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
        "slug": "parenthese-douceur",
        "name": {"fr": "Une parenthèse de douceur", "en": "A gentle interlude"},
        "tagline": {"fr": "L'intimité de la suite Douceur", "en": "The intimacy of the Douceur suite"},
        "short_description": {
            "fr": "Une nuit pour deux dans la suite Douceur, pensée comme un refuge feutré.",
            "en": "One night for two in the Douceur suite, a hushed little refuge.",
        },
        "long_description": {
            "fr": "Il y a des moments que l'on n'offre pas, que l'on partage. Une parenthèse de douceur, c'est une nuit dans la suite Douceur, la plus intime de la maison, où la lumière se fait tamisée et le temps se suspend. Un cocon pour se retrouver, loin de tout.",
            "en": "Some moments are not given, they are shared. A gentle interlude is a night in the Douceur suite, the most intimate of the house, where the light softens and time stands still. A cocoon to reconnect, far from everything.",
        },
        "usage": {
            "fr": "Valable 12 mois. Le bénéficiaire réserve ses dates via le formulaire « Utiliser ma carte cadeau », selon les disponibilités de la suite Douceur.",
            "en": "Valid for 12 months. The recipient books their dates via the \u201cUse my gift card\u201d form, subject to Douceur suite availability.",
        },
        "price": 150.0,
        "from_price": False,
        "image_url": "/media/06c7bdiw_50CA4710-2440-42FD-BA71-5227C2500D01.JPG",
        "images": [
            "/media/06c7bdiw_50CA4710-2440-42FD-BA71-5227C2500D01.JPG",
            "/images/PHOTO_2.jpg",
            "/images/PHOTO_3.jpg",
            "/media/p7ognvc7_B4C093FA-ECD4-4A9C-8CAC-D3B799C14E1B.JPG",
        ],
        "includes": [
            {"fr": "Une nuit pour deux dans la suite Douceur", "en": "One night for two in the Douceur suite"},
            {"fr": "Une attention de la maison", "en": "A welcome attention from the house"},
        ],
        "suite_options": [],
        "active": True, "sort_order": 1,
    },
    {
        "slug": "envolee-deux",
        "name": {"fr": "Une envolée à deux", "en": "A flight for two"},
        "tagline": {"fr": "La suite signature L'Envolée", "en": "The signature L'Envolée suite"},
        "short_description": {
            "fr": "Une nuit pour deux dans la suite L'Envolée, une invitation à s'évader.",
            "en": "One night for two in the L'Envolée suite, an invitation to escape.",
        },
        "long_description": {
            "fr": "Une montée en gamme, un souffle. La suite L'Envolée est la plus spacieuse de la maison, baignée de lumière et de volumes généreux. Une envolée à deux, c'est l'invitation à prendre de la hauteur, à s'offrir un moment privilégié, suspendu.",
            "en": "A step up, a breath of air. The L'Envolée suite is the most spacious of the house, bathed in light and generous volumes. A flight for two is an invitation to rise above it all and share a privileged, suspended moment.",
        },
        "usage": {
            "fr": "Valable 12 mois. Le bénéficiaire réserve ses dates via le formulaire « Utiliser ma carte cadeau », selon les disponibilités de la suite L'Envolée.",
            "en": "Valid for 12 months. The recipient books their dates via the \u201cUse my gift card\u201d form, subject to L'Envolée suite availability.",
        },
        "price": 170.0,
        "from_price": False,
        "image_url": "/media/49xdp4zr_F28F0185-183B-4CAC-9287-576C414DD07A.JPG",
        "images": [
            "/media/49xdp4zr_F28F0185-183B-4CAC-9287-576C414DD07A.JPG",
            "/images/x2jgmdrr_PHOTO_7.jpg",
            "/images/27a8ntzq_PHOTO_8.jpg",
            "/media/6ompvcnm_7A67B1F7-EFA0-42FE-8054-5C7B83393CB8.JPG",
        ],
        "includes": [
            {"fr": "Une nuit pour deux dans la suite L'Envolée", "en": "One night for two in the L'Envolée suite"},
            {"fr": "Une attention de la maison", "en": "A welcome attention from the house"},
        ],
        "suite_options": [],
        "active": True, "sort_order": 2,
    },
    {
        "slug": "echappee-gourmande",
        "name": {"fr": "L'Échappée Gourmande", "en": "The Gourmet Escape"},
        "tagline": {"fr": "Une nuit, une table imaginée par le chef", "en": "A night, a table imagined by the chef"},
        "short_description": {
            "fr": "Une nuit en suite et une expérience gastronomique imaginée par le chef, rien que pour vous.",
            "en": "A night in a suite and a gourmet experience imagined by the chef, just for you.",
        },
        "long_description": {
            "fr": "L'alliance d'une nuit en suite et d'une table imaginée par le chef. Pour les bénéficiaires de cette carte, le chef du restaurant Ô P'tit Repère du Goût compose une expérience gastronomique dédiée : une coupe de champagne, un menu signé de sa main et un accord mets et vins. Choisissez votre suite, nous nous occupons du reste.",
            "en": "The union of a night in a suite and a table imagined by the chef. For holders of this card, the chef of the Ô P'tit Repère du Goût restaurant composes a dedicated gourmet experience: a glass of champagne, a menu of his own creation and a food and wine pairing. Choose your suite, we take care of the rest.",
        },
        "usage": {
            "fr": "Valable 12 mois, week-ends compris, hors jours fériés et dates d'exception (Saint-Valentin, fête des mères…). Le bénéficiaire choisit ses dates via « J'ai une carte cadeau » sur la page Réserver : nous convenons ensemble de la table selon les disponibilités.",
            "en": "Valid for 12 months, weekends included, excluding public holidays and special dates (Valentine's Day, Mother's Day…). The recipient picks dates via “I have a gift card” on the Book page; we arrange the table together, subject to availability.",
        },
        "price": 350.0,
        "from_price": True,
        "image_url": "/media/echappee-collage.jpg",
        "images": [
            "/media/echappee-collage.jpg",
            "/images/6r50xqk9_PHOTO_1__chef_.jpg",
            "/images/PHOTO_13.jpg",
            "/images/PHOTO_12.jpg",
        ],
        "includes": [
            {"fr": "Une nuit pour deux (suite au choix)", "en": "One night for two (suite of your choice)"},
            {"fr": "Une coupe de champagne", "en": "A glass of champagne"},
            {"fr": "Une expérience gastronomique imaginée par le chef", "en": "A gourmet experience imagined by the chef"},
            {"fr": "Un accord mets et vins", "en": "A food and wine pairing"},
            {"fr": "Une attention de la maison", "en": "A welcome attention from the house"},
        ],
        "suite_options": [
            {"key": "douceur", "label": {"fr": "Suite Douceur", "en": "Douceur suite"}, "price": 350.0,
             "image_url": "/media/06c7bdiw_50CA4710-2440-42FD-BA71-5227C2500D01.JPG"},
            {"key": "envolee", "label": {"fr": "Suite L'Envolée", "en": "L'Envolée suite"}, "price": 370.0,
             "image_url": "/media/49xdp4zr_F28F0185-183B-4CAC-9287-576C414DD07A.JPG"},
        ],
        "active": True, "sort_order": 3,
    },
]
CURRENT_SLUGS = {c["slug"] for c in DEFAULT_COFFRETS}


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
    # Unique only for issued codes (pending cards have code=None)
    try:
        info = await _db.giftcards.index_information()
        if "code_1" in info and not info["code_1"].get("partialFilterExpression"):
            await _db.giftcards.drop_index("code_1")
    except Exception as e:  # noqa: BLE001
        logger.warning("giftcards index check failed: %s", e)
    await _db.giftcards.create_index(
        "code", unique=True, partialFilterExpression={"code": {"$type": "string"}}
    )
    await _db.payment_transactions.create_index("session_id", unique=True)
    if await _db.giftcard_coffrets.count_documents({}) == 0:
        for c in DEFAULT_COFFRETS:
            await _db.giftcard_coffrets.insert_one({"id": str(uuid.uuid4()), **c, "created_at": _iso(_now())})
        logger.info("Seeded default gift coffrets")
    else:
        # One-time catalogue refresh: if the new slugs are absent, replace the seed set.
        has_new = await _db.giftcard_coffrets.find_one({"slug": {"$in": list(CURRENT_SLUGS)}})
        if not has_new:
            await _db.giftcard_coffrets.delete_many({"slug": {"$in": ["parenthese", "gourmande", "signature"]}})
            for c in DEFAULT_COFFRETS:
                await _db.giftcard_coffrets.insert_one({"id": str(uuid.uuid4()), **c, "created_at": _iso(_now())})
            logger.info("Refreshed gift coffrets to the new experience set")
    # Échappée : l'apéritif devient une coupe de champagne. Ne touche que l'ancien libellé,
    # donc sans effet si le texte a déjà été modifié depuis l'admin.
    await _db.giftcard_coffrets.update_one(
        {"slug": "echappee-gourmande", "includes.fr": "Un apéritif"},
        {"$set": {"includes.$": {"fr": "Une coupe de champagne", "en": "A glass of champagne"}}},
    )
    # Échappée : conditions (week-ends compris, hors jours fériés). Seulement si le texte d'origine est encore là.
    await _db.giftcard_coffrets.update_one(
        {"slug": "echappee-gourmande", "usage.fr": "Valable 12 mois. Le bénéficiaire réserve via le formulaire « Utiliser ma carte cadeau ». L'expérience gastronomique est dédiée aux porteurs de cette carte et convenue ensemble selon les disponibilités."},
        {"$set": {"usage": {"fr": "Valable 12 mois, week-ends compris, hors jours fériés et dates d'exception (Saint-Valentin, fête des mères…). Le bénéficiaire choisit ses dates via « J'ai une carte cadeau » sur la page Réserver : nous convenons ensemble de la table selon les disponibilités.", "en": "Valid for 12 months, weekends included, excluding public holidays and special dates (Valentine's Day, Mother's Day…). The recipient picks dates via “I have a gift card” on the Book page; we arrange the table together, subject to availability."}}},
    )
    doc = await _db.giftcard_coffrets.find_one({"slug": "echappee-gourmande"})
    desc = (doc or {}).get("long_description") or {}
    fixed = {
        "fr": (desc.get("fr") or "").replace("un apéritif, un menu", "une coupe de champagne, un menu"),
        "en": (desc.get("en") or "").replace("an aperitif, a menu", "a glass of champagne, a menu"),
    }
    if doc and fixed != {"fr": desc.get("fr") or "", "en": desc.get("en") or ""}:
        await _db.giftcard_coffrets.update_one({"slug": "echappee-gourmande"}, {"$set": {"long_description": {**desc, **fixed}}})


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
        "tagline": c.get("tagline"),
        "short_description": c.get("short_description") or c.get("description"),
        "long_description": c.get("long_description") or c.get("description"),
        "usage": c.get("usage"),
        "price": c.get("price"), "from_price": bool(c.get("from_price")),
        "image_url": c.get("image_url"),
        "images": c.get("images") or ([c.get("image_url")] if c.get("image_url") else []),
        "includes": c.get("includes", []),
        "suite_options": c.get("suite_options", []),
        "active": c.get("active", True),
        "sort_order": c.get("sort_order", 99),
    }


# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------
class CheckoutIn(BaseModel):
    coffret_id: str
    option_key: Optional[str] = None
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
    suite_label = None
    suite_key = None
    options = coffret.get("suite_options") or []
    if options:
        chosen = next((o for o in options if o.get("key") == payload.option_key), None)
        if not chosen:
            raise HTTPException(status_code=400, detail="Veuillez choisir une suite")
        amount = float(chosen["price"])
        suite_key = chosen.get("key")
        suite_label = (chosen.get("label") or {}).get("fr")
    if amount <= 0:
        raise HTTPException(status_code=400, detail="Montant invalide")
    name_fr = (coffret.get("name") or {}).get("fr") or "Coffret Plume Suites"
    product_label = f"Carte cadeau — {name_fr}" + (f" ({suite_label})" if suite_label else "")

    import asyncio
    try:
        session = await asyncio.to_thread(
            lambda: stripe.checkout.Session.create(
                mode="payment",
                line_items=[{
                    "price_data": {
                        "currency": CURRENCY,
                        "product_data": {"name": product_label},
                        "unit_amount": int(round(amount * 100)),
                    },
                    "quantity": 1,
                }],
                customer_email=str(payload.buyer_email),
                success_url=f"{payload.origin_url}/paiement/succes?session_id={{CHECKOUT_SESSION_ID}}",
                cancel_url=f"{payload.origin_url}/paiement/annule",
                metadata={"kind": "giftcard", "coffret_id": coffret["id"], "buyer_email": str(payload.buyer_email)},
            )
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
        "coffret_name": name_fr + (f" — {suite_label}" if suite_label else ""),
        "suite_key": suite_key,
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
    """Idempotent: mark paid, issue code, set validity, email the buyer once. Returns the card."""
    card = await _db.giftcards.find_one({"session_id": session_id})
    if not card:
        return None
    if card.get("status") == "active" and card.get("code"):
        return card
    code = await _unique_code()
    now = _now()
    expires = now.replace(year=now.year + 1)
    res = await _db.giftcards.update_one(
        {"session_id": session_id, "status": {"$ne": "active"}},
        {"$set": {
            "code": code, "status": "active",
            "purchased_at": _iso(now), "expires_at": _iso(expires),
        }},
    )
    card = await _db.giftcards.find_one({"session_id": session_id})
    # Email only when THIS call performed the activation (avoids a duplicate email on a webhook/poll race).
    if res.modified_count == 1 and card and card.get("code"):
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
    import asyncio
    record = await _db.payment_transactions.find_one({"session_id": session_id})
    if not record:
        raise HTTPException(status_code=404, detail="Transaction introuvable")
    if record.get("payment_status") != "paid":
        try:
            s = await asyncio.to_thread(stripe.checkout.Session.retrieve, session_id)
            if s.payment_status == "paid" or s.status == "complete":
                await _db.payment_transactions.update_one(
                    {"session_id": session_id, "payment_status": {"$ne": "paid"}},
                    {"$set": {"status": "completed", "payment_status": "paid", "updated_at": _now()}},
                )
                await _activate_giftcard(session_id)
                record = await _db.payment_transactions.find_one({"session_id": session_id})
        except Exception as e:  # noqa: BLE001
            logger.error("status poll stripe retrieve failed: %s", e)
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
    if t in ("checkout.session.completed", "checkout.session.async_payment_succeeded"):
        sid = obj["id"]
        pay_status = obj.get("payment_status", "")
        await _db.payment_transactions.update_one(
            {"session_id": sid, "payment_status": {"$ne": "paid"}},
            {"$set": {"status": "completed", "payment_status": pay_status or "paid",
                      "stripe_payment_intent_id": obj.get("payment_intent"), "updated_at": _now()}},
        )
        # Only issue the card once payment is actually settled (delayed methods report 'unpaid').
        if pay_status == "paid":
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
    if float(data.get("price", 0)) <= 0:
        raise HTTPException(status_code=400, detail="Le prix doit être supérieur à 0")
    slug = data.get("slug")
    clash = await _db.giftcard_coffrets.find_one({"slug": slug}) if slug else None
    if coffret_id:
        if not await _db.giftcard_coffrets.find_one({"id": coffret_id}):
            raise HTTPException(status_code=404, detail="Coffret introuvable")
        if clash and clash.get("id") != coffret_id:
            raise HTTPException(status_code=409, detail="Ce slug est déjà utilisé")
        await _db.giftcard_coffrets.update_one({"id": coffret_id}, {"$set": data})
        return await _db.giftcard_coffrets.find_one({"id": coffret_id}, {"_id": 0})
    if clash:
        raise HTTPException(status_code=409, detail="Ce slug est déjà utilisé")
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
