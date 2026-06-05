"""Backend API tests for Plume Suites — iteration 4: 14 articles, 3 new editorial first, no breakfast mentions, updated table-de-saison & nouveau-chapitre-mediterraneen."""
import os
import requests
import pytest

BASE_URL = os.environ['REACT_APP_BACKEND_URL'].rstrip('/')
API = f"{BASE_URL}/api"

EXPECTED_FIRST_3_EDITORIAL = [
    "o-ptit-repere-du-gout",
    "vignes-et-art-de-vivre-bourguignon",
    "plume-suites-etape-en-bourgogne",
]

OTHER_REQUIRED_SLUGS = [
    "canal-de-bourgogne-velo-fleurey",
    "eurovelo-6-bourgogne",
    "week-end-velo-canal-dijon-beaune",
    "que-faire-a-dijon-week-end",
    "visiter-beaune-48-heures",
    "climats-bourgogne-unesco",
    "route-des-vins",
    "table-de-saison",
    "douceur-de-vivre",
    "nouveau-chapitre-mediterraneen",
    "matins-au-bord-du-canal",
]


@pytest.fixture(scope="module")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# --- Journal listing ---
class TestJournalList:
    def test_list_journal_returns_14(self, session):
        r = session.get(f"{API}/journal", timeout=30)
        assert r.status_code == 200, r.text
        data = r.json()
        assert isinstance(data, list)
        assert len(data) == 14, f"expected 14 articles, got {len(data)}"

    def test_first_3_are_new_editorial(self, session):
        r = session.get(f"{API}/journal", timeout=30)
        slugs = [a["slug"] for a in r.json()]
        assert slugs[:3] == EXPECTED_FIRST_3_EDITORIAL, f"first 3 slugs incorrect: {slugs[:3]}"

    def test_all_required_slugs_present(self, session):
        r = session.get(f"{API}/journal", timeout=30)
        slugs = set(a["slug"] for a in r.json())
        for s in EXPECTED_FIRST_3_EDITORIAL + OTHER_REQUIRED_SLUGS:
            assert s in slugs, f"missing slug: {s}"

    def test_listing_has_no_body(self, session):
        r = session.get(f"{API}/journal", timeout=30)
        for a in r.json():
            assert "body" not in a


# --- Individual article fetch ---
class TestArticleFetch:
    @pytest.mark.parametrize("slug", EXPECTED_FIRST_3_EDITORIAL)
    def test_new_editorial_article_full(self, session, slug):
        r = session.get(f"{API}/journal/{slug}", timeout=30)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["slug"] == slug
        assert "fr" in data["body"] and "en" in data["body"]
        fr_body = data["body"]["fr"]
        en_body = data["body"]["en"]
        assert len(fr_body) >= 5
        assert len(en_body) >= 5
        # Must have multiple H2 sections
        h2_fr = [p for p in fr_body if p.startswith("## ")]
        h2_en = [p for p in en_body if p.startswith("## ")]
        assert len(h2_fr) >= 3, f"{slug} fr: expected 3+ H2, got {len(h2_fr)}"
        assert len(h2_en) >= 3, f"{slug} en: expected 3+ H2, got {len(h2_en)}"

    def test_all_14_individually_fetchable(self, session):
        r = session.get(f"{API}/journal", timeout=30)
        slugs = [a["slug"] for a in r.json()]
        assert len(slugs) == 14
        for slug in slugs:
            r2 = session.get(f"{API}/journal/{slug}", timeout=30)
            assert r2.status_code == 200, f"failed for {slug}"

    def test_404_unknown_slug(self, session):
        r = session.get(f"{API}/journal/does-not-exist-x", timeout=30)
        assert r.status_code == 404


# --- Content validation: rewritten articles ---
class TestRewrittenContent:
    def test_table_de_saison_no_sommelier_or_producteurs_locaux(self, session):
        r = session.get(f"{API}/journal/table-de-saison", timeout=30)
        assert r.status_code == 200
        body = r.json()["body"]
        joined_fr = " ".join(body["fr"]).lower()
        joined_en = " ".join(body["en"]).lower()
        assert "sommelier" not in joined_fr, "found 'sommelier' in table-de-saison fr"
        assert "sommelier" not in joined_en, "found 'sommelier' in table-de-saison en"
        assert "producteurs locaux" not in joined_fr, "found 'producteurs locaux' in table-de-saison fr"
        # 100% Bourgogne signature
        assert ("100% bourgogne" in joined_fr) or ("100 % bourgogne" in joined_fr) or ("entièrement bourguignonne" in joined_fr) or ("bourguignonne" in joined_fr)

    def test_nouveau_chapitre_mediterraneen_mentions_appartement_piscine_plage(self, session):
        r = session.get(f"{API}/journal/nouveau-chapitre-mediterraneen", timeout=30)
        assert r.status_code == 200
        body = r.json()["body"]
        joined_fr = " ".join(body["fr"]).lower()
        assert "appartement" in joined_fr, "missing 'appartement'"
        assert "piscine" in joined_fr, "missing 'piscine'"
        assert "plage" in joined_fr, "missing 'plage'"


# --- Breakfast / petit-déjeuner ban across all articles ---
class TestNoBreakfastMention:
    def test_no_petit_dejeuner_or_breakfast_tray_anywhere(self, session):
        r = session.get(f"{API}/journal", timeout=30)
        slugs = [a["slug"] for a in r.json()]
        offenders = []
        for slug in slugs:
            r2 = session.get(f"{API}/journal/{slug}", timeout=30)
            body = r2.json()["body"]
            joined_fr = " ".join(body["fr"]).lower()
            joined_en = " ".join(body["en"]).lower()
            if "petit-déjeuner" in joined_fr or "petit déjeuner" in joined_fr:
                offenders.append(f"{slug}:fr:petit-déjeuner")
            if "breakfast tray" in joined_en:
                offenders.append(f"{slug}:en:breakfast tray")
            # Plume does not serve breakfast — also ban general "breakfast" mentions
            # but only if it's about Plume itself; lighter check: just petit-déjeuner & breakfast tray
        assert offenders == [], f"breakfast mentions found: {offenders}"


# --- Contact endpoints ---
class TestContact:
    def test_post_contact_creates_message(self, session):
        payload = {
            "name": "TEST_User_i4",
            "email": "test_user_i4@example.com",
            "subject": "TEST Booking iteration 4",
            "message": "TEST_ Hello from pytest iteration 4",
            "locale": "fr",
        }
        r = session.post(f"{API}/contact", json=payload, timeout=30)
        assert r.status_code == 200, r.text
        data = r.json()
        assert "id" in data and len(data["id"]) > 0
        assert data["email"] == payload["email"]
        pytest.created_contact_id_i4 = data["id"]

    def test_get_contact_lists_messages(self, session):
        r = session.get(f"{API}/contact", timeout=30)
        assert r.status_code == 200
        items = r.json()
        ids = [it.get("id") for it in items]
        assert getattr(pytest, "created_contact_id_i4", None) in ids
        for it in items:
            assert "_id" not in it

    def test_post_contact_invalid_email_422(self, session):
        payload = {"name": "TEST_Bad", "email": "bad-email", "message": "TEST_ bad"}
        r = session.post(f"{API}/contact", json=payload, timeout=30)
        assert r.status_code == 422
