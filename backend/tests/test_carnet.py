"""Backend tests for Carnet Plume — customer accounts + newsletter double opt-in.

SMTP is intentionally disabled (SMTP_PASSWORD empty). Verification / reset /
newsletter tokens are read directly from MongoDB (test_database) to drive
flows that would normally rely on email.
"""
import os
import time
import uuid
import asyncio

import pytest
import requests
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv("/app/backend/.env")

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://pageinsights-fix.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "test_database")

ADMIN_EMAIL = "hello@plumesuites.fr"
ADMIN_PASSWORD = "PlumeSuites2026!"


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------
@pytest.fixture(scope="session")
def s():
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session


@pytest.fixture(scope="session")
def db():
    client = AsyncIOMotorClient(MONGO_URL)
    return client[DB_NAME]


def _run(coro):
    return asyncio.get_event_loop().run_until_complete(coro)


def _unique_email(prefix="test"):
    return f"TEST_{prefix}_{uuid.uuid4().hex[:10]}@example.com"


def _register(s, email=None, newsletter=False, pwd="MotDePasse123"):
    email = email or _unique_email()
    r = s.post(f"{API}/carnet/register", json={
        "first_name": "Test", "last_name": "User",
        "email": email, "password": pwd, "password_confirm": pwd,
        "newsletter_opt_in": newsletter, "locale": "fr",
    })
    return r, email, pwd


# ---------------------------------------------------------------------------
# Registration
# ---------------------------------------------------------------------------
class TestRegister:
    def test_register_success(self, s):
        r, email, _ = _register(s)
        assert r.status_code == 200, r.text
        data = r.json()
        assert "token" in data and "user" in data
        assert data["user"]["email"] == email.lower()
        assert data["user"]["email_verified"] is False
        assert data["user"]["plumes_balance"] == 0

    def test_register_duplicate(self, s):
        _, email, _ = _register(s)
        r2 = s.post(f"{API}/carnet/register", json={
            "first_name": "X", "last_name": "Y",
            "email": email, "password": "MotDePasse123",
            "password_confirm": "MotDePasse123",
            "newsletter_opt_in": False, "locale": "fr",
        })
        assert r2.status_code == 409

    def test_register_password_mismatch(self, s):
        r = s.post(f"{API}/carnet/register", json={
            "first_name": "A", "last_name": "B",
            "email": _unique_email(), "password": "MotDePasse123",
            "password_confirm": "Different1", "newsletter_opt_in": False, "locale": "fr",
        })
        assert r.status_code == 400


# ---------------------------------------------------------------------------
# Login + brute force
# ---------------------------------------------------------------------------
class TestLogin:
    def test_login_success(self, s):
        _, email, pwd = _register(s)
        r = s.post(f"{API}/login" if False else f"{API}/carnet/login",
                   json={"email": email, "password": pwd})
        assert r.status_code == 200
        assert "token" in r.json()

    def test_login_wrong_password(self, s):
        _, email, _ = _register(s)
        r = s.post(f"{API}/carnet/login", json={"email": email, "password": "wrongpass"})
        assert r.status_code == 401

    def test_login_bruteforce_lock(self, s, db):
        _, email, pwd = _register(s)
        # 5 failures -> lock (429) — clear attempts first
        _run(db.carnet_login_attempts.delete_many({}))
        # Note: requests may be load-balanced across backend pods; each pod's
        # client IP contributes to a separate identifier bucket. Fire enough
        # attempts to guarantee at least one bucket reaches the 5-fail lock.
        got_lock = False
        for i in range(15):
            r = s.post(f"{API}/carnet/login", json={"email": email, "password": "wrong"})
            if r.status_code == 429:
                got_lock = True
                break
        if not got_lock:
            # Now try with correct password — one bucket should be locked
            for _ in range(5):
                r = s.post(f"{API}/carnet/login", json={"email": email, "password": pwd})
                if r.status_code == 429:
                    got_lock = True
                    break
        assert got_lock, "brute-force lock (429) never triggered"


