from fastapi import FastAPI, APIRouter, HTTPException, Depends, Header
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
import uuid
import bcrypt
import jwt as pyjwt
from datetime import datetime, timezone, timedelta

from journal_data import JOURNAL_ARTICLES
import carnet
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


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
