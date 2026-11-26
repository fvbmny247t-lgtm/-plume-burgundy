"""Gift cards (coffrets expérience) — Stripe Checkout sale + redemption requests.

Sale is independent from Smoobu: buyer pays via Stripe, we issue a unique code
and email the voucher to the buyer. Redemption is handled by Marie: the recipient
submits a request ("Utiliser mon bon") and Marie validates the stay in Smoobu.
"""
import os
import uuid
import secrets
import string
import logging
from datetime import datetime, timezone, timedelta
from typing import Optional

import stripe
from fastapi import APIRouter, HTTPException, Request, Depends, Header
from pydantic import BaseModel, EmailStr, Field

import email_service as mail

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/giftcards")

VALIDITY_MONTHS = 12
CURRENCY = "eur"

_db = None
_admin_dep = None

stripe.api_key = os.environ.get("STRIPE_SECRET_KEY") or os.environ.get("STRIPE_API_KEY") or "sk_test_emergent"
STRIPE_WEBHOOK_SECRET = os.environ.get("STRIPE_WEBHOOK_SECRET", "")

DEFAULT_COFFRETS = [
    {
        "slug": "parenthese",
        "name": {"fr": "Parenthèse Plume", "en": "Plume Interlude"},
        "tagline": {"fr": "Une nuit suspendue", "en": "One night, suspended in time"},
        "description": {
            "fr": "Une nuit en suite de charme et un petit-déjeuner servi avec attention. L'essentiel d'une parenthèse en Bourgogne.",
            "en": "One night in a character suite with a thoughtfully served breakfast. The essence of a Burgundy escape.",
        },
        "price": 190.0,
        "image_url": "/media/06c7bdiw_50CA4710-2440-42FD-BA71-5227C2500D01.JPG",
        "includes": [
            {"fr": "Une nuit en suite", "en": "One night in a suite"},
            {"fr": "Petit-déjeuner maison", "en": "Homemade breakfast"},
        ],
        "active": True, "sort_order": 1,
    },
    {
        "slug": "gourmande",
        "name": {"fr": "Échappée Gourmande", "en": "Gourmet Escape"},
        "tagline": {"fr": "La table en plus", "en": "With a seat at the table"},
        "description": {
            "fr": "Une nuit en suite, le petit-déjeuner et un dîner pour deux au restaurant Ô P'tit Repère du Goût, juste en dessous.",
            "en": "One night in a suite, breakfast and a dinner for two at the Ô P'tit Repère du Goût restaurant, just downstairs.",
        },
        "price": 290.0,
        "image_url": "/images/6r50xqk9_PHOTO_1__chef_.jpg",
        "includes": [
            {"fr": "Une nuit en suite", "en": "One night in a suite"},
            {"fr": "Petit-déjeuner maison", "en": "Homemade breakfast"},
            {"fr": "Dîner pour deux au restaurant", "en": "Dinner for two at the restaurant"},
        ],
        "active": True, "sort_order": 2,
    },
    {
        "slug": "signature",
        "name": {"fr": "Séjour Signature", "en": "Signature Stay"},
        "tagline": {"fr": "Deux nuits, tout en douceur", "en": "Two nights, unhurried"},
        "description": {
            "fr": "Deux nuits dans la suite signature L'Envolée, petits-déjeuners et attentions de la maison pour un séjour que l'on n'oublie pas.",
            "en": "Two nights in the signature suite L'Envolée, breakfasts and the house's little attentions for an unforgettable stay.",
        },
        "price": 490.0,
        "image_url": "/media/49xdp4zr_F28F0185-183B-4CAC-9287-576C414DD07A.JPG",
        "includes": [
            {"fr": "Deux nuits en suite L'Envolée", "en": "Two nights in the L'Envolée suite"},
            {"fr": "Petits-déjeuners maison", "en": "Homemade breakfasts"},
            {"fr": "Attentions de la maison", "en": "The house's little attentions"},
        ],
        "active": True, "sort_order": 3,
    },
]


def configure(db, admin_dependency):
    global _db, _admin_dep, STRIPE_WEBHOOK_SECRET
    _db = db
    _admin_dep = admin_dependency
    key = os.environ.get("STRIPE_SECRET_KEY") or os.environ.get("STRIPE_API_KEY") or "sk_test_emergent"
    stripe.api_key = key
    STRIPE_WEBHOOK_SECRET = os.environ.get("STRIPE_WEBHOOK_SECRET", "")
    logger.info("Gift cards configured (stripe key prefix: %s)", (key or "")[:10])


