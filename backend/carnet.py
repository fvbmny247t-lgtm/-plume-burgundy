"""Carnet Plume — customer accounts, authentication and La Lettre de Marie.

Distinct from the single admin account (collection `admins`). Customers live
in `carnet_users` with role "user"; their JWTs carry role="user" so admin and
customer tokens never cross-authorize.
"""
import os
import uuid
import secrets
import logging
from datetime import datetime, timezone, timedelta
from typing import Optional

import bcrypt
import jwt as pyjwt
from fastapi import APIRouter, HTTPException, Header, Depends, Request
from pydantic import BaseModel, EmailStr, Field

import email_service as mail

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/carnet")

JWT_ALG = "HS256"
NEWSLETTER_TEXT_VERSION = "2026-06"

_db = None
_jwt_secret = "dev-secret-change-me"


def configure(db, jwt_secret: str):
    global _db, _jwt_secret
    _db = db
    _jwt_secret = jwt_secret


async def ensure_indexes():
    if _db is None:
        return
    await _db.carnet_users.create_index("email", unique=True)
    await _db.carnet_email_tokens.create_index("token", unique=True)
    await _db.carnet_reset_tokens.create_index("token", unique=True)
    await _db.carnet_newsletter.create_index("email", unique=True)


def _public_base() -> str:
    return os.environ.get("PUBLIC_BASE_URL", "http://localhost:3000").rstrip("/")


