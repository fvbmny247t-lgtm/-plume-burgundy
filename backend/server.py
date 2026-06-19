from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
import uuid
from datetime import datetime, timezone

from journal_data import JOURNAL_ARTICLES
from email_service import send_contact_emails


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")


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
async def list_contact_messages():
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
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