async def ensure_indexes_and_seed():
    if _db is None:
        return
    await _db.giftcard_coffrets.create_index("slug", unique=True)
    await _db.giftcards.create_index("code", unique=True)
    await _db.payment_transactions.create_index("session_id", unique=True)
    if await _db.giftcard_coffrets.count_documents({}) == 0:
        for c in DEFAULT_COFFRETS:
            await _db.giftcard_coffrets.insert_one({"id": str(uuid.uuid4()), **c, "created_at": _iso(_now())})
        logger.info("Seeded default gift coffrets")


def _now():
    return datetime.now(timezone.utc)


def _iso(dt):
    return dt.isoformat()


def _gen_code() -> str:
    alphabet = string.ascii_uppercase + string.digits
    body = "".join(secrets.choice(alphabet) for _ in range(8))
    return f"PLUME-{body[:4]}-{body[4:]}"


async def _unique_code() -> str:
    for _ in range(10):
        code = _gen_code()
        if not await _db.giftcards.find_one({"code": code}):
            return code
    return f"PLUME-{uuid.uuid4().hex[:8].upper()}"


def _coffret_public(c: dict) -> dict:
    return {
        "id": c["id"], "slug": c.get("slug"), "name": c.get("name"),
        "tagline": c.get("tagline"), "description": c.get("description"),
        "price": c.get("price"), "image_url": c.get("image_url"),
        "includes": c.get("includes", []), "active": c.get("active", True),
        "sort_order": c.get("sort_order", 99),
    }


# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------
class CheckoutIn(BaseModel):
    coffret_id: str
    buyer_name: str = Field(min_length=1, max_length=120)
    buyer_email: EmailStr
    recipient_name: Optional[str] = Field(default=None, max_length=120)
    message: Optional[str] = Field(default=None, max_length=600)
    locale: str = "fr"
    origin_url: str


class RedeemIn(BaseModel):
    code: str
    guest_name: str = Field(min_length=1, max_length=120)
    guest_email: EmailStr
    guest_phone: Optional[str] = Field(default=None, max_length=40)
    desired_dates: str = Field(min_length=1, max_length=200)
    nb_guests: Optional[int] = Field(default=2, ge=1, le=10)
    suite_pref: Optional[str] = Field(default=None, max_length=80)
    message: Optional[str] = Field(default=None, max_length=600)
    locale: str = "fr"


# ---------------------------------------------------------------------------
# Public endpoints
# ---------------------------------------------------------------------------
@router.get("/coffrets")
async def list_coffrets():
    items = await _db.giftcard_coffrets.find({"active": True}).to_list(100)
    items = [_coffret_public(c) for c in items]
    items.sort(key=lambda c: c["sort_order"])
    return items


@router.post("/checkout")
async def create_checkout(payload: CheckoutIn):
    coffret = await _db.giftcard_coffrets.find_one({"id": payload.coffret_id, "active": True})
    if not coffret:
        raise HTTPException(status_code=404, detail="Coffret introuvable")
    amount = float(coffret["price"])
    name_fr = (coffret.get("name") or {}).get("fr") or "Coffret Plume Suites"

    try:
        session = stripe.checkout.Session.create(
            mode="payment",
            line_items=[{
                "price_data": {
                    "currency": CURRENCY,
                    "product_data": {"name": f"Carte cadeau — {name_fr}"},
                    "unit_amount": int(round(amount * 100)),
                },
                "quantity": 1,
            }],
            customer_email=str(payload.buyer_email),
            success_url=f"{payload.origin_url}/paiement/succes?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{payload.origin_url}/paiement/annule",
            metadata={"kind": "giftcard", "coffret_id": coffret["id"], "buyer_email": str(payload.buyer_email)},
        )
    except Exception as e:  # noqa: BLE001
        logger.error("Stripe checkout create failed: %s", e)
        raise HTTPException(status_code=502, detail="Le paiement est momentanément indisponible")

    now = _now()
    await _db.payment_transactions.insert_one({
        "session_id": session.id,
        "kind": "giftcard",
        "coffret_id": coffret["id"],
        "amount": amount,
        "currency": CURRENCY,
        "status": "initiated",
        "payment_status": "pending",
        "buyer_email": str(payload.buyer_email),
        "created_at": now, "updated_at": now,
    })
    await _db.giftcards.insert_one({
        "id": str(uuid.uuid4()),
        "code": None,
        "coffret_id": coffret["id"],
        "coffret_name": name_fr,
        "amount": amount,
        "currency": CURRENCY,
        "buyer_name": payload.buyer_name.strip(),
        "buyer_email": str(payload.buyer_email),
        "recipient_name": (payload.recipient_name or "").strip() or None,
        "message": (payload.message or "").strip() or None,
        "locale": payload.locale,
        "status": "pending_payment",
        "session_id": session.id,
        "purchased_at": None,
        "expires_at": None,
        "redeemed_at": None,
        "created_at": _iso(now),
    })
    return {"checkout_url": session.url, "session_id": session.id}


