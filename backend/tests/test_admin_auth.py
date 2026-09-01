"""Backend tests — Espace admin privé (JWT auth) — iteration 6."""
import os
import re
from pathlib import Path

import pytest
import requests
from dotenv import dotenv_values

frontend_env = dotenv_values("/app/frontend/.env")
base_url = os.environ.get("REACT_APP_BACKEND_URL") or frontend_env.get("REACT_APP_BACKEND_URL")
if not base_url:
    raise RuntimeError("REACT_APP_BACKEND_URL missing")
API = f"{base_url.rstrip('/')}/api"


@pytest.fixture(scope="module")
def creds():
    p = Path("/app/memory/test_credentials.md")
    if not p.exists():
        pytest.skip("missing test_credentials.md")
    c = p.read_text(encoding="utf-8")
    e = re.search(r"(?im)^\s*(?:[-*]\s*)?(?:\*\*)?email(?:\*\*)?\s*:\s*`?([^`\s]+)", c)
    pw = re.search(r"(?im)^\s*(?:[-*]\s*)?(?:\*\*)?password(?:\*\*)?\s*:\s*`?([^`\s]+)", c)
    if not e or not pw:
        pytest.skip("no creds parsed")
    return {"email": e.group(1), "password": pw.group(1)}


@pytest.fixture(scope="module")
def token(creds):
    r = requests.post(f"{API}/admin/login", json=creds, timeout=30)
    if r.status_code != 200:
        pytest.fail(f"login failed {r.status_code}: {r.text[:300]}")
    return r.json()["token"]


# --- POST /api/admin/login ---
class TestAdminLogin:
    def test_login_success(self, creds):
        r = requests.post(f"{API}/admin/login", json=creds, timeout=30)
        assert r.status_code == 200, r.text
        d = r.json()
        assert isinstance(d.get("token"), str) and len(d["token"]) > 20
        assert d.get("email") == creds["email"].lower()
        assert d["token"].count(".") == 2  # JWT

    def test_login_case_insensitive_email(self, creds):
        r = requests.post(
            f"{API}/admin/login",
            json={"email": creds["email"].upper(), "password": creds["password"]},
            timeout=30,
        )
        assert r.status_code == 200, r.text
        assert r.json()["email"] == creds["email"].lower()

    def test_login_wrong_password(self, creds):
        r = requests.post(
            f"{API}/admin/login",
            json={"email": creds["email"], "password": "WrongPass123!"},
            timeout=30,
        )
        assert r.status_code == 401
        assert "detail" in r.json()

    def test_login_unknown_email(self):
        r = requests.post(
            f"{API}/admin/login",
            json={"email": "nobody@example.com", "password": "whatever"},
            timeout=30,
        )
        assert r.status_code == 401

    def test_login_validation_error(self):
        r = requests.post(f"{API}/admin/login", json={"email": "not-an-email"}, timeout=30)
        assert r.status_code == 422


# --- GET /api/admin/me ---
class TestAdminMe:
    def test_me_with_token(self, token, creds):
        r = requests.get(f"{API}/admin/me", headers={"Authorization": f"Bearer {token}"}, timeout=30)
        assert r.status_code == 200, r.text
        assert r.json()["email"] == creds["email"].lower()
        assert "_id" not in r.json()

    def test_me_no_header(self):
        assert requests.get(f"{API}/admin/me", timeout=30).status_code == 401

    def test_me_bad_token(self):
        r = requests.get(f"{API}/admin/me", headers={"Authorization": "Bearer abc.def.ghi"}, timeout=30)
        assert r.status_code == 401

    def test_me_malformed_scheme(self, token):
        r = requests.get(f"{API}/admin/me", headers={"Authorization": token}, timeout=30)
        assert r.status_code == 401


# --- GET /api/admin/messages & GET /api/contact (protected) ---
class TestAdminMessages:
    def test_messages_requires_auth(self):
        assert requests.get(f"{API}/admin/messages", timeout=30).status_code == 401

    def test_messages_with_token(self, token):
        r = requests.get(f"{API}/admin/messages", headers={"Authorization": f"Bearer {token}"}, timeout=30)
        assert r.status_code == 200, r.text
        data = r.json()
        assert isinstance(data, list)
        assert len(data) >= 4, f"expected >=4 messages, got {len(data)}"
        for m in data:
            assert "_id" not in m
            assert "name" in m and "email" in m and "message" in m
            assert "created_at" in m

    def test_contact_get_protected(self):
        assert requests.get(f"{API}/contact", timeout=30).status_code == 401

    def test_contact_get_with_token(self, token):
        r = requests.get(f"{API}/contact", headers={"Authorization": f"Bearer {token}"}, timeout=30)
        assert r.status_code == 200, r.text
        assert isinstance(r.json(), list)


# --- POST /api/contact stays public + persists ---
class TestPublicContactPost:
    def test_post_contact_public_and_visible_to_admin(self, token):
        payload = {
            "name": "TEST_QA_Admin",
            "email": "test_qa_admin@example.com",
            "subject": "TEST_QA subject",
            "message": "TEST_QA message body",
            "locale": "fr",
        }
        r = requests.post(f"{API}/contact", json=payload, timeout=60)
        assert r.status_code == 200, r.text
        created = r.json()
        assert created["name"] == payload["name"]
        assert "id" in created and "_id" not in created

        r2 = requests.get(f"{API}/admin/messages", headers={"Authorization": f"Bearer {token}"}, timeout=30)
        assert r2.status_code == 200
        assert any(m.get("id") == created["id"] for m in r2.json()), "new message not returned by admin endpoint"
