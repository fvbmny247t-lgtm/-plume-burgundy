#!/usr/bin/env python3
"""
Backend API tests for Plume Suites
Tests contact form email integration and journal API after content changes
"""

import requests
import json
import sys
from datetime import datetime

# Base URL from frontend/.env
BASE_URL = "https://pageinsights-fix.preview.emergentagent.com/api"

def print_test_header(test_name):
    """Print a formatted test header"""
    print(f"\n{'='*80}")
    print(f"TEST: {test_name}")
    print(f"{'='*80}")

def print_result(passed, message):
    """Print test result"""
    status = "✅ PASS" if passed else "❌ FAIL"
    print(f"{status}: {message}")
    return passed

def test_contact_form_fr():
    """Test POST /api/contact with French locale"""
    print_test_header("Contact Form - French Locale")
    
    payload = {
        "name": "Jean Test",
        "email": "jean.test@example.com",
        "subject": "Demande de séjour",
        "message": "Bonjour, je souhaite des informations.",
        "locale": "fr"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/contact", json=payload, timeout=30)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        # Check status code
        if response.status_code != 200:
            return print_result(False, f"Expected 200, got {response.status_code}")
        
        # Check response structure
        data = response.json()
        required_fields = ["id", "name", "email", "subject", "message", "locale", "created_at"]
        missing_fields = [f for f in required_fields if f not in data]
        
        if missing_fields:
            return print_result(False, f"Missing fields: {missing_fields}")
        
        # Verify data matches
        if data["name"] != payload["name"]:
            return print_result(False, f"Name mismatch: {data['name']} != {payload['name']}")
        if data["email"] != payload["email"]:
            return print_result(False, f"Email mismatch: {data['email']} != {payload['email']}")
        if data["locale"] != payload["locale"]:
            return print_result(False, f"Locale mismatch: {data['locale']} != {payload['locale']}")
        
        return print_result(True, "Contact form FR submission successful with correct response structure")
        
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_contact_form_en():
    """Test POST /api/contact with English locale"""
    print_test_header("Contact Form - English Locale")
    
    payload = {
        "name": "John Test",
        "email": "john.test@example.com",
        "subject": "Booking inquiry",
        "message": "Hello, I would like some information about your suites.",
        "locale": "en"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/contact", json=payload, timeout=30)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        if response.status_code != 200:
            return print_result(False, f"Expected 200, got {response.status_code}")
        
        data = response.json()
        if data["locale"] != "en":
            return print_result(False, f"Locale should be 'en', got {data['locale']}")
        
        return print_result(True, "Contact form EN submission successful")
        
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_contact_form_missing_fields():
    """Test POST /api/contact with missing required fields"""
    print_test_header("Contact Form - Missing Required Fields")
    
    # Missing 'message' field
    payload = {
        "name": "Test User",
        "email": "test@example.com"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/contact", json=payload, timeout=30)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 422:
            return print_result(True, "Correctly rejected missing required field with 422")
        else:
            return print_result(False, f"Expected 422, got {response.status_code}")
        
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_contact_form_invalid_email():
    """Test POST /api/contact with invalid email"""
    print_test_header("Contact Form - Invalid Email")
    
    payload = {
        "name": "Test User",
        "email": "not-an-email",
        "message": "Test message",
        "locale": "fr"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/contact", json=payload, timeout=30)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 422:
            return print_result(True, "Correctly rejected invalid email with 422")
        else:
            return print_result(False, f"Expected 422, got {response.status_code}")
        
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_journal_list():
    """Test GET /api/journal returns 12 articles"""
    print_test_header("Journal List - Count Articles")
    
    try:
        response = requests.get(f"{BASE_URL}/journal", timeout=30)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 200:
            return print_result(False, f"Expected 200, got {response.status_code}")
        
        articles = response.json()
        print(f"Number of articles: {len(articles)}")
        
        if len(articles) != 12:
            return print_result(False, f"Expected 12 articles, got {len(articles)}")
        
        # Print article slugs for verification
        slugs = [a.get("slug") for a in articles]
        print(f"Article slugs: {slugs}")
        
        return print_result(True, "Journal list returns exactly 12 articles")
        
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_journal_new_article():
    """Test GET /api/journal/ou-dormir-circuit-dijon-prenois returns 200 with FR+EN body"""
    print_test_header("Journal - New Dijon-Prenois Article")
    
    slug = "ou-dormir-circuit-dijon-prenois"
    
    try:
        response = requests.get(f"{BASE_URL}/journal/{slug}", timeout=30)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 200:
            return print_result(False, f"Expected 200, got {response.status_code}")
        
        article = response.json()
        
        # Check for body field with FR and EN
        if "body" not in article:
            return print_result(False, "Missing 'body' field in article")
        
        body = article["body"]
        if not isinstance(body, dict):
            return print_result(False, f"Body should be a dict, got {type(body)}")
        
        if "fr" not in body:
            return print_result(False, "Missing 'fr' in body")
        if "en" not in body:
            return print_result(False, "Missing 'en' in body")
        
        # Check that body arrays are not empty
        if not isinstance(body["fr"], list) or len(body["fr"]) == 0:
            return print_result(False, "FR body should be a non-empty list")
        if not isinstance(body["en"], list) or len(body["en"]) == 0:
            return print_result(False, "EN body should be a non-empty list")
        
        print(f"FR body paragraphs: {len(body['fr'])}")
        print(f"EN body paragraphs: {len(body['en'])}")
        print(f"Article title (FR): {article.get('title', {}).get('fr', 'N/A')}")
        
        return print_result(True, "New Dijon-Prenois article found with FR+EN body")
        
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_journal_deleted_article_1():
    """Test GET /api/journal/douceur-de-vivre returns 404"""
    print_test_header("Journal - Deleted Article 'douceur-de-vivre'")
    
    slug = "douceur-de-vivre"
    
    try:
        response = requests.get(f"{BASE_URL}/journal/{slug}", timeout=30)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 404:
            return print_result(True, "Deleted article correctly returns 404")
        else:
            return print_result(False, f"Expected 404, got {response.status_code}")
        
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_journal_deleted_article_2():
    """Test GET /api/journal/matins-au-bord-du-canal returns 404"""
    print_test_header("Journal - Deleted Article 'matins-au-bord-du-canal'")
    
    slug = "matins-au-bord-du-canal"
    
    try:
        response = requests.get(f"{BASE_URL}/journal/{slug}", timeout=30)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 404:
            return print_result(True, "Deleted article correctly returns 404")
        else:
            return print_result(False, f"Expected 404, got {response.status_code}")
        
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_journal_existing_article():
    """Test GET /api/journal/o-ptit-repere-du-gout returns 200"""
    print_test_header("Journal - Existing Article 'o-ptit-repere-du-gout'")
    
    slug = "o-ptit-repere-du-gout"
    
    try:
        response = requests.get(f"{BASE_URL}/journal/{slug}", timeout=30)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 200:
            return print_result(False, f"Expected 200, got {response.status_code}")
        
        article = response.json()
        print(f"Article title (FR): {article.get('title', {}).get('fr', 'N/A')}")
        
        return print_result(True, "Existing article still accessible")
        
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def main():
    """Run all tests and report results"""
    print("\n" + "="*80)
    print("PLUME SUITES BACKEND API TESTS")
    print(f"Base URL: {BASE_URL}")
    print(f"Test Time: {datetime.now().isoformat()}")
    print("="*80)
    
    results = []
    
    # Contact Form Tests
    print("\n" + "="*80)
    print("CONTACT FORM EMAIL INTEGRATION TESTS")
    print("="*80)
    results.append(test_contact_form_fr())
    results.append(test_contact_form_en())
    results.append(test_contact_form_missing_fields())
    results.append(test_contact_form_invalid_email())
    
    # Journal API Tests
    print("\n" + "="*80)
    print("JOURNAL API TESTS")
    print("="*80)
    results.append(test_journal_list())
    results.append(test_journal_new_article())
    results.append(test_journal_deleted_article_1())
    results.append(test_journal_deleted_article_2())
    results.append(test_journal_existing_article())
    
    # Summary
    print("\n" + "="*80)
    print("TEST SUMMARY")
    print("="*80)
    passed = sum(results)
    total = len(results)
    print(f"Passed: {passed}/{total}")
    print(f"Failed: {total - passed}/{total}")
    
    if passed == total:
        print("\n✅ ALL TESTS PASSED")
        return 0
    else:
        print(f"\n❌ {total - passed} TEST(S) FAILED")
        return 1

if __name__ == "__main__":
    sys.exit(main())
