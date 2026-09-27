"""Smoobu reservation sync + Plumes computation for Carnet Plume.

Source of truth: Smoobu (reservations/prices/channel/dates).
Emergent owns: accounts, Plumes, attentions, newsletter.

Plumes rule (V1): 1 EUR of an eligible DIRECT reservation = 1 Plume.
Tourist tax (Smoobu 'city-tax') is always excluded. Floor to integer.
"Plumes a venir" (pending) on detection, credited after check-out.
Cancellations remove pending. Idempotent by Smoobu booking id.
"""
import math
import logging
from datetime import datetime, timezone, date

import smoobu_client as sc

logger = logging.getLogger(__name__)

NEWSLETTER_BONUS = 100

# Account-specific default channel classification (editable later in admin).
# category in {DIRECT, MANUEL, OTA, BLOCKED, UNKNOWN}; eligible => earns Plumes.
DEFAULT_CHANNELS = {
    3040403: {"name": "Direct booking", "category": "DIRECT", "eligible": True},
    3040406: {"name": "Website", "category": "DIRECT", "eligible": True},
    3042347: {"name": "Booking.com", "category": "OTA", "eligible": False},
    3045746: {"name": "Expedia", "category": "OTA", "eligible": False},
    3042353: {"name": "Airbnb", "category": "OTA", "eligible": False},
    3040397: {"name": "Blocked channel", "category": "BLOCKED", "eligible": False},
}
OTA_NAME_HINTS = ("booking.com", "airbnb", "expedia", "vrbo", "tripadvisor", "hrs")
DIRECT_NAME_HINTS = ("direct", "website", "booking engine", "manual", "api")

_db = None


def configure(db):
    global _db
    _db = db


async def ensure_indexes():
    if _db is None:
        return
    await _db.smoobu_reservations.create_index("smoobu_id", unique=True)
    await _db.smoobu_reservations.create_index("email")
    await _db.smoobu_reservations.create_index("user_id")
    await _db.plumes_ledger.create_index("idempotency_key", unique=True)
    await _db.smoobu_channels.create_index("channel_id", unique=True)


def _now_iso():
    return datetime.now(timezone.utc).isoformat()


def _norm_email(e):
    return (e or "").strip().lower() or None


async def _classify(channel: dict) -> dict:
    """Return {category, eligible} using the editable map, then heuristics."""
    cid = channel.get("id")
    name = (channel.get("name") or "").strip()
    if cid is not None:
        rec = await _db.smoobu_channels.find_one({"channel_id": cid})
        if rec:
            return {"category": rec["category"], "eligible": bool(rec.get("eligible"))}
        default = DEFAULT_CHANNELS.get(cid)
        entry = default or {
            "name": name,
            "category": _heuristic_category(name),
            "eligible": _heuristic_category(name) in ("DIRECT", "MANUEL"),
        }
        await _db.smoobu_channels.update_one(
            {"channel_id": cid},
            {"$set": {"channel_id": cid, **entry, "seen_at": _now_iso()}},
            upsert=True,
        )
        return {"category": entry["category"], "eligible": bool(entry.get("eligible"))}
    cat = _heuristic_category(name)
    return {"category": cat, "eligible": cat in ("DIRECT", "MANUEL")}


def _heuristic_category(name: str) -> str:
    n = (name or "").lower()
    if any(h in n for h in OTA_NAME_HINTS):
        return "OTA"
    if any(h in n for h in DIRECT_NAME_HINTS):
        return "DIRECT"
    return "UNKNOWN"


def _num(v):
    try:
        return float(v) if v is not None else 0.0
    except (TypeError, ValueError):
        return 0.0


def _compute_plumes(booking: dict, cls: dict) -> tuple[int, float]:
    """Return (plumes, eligible_amount)."""
    if not cls["eligible"]:
        return 0, 0.0
    price = _num(booking.get("price"))
    city_tax = _num(booking.get("city-tax"))
    eligible = max(price - city_tax, 0.0)
    return int(math.floor(eligible)), round(eligible, 2)


def _status_for(booking: dict, is_cancelled: bool) -> str:
    if is_cancelled:
        return "cancelled"
    dep = booking.get("departure")
    try:
        if dep and datetime.strptime(dep, "%Y-%m-%d").date() <= date.today():
            return "credited"
    except ValueError:
        pass
    return "pending"


