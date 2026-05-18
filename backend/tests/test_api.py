"""Backend API tests for Plume Suites: journal + contact."""
import os
import requests
import pytest

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://plume-burgundy-edit.preview.emergentagent.com').rstrip('/')
API = f"{BASE_URL}/api"


@pytest.fixture(scope="module")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# --- Journal endpoints ---
class TestJournal:
    def test_list_journal_returns_5(self, session):
        r = session.get(f"{API}/journal", timeout=30)
        assert r.status_code == 200, r.text
        data = r.json()
        assert isinstance(data, list)
        assert len(data) == 5
        slugs = {a["slug"] for a in data}
        assert "matins-au-bord-du-canal" in slugs
        # excerpt fields exist and bilingual
        assert "fr" in data[0]["title"] and "en" in data[0]["title"]
        # body should NOT be in list endpoint
        assert "body" not in data[0]

    def test_get_journal_article_bilingual_body(self, session):
        r = session.get(f"{API}/journal/matins-au-bord-du-canal", timeout=30)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["slug"] == "matins-au-bord-du-canal"
        assert "body" in data
        assert "fr" in data["body"] and "en" in data["body"]
        assert isinstance(data["body"]["fr"], list) and len(data["body"]["fr"]) > 0
        assert isinstance(data["body"]["en"], list) and len(data["body"]["en"]) > 0

    def test_get_journal_article_404(self, session):
        r = session.get(f"{API}/journal/does-not-exist-slug", timeout=30)
        assert r.status_code == 404


# --- Contact endpoints ---
class TestContact:
    def test_post_contact_creates_message(self, session):
        payload = {
            "name": "TEST_User",
            "email": "test_user@example.com",
            "subject": "TEST Booking question",
            "message": "TEST_ Hello from pytest",
            "locale": "fr",
        }
        r = session.post(f"{API}/contact", json=payload, timeout=30)
        assert r.status_code == 200, r.text
        data = r.json()
        assert "id" in data and isinstance(data["id"], str) and len(data["id"]) > 0
        assert "created_at" in data
        assert data["name"] == payload["name"]
        assert data["email"] == payload["email"]
        assert data["message"] == payload["message"]
        # store id for later
        pytest.created_contact_id = data["id"]

    def test_get_contact_lists_messages(self, session):
        r = session.get(f"{API}/contact", timeout=30)
        assert r.status_code == 200, r.text
        items = r.json()
        assert isinstance(items, list)
        # The message we just inserted should be present
        ids = [it.get("id") for it in items]
        assert getattr(pytest, "created_contact_id", None) in ids
        # ensure no mongo _id leak
        for it in items:
            assert "_id" not in it

    def test_post_contact_invalid_email_422(self, session):
        payload = {
            "name": "TEST_Bad",
            "email": "not-an-email",
            "message": "TEST_ invalid email",
        }
        r = session.post(f"{API}/contact", json=payload, timeout=30)
        assert r.status_code == 422
