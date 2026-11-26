from fastapi import FastAPI, APIRouter, HTTPException, Depends, Header, Request, BackgroundTasks
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import hmac
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
import uuid
import bcrypt
import jwt as pyjwt
from datetime import datetime, timezone, timedelta

from journal_data import JOURNAL_ARTICLES
import carnet
import smoobu_sync
import smoobu_client
import giftcards
try:
    from email_service import send_contact_emails
except Exception as _e:  # never let email layer block server startup
    logging.getLogger(__name__).error(f"email_service import failed: {_e}")
    async def send_contact_emails(*args, **kwargs):
        return {"error": "email_service_unavailable"}


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'test_database')]

app = FastAPI()
api_router = APIRouter(prefix="/api")

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Auth (single admin, JWT Bearer)
# ---------------------------------------------------------------------------
JWT_SECRET = os.environ.get("JWT_SECRET", "dev-secret-change-me")
JWT_ALG = "HS256"
ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "admin@example.com")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "admin123")


def hash_password(pw: str) -> str:
    return bcrypt.hashpw(pw.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(pw: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(pw.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def create_access_token(email: str) -> str:
    payload = {
        "sub": email,
        "role": "admin",
        "type": "access",
        "exp": datetime.now(timezone.utc) + timedelta(hours=12),
    }
    return pyjwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)


async def get_current_admin(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Non authentifié")
    token = authorization[7:]
    try:
        payload = pyjwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])
    except pyjwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Session expirée, reconnectez-vous")
    except pyjwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token invalide")
    admin = await db.admins.find_one({"email": payload.get("sub")})
    if not admin:
        raise HTTPException(status_code=401, detail="Compte introuvable")
    return {"email": admin["email"]}


class AdminLogin(BaseModel):
    email: EmailStr
    password: str


class MessageReadUpdate(BaseModel):
    read: bool


class ContactMessageCreate(BaseModel):
    name: str
    email: EmailStr
    subject: Optional[str] = None
    message: str
    locale: Optional[str] = "fr"


class ContactMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    subject: Optional[str] = None
    message: str
    locale: str = "fr"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


@api_router.get("/")
async def root():
    return {"message": "Plume Suites API"}


# ---- Admin auth routes ----
@api_router.post("/admin/login")
async def admin_login(payload: AdminLogin):
    admin = await db.admins.find_one({"email": payload.email.lower()})
    if not admin or not verify_password(payload.password, admin["password_hash"]):
        raise HTTPException(status_code=401, detail="Identifiants incorrects")
    token = create_access_token(admin["email"])
    return {"token": token, "email": admin["email"]}


@api_router.get("/admin/me")
async def admin_me(admin: dict = Depends(get_current_admin)):
    return admin


@api_router.get("/admin/messages")
async def admin_messages(admin: dict = Depends(get_current_admin)):
    items = await db.contact_messages.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    for it in items:
        it.setdefault("read", False)
    return items


@api_router.patch("/admin/messages/{message_id}")
async def update_message_read(
    message_id: str,
    payload: MessageReadUpdate,
    admin: dict = Depends(get_current_admin),
):
    res = await db.contact_messages.update_one(
        {"id": message_id}, {"$set": {"read": payload.read}}
    )
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Message introuvable")
    return {"id": message_id, "read": payload.read}


@api_router.post("/contact", response_model=ContactMessage)
async def create_contact_message(payload: ContactMessageCreate):
    obj = ContactMessage(**payload.model_dump())
    doc = obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.contact_messages.insert_one(doc)
    # Fire notification + branded auto-reply (failures are logged, not raised)
    try:
        email_result = await send_contact_emails(
            name=obj.name,
            email=obj.email,
            subject=obj.subject or "",
            message=obj.message,
            lang=obj.locale or "fr",
        )
        await db.contact_messages.update_one(
            {"id": obj.id}, {"$set": {"email_result": email_result}}
        )
    except Exception as e:  # noqa: BLE001
        logging.getLogger(__name__).error(f"send_contact_emails error: {e}")
    return obj


@api_router.get("/contact", response_model=List[ContactMessage])
async def list_contact_messages(admin: dict = Depends(get_current_admin)):
    items = await db.contact_messages.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    for it in items:
        if isinstance(it.get('created_at'), str):
            it['created_at'] = datetime.fromisoformat(it['created_at'])
    return items


@api_router.get("/journal")
async def list_journal():
    return [
        {k: v for k, v in a.items() if k != "body"} for a in JOURNAL_ARTICLES
    ]


@api_router.get("/journal/{slug}")
async def get_journal_article(slug: str):
    for a in JOURNAL_ARTICLES:
        if a["slug"] == slug:
            return a
    raise HTTPException(status_code=404, detail="Article not found")


carnet.configure(db, JWT_SECRET)
api_router.include_router(carnet.router)

smoobu_sync.configure(db)


class ChannelUpdate(BaseModel):
    category: str
    eligible: bool


@api_router.post("/admin/smoobu/sync")
async def admin_smoobu_sync(full: bool = False, admin: dict = Depends(get_current_admin)):
    state = await db.smoobu_sync_state.find_one({"_id": "state"})
    modified_from = None
    if not full and state and state.get("last_sync_at"):
        modified_from = (datetime.now(timezone.utc) - timedelta(days=7)).strftime("%Y-%m-%d")
    result = await smoobu_sync.sync_reservations(modified_from=modified_from, full=full)
    credited = await smoobu_sync.credit_due_stays()
    result["stays_credited_users"] = credited
    return result


@api_router.get("/admin/smoobu/state")
async def admin_smoobu_state(admin: dict = Depends(get_current_admin)):
    state = await db.smoobu_sync_state.find_one({"_id": "state"}, {"_id": 0})
    total = await db.smoobu_reservations.count_documents({})
    linked = await db.smoobu_reservations.count_documents({"user_id": {"$ne": None}})
    return {"state": state or {}, "reservations_total": total, "reservations_linked": linked}


@api_router.get("/admin/smoobu/apartments")
async def admin_smoobu_apartments(admin: dict = Depends(get_current_admin)):
    return await smoobu_client.get_apartments()


@api_router.get("/admin/smoobu/channels")
async def admin_smoobu_channels(admin: dict = Depends(get_current_admin)):
    items = await db.smoobu_channels.find({}, {"_id": 0}).to_list(200)
    return items


@api_router.patch("/admin/smoobu/channels/{channel_id}")
async def admin_update_channel(channel_id: int, payload: ChannelUpdate, admin: dict = Depends(get_current_admin)):
    await db.smoobu_channels.update_one(
        {"channel_id": channel_id},
        {"$set": {"category": payload.category, "eligible": payload.eligible}},
        upsert=True,
    )
    return {"channel_id": channel_id, "category": payload.category, "eligible": payload.eligible}


WEBHOOK_CRON_SECRET = os.environ.get("WEBHOOK_CRON_SECRET")


async def _run_smoobu_reconcile():
    try:
        modified_from = (datetime.now(timezone.utc) - timedelta(days=14)).strftime("%Y-%m-%d")
        await smoobu_sync.sync_reservations(modified_from=modified_from)
        await smoobu_sync.credit_due_stays()
        logger.info("Smoobu reconcile cron completed")
    except Exception as e:  # noqa: BLE001
        logger.error("Smoobu reconcile cron failed: %s", e)


@api_router.post("/cron/smoobu-reconcile")
async def cron_smoobu_reconcile(request: Request, background_tasks: BackgroundTasks):
    # Cron endpoints must ack 2xx immediately; enqueue/background the actual work.
    auth = request.headers.get("authorization", "")
    token = auth[7:] if auth.startswith("Bearer ") else ""
    if not WEBHOOK_CRON_SECRET or not hmac.compare_digest(token, WEBHOOK_CRON_SECRET):
        raise HTTPException(status_code=401, detail="unauthorized")
    background_tasks.add_task(_run_smoobu_reconcile)
    return {"accepted": True}


# ---- Gift cards (coffrets) ----
giftcards.configure(db, get_current_admin)
api_router.include_router(giftcards.router)


class CoffretIn(BaseModel):
    slug: str
    name: dict
    tagline: dict | None = None
    description: dict | None = None
    price: float
    image_url: str | None = None
    includes: list = []
    active: bool = True
    sort_order: int = 99


class RedemptionUpdate(BaseModel):
    status: str
    admin_note: str | None = None


@api_router.post("/stripe/webhook")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig = request.headers.get("stripe-signature", "")
    return await giftcards.handle_webhook(payload, sig)


@api_router.get("/admin/giftcards/coffrets")
async def admin_gc_coffrets(admin: dict = Depends(get_current_admin)):
    return await giftcards.admin_list_coffrets()


@api_router.post("/admin/giftcards/coffrets")
async def admin_gc_create(payload: CoffretIn, admin: dict = Depends(get_current_admin)):
    return await giftcards.admin_upsert_coffret(payload.model_dump())


@api_router.put("/admin/giftcards/coffrets/{coffret_id}")
async def admin_gc_update(coffret_id: str, payload: CoffretIn, admin: dict = Depends(get_current_admin)):
    return await giftcards.admin_upsert_coffret(payload.model_dump(), coffret_id)


@api_router.delete("/admin/giftcards/coffrets/{coffret_id}")
async def admin_gc_delete(coffret_id: str, admin: dict = Depends(get_current_admin)):
    return await giftcards.admin_delete_coffret(coffret_id)


@api_router.get("/admin/giftcards/cards")
async def admin_gc_cards(admin: dict = Depends(get_current_admin)):
    return await giftcards.admin_list_cards()


@api_router.get("/admin/giftcards/redemptions")
async def admin_gc_redemptions(admin: dict = Depends(get_current_admin)):
    return await giftcards.admin_list_redemptions()


@api_router.patch("/admin/giftcards/redemptions/{redemption_id}")
async def admin_gc_update_redemption(redemption_id: str, payload: RedemptionUpdate, admin: dict = Depends(get_current_admin)):
    return await giftcards.admin_update_redemption(redemption_id, payload.status, payload.admin_note)


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)


@app.on_event("startup")
async def seed_admin():
    email = ADMIN_EMAIL.lower()
    existing = await db.admins.find_one({"email": email})
    if existing is None:
        await db.admins.insert_one({
            "email": email,
            "password_hash": hash_password(ADMIN_PASSWORD),
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        logger.info("Seeded admin account: %s", email)
    elif not verify_password(ADMIN_PASSWORD, existing["password_hash"]):
        await db.admins.update_one(
            {"email": email}, {"$set": {"password_hash": hash_password(ADMIN_PASSWORD)}}
        )
        logger.info("Updated admin password for: %s", email)
    await carnet.ensure_indexes()
    await smoobu_sync.ensure_indexes()
    await giftcards.ensure_indexes_and_seed()


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
