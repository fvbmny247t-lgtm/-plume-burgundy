# Gift cards (coffrets) — public, checkout, status/activation, voucher, redeem, admin CRUD + role separation
import os
from datetime import datetime, timezone

import pytest
import requests
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv("/app/frontend/.env")
load_dotenv("/app/backend/.env")
BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
API = f"{BASE_URL}/api"
PAID_SESSION = os.environ.get("GC_PAID_SESSION")  # session paid via Stripe UI by the testing agent
ADMIN = {"email": "hello@plumesuites.fr", "password": "PlumeSuites2026!"}
CARNET = {"email": "smermet@s-sentiel.fr", "password": "MotDePasse123"}

db = MongoClient(os.environ["MONGO_URL"])[os.environ["DB_NAME"]]
CREATED = {"sessions": [], "coffrets": [], "redemptions": []}


@pytest.fixture(scope="module")
def admin_h():
    r = requests.post(f"{API}/admin/login", json=ADMIN)
    if r.status_code != 200:
        pytest.skip("admin login failed")
    return {"Authorization": f"Bearer {r.json()['token']}"}


@pytest.fixture(scope="module")
def coffrets():
    return requests.get(f"{API}/giftcards/coffrets").json()


@pytest.fixture(scope="module", autouse=True)
def cleanup():
    yield
    for sid in CREATED["sessions"]:
        db.giftcards.delete_one({"session_id": sid, "status": "pending_payment"})
        db.payment_transactions.delete_one({"session_id": sid})
    for cid in CREATED["coffrets"]:
        db.giftcard_coffrets.delete_one({"id": cid})
    for rid in CREATED["redemptions"]:
        db.giftcard_redemptions.delete_one({"id": rid})


def _checkout(cid, email="test@example.com"):
    return requests.post(f"{API}/giftcards/checkout", json={
        "coffret_id": cid, "buyer_name": "TEST_Buyer", "buyer_email": email,
        "recipient_name": "TEST_Rec", "message": "TEST msg", "locale": "fr", "origin_url": BASE_URL})


# ---- Public coffrets
def test_coffrets_list(coffrets):
    slugs = {c["slug"]: c for c in coffrets}
    for s, p in [("parenthese", 190), ("gourmande", 290), ("signature", 490)]:
        assert s in slugs and slugs[s]["price"] == p
        assert slugs[s]["name"]["fr"] and slugs[s]["name"]["en"]
        assert slugs[s]["description"]["fr"] and slugs[s]["image_url"]
    assert all("_id" not in c for c in coffrets)


# ---- Checkout (two in a row: regression for unique code=null index)
def test_checkout_creates_rows_twice(coffrets):
    cid = next(c["id"] for c in coffrets if c["slug"] == "parenthese")
    for _ in range(2):
        r = _checkout(cid)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["checkout_url"].startswith("https://checkout.stripe.com")
        sid = d["session_id"]; CREATED["sessions"].append(sid)
        tx = db.payment_transactions.find_one({"session_id": sid})
        assert tx["payment_status"] == "pending" and tx["amount"] == 190.0
        gc = db.giftcards.find_one({"session_id": sid})
        assert gc["status"] == "pending_payment" and gc["code"] is None
    st = requests.get(f"{API}/giftcards/status/{CREATED['sessions'][0]}").json()
    assert st["payment_status"] != "paid" and st["code"] is None


def test_checkout_validation(coffrets):
    assert _checkout("nope").status_code == 404
    cid = coffrets[0]["id"]
    assert _checkout(cid, email="bad").status_code == 422
    assert requests.get(f"{API}/giftcards/status/cs_test_unknown").status_code == 404


# ---- Paid session activation + idempotency
def test_paid_status_idempotent():
    if not PAID_SESSION:
        pytest.skip("no GC_PAID_SESSION")
    a = requests.get(f"{API}/giftcards/status/{PAID_SESSION}").json()
    b = requests.get(f"{API}/giftcards/status/{PAID_SESSION}").json()
    assert a["payment_status"] == "paid"
    assert a["code"] and a["code"] == b["code"]
    import re
    assert re.fullmatch(r"PLUME-[A-Z0-9]{4}-[A-Z0-9]{4}", a["code"])
    assert db.giftcards.count_documents({"session_id": PAID_SESSION}) == 1
    gc = db.giftcards.find_one({"session_id": PAID_SESSION})
    assert gc["status"] in ("active", "redeemed")
    days = (datetime.fromisoformat(gc["expires_at"]) - datetime.fromisoformat(gc["purchased_at"])).days
    assert 359 <= days <= 366, days


def test_voucher():
    assert requests.get(f"{API}/giftcards/voucher/PLUME-NOPE-NOPE").status_code == 404
    if not PAID_SESSION:
        pytest.skip("no GC_PAID_SESSION")
    code = db.giftcards.find_one({"session_id": PAID_SESSION})["code"]
    d = requests.get(f"{API}/giftcards/voucher/{code.lower()}").json()
    assert d["code"] == code and d["coffret_name"] and d["expires_at"]
    assert d["recipient_name"] == "TEST_Recipient"


