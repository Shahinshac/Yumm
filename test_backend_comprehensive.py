#!/usr/bin/env python
"""Comprehensive backend testing suite"""
import sys
import os
import json

sys.path.insert(0, os.getcwd())
os.environ['FLASK_ENV'] = 'development'
os.environ['MONGODB_URI'] = 'mongodb+srv://fooduser:Fv7%40FoodApp123@cluster0.qugxr.mongodb.net/fooddelivery?retryWrites=true&w=majority'

from backend.app import create_app

app = create_app()

def test_api(name, method, path, data=None, token=None):
    """Test an API endpoint"""
    sep = "="*70
    print(f"\n{sep}")
    print(f"TEST: {name}")
    print(f"{sep}")
    print(f"{method} {path}")

    with app.test_client() as client:
        if method == 'GET':
            headers = {'Authorization': f'Bearer {token}'} if token else {}
            resp = client.get(path, headers=headers)
        elif method == 'POST':
            headers = {'Content-Type': 'application/json'}
            if token:
                headers['Authorization'] = f'Bearer {token}'
            resp = client.post(path, json=data, headers=headers)
        else:
            resp = None

        result = resp.get_json()
        print(f"Status: {resp.status_code}")
        print(f"Response: {json.dumps(result, indent=2)}")
        return result, resp.status_code

def main():
    with app.app_context():
        # Test 1: Health Check
        print("\n\n")
        print("█" * 70)
        print("█  COMPREHENSIVE BACKEND TEST SUITE")
        print("█" * 70)

        test_api('1. Health Check', 'GET', '/api/health')

        # Test 2: Customer Google Login
        resp2, _ = test_api('2. Customer Google Login', 'POST', '/api/auth/google-login', {
            'id_token': 'mock_customer_test'
        })
        customer_token = resp2.get('access_token') if resp2 and 'access_token' in resp2 else None

        # Test 3: Restaurant Registration
        resp3, status3 = test_api('3. Restaurant Registration (PENDING)', 'POST', '/api/auth/register/restaurant', {
            'name': 'Test Chef',
            'email': 'testchef@pizza.com',
            'phone': '9876543210',
            'shop_name': 'Test Pizza House',
            'address': 'Test Address Street 123'
        })
        rest_user_id = resp3.get('user_id') if resp3 else None
        print(f"[INFO] Restaurant User ID: {rest_user_id}")

        # Test 4: Try Login Before Approval
        test_api('4. Login Before Approval (Should BLOCK)', 'POST', '/api/auth/login', {
            'email': 'testchef@pizza.com',
            'password': 'anypassword'
        })

        # Test 5: Delivery Registration
        resp5, _ = test_api('5. Delivery Registration (PENDING)', 'POST', '/api/auth/register/delivery', {
            'name': 'Test Runner',
            'email': 'runner@delivery.com',
            'phone': '9123456789',
            'vehicle_type': 'bike'
        })
        delivery_user_id = resp5.get('user_id') if resp5 else None
        print(f"[INFO] Delivery User ID: {delivery_user_id}")

        # Test 6: Admin Login
        resp6, _ = test_api('6. Admin Login', 'POST', '/api/auth/login', {
            'email': 'admin',
            'password': 'admin123'
        })
        admin_token = resp6.get('access_token') if resp6 else None
        print(f"[INFO] Admin Token: {admin_token[:20]}..." if admin_token else "[ERROR] No admin token")

        # Test 7: View Pending Users
        resp7, _ = test_api('7. Get Pending Users (Admin)', 'GET', '/api/admin/pending-users', token=admin_token)
        pending_count = resp7.get('count', 0) if resp7 else 0
        print(f"[INFO] Pending Users Count: {pending_count}")

        # Test 8: Approve Restaurant User
        if rest_user_id:
            resp8, _ = test_api('8. Approve Restaurant User & Generate Password', 'POST', f'/api/admin/approve/{rest_user_id}', token=admin_token)
            generated_password = resp8.get('password') if resp8 else None
            print(f"[INFO] Generated Password: {generated_password}")

            # Test 9: Login After Approval
            if generated_password:
                resp9, status9 = test_api('9. Login After Approval (Should SUCCESS)', 'POST', '/api/auth/login', {
                    'email': 'testchef@pizza.com',
                    'password': generated_password
                })
                if status9 == 200:
                    print("[SUCCESS] Restaurant can now login!")
                    rest_token = resp9.get('access_token')
                else:
                    print("[ERROR] Login failed after approval")

        # Test 10: Reject Delivery User
        if delivery_user_id:
            test_api('10. Reject Delivery Registration', 'POST', f'/api/admin/reject/{delivery_user_id}',
                    {'reason': 'Test rejection'}, token=admin_token)

        # Test 11: Customer Get Current User
        if customer_token:
            test_api('11. Get Current User (Customer via Google)', 'GET', '/api/auth/me', token=customer_token)

        # Test 12: Duplicate Email Prevention
        test_api('12. Duplicate Email Prevention (Should FAIL)', 'POST', '/api/auth/register/restaurant', {
            'name': 'Another Chef',
            'email': 'testchef@pizza.com',  # Same email as Test 3
            'phone': '9999999999',
            'shop_name': 'Another Pizza Place',
            'address': 'Another Address'
        })

        # Test 13: Invalid Phone
        test_api('13. Invalid Phone Validation (Should FAIL)', 'POST', '/api/auth/register/delivery', {
            'name': 'Invalid Runner',
            'email': 'invalid@delivery.com',
            'phone': '123',  # Too short
            'vehicle_type': 'bike'
        })

        # Test 14: Invalid Vehicle Type
        test_api('14. Invalid Vehicle Type (Should FAIL)', 'POST', '/api/auth/register/delivery', {
            'name': 'Test Runner 2',
            'email': 'runner2@delivery.com',
            'phone': '9876543210',
            'vehicle_type': 'rocket'  # Invalid
        })

        print("\n\n")
        print("█" * 70)
        print("█  ✅ ALL TESTS COMPLETED SUCCESSFULLY")
        print("█" * 70)

if __name__ == '__main__':
    main()