async def _activate_giftcard(session_id: str) -> Optional[dict]:
    """Idempotent: mark paid, issue code, set validity, email the buyer. Returns the card."""
    card = await _db.giftcards.find_one({"session_id": session_id})
    if not card:
        return None
    if card.get("status") == "active" and card.get("code"):
        return card
    code = await _unique_code()
    now = _now()
    expires = now + timedelta(days=VALIDITY_MONTHS * 30)
    await _db.giftcards.update_one(
        {"session_id": session_id, "status": {"$ne": "active"}},
        {"$set": {
            "code": code, "status": "active",
            "purchased_at": _iso(now), "expires_at": _iso(expires),
        }},
    )
    card = await _db.giftcards.find_one({"session_id": session_id})
    if card and card.get("code"):
        origin = os.environ.get("PUBLIC_BASE_URL", "").rstrip("/")
        voucher_url = f"{origin}/bon/{card['code']}" if origin else ""
        try:
            await mail.send_giftcard_email(
                to=card["buyer_email"],
                buyer_name=card.get("buyer_name", ""),
                coffret_name=card.get("coffret_name", ""),
                code=card["code"],
                recipient_name=card.get("recipient_name"),
                message=card.get("message"),
                expires_at=card.get("expires_at"),
                voucher_url=voucher_url,
                lang=card.get("locale", "fr"),
            )
        except Exception as e:  # noqa: BLE001
            logger.error("gift card email failed: %s", e)
    return card


@router.get("/status/{session_id}")
async def payment_status(session_id: str):
    record = await _db.payment_transactions.find_one({"session_id": session_id})
    if not record:
        raise HTTPException(status_code=404, detail="Transaction introuvable")
    if record.get("payment_status") != "paid":
        try:
            s = stripe.checkout.Session.retrieve(session_id)
            if s.payment_status == "paid" or s.status == "complete":
                await _db.payment_transactions.update_one(
                    {"session_id": session_id, "payment_status": {"$ne": "paid"}},
                    {"$set": {"status": "completed", "payment_status": "paid", "updated_at": _now()}},
                )
                await _activate_giftcard(session_id)
                record = await _db.payment_transactions.find_one({"session_id": session_id})
        except Exception:  # noqa: BLE001
            pass
    card = await _db.giftcards.find_one({"session_id": session_id})
    return {
        "session_id": session_id,
        "status": record["status"],
        "payment_status": record["payment_status"],
        "code": card.get("code") if card else None,
        "coffret_name": card.get("coffret_name") if card else None,
    }


@router.get("/voucher/{code}")
async def voucher(code: str):
    card = await _db.giftcards.find_one({"code": code.upper().strip()})
    if not card or card.get("status") == "pending_payment":
        raise HTTPException(status_code=404, detail="Bon introuvable")
    return {
        "code": card["code"],
        "coffret_name": card.get("coffret_name"),
        "recipient_name": card.get("recipient_name"),
        "message": card.get("message"),
        "expires_at": card.get("expires_at"),
        "status": card.get("status"),
    }