# ---- Admin auth / role separation
@pytest.mark.parametrize("method,path", [
    ("get", "coffrets"), ("post", "coffrets"), ("put", "coffrets/x"), ("delete", "coffrets/x"),
    ("get", "cards"), ("get", "redemptions"), ("patch", "redemptions/x")])
def test_admin_requires_token(method, path):
    r = getattr(requests, method)(f"{API}/admin/giftcards/{path}", json={})
    assert r.status_code == 401


def test_admin_rejects_carnet_token():
    r = requests.post(f"{API}/carnet/login", json=CARNET)
    if r.status_code != 200:
        pytest.skip("carnet login failed")
    h = {"Authorization": f"Bearer {r.json()['token']}"}
    for p in ["coffrets", "cards", "redemptions"]:
        assert requests.get(f"{API}/admin/giftcards/{p}", headers=h).status_code == 401


# ---- Admin coffret CRUD
def test_admin_coffret_crud(admin_h):
    body = {"slug": "test-coffret-qa", "name": {"fr": "TEST_Coffret", "en": "TEST_Box"},
            "description": {"fr": "d", "en": "d"}, "price": 99, "image_url": "/images/x.jpg",
            "active": True, "sort_order": 50}
    r = requests.post(f"{API}/admin/giftcards/coffrets", json=body, headers=admin_h)
    assert r.status_code == 200, r.text
    cid = r.json()["id"]; CREATED["coffrets"].append(cid)
    assert "_id" not in r.json()
    pub = requests.get(f"{API}/giftcards/coffrets").json()
    assert any(c["id"] == cid for c in pub)
    body["price"] = 120; body["name"]["fr"] = "TEST_Coffret2"
    r = requests.put(f"{API}/admin/giftcards/coffrets/{cid}", json=body, headers=admin_h)
    assert r.status_code == 200 and r.json()["price"] == 120
    pub = requests.get(f"{API}/giftcards/coffrets").json()
    assert next(c for c in pub if c["id"] == cid)["name"]["fr"] == "TEST_Coffret2"
    # duplicate slug should not 500
    dup = requests.post(f"{API}/admin/giftcards/coffrets", json={**body, "slug": "parenthese"}, headers=admin_h)
    if dup.status_code == 200:
        CREATED["coffrets"].append(dup.json()["id"])
    assert dup.status_code in (400, 409), f"duplicate slug -> {dup.status_code}"


def test_admin_coffret_delete(admin_h):
    body = {"slug": "test-coffret-del", "name": {"fr": "TEST_Del", "en": "TEST_Del"}, "price": 10}
    cid = requests.post(f"{API}/admin/giftcards/coffrets", json=body, headers=admin_h).json()["id"]
    CREATED["coffrets"].append(cid)
    assert requests.delete(f"{API}/admin/giftcards/coffrets/{cid}", headers=admin_h).status_code == 200
    assert not any(c["id"] == cid for c in requests.get(f"{API}/giftcards/coffrets").json())


# ---- Redemption flow
def test_redeem_invalid():
    r = requests.post(f"{API}/giftcards/redeem", json={"code": "PLUME-NOPE-NOPE", "guest_name": "TEST_G",
                      "guest_email": "test@example.com", "desired_dates": "14-16 fev"})
    assert r.status_code == 404


def test_redeem_and_admin_process(admin_h):
    if not PAID_SESSION:
        pytest.skip("no GC_PAID_SESSION")
    gc = db.giftcards.find_one({"session_id": PAID_SESSION})
    if gc["status"] != "active":
        pytest.skip("card already redeemed")
    code = gc["code"]
    cards = requests.get(f"{API}/admin/giftcards/cards", headers=admin_h).json()
    assert any(c["code"] == code and c["status"] == "active" for c in cards)
    r = requests.post(f"{API}/giftcards/redeem", json={"code": code, "guest_name": "TEST_Guest",
                      "guest_email": "test@example.com", "desired_dates": "TEST 14-16 fev", "nb_guests": 2})
    assert r.status_code == 200 and r.json()["ok"]
    red = db.giftcard_redemptions.find_one({"code": code, "guest_name": "TEST_Guest"}, sort=[("created_at", -1)])
    CREATED["redemptions"].append(red["id"])
    assert red["status"] == "pending"
    reds = requests.get(f"{API}/admin/giftcards/redemptions", headers=admin_h).json()
    assert any(x["id"] == red["id"] for x in reds)
    r = requests.patch(f"{API}/admin/giftcards/redemptions/{red['id']}", json={"status": "processed", "admin_note": "TEST"}, headers=admin_h)
    assert r.status_code == 200
    assert db.giftcard_redemptions.find_one({"id": red["id"]})["status"] == "processed"
    assert db.giftcards.find_one({"code": code})["status"] == "redeemed"
    again = requests.post(f"{API}/giftcards/redeem", json={"code": code, "guest_name": "TEST_G",
                          "guest_email": "test@example.com", "desired_dates": "x"})
    assert again.status_code == 409
    assert requests.patch(f"{API}/admin/giftcards/redemptions/nope", json={"status": "processed"}, headers=admin_h).status_code == 404