# ---------------------------------------------------------------------------
# /me + role separation
# ---------------------------------------------------------------------------
class TestMeRoleSeparation:
    def test_me_with_user_token(self, s):
        r, email, _ = _register(s)
        token = r.json()["token"]
        me = s.get(f"{API}/carnet/me", headers={"Authorization": f"Bearer {token}"})
        assert me.status_code == 200
        assert me.json()["email"] == email.lower()

    def test_admin_token_cannot_access_carnet_me(self, s):
        r = s.post(f"{API}/admin/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        assert r.status_code == 200
        admin_token = r.json()["token"]
        me = s.get(f"{API}/carnet/me", headers={"Authorization": f"Bearer {admin_token}"})
        assert me.status_code == 401

    def test_user_token_cannot_access_admin_me(self, s):
        r, _, _ = _register(s)
        user_token = r.json()["token"]
        me = s.get(f"{API}/admin/me", headers={"Authorization": f"Bearer {user_token}"})
        assert me.status_code == 401


# ---------------------------------------------------------------------------
# Email verification
# ---------------------------------------------------------------------------
class TestVerifyEmail:
    def test_verify_email_flow(self, s, db):
        r, email, _ = _register(s)
        user_id = r.json()["user"]["id"]
        rec = _run(db.carnet_email_tokens.find_one({"user_id": user_id, "purpose": "verify"}))
        assert rec is not None
        token = rec["token"]
        v = s.post(f"{API}/carnet/verify-email", json={"token": token})
        assert v.status_code == 200
        # reuse -> 400
        v2 = s.post(f"{API}/carnet/verify-email", json={"token": token})
        assert v2.status_code == 400
        user = _run(db.carnet_users.find_one({"id": user_id}))
        assert user["email_verified"] is True


# ---------------------------------------------------------------------------
# Forgot / reset password
# ---------------------------------------------------------------------------
class TestResetPassword:
    def test_reset_flow(self, s, db):
        _, email, pwd = _register(s)
        f = s.post(f"{API}/carnet/forgot-password", json={"email": email, "locale": "fr"})
        assert f.status_code == 200
        user = _run(db.carnet_users.find_one({"email": email.lower()}))
        rec = _run(db.carnet_reset_tokens.find_one({"user_id": user["id"], "used": False}))
        assert rec is not None
        new_pwd = "NouveauPass456"
        r = s.post(f"{API}/carnet/reset-password", json={
            "token": rec["token"], "password": new_pwd, "password_confirm": new_pwd
        })
        assert r.status_code == 200
        # login with new password
        li = s.post(f"{API}/carnet/login", json={"email": email, "password": new_pwd})
        assert li.status_code == 200
        # reuse token -> 400
        r2 = s.post(f"{API}/carnet/reset-password", json={
            "token": rec["token"], "password": new_pwd, "password_confirm": new_pwd
        })
        assert r2.status_code == 400

    def test_forgot_unknown_email_returns_ok(self, s):
        r = s.post(f"{API}/carnet/forgot-password", json={"email": _unique_email(), "locale": "fr"})
        assert r.status_code == 200


# ---------------------------------------------------------------------------
# Change password (bearer)
# ---------------------------------------------------------------------------
class TestChangePassword:
    def test_change_password(self, s):
        r, email, pwd = _register(s)
        token = r.json()["token"]
        h = {"Authorization": f"Bearer {token}"}
        # wrong current
        r1 = s.post(f"{API}/carnet/change-password", headers=h, json={
            "current_password": "wrong", "new_password": "NewPass9876",
            "new_password_confirm": "NewPass9876"
        })
        assert r1.status_code == 400
        # correct
        new_pwd = "NewPass9876"
        r2 = s.post(f"{API}/carnet/change-password", headers=h, json={
            "current_password": pwd, "new_password": new_pwd,
            "new_password_confirm": new_pwd
        })
        assert r2.status_code == 200
        li = s.post(f"{API}/carnet/login", json={"email": email, "password": new_pwd})
        assert li.status_code == 200


# ---------------------------------------------------------------------------
# Change email
# ---------------------------------------------------------------------------
class TestChangeEmail:
    def test_change_email_flow(self, s, db):
        r, email, pwd = _register(s)
        token = r.json()["token"]
        user_id = r.json()["user"]["id"]
        h = {"Authorization": f"Bearer {token}"}
        new_email = _unique_email("newmail")
        c = s.post(f"{API}/carnet/change-email", headers=h,
                   json={"new_email": new_email, "password": pwd})
        assert c.status_code == 200
        user = _run(db.carnet_users.find_one({"id": user_id}))
        assert user.get("pending_email") == new_email.lower()
        rec = _run(db.carnet_email_tokens.find_one({"user_id": user_id, "purpose": "change_email", "used": False}))
        assert rec is not None
        v = s.post(f"{API}/carnet/verify-email-change", json={"token": rec["token"]})
        assert v.status_code == 200
        user2 = _run(db.carnet_users.find_one({"id": user_id}))
        assert user2["email"] == new_email.lower()
        assert user2.get("pending_email") in (None, "")


# ---------------------------------------------------------------------------
# Profile update
# ---------------------------------------------------------------------------
class TestProfile:
    def test_patch_profile(self, s):
        r, _, _ = _register(s)
        token = r.json()["token"]
        p = s.patch(f"{API}/carnet/profile",
                    headers={"Authorization": f"Bearer {token}"},
                    json={"first_name": "Alice", "last_name": "Wonder"})
        assert p.status_code == 200
        d = p.json()
        assert d["first_name"] == "Alice" and d["last_name"] == "Wonder"


# ---------------------------------------------------------------------------
# Newsletter double opt-in
# ---------------------------------------------------------------------------
class TestNewsletter:
    def test_double_optin_flow(self, s, db):
        r, email, _ = _register(s, newsletter=True)
        user_id = r.json()["user"]["id"]
        rec = _run(db.carnet_newsletter.find_one({"email": email.lower()}))
        assert rec is not None
        assert rec["status"] == "pending"
        confirm_token = rec["confirm_token"]
        unsub_token = rec["unsubscribe_token"]
        c = s.post(f"{API}/carnet/newsletter/confirm", json={"token": confirm_token})
        assert c.status_code == 200
        user = _run(db.carnet_users.find_one({"id": user_id}))
        assert user["newsletter_status"] == "confirmed"
        # idempotent
        c2 = s.post(f"{API}/carnet/newsletter/confirm", json={"token": confirm_token})
        assert c2.status_code == 200
        # unsubscribe
        u = s.post(f"{API}/carnet/newsletter/unsubscribe", json={"token": unsub_token})
        assert u.status_code == 200
        user2 = _run(db.carnet_users.find_one({"id": user_id}))
        assert user2["newsletter_status"] == "unsubscribed"


# ---------------------------------------------------------------------------
# Delete account
# ---------------------------------------------------------------------------
class TestDeleteAccount:
    def test_delete_wrong_password(self, s):
        r, _, _ = _register(s)
        token = r.json()["token"]
        d = s.delete(f"{API}/carnet/account",
                     headers={"Authorization": f"Bearer {token}"},
                     json={"password": "wrong"})
        assert d.status_code == 400

    def test_delete_success(self, s):
        r, email, pwd = _register(s)
        token = r.json()["token"]
        d = s.delete(f"{API}/carnet/account",
                     headers={"Authorization": f"Bearer {token}"},
                     json={"password": pwd})
        assert d.status_code == 200
        li = s.post(f"{API}/carnet/login", json={"email": email, "password": pwd})
        assert li.status_code == 401


# ---------------------------------------------------------------------------
# Regression: admin login + contact
# ---------------------------------------------------------------------------
class TestRegression:
    def test_admin_login(self, s):
        r = s.post(f"{API}/admin/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        assert r.status_code == 200

    def test_contact_form(self, s):
        r = s.post(f"{API}/contact", json={
            "name": "TEST Regression",
            "email": _unique_email("contact"),
            "subject": "Test",
            "message": "Hello from tests",
            "locale": "fr",
        })
        assert r.status_code == 200
        assert "id" in r.json()