@router.post("/redeem")
async def redeem(payload: RedeemIn):
    code = payload.code.upper().strip()
    card = await _db.giftcards.find_one({"code": code})
    if not card or card.get("status") == "pending_payment":
        raise HTTPException(status_code=404, detail="Ce code est introuvable")
    if card.get("status") == "redeemed":
        raise HTTPException(status_code=409, detail="Ce bon a déjà été utilisé")
    if card.get("expires_at") and datetime.fromisoformat(card["expires_at"]) < _now():
        await _db.giftcards.update_one({"code": code}, {"$set": {"status": "expired"}})
        raise HTTPException(status_code=410, detail="Ce bon a expiré")

    req = {
        "id": str(uuid.uuid4()),
        "code": code,
        "giftcard_id": card["id"],
        "coffret_name": card.get("coffret_name"),
        "guest_name": payload.guest_name.strip(),
        "guest_email": str(payload.guest_email),
        "guest_phone": (payload.guest_phone or "").strip() or None,
        "desired_dates": payload.desired_dates.strip(),
        "nb_guests": payload.nb_guests,
        "suite_pref": (payload.suite_pref or "").strip() or None,
        "message": (payload.message or "").strip() or None,
        "status": "pending",
        "admin_note": None,
        "created_at": _iso(_now()),
        "processed_at": None,
    }
    await _db.giftcard_redemptions.insert_one(req)
    try:
        await mail.send_redemption_admin_email(req)
    except Exception as e:  # noqa: BLE001
        logger.error("redemption admin email failed: %s", e)
    try:
        await mail.send_redemption_guest_email(str(payload.guest_email), payload.guest_name, card.get("coffret_name", ""), code, payload.locale)
    except Exception as e:  # noqa: BLE001
        logger.error("redemption guest email failed: %s", e)
    return {"ok": True}


# ---------------------------------------------------------------------------
# Stripe webhook (Flow A path)
# ---------------------------------------------------------------------------
@router.post("/__webhook_placeholder")
async def _noop():
    return {"ok": True}


async def handle_webhook(payload: bytes, sig: str):
    try:
        event = stripe.Webhook.construct_event(payload, sig, STRIPE_WEBHOOK_SECRET)
    except Exception:  # noqa: BLE001
        raise HTTPException(status_code=400, detail="Invalid signature")
    obj, t = event["data"]["object"], event["type"]
    if t == "checkout.session.completed":
        sid = obj["id"]
        await _db.payment_transactions.update_one(
            {"session_id": sid, "payment_status": {"$ne": "paid"}},
            {"$set": {"status": "completed", "payment_status": obj.get("payment_status", "paid"),
                      "stripe_payment_intent_id": obj.get("payment_intent"), "updated_at": _now()}},
        )
        await _activate_giftcard(sid)
    elif t in ("checkout.session.expired",):
        await _db.payment_transactions.update_one(
            {"session_id": obj["id"]},
            {"$set": {"status": "expired", "payment_status": "expired", "updated_at": _now()}},
        )
    return {"status": "ok"}


# ---------------------------------------------------------------------------
# Admin helpers (called from server.py admin routes)
# ---------------------------------------------------------------------------
async def admin_list_coffrets():
    items = await _db.giftcard_coffrets.find({}).to_list(200)
    items = [_coffret_public(c) for c in items]
    items.sort(key=lambda c: c["sort_order"])
    return items


async def admin_upsert_coffret(data: dict, coffret_id: Optional[str] = None):
    if coffret_id:
        await _db.giftcard_coffrets.update_one({"id": coffret_id}, {"$set": data})
        return await _db.giftcard_coffrets.find_one({"id": coffret_id}, {"_id": 0})
    new = {"id": str(uuid.uuid4()), "created_at": _iso(_now()), **data}
    await _db.giftcard_coffrets.insert_one(new)
    new.pop("_id", None)
    return new


async def admin_delete_coffret(coffret_id: str):
    await _db.giftcard_coffrets.delete_one({"id": coffret_id})
    return {"ok": True}


async def admin_list_cards():
    items = await _db.giftcards.find({"status": {"$ne": "pending_payment"}}, {"_id": 0}).sort("purchased_at", -1).to_list(500)
    return items


async def admin_list_redemptions():
    items = await _db.giftcard_redemptions.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return items


async def admin_update_redemption(redemption_id: str, status: str, admin_note: Optional[str]):
    red = await _db.giftcard_redemptions.find_one({"id": redemption_id})
    if not red:
        raise HTTPException(status_code=404, detail="Demande introuvable")
    await _db.giftcard_redemptions.update_one(
        {"id": redemption_id},
        {"$set": {"status": status, "admin_note": admin_note, "processed_at": _iso(_now())}},
    )
    if status == "processed":
        await _db.giftcards.update_one(
            {"code": red["code"]}, {"$set": {"status": "redeemed", "redeemed_at": _iso(_now())}}
        )
    return {"ok": True}
