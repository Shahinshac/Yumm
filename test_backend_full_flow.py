import sys
import os
import json

sys.path.insert(0, os.getcwd())
os.environ['FLASK_ENV'] = 'development'
os.environ['MONGODB_URI'] = 'mongodb://127.0.0.1:27017/fooddelivery_test_e2e'

from backend.app import create_app
app = create_app()

def test_api(name, method, path, data=None, token=None):
    with app.test_client() as client:
        headers = {}
        if token:
            headers['Authorization'] = f'Bearer {token}'
        
        print(f"\n--- {name} ---")
        if method == 'POST':
            headers['Content-Type'] = 'application/json'
            resp = client.post(path, json=data, headers=headers)
        elif method == 'PUT':
            headers['Content-Type'] = 'application/json'
            resp = client.put(path, json=data, headers=headers)
        elif method == 'GET':
            resp = client.get(path, headers=headers)
            
        result = resp.get_json() if resp.is_json else None
        print(f"Status: {resp.status_code}")
        print(f"Response: {json.dumps(result, indent=2) if result else resp.data}")
        return result, resp.status_code

import time
import uuid

def main():
    import uuid
    unique_id = str(uuid.uuid4())[:8]
    
    with app.app_context():
        # Seed admin 
        from backend.app.models.user import User
        from backend.app.utils.security import PasswordSecurity
        if not User.objects(email='admin').first():
            User(
                username='admin', email='admin', 
                password_hash=PasswordSecurity.hash_password('admin123'),
                role='admin', is_approved=True, is_verified=True,
                phone='0000000000'
            ).save()

        print("Starting E2E Multi-Role Flow Test...")
        # 1. Register Users
        print("1. Registering entities...")
        
        # Seed customer and get token manually (bypass Google OAuth strictly for E2E tests)
        from backend.app.models.user import User
        from flask_jwt_extended import create_access_token
        cust_email = f'mock_e2e_cust_{unique_id}@test.com'
        cust_user = User(
            username=f'TestCust_{unique_id}', email=cust_email, role='customer',
            phone='1234567890', is_approved=True, is_verified=True, password_hash='mock'
        ).save()
        cust_token = create_access_token(identity=str(cust_user.id))

        r_rest, _ = test_api('Reg Rest', 'POST', '/api/auth/register/restaurant', {
            'name': 'E2E Chef', 'email': f'e2e_{unique_id}@chef.com', 'phone': '8888888888',
            'shop_name': 'E2E Shop', 'address': 'E2E Street', 'id_proof_url': 'x'
        })
        rest_id = r_rest.get('user_id') if r_rest else None

        r_deliv, _ = test_api('Reg Deliv', 'POST', '/api/auth/register/delivery', {
            'name': 'E2E Rider', 'email': f'e2e_{unique_id}@rider.com', 'phone': '7777777777',
            'vehicle_type': 'bike', 'id_proof_url': 'x'
        })
        deliv_id = r_deliv.get('user_id') if r_deliv else None

        # 2. Admin Approval
        print("2. Admin approving partners...")
        r_admin, _ = test_api('Admin Login', 'POST', '/api/auth/login', {'email': 'admin', 'password': 'admin123'})
        admin_token = r_admin.get('access_token')

        r_appr_rest, _ = test_api('Approve Rest', 'POST', f'/api/admin/approve/{rest_id}', token=admin_token)
        r_appr_deliv, _ = test_api('Approve Deliv', 'POST', f'/api/admin/approve/{deliv_id}', token=admin_token)

        # 3. Rest Login & Menu Create
        print("3. Partner logins & setup...")
        r_rest_login, _ = test_api('Rest Login', 'POST', '/api/auth/login', {'email': f'e2e_{unique_id}@chef.com', 'password': r_appr_rest.get('password')})
        rest_token = r_rest_login.get('access_token') if r_rest_login else None
        
        r_deliv_login, _ = test_api('Deliv Login', 'POST', '/api/auth/login', {'email': f'e2e_{unique_id}@rider.com', 'password': r_appr_deliv.get('password')})
        deliv_token = r_deliv_login.get('access_token') if r_deliv_login else None

        # Menu Add
        r_menu, _ = test_api('Add Menu', 'POST', '/api/restaurant-dashboard/menu/add', {
            'name': 'E2E Pizza', 'price': 250.0, 'description': 'Good pizza', 'category': 'Pizza'
        }, token=rest_token)
        item_id = r_menu.get('menu_item', {}).get('id') if r_menu else None

        # 4. Customer Creates Order
        print("4. Customer order flow...")
        # Get restaurants list
        r_rest_list, _ = test_api('Get Rests', 'GET', '/api/customer/restaurants', token=cust_token)
        rests = r_rest_list.get('restaurants', []) if isinstance(r_rest_list, dict) else r_rest_list
        restaurant_id = rests[0]['id'] if rests else rest_id

        r_order, _ = test_api('Place Order', 'POST', '/api/customer/orders', {
            'restaurant_id': restaurant_id,
            'items': [{'id': item_id, 'name': 'E2E Pizza', 'price': 250.0, 'quantity': 1, 'qty': 1}],
            'total_amount': 250.0,
            'delivery_address': 'Customer House 1'
        }, token=cust_token)
        order_id = r_order.get('order', {}).get('id')

        # 5. Rest accepts order
        if order_id:
            print("5. Order Status transitions...")
            test_api('Accept', 'PUT', f'/api/orders/{order_id}/status', {'status': 'accepted'}, token=rest_token)
            test_api('Preparing', 'PUT', f'/api/orders/{order_id}/status', {'status': 'preparing'}, token=rest_token)
            test_api('Ready', 'PUT', f'/api/orders/{order_id}/status', {'status': 'ready'}, token=rest_token)

            test_api('Driver Accept', 'PUT', f'/api/delivery/orders/{order_id}/accept', token=deliv_token)
            test_api('Driver Pick', 'PUT', f'/api/delivery/orders/{order_id}/status', {'status': 'picked'}, token=deliv_token)
            test_api('Driver Complete', 'PUT', f'/api/delivery/orders/{order_id}/status', {'status': 'delivered'}, token=deliv_token)

            r_check, _ = test_api('Check Order', 'GET', f'/api/customer/orders/{order_id}', token=cust_token)
            print("Final Order Status:", r_check.get('status'))

        print("--- E2E Multi-Role Flow Test Complete ---")

if __name__ == '__main__':
    main()
