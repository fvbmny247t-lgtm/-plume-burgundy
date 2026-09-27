"""Phase 2-4: Smoobu sync + Plumes ledger + Carnet stays + Cron.

Covers: admin smoobu endpoints auth, channel classification, cron auth,
Plumes math (floor(price - city_tax)), newsletter bonus idempotency,
stays endpoint (DIRECT vs OTA), and linking via verified email.
"""
import math
import os
import time
import uuid
import pytest
import requests
from pymongo import MongoClient

BASE_URL = os.environ["REACT_APP_BACKEND_URL"].rstrip("/") + "/api"
MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "test_database")
CRON_SECRET = os.environ.get("WEBHOOK_CRON_SECRET")

ADMIN_EMAIL = "hello@plumesuites.fr"
ADMIN_PASSWORD = "PlumeSuites2026!"
SEED_CUSTOMER_EMAIL = "smermet@s-sentiel.fr"
SEED_CUSTOMER_PASSWORD = "MotDePasse123"


@pytest.fixture(scope="module")
def mongo():
    c = MongoClient(MONGO_URL)
    yield c[DB_NAME]
    c.close()


@pytest.fixture(scope="module")
def admin_token():
    r = requests.post(f"{BASE_URL}/admin/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, r.text
    return r.json()["token"]


@pytest.fixture(scope="module")
def customer_token():
    r = requests.post(f"{BASE_URL}/carnet/login", json={"email": SEED_CUSTOMER_EMAIL, "password": SEED_CUSTOMER_PASSWORD})
    assert r.status_code == 200, r.text
    return r.json()["token"]


# ----- Admin smoobu endpoints auth ---------------------------------------
class TestAdminSmoobuAuth:
    def test_state_requires_admin(self):
        assert requests.get(f"{BASE_URL}/admin/smoobu/state").status_code == 401

    def test_state_rejects_customer_token(self, customer_token):
        r = requests.get(f"{BASE_URL}/admin/smoobu/state", headers={"Authorization": f"Bearer {customer_token}"})
        assert r.status_code == 401

    def test_channels_requires_admin(self):
        assert requests.get(f"{BASE_URL}/admin/smoobu/channels").status_code == 401

    def test_channels_rejects_customer_token(self, customer_token):
        r = requests.get(f"{BASE_URL}/admin/smoobu/channels", headers={"Authorization": f"Bearer {customer_token}"})
        assert r.status_code == 401

    def test_sync_rejects_customer_token(self, customer_token):
        r = requests.post(f"{BASE_URL}/admin/smoobu/sync", headers={"Authorization": f"Bearer {customer_token}"})
        assert r.status_code == 401


# ----- State + channels content -------------------------------------------
class TestSmoobuState:
    def test_state_has_reservations(self, admin_token):
        r = requests.get(f"{BASE_URL}/admin/smoobu/state", headers={"Authorization": f"Bearer {admin_token}"})
        assert r.status_code == 200
        data = r.json()
        assert data.get("reservations_total", 0) > 0
        state = data.get("state") or data
        assert state.get("last_sync_at")

    def test_channels_classification(self, admin_token):
        r = requests.get(f"{BASE_URL}/admin/smoobu/channels", headers={"Authorization": f"Bearer {admin_token}"})
        assert r.status_code == 200
        items = r.json()
        assert isinstance(items, list) and len(items) > 0
        by_name = {(c.get("name") or "").lower(): c for c in items}

        def find(hint):
            for k, v in by_name.items():
                if hint in k:
                    return v
            return None

        direct = find("direct booking") or find("direct")
        website = find("website")
        booking = find("booking.com")
        airbnb = find("airbnb")
        expedia = find("expedia")
        blocked = find("blocked")

        # Assertions: DIRECT/OTA/BLOCKED classification
        for ch in (direct, website):
            if ch:
                assert ch["category"] == "DIRECT" and ch["eligible"] is True
        for ch in (booking, airbnb, expedia):
            if ch:
                assert ch["category"] == "OTA" and ch["eligible"] is False
        if blocked:
            assert blocked["category"] == "BLOCKED" and blocked["eligible"] is False


class TestChannelPatch:
    def test_patch_channel(self, admin_token, mongo):
        # Pick any existing channel and toggle then reset
        ch = mongo.smoobu_channels.find_one({})
        assert ch is not None
        cid = ch["channel_id"]
        original_cat, original_elig = ch["category"], bool(ch["eligible"])

        r = requests.patch(
            f"{BASE_URL}/admin/smoobu/channels/{cid}",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={"category": "MANUEL", "eligible": True},
        )
        assert r.status_code == 200
        body = r.json()
        assert body["channel_id"] == cid
        assert body["category"] == "MANUEL"
        assert body["eligible"] is True

        # Verify persisted
        updated = mongo.smoobu_channels.find_one({"channel_id": cid})
        assert updated["category"] == "MANUEL" and updated["eligible"] is True

        # Restore
        requests.patch(
            f"{BASE_URL}/admin/smoobu/channels/{cid}",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={"category": original_cat, "eligible": original_elig},
        )


# ----- Cron auth ---------------------------------------------------------
class TestCronAuth:
    def test_cron_requires_bearer(self):
        assert requests.post(f"{BASE_URL}/cron/smoobu-reconcile").status_code == 401

    def test_cron_bad_token(self):
        r = requests.post(f"{BASE_URL}/cron/smoobu-reconcile", headers={"Authorization": "Bearer wrong"})
        assert r.status_code == 401

    def test_cron_valid_token(self):
        assert CRON_SECRET, "WEBHOOK_CRON_SECRET missing from env"
        r = requests.post(f"{BASE_URL}/cron/smoobu-reconcile", headers={"Authorization": f"Bearer {CRON_SECRET}"})
        assert r.status_code == 200
        assert r.json().get("accepted") is True


# ----- Plumes math -------------------------------------------------------
class TestPlumesMath:
    def test_direct_reservations_math(self, mongo):
        # Verify a couple of DIRECT eligible reservations
        docs = list(mongo.smoobu_reservations.find({"source": "DIRECT", "eligible": True, "plumes": {"$gt": 0}}).limit(5))
        assert len(docs) > 0
        for d in docs:
            expected = int(math.floor(max(float(d.get("price", 0)) - float(d.get("city_tax", 0)), 0)))
            assert d["plumes"] == expected, f"smoobu_id={d.get('smoobu_id')} price={d.get('price')} city_tax={d.get('city_tax')} plumes={d['plumes']} expected={expected}"

    def test_ota_reservations_no_plumes(self, mongo):
        docs = list(mongo.smoobu_reservations.find({"source": "OTA"}).limit(10))
        assert len(docs) > 0
        for d in docs:
            assert d.get("plumes", 0) == 0
            assert d.get("eligible") is False


# ----- Seeded customer: /me + /stays -----------------------------------
class TestSeedCustomerStays:
    def test_me_shows_balance(self, customer_token):
        r = requests.get(f"{BASE_URL}/carnet/me", headers={"Authorization": f"Bearer {customer_token}"})
        assert r.status_code == 200
        d = r.json()
        # Per problem statement: balance 100 (newsletter bonus), pending 404
        assert d.get("plumes_balance") == 100, f"got {d.get('plumes_balance')}"
        assert d.get("plumes_pending") == 404, f"got {d.get('plumes_pending')}"

    def test_stays_endpoint(self, customer_token):
        r = requests.get(f"{BASE_URL}/carnet/stays", headers={"Authorization": f"Bearer {customer_token}"})
        assert r.status_code == 200
        d = r.json()
        assert "stays" in d and "next_stay" in d
        stays = d["stays"]
        assert isinstance(stays, list) and len(stays) > 0

        for s in stays:
            for k in ("apartment", "arrival", "departure", "channel", "source", "plumes", "plumes_status"):
                assert k in s, f"missing {k} in {s}"

        direct = [s for s in stays if s["source"] == "DIRECT"]
        ota = [s for s in stays if s["source"] == "OTA"]
        # Seed customer has DIRECT stays with plumes
        assert len(direct) > 0
        for s in direct:
            if s.get("plumes_status") != "cancelled" and s.get("eligible"):
                assert s["plumes"] > 0 or float(s.get("price", 0)) - float(s.get("city_tax", 0)) < 1
        for s in ota:
            assert s["plumes"] == 0


# ----- Stays endpoint auth -----------------------------------------------
class TestStaysAuth:
    def test_stays_requires_auth(self):
        assert requests.get(f"{BASE_URL}/carnet/stays").status_code == 401


# ----- Newsletter bonus idempotency -------------------------------------
class TestNewsletterBonusIdempotency:
    def test_confirm_again_no_extra_entry(self, mongo, customer_token):
        # Find seed customer's confirmed newsletter row + its confirm_token
        r = requests.get(f"{BASE_URL}/carnet/me", headers={"Authorization": f"Bearer {customer_token}"})
        user = r.json()
        user_row = mongo.carnet_users.find_one({"email": SEED_CUSTOMER_EMAIL})
        user_id = user_row["id"]
        nl = mongo.carnet_newsletter.find_one({"email": SEED_CUSTOMER_EMAIL})
        assert nl is not None, "seeded newsletter row missing"
        assert nl.get("status") == "confirmed"
        confirm_token = nl.get("confirm_token")
        assert confirm_token

        # Count ledger entries for this user of type newsletter_bonus
        pre = list(mongo.plumes_ledger.find({"user_id": user_id, "type": "newsletter_bonus"}))
        assert len(pre) == 1

        # Confirm again
        r2 = requests.post(f"{BASE_URL}/carnet/newsletter/confirm", json={"token": confirm_token})
        assert r2.status_code == 200

        post = list(mongo.plumes_ledger.find({"user_id": user_id, "type": "newsletter_bonus"}))
        assert len(post) == 1

        # Balance unchanged
        r3 = requests.get(f"{BASE_URL}/carnet/me", headers={"Authorization": f"Bearer {customer_token}"})
        assert r3.json().get("plumes_balance") == user["plumes_balance"]


# ----- Linking flow: fresh account after email verification --------------
class TestLinkingFlow:
    def test_link_only_after_verification(self, mongo):
        # Find a DIRECT reservation with an email + plumes>0 that is NOT already linked
        resa = mongo.smoobu_reservations.find_one({
            "source": "DIRECT", "eligible": True, "plumes": {"$gt": 0},
            "email": {"$ne": None}, "user_id": None,
        })
        if not resa:
            pytest.skip("No unlinked DIRECT reservation available")
        target_email = resa["email"]

        # Avoid clobbering if account already exists
        existing = mongo.carnet_users.find_one({"email": target_email})
        if existing:
            pytest.skip(f"Account already exists for {target_email}")

        # Register
        payload = {
            "first_name": "TEST", "last_name": "Link",
            "email": target_email, "password": "TestPass1234!",
            "password_confirm": "TestPass1234!",
            "newsletter_opt_in": False, "locale": "fr",
        }
        r = requests.post(f"{BASE_URL}/carnet/register", json=payload)
        assert r.status_code == 200, r.text
        token = r.json()["token"]

        # Before verification, /me shows balance 0 / pending 0
        me = requests.get(f"{BASE_URL}/carnet/me", headers={"Authorization": f"Bearer {token}"}).json()
        assert me["plumes_balance"] == 0
        assert me["plumes_pending"] == 0

        # Read verify token from Mongo
        user_id = me["id"]
        tok = mongo.carnet_email_tokens.find_one({"user_id": user_id, "purpose": "verify", "used": False})
        assert tok is not None
        verify_token = tok["token"]

        # Verify
        vr = requests.post(f"{BASE_URL}/carnet/verify-email", json={"token": verify_token})
        assert vr.status_code == 200

        time.sleep(0.5)

        # After verification, the reservation must be linked to this user
        linked = mongo.smoobu_reservations.count_documents({"user_id": user_id})
        assert linked > 0, "reservation should be linked after email verification"

        # /me: retroactive rule -> credited stays predating account creation are excluded
        me2 = requests.get(f"{BASE_URL}/carnet/me", headers={"Authorization": f"Bearer {token}"}).json()

        # stays endpoint returns at least one stay
        stays = requests.get(f"{BASE_URL}/carnet/stays", headers={"Authorization": f"Bearer {token}"}).json()
        assert len(stays["stays"]) > 0, "stays list should have the newly linked reservation"

        user_row = mongo.carnet_users.find_one({"id": user_id})
        acct_date = user_row["created_at"][:10]
        counted_credited = sum(
            s["plumes"] for s in stays["stays"]
            if s.get("plumes_status") == "credited" and (s.get("departure") or "") >= acct_date
        )
        counted_pending = sum(
            s["plumes"] for s in stays["stays"] if s.get("plumes_status") == "pending"
        )
        assert me2["plumes_balance"] == counted_credited
        assert me2["plumes_pending"] == counted_pending

        # Cleanup: delete the test account
        mongo.carnet_users.delete_one({"id": user_id})
        mongo.carnet_email_tokens.delete_many({"user_id": user_id})
        mongo.smoobu_reservations.update_many({"user_id": user_id}, {"$set": {"user_id": None}})