def _hash(pw: str) -> str:
    return bcrypt.hashpw(pw.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def _verify(pw: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(pw.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def _now():
    return datetime.now(timezone.utc)


def _iso(dt: datetime) -> str:
    return dt.isoformat()


def _token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "role": "user",
        "type": "access",
        "exp": _now() + timedelta(days=7),
    }
    return pyjwt.encode(payload, _jwt_secret, algorithm=JWT_ALG)


def _serialize(user: dict) -> dict:
    return {
        "id": user["id"],
        "first_name": user.get("first_name", ""),
        "last_name": user.get("last_name", ""),
        "email": user["email"],
        "email_verified": bool(user.get("email_verified", False)),
        "pending_email": user.get("pending_email"),
        "newsletter_status": user.get("newsletter_status", "none"),
        "plumes_balance": int(user.get("plumes_balance", 0)),
        "plumes_pending": int(user.get("plumes_pending", 0)),
        "created_at": user.get("created_at"),
    }


async def get_current_user(authorization: Optional[str] = Header(None)) -> dict:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Non authentifié")
    token = authorization[7:]
    try:
        payload = pyjwt.decode(token, _jwt_secret, algorithms=[JWT_ALG])
    except pyjwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Session expirée, reconnectez-vous")
    except pyjwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token invalide")
    if payload.get("role") != "user":
        raise HTTPException(status_code=401, detail="Token invalide")
    user = await _db.carnet_users.find_one({"id": payload.get("sub")})
    if not user:
        raise HTTPException(status_code=401, detail="Compte introuvable")
    return user


# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------
class RegisterIn(BaseModel):
    first_name: str = Field(min_length=1, max_length=80)
    last_name: str = Field(min_length=1, max_length=80)
    email: EmailStr
    password: str = Field(min_length=8, max_length=200)
    password_confirm: str
    newsletter_opt_in: bool = False
    locale: str = "fr"


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class ForgotIn(BaseModel):
    email: EmailStr
    locale: str = "fr"


class ResetIn(BaseModel):
    token: str
    password: str = Field(min_length=8, max_length=200)
    password_confirm: str


class ChangePwdIn(BaseModel):
    current_password: str
    new_password: str = Field(min_length=8, max_length=200)
    new_password_confirm: str


class ChangeEmailIn(BaseModel):
    new_email: EmailStr
    password: str


class UpdateProfileIn(BaseModel):
    first_name: str = Field(min_length=1, max_length=80)
    last_name: str = Field(min_length=1, max_length=80)


class DeleteAccountIn(BaseModel):
    password: str


class TokenIn(BaseModel):
    token: str


class NewsletterSubscribeIn(BaseModel):
    email: EmailStr
    locale: str = "fr"
    source: str = "site"


# ---------------------------------------------------------------------------
# Helpers: tokens & emails
# ---------------------------------------------------------------------------
async def _create_email_token(user_id: str, purpose: str, new_email: str = None, hours: int = 48) -> str:
    token = secrets.token_urlsafe(32)
    await _db.carnet_email_tokens.insert_one({
        "token": token,
        "user_id": user_id,
        "purpose": purpose,
        "new_email": new_email,
        "used": False,
        "expires_at": _iso(_now() + timedelta(hours=hours)),
        "created_at": _iso(_now()),
    })
    return token


async def _send_verification(user: dict):
    token = await _create_email_token(user["id"], "verify", hours=48)
    url = f"{_public_base()}/carnet/verifier?token={token}"
    try:
        await mail.send_verification_email(user["email"], user.get("first_name", ""), url, user.get("locale", "fr"))
    except Exception as e:  # noqa: BLE001
        logger.error(f"verification email failed: {e}")
    logger.info("Carnet verify link for %s: %s", user["email"], url)


async def _upsert_newsletter(email: str, user_id: str, locale: str, source: str):
    """Create or reset a pending double opt-in entry and send the confirm email."""
    email = email.lower().strip()
    existing = await _db.carnet_newsletter.find_one({"email": email})
    if existing and existing.get("status") == "confirmed":
        if user_id and not existing.get("user_id"):
            await _db.carnet_newsletter.update_one({"email": email}, {"$set": {"user_id": user_id}})
        return existing.get("status")

    confirm_token = secrets.token_urlsafe(32)
    unsub_token = existing.get("unsubscribe_token") if existing else None
    unsub_token = unsub_token or secrets.token_urlsafe(32)
    doc = {
        "email": email,
        "user_id": user_id,
        "status": "pending",
        "source": source,
        "text_version": NEWSLETTER_TEXT_VERSION,
        "opt_in_at": _iso(_now()),
        "confirm_token": confirm_token,
        "confirmed_at": None,
        "unsubscribe_token": unsub_token,
        "unsubscribed_at": None,
    }
    if existing:
        await _db.carnet_newsletter.update_one({"email": email}, {"$set": doc})
        doc["id"] = existing.get("id", str(uuid.uuid4()))
    else:
        doc["id"] = str(uuid.uuid4())
        await _db.carnet_newsletter.insert_one(doc)

    confirm_url = f"{_public_base()}/lettre/confirmer?token={confirm_token}"
    unsub_url = f"{_public_base()}/lettre/desinscription?token={unsub_token}"
    try:
        await mail.send_newsletter_confirm_email(email, confirm_url, unsub_url, locale)
    except Exception as e:  # noqa: BLE001
        logger.error(f"newsletter confirm email failed: {e}")
    logger.info("Newsletter confirm link for %s: %s", email, confirm_url)
    return "pending"


# ---------------------------------------------------------------------------
# Brute force protection (login)
# ---------------------------------------------------------------------------
async def _bruteforce_check(identifier: str):
    rec = await _db.carnet_login_attempts.find_one({"identifier": identifier})
    if rec and rec.get("locked_until"):
        locked_until = datetime.fromisoformat(rec["locked_until"])
        if locked_until > _now():
            raise HTTPException(status_code=429, detail="Trop de tentatives. Réessayez dans quelques minutes.")


async def _bruteforce_fail(identifier: str):
    rec = await _db.carnet_login_attempts.find_one({"identifier": identifier})
    count = (rec.get("count", 0) if rec else 0) + 1
    update = {"count": count, "updated_at": _iso(_now())}
    if count >= 5:
        update["locked_until"] = _iso(_now() + timedelta(minutes=15))
        update["count"] = 0
    await _db.carnet_login_attempts.update_one(
        {"identifier": identifier}, {"$set": update}, upsert=True
    )


async def _bruteforce_clear(identifier: str):
    await _db.carnet_login_attempts.delete_one({"identifier": identifier})


def _client_id(request: Request, email: str) -> str:
    xff = request.headers.get("x-forwarded-for")
    if xff:
        ip = xff.split(",")[0].strip()
    else:
        ip = request.headers.get("x-real-ip") or (request.client.host if request.client else "?")
    return f"{ip}:{email.lower()}"


# ---------------------------------------------------------------------------
# Auth endpoints
# ---------------------------------------------------------------------------
@router.post("/register")
async def register(payload: RegisterIn):
    if payload.password != payload.password_confirm:
        raise HTTPException(status_code=400, detail="Les mots de passe ne correspondent pas")
    email = payload.email.lower().strip()
    if await _db.carnet_users.find_one({"email": email}):
        raise HTTPException(status_code=409, detail="Un compte existe déjà avec cette adresse")

    user = {
        "id": str(uuid.uuid4()),
        "first_name": payload.first_name.strip(),
        "last_name": payload.last_name.strip(),
        "email": email,
        "password_hash": _hash(payload.password),
        "role": "user",
        "email_verified": False,
        "pending_email": None,
        "newsletter_status": "none",
        "plumes_balance": 0,
        "plumes_pending": 0,
        "locale": payload.locale,
        "created_at": _iso(_now()),
        "updated_at": _iso(_now()),
    }
    await _db.carnet_users.insert_one(user)
    await _send_verification(user)

    if payload.newsletter_opt_in:
        status = await _upsert_newsletter(email, user["id"], payload.locale, "inscription")
        await _db.carnet_users.update_one({"id": user["id"]}, {"$set": {"newsletter_status": status}})
        user["newsletter_status"] = status

    token = _token(user["id"], email)
    return {"token": token, "user": _serialize(user)}


@router.post("/login")
async def login(payload: LoginIn, request: Request):
    email = payload.email.lower().strip()
    identifier = _client_id(request, email)
    await _bruteforce_check(identifier)
    user = await _db.carnet_users.find_one({"email": email})
    if not user or not _verify(payload.password, user["password_hash"]):
        await _bruteforce_fail(identifier)
        raise HTTPException(status_code=401, detail="Identifiants incorrects")
    await _bruteforce_clear(identifier)
    token = _token(user["id"], email)
    return {"token": token, "user": _serialize(user)}


@router.post("/logout")
async def logout(user: dict = Depends(get_current_user)):
    return {"ok": True}


@router.get("/me")
async def me(user: dict = Depends(get_current_user)):
    return _serialize(user)


@router.post("/verify-email")
async def verify_email(payload: TokenIn):
    rec = await _db.carnet_email_tokens.find_one({"token": payload.token, "purpose": "verify"})
    if not rec or rec.get("used"):
        raise HTTPException(status_code=400, detail="Lien invalide ou déjà utilisé")
    if datetime.fromisoformat(rec["expires_at"]) < _now():
        raise HTTPException(status_code=400, detail="Lien expiré")
    user = await _db.carnet_users.find_one({"id": rec["user_id"]})
    if not user:
        raise HTTPException(status_code=404, detail="Compte introuvable")
    await _db.carnet_email_tokens.update_one({"token": payload.token}, {"$set": {"used": True}})
    if not user.get("email_verified"):
        await _db.carnet_users.update_one({"id": user["id"]}, {"$set": {"email_verified": True, "updated_at": _iso(_now())}})
        carnet_url = f"{_public_base()}/carnet"
        try:
            await mail.send_welcome_carnet_email(user["email"], user.get("first_name", ""), carnet_url, user.get("locale", "fr"))
        except Exception as e:  # noqa: BLE001
            logger.error(f"welcome email failed: {e}")
    return {"ok": True}


@router.post("/resend-verification")
async def resend_verification(user: dict = Depends(get_current_user)):
    if user.get("email_verified"):
        return {"ok": True, "already_verified": True}
    await _send_verification(user)
    return {"ok": True}


@router.post("/forgot-password")
async def forgot_password(payload: ForgotIn):
    email = payload.email.lower().strip()
    user = await _db.carnet_users.find_one({"email": email})
    if user:
        token = secrets.token_urlsafe(32)
        await _db.carnet_reset_tokens.insert_one({
            "token": token,
            "user_id": user["id"],
            "used": False,
            "expires_at": _iso(_now() + timedelta(hours=1)),
            "created_at": _iso(_now()),
        })
        url = f"{_public_base()}/carnet/reinitialiser?token={token}"
        try:
            await mail.send_reset_password_email(email, user.get("first_name", ""), url, payload.locale)
        except Exception as e:  # noqa: BLE001
            logger.error(f"reset email failed: {e}")
        logger.info("Carnet reset link for %s: %s", email, url)
    return {"ok": True}


@router.post("/reset-password")
async def reset_password(payload: ResetIn):
    if payload.password != payload.password_confirm:
        raise HTTPException(status_code=400, detail="Les mots de passe ne correspondent pas")
    rec = await _db.carnet_reset_tokens.find_one({"token": payload.token})
    if not rec or rec.get("used"):
        raise HTTPException(status_code=400, detail="Lien invalide ou déjà utilisé")
    if datetime.fromisoformat(rec["expires_at"]) < _now():
        raise HTTPException(status_code=400, detail="Lien expiré")
    user = await _db.carnet_users.find_one({"id": rec["user_id"]})
    if not user:
        raise HTTPException(status_code=404, detail="Compte introuvable")
    await _db.carnet_users.update_one(
        {"id": user["id"]}, {"$set": {"password_hash": _hash(payload.password), "updated_at": _iso(_now())}}
    )
    await _db.carnet_reset_tokens.update_one({"token": payload.token}, {"$set": {"used": True}})
    try:
        await mail.send_password_changed_email(user["email"], user.get("first_name", ""), user.get("locale", "fr"))
    except Exception as e:  # noqa: BLE001
        logger.error(f"password changed email failed: {e}")
    return {"ok": True}


@router.patch("/profile")
async def update_profile(payload: UpdateProfileIn, user: dict = Depends(get_current_user)):
    await _db.carnet_users.update_one(
        {"id": user["id"]},
        {"$set": {"first_name": payload.first_name.strip(), "last_name": payload.last_name.strip(), "updated_at": _iso(_now())}},
    )
    fresh = await _db.carnet_users.find_one({"id": user["id"]})
    return _serialize(fresh)


@router.post("/change-password")
async def change_password(payload: ChangePwdIn, user: dict = Depends(get_current_user)):
    if not _verify(payload.current_password, user["password_hash"]):
        raise HTTPException(status_code=400, detail="Mot de passe actuel incorrect")
    if payload.new_password != payload.new_password_confirm:
        raise HTTPException(status_code=400, detail="Les mots de passe ne correspondent pas")
    await _db.carnet_users.update_one(
        {"id": user["id"]}, {"$set": {"password_hash": _hash(payload.new_password), "updated_at": _iso(_now())}}
    )
    try:
        await mail.send_password_changed_email(user["email"], user.get("first_name", ""), user.get("locale", "fr"))
    except Exception as e:  # noqa: BLE001
        logger.error(f"password changed email failed: {e}")
    return {"ok": True}


@router.post("/change-email")
async def change_email(payload: ChangeEmailIn, user: dict = Depends(get_current_user)):
    if not _verify(payload.password, user["password_hash"]):
        raise HTTPException(status_code=400, detail="Mot de passe incorrect")
    new_email = payload.new_email.lower().strip()
    if new_email == user["email"]:
        raise HTTPException(status_code=400, detail="Cette adresse est déjà la vôtre")
    if await _db.carnet_users.find_one({"email": new_email}):
        raise HTTPException(status_code=409, detail="Cette adresse est déjà utilisée")
    await _db.carnet_users.update_one({"id": user["id"]}, {"$set": {"pending_email": new_email}})
    token = await _create_email_token(user["id"], "change_email", new_email=new_email, hours=24)
    url = f"{_public_base()}/carnet/confirmer-email?token={token}"
    try:
        await mail.send_verification_email(new_email, user.get("first_name", ""), url, user.get("locale", "fr"))
    except Exception as e:  # noqa: BLE001
        logger.error(f"change-email verification failed: {e}")
    logger.info("Carnet change-email link for %s: %s", new_email, url)
    return {"ok": True}


@router.post("/verify-email-change")
async def verify_email_change(payload: TokenIn):
    rec = await _db.carnet_email_tokens.find_one({"token": payload.token, "purpose": "change_email"})
    if not rec or rec.get("used"):
        raise HTTPException(status_code=400, detail="Lien invalide ou déjà utilisé")
    if datetime.fromisoformat(rec["expires_at"]) < _now():
        raise HTTPException(status_code=400, detail="Lien expiré")
    new_email = rec.get("new_email")
    if not new_email:
        raise HTTPException(status_code=400, detail="Lien invalide")
    if await _db.carnet_users.find_one({"email": new_email}):
        raise HTTPException(status_code=409, detail="Cette adresse est déjà utilisée")
    await _db.carnet_users.update_one(
        {"id": rec["user_id"]},
        {"$set": {"email": new_email, "pending_email": None, "email_verified": True, "updated_at": _iso(_now())}},
    )
    await _db.carnet_email_tokens.update_one({"token": payload.token}, {"$set": {"used": True}})
    return {"ok": True}


@router.delete("/account")
async def delete_account(payload: DeleteAccountIn, user: dict = Depends(get_current_user)):
    if not _verify(payload.password, user["password_hash"]):
        raise HTTPException(status_code=400, detail="Mot de passe incorrect")
    await _db.carnet_users.delete_one({"id": user["id"]})
    await _db.carnet_email_tokens.delete_many({"user_id": user["id"]})
    await _db.carnet_reset_tokens.delete_many({"user_id": user["id"]})
    await _db.carnet_newsletter.update_many(
        {"user_id": user["id"]}, {"$set": {"user_id": None}}
    )
    return {"ok": True}


# ---------------------------------------------------------------------------
# La Lettre de Marie (double opt-in)
# ---------------------------------------------------------------------------
@router.post("/newsletter/subscribe")
async def newsletter_subscribe(payload: NewsletterSubscribeIn, authorization: Optional[str] = Header(None)):
    user_id = None
    if authorization and authorization.startswith("Bearer "):
        try:
            p = pyjwt.decode(authorization[7:], _jwt_secret, algorithms=[JWT_ALG])
            if p.get("role") == "user":
                user_id = p.get("sub")
        except Exception:
            user_id = None
    status = await _upsert_newsletter(payload.email.lower().strip(), user_id, payload.locale, payload.source)
    if user_id:
        await _db.carnet_users.update_one({"id": user_id}, {"$set": {"newsletter_status": status}})
    return {"ok": True, "status": status}


@router.post("/newsletter/confirm")
async def newsletter_confirm(payload: TokenIn):
    rec = await _db.carnet_newsletter.find_one({"confirm_token": payload.token})
    if not rec:
        raise HTTPException(status_code=400, detail="Lien invalide")
    if rec.get("status") != "confirmed":
        await _db.carnet_newsletter.update_one(
            {"email": rec["email"]},
            {"$set": {"status": "confirmed", "confirmed_at": _iso(_now()), "unsubscribed_at": None}},
        )
        if rec.get("user_id"):
            await _db.carnet_users.update_one(
                {"id": rec["user_id"]}, {"$set": {"newsletter_status": "confirmed"}}
            )
            # TODO Phase 6/7: crediter le bonus unique de 100 Plumes (ledger).
    return {"ok": True, "status": "confirmed"}


@router.post("/newsletter/unsubscribe")
async def newsletter_unsubscribe(payload: TokenIn):
    rec = await _db.carnet_newsletter.find_one({"unsubscribe_token": payload.token})
    if not rec:
        raise HTTPException(status_code=400, detail="Lien invalide")
    await _db.carnet_newsletter.update_one(
        {"email": rec["email"]},
        {"$set": {"status": "unsubscribed", "unsubscribed_at": _iso(_now())}},
    )
    if rec.get("user_id"):
        await _db.carnet_users.update_one(
            {"id": rec["user_id"]}, {"$set": {"newsletter_status": "unsubscribed"}}
        )
    return {"ok": True, "status": "unsubscribed"}
