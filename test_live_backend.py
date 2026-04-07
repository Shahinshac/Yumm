#!/usr/bin/env python
"""Comprehensive backend testing - Testing against LIVE RENDER deployment"""
import requests
import json

BASE_URL = "https://yumm-ym2m.onrender.com"

def test_api(name, method, path, data=None, token=None):
    """Test an API endpoint"""
    sep = "="*70
    print(f"\n{sep}")
    print(f"TEST: {name}")
    print(f"{sep}")
    url = f"{BASE_URL}{path}"
    print(f"{method} {url}")

    headers = {'Content-Type': 'application/json'}
    if token:
        headers['Authorization'] = f'Bearer {token}'

    try:
        if method == 'GET':
            resp = requests.get(url, headers=headers, timeout=10)
        elif method == 'POST':
            resp = requests.post(url, json=data, headers=headers, timeout=10)
        else:
            resp = None

        result = resp.json()
        print(f"Status: {resp.status_code}")
        print(f"Response: {json.dumps(result, indent=2)}")
        return result, resp.status_code
    except Exception as e:
        print(f"ERROR: {str(e)}")
        return None, None

def main():
    print("\n\n")
    print("█" * 70)
    print("█  COMPREHENSIVE BACKEND TEST SUITE (LIVE RENDER)")
    print("█" * 70)

    # Test 1: Health Check
    test_api('1. Health Check', 'GET', '/api/health')

    # Test 2: Customer Google Login
    resp2, _ = test_api('2. Customer Google Login', 'POST', '/api/auth/google-login', {
        'id_token': 'mock_customer_live_test'
    })
    customer_token = resp2.get('access_token') if resp2 and 'access_token' in resp2 else None

    # Test 3: Restaurant Registration
    resp3, status3 = test_api('3. Restaurant Registration (PENDING)', 'POST', '/api/auth/register/restaurant', {
        'name': 'Live Test Chef',
        'email': 'livechef@pizza.com',
        'phone': '9876543210',
        'shop_name': 'Live Test Pizza',
        'address': 'Live Test Address 123'
    })
    rest_user_id = resp3.get('user_id') if resp3 else None
    if rest_user_id:
        print(f"[INFO] Restaurant User ID: {rest_user_id}")

    # Test 4: Try Login Before Approval
    test_api('4. Login Before Approval (Should BLOCK)', 'POST', '/api/auth/login', {
        'email': 'livechef@pizza.com',
        'password': 'anypassword'
    })

    # Test 5: Delivery Registration
    resp5, _ = test_api('5. Delivery Registration (PENDING)', 'POST', '/api/auth/register/delivery', {
        'name': 'Live Test Runner',
        'email': 'liverunner@delivery.com',
        'phone': '9123456789',
        'vehicle_type': 'bike'
    })
    delivery_user_id = resp5.get('user_id') if resp5 else None
    if delivery_user_id:
        print(f"[INFO] Delivery User ID: {delivery_user_id}")

    # Test 6: Admin Login
    resp6, _ = test_api('6. Admin Login', 'POST', '/api/auth/login', {
        'email': 'admin',
        'password': 'admin123'
    })
    admin_token = resp6.get('access_token') if resp6 else None
    if admin_token:
        print(f"[INFO] Admin Token obtained: {admin_token[:30]}...")

    # Test 7: View Pending Users
    if admin_token:
        resp7, _ = test_api('7. Get Pending Users (Admin)', 'GET', '/api/admin/pending-users', token=admin_token)
        if resp7:
            pending_count = resp7.get('count', 0)
            print(f"[INFO] Pending Users Count: {pending_count}")

    # Test 8: Approve Restaurant User
    if rest_user_id and admin_token:
        resp8, _ = test_api('8. Approve Restaurant User & Generate Password', 'POST', f'/api/admin/approve/{rest_user_id}', token=admin_token)
        if resp8:
            generated_password = resp8.get('password')
            if generated_password:
                print(f"[INFO] Generated Password: {generated_password}")

                # Test 9: Login After Approval
                resp9, status9 = test_api('9. Login After Approval (Should SUCCESS)', 'POST', '/api/auth/login', {
                    'email': 'livechef@pizza.com',
                    'password': generated_password
                })
                if status9 == 200:
                    print("[SUCCESS] Restaurant can now login!")

    # Test 10: Customer Get Current User
    if customer_token:
        test_api('10. Get Current User (Customer via Google)', 'GET', '/api/auth/me', token=customer_token)

    # Test 11: Duplicate Email Prevention
    test_api('11. Duplicate Email Prevention (Should FAIL)', 'POST', '/api/auth/register/restaurant', {
        'name': 'Another Chef',
        'email': 'livechef@pizza.com',  # Same email
        'phone': '9999999999',
        'shop_name': 'Another Pizza',
        'address': 'Another Address'
    })

    # Test 12: Invalid Phone
    test_api('12. Invalid Phone Validation (Should FAIL)', 'POST', '/api/auth/register/delivery', {
        'name': 'Invalid Runner',
        'email': 'invalid@delivery.com',
        'phone': '123',  # Too short
        'vehicle_type': 'bike'
    })

    # Test 13: Invalid Vehicle Type
    test_api('13. Invalid Vehicle Type (Should FAIL)', 'POST', '/api/auth/register/delivery', {
        'name': 'Test Runner 2',
        'email': 'runner2@delivery.com',
        'phone': '9876543210',
        'vehicle_type': 'rocket'  # Invalid
    })

    # Test 14: Missing Required Fields
    test_api('14. Missing Required Fields (Should FAIL)', 'POST', '/api/auth/register/restaurant', {
        'name': 'Incomplete',
        # Missing: email, phone, shop_name, address
    })

    print("\n\n")
    print("█" * 70)
    print("█  ✅ ALL TESTS COMPLETED")
    print("█" * 70)

if __name__ == '__main__':
    main()