async def _upsert_reservation(booking: dict) -> dict:
    smoobu_id = booking.get("id")
    channel = booking.get("channel") or {}
    apartment = booking.get("apartment") or {}
    btype = (booking.get("type") or "").lower()
    is_blocked = bool(booking.get("is-blocked-booking"))
    is_cancelled = "cancellation" in btype or "cancelled" in btype

    cls = await _classify(channel)
    if is_blocked or cls["category"] == "BLOCKED":
        plumes, eligible = 0, 0.0
        status = "blocked"
    else:
        plumes, eligible = _compute_plumes(booking, cls)
        status = _status_for(booking, is_cancelled)

    email = _norm_email(booking.get("email"))
    guest_name = booking.get("guest-name") or " ".join(
        [booking.get("firstname") or "", booking.get("lastname") or ""]
    ).strip() or None

    user = await _db.carnet_users.find_one({"email": email}) if email else None

    doc = {
        "smoobu_id": smoobu_id,
        "type": booking.get("type"),
        "is_blocked": is_blocked,
        "is_cancelled": is_cancelled,
        "arrival": booking.get("arrival"),
        "departure": booking.get("departure"),
        "apartment": {"id": apartment.get("id"), "name": apartment.get("name")},
        "channel": {"id": channel.get("id"), "name": channel.get("name")},
        "source": cls["category"],
        "eligible": cls["eligible"],
        "guest_name": guest_name,
        "email": email,
        "adults": booking.get("adults"),
        "children": booking.get("children"),
        "price": _num(booking.get("price")),
        "city_tax": _num(booking.get("city-tax")),
        "eligible_amount": eligible,
        "plumes": plumes,
        "plumes_status": status,
        "user_id": user["id"] if user else None,
        "created_at": booking.get("created-at"),
        "modified_at": booking.get("modifiedAt") or booking.get("modified-at"),
        "synced_at": _now_iso(),
    }
    await _db.smoobu_reservations.replace_one({"smoobu_id": smoobu_id}, doc, upsert=True)
    return doc


async def recompute_user_balances(user_id: str):
    """Balance = newsletter bonus + credited stays; pending = pending stays.
    Retroactive rule: a checked-out (credited) stay only counts if the account
    existed on or before check-out (no auto retroactive credit; admin can add manually)."""
    if not user_id:
        return
    user = await _db.carnet_users.find_one({"id": user_id})
    acct_date = None
    if user and user.get("created_at"):
        try:
            acct_date = datetime.fromisoformat(user["created_at"]).date()
        except ValueError:
            acct_date = None
    credited = 0
    pending = 0
    cursor = _db.smoobu_reservations.find({"user_id": user_id})
    async for r in cursor:
        status = r.get("plumes_status")
        plumes = int(r.get("plumes", 0))
        if status == "credited":
            dep = r.get("departure")
            dep_date = None
            try:
                dep_date = datetime.strptime(dep, "%Y-%m-%d").date() if dep else None
            except ValueError:
                dep_date = None
            if acct_date is None or dep_date is None or dep_date >= acct_date:
                credited += plumes
        elif status == "pending":
            pending += plumes
    async for entry in _db.plumes_ledger.find({"user_id": user_id, "status": "credited"}):
        if entry.get("type") != "stay":
            credited += int(entry.get("amount", 0))
    await _db.carnet_users.update_one(
        {"id": user_id},
        {"$set": {"plumes_balance": credited, "plumes_pending": pending}},
    )


async def link_reservations_for_user(user: dict):
    """Attach reservations matching the user's email, then recompute."""
    email = _norm_email(user.get("email"))
    if not email:
        return
    await _db.smoobu_reservations.update_many(
        {"email": email, "user_id": None}, {"$set": {"user_id": user["id"]}}
    )
    await recompute_user_balances(user["id"])


async def award_newsletter_bonus(user_id: str):
    """Idempotent +100 Plumes on confirmed newsletter subscription."""
    key = f"newsletter_bonus:{user_id}"
    existing = await _db.plumes_ledger.find_one({"idempotency_key": key})
    if existing:
        return False
    await _db.plumes_ledger.insert_one({
        "idempotency_key": key,
        "user_id": user_id,
        "amount": NEWSLETTER_BONUS,
        "type": "newsletter_bonus",
        "status": "credited",
        "origin": "system",
        "comment": "+100 Plumes — Bienvenue dans La Lettre de Marie",
        "created_at": _now_iso(),
    })
    await recompute_user_balances(user_id)
    return True


async def sync_reservations(modified_from: str | None = None, full: bool = False) -> dict:
    """Pull reservations from Smoobu, upsert, classify, link, recompute balances."""
    filters = {"showCancellation": True}
    if full or not modified_from:
        filters["from"] = "2023-01-01"
        filters["to"] = "2030-12-31"
    else:
        filters["modifiedFrom"] = modified_from
    count = 0
    affected_users = set()
    try:
        async for booking in sc.iter_reservations(**filters):
            doc = await _upsert_reservation(booking)
            count += 1
            if doc.get("user_id"):
                affected_users.add(doc["user_id"])
    except Exception as e:  # noqa: BLE001
        logger.error("Smoobu sync error: %s", e)
        await _db.smoobu_sync_state.update_one(
            {"_id": "state"},
            {"$set": {"last_error": str(e), "last_error_at": _now_iso()}},
            upsert=True,
        )
        raise
    for uid in affected_users:
        await recompute_user_balances(uid)
    await _db.smoobu_sync_state.update_one(
        {"_id": "state"},
        {"$set": {"last_sync_at": _now_iso(), "last_count": count, "last_error": None}},
        upsert=True,
    )
    return {"synced": count, "users_updated": len(affected_users)}


async def credit_due_stays() -> int:
    """Move pending -> credited for reservations whose departure has passed."""
    today = date.today().isoformat()
    affected = set()
    cursor = _db.smoobu_reservations.find({"plumes_status": "pending"})
    async for r in cursor:
        dep = r.get("departure")
        if dep and dep <= today:
            await _db.smoobu_reservations.update_one(
                {"smoobu_id": r["smoobu_id"]}, {"$set": {"plumes_status": "credited"}}
            )
            if r.get("user_id"):
                affected.add(r["user_id"])
    for uid in affected:
        await recompute_user_balances(uid)
    return len(affected)
