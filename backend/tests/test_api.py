"""Backend API tests for Plume Suites — iteration 3: 11 articles, contact CRUD."""
import os
import requests
import pytest

BASE_URL = os.environ['REACT_APP_BACKEND_URL'].rstrip('/')
API = f"{BASE_URL}/api"

EXPECTED_SLUGS_FIRST_6 = [
    "canal-de-bourgogne-velo-fleurey",
    "eurovelo-6-bourgogne",
    "week-end-velo-canal-dijon-beaune",
    "que-faire-a-dijon-week-end",
    "visiter-beaune-48-heures",
    "climats-bourgogne-unesco",
]


@pytest.fixture(scope="module")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# --- Journal endpoints ---
class TestJournal:
    def test_list_journal_returns_11(self, session):
        r = session.get(f"{API}/journal", timeout=30)
        assert r.status_code == 200, r.text
        data = r.json()
        assert isinstance(data, list)
        assert len(data) == 11, f"expected 11 articles, got {len(data)}"
        slugs = [a["slug"] for a in data]
        # First 3 cycling, then 3 SEO landmarks
        assert slugs[:6] == EXPECTED_SLUGS_FIRST_6, f"first 6 slugs incorrect: {slugs[:6]}"
        assert "route-des-vins" in slugs
        # Bilingual title
        assert "fr" in data[0]["title"] and "en" in data[0]["title"]
        # body excluded from list
        assert "body" not in data[0]

    @pytest.mark.parametrize("slug", EXPECTED_SLUGS_FIRST_6)
    def test_get_article_full_body(self, session, slug):
        r = session.get(f"{API}/journal/{slug}", timeout=30)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["slug"] == slug
        assert "body" in data
        assert "fr" in data["body"] and "en" in data["body"]
        assert isinstance(data["body"]["fr"], list) and len(data["body"]["fr"]) >= 3
        assert isinstance(data["body"]["en"], list) and len(data["body"]["en"]) >= 3

    def test_dijon_article_has_h2_and_29_plus_paragraphs(self, session):
        r = session.get(f"{API}/journal/que-faire-a-dijon-week-end", timeout=30)
        assert r.status_code == 200
        data = r.json()
        fr_body = data["body"]["fr"]
        assert len(fr_body) >= 25, f"expected 25+ paragraphs, got {len(fr_body)}"
        h2_count = sum(1 for p in fr_body if p.startswith("## "))
        assert h2_count >= 5, f"expected 5+ H2 sections, got {h2_count}"

    def test_beaune_article_has_h2(self, session):
        r = session.get(f"{API}/journal/visiter-beaune-48-heures", timeout=30)
        assert r.status_code == 200
        body = r.json()["body"]["fr"]
        h2 = [p for p in body if p.startswith("## ")]
        assert len(h2) >= 5

    def test_climats_article_has_h2(self, session):
        r = session.get(f"{API}/journal/climats-bourgogne-unesco", timeout=30)
        assert r.status_code == 200
        body = r.json()["body"]["fr"]
        h2 = [p for p in body if p.startswith("## ")]
        assert len(h2) >= 4

    def test_all_11_slugs_individually_fetchable(self, session):
        r = session.get(f"{API}/journal", timeout=30)
        slugs = [a["slug"] for a in r.json()]
        assert len(slugs) == 11
        for slug in slugs:
            r2 = session.get(f"{API}/journal/{slug}", timeout=30)
            assert r2.status_code == 200, f"failed for {slug}"
            d = r2.json()
            assert "body" in d and "fr" in d["body"]

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
            "message": "TEST_ Hello from pytest iteration 3",
            "locale": "fr",
        }
        r = session.post(f"{API}/contact", json=payload, timeout=30)
        assert r.status_code == 200, r.text
        data = r.json()
        assert "id" in data and isinstance(data["id"], str) and len(data["id"]) > 0
        assert data["name"] == payload["name"]
        assert data["email"] == payload["email"]
        pytest.created_contact_id = data["id"]

    def test_get_contact_lists_messages(self, session):
        r = session.get(f"{API}/contact", timeout=30)
        assert r.status_code == 200, r.text
        items = r.json()
        assert isinstance(items, list)
        ids = [it.get("id") for it in items]
        assert getattr(pytest, "created_contact_id", None) in ids
        for it in items:
            assert "_id" not in it

    def test_post_contact_invalid_email_422(self, session):
        payload = {"name": "TEST_Bad", "email": "not-an-email", "message": "TEST_ bad"}
        r = session.post(f"{API}/contact", json=payload, timeout=30)
        assert r.status_code == 422
