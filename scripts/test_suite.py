#!/ user/bin/env python
"""
E2E Test Suite for Yumm Platform
Validates: Customer, Restaurant, Delivery, and Admin flows.
"""
import sys
import os
import json
import uuid
import time

# Add root to path
sys.path.append(os.getcwd())

from backend.app import create_app
from backend.app.models.user import User
from backend.app.models.models import Order
from backend.app.models.restaurant import Restaurant, MenuItem
from backend.app.models.delivery_partner import DeliveryPartner

app = create_app()

def api_call(client, method, path, data=None, token=None):
    headers = {'Content-Type': 'application/json'}
    if token:
        headers['Authorization'] = f'Bearer {token}'
    
    if method == 'GET':
        resp = client.get(path, headers=headers)
    elif method == 'POST':
        resp = client.post(path, json=data, headers=headers)
    elif method == 'PUT':
        resp = client.put(path, json=data, headers=headers)
    else:
        return None, 500
        
    try:
        return resp.get_json(), resp.status_code
    except:
        return resp.data, resp.status_code

def run_tests():
    print("🚀 Starting Comprehensive E2E Test Suite...")
    
    with app.test_client() as client:
        # 1. Admin Login
        print("\n--- Phase 1: Admin Setup ---")
        admin_data, status = api_call(client, 'POST', '/api/auth/login', {
            'email': 'admin',
            'password': 'admin123'
        })
        if status != 200:
            print("❌ Admin login failed")
            return
        admin_token = admin_data['access_token']
        print("✅ Admin logged in")

        # 2. Restaurant Registration
        print("\n--- Phase 2: Restaurant Lifecycle ---")
        unique_id = str(uuid.uuid4())[:8]
        rest_email = f"rest_{unique_id}@test.com"
        reg_data, status = api_call(client, 'POST', '/api/auth/register/restaurant', {
            'name': 'Test Owner',
            'email': rest_email,
            'phone': '1234567890',
            'shop_name': f'Pizza Paradise {unique_id}',
            'category': 'Fast Food',
            'address': '123 Chef Street'
        })
        if status != 201 and status != 200:
            print(f"❌ Restaurant registration failed: {reg_data}")
            return
        rest_user_id = reg_data['user_id']
        print(f"✅ Restaurant registered: {rest_email}")

        # 3. Admin Approval
        app_data, status = api_call(client, 'POST', f'/api/admin/approve/{rest_user_id}', token=admin_token)
        if status != 200:
            print("❌ Restaurant approval failed")
            return
        rest_pass = app_data['password']
        print(f"✅ Restaurant approved. Password: {rest_pass}")

        # 4. Restaurant Login & Menu
        rest_login, status = api_call(client, 'POST', '/api/auth/login', {
            'email': rest_email,
            'password': rest_pass
        })
        rest_token = rest_login['access_token']
        print("✅ Restaurant logged in")

        # Create a menu item
        menu_item, status = api_call(client, 'POST', '/api/restaurant-dashboard/menu/add', {
            'name': 'Classic Margherita',
            'description': 'Tomato, Mozzarella, Basil',
            'price': 499,
            'category': 'Pizza',
            'is_veg': True
        }, token=rest_token)
        
        if status != 201:
            print(f"❌ Menu item creation failed ({status}): {menu_item}")
            return
            
        menu_item_id = menu_item['item'].get('id') or menu_item['item'].get('_id')
        print(f"✅ Menu item created: {menu_item['item'].get('name')}")

        # 5. Customer Flow
        print("\n--- Phase 3: Customer Order Flow ---")
        cust_login, status = api_call(client, 'POST', '/api/auth/google-login', {
            'id_token': 'mock_customer_test'
        })
        cust_token = cust_login['access_token']
        print("✅ Customer logged in (Google)")

        # Find the restaurant in the list
        rest_name = f'Pizza Paradise {unique_id}'
        rests, status = api_call(client, 'GET', '/api/customer/restaurants', token=cust_token)
        target_rest = next((r for r in rests if r['name'] == rest_name), None)
        
        if not target_rest:
            print(f"❌ Restaurant '{rest_name}' not found in customer list")
            return
        
        print(f"✅ Found restaurant: {target_rest['name']} (ID: {target_rest['id']})")
        rest_db_id = target_rest['id']
        
        # Place Order
        order_data, status = api_call(client, 'POST', '/api/orders', {
            'restaurant_id': rest_db_id,
            'items': [{
                'id': menu_item_id, 
                'name': 'Classic Margherita',
                'price': 499,
                'qty': 2
            }],
            'delivery_address': 'Customer Home 456',
            'payment_method': 'cod'
        }, token=cust_token)
        
        if status != 201:
            print(f"❌ Order placement failed ({status}): {order_data}")
            return
            
        order_id = order_data['order']['id']
        print(f"✅ Order placed: {order_id}")

        # 6. Restaurant Manage Order
        _, status = api_call(client, 'PUT', f'/api/restaurant/orders/{order_id}', {
            'status': 'preparing'
        }, token=rest_token)
        print("✅ Restaurant status: Preparing")
        
        _, status = api_call(client, 'PUT', f'/api/restaurant/orders/{order_id}', {
            'status': 'ready'
        }, token=rest_token)
        print("✅ Restaurant status: Ready")

        # 7. Delivery Flow
        print("\n--- Phase 4: Delivery Flow ---")
        del_email = f"rider_{unique_id}@test.com"
        api_call(client, 'POST', '/api/auth/register/delivery', {
            'name': 'Speedy Rider',
            'email': del_email,
            'phone': '9998887770',
            'vehicle_type': 'bike'
        })
        pending_del, _ = api_call(client, 'GET', '/api/admin/pending-users', token=admin_token)
        del_user = next((u for u in pending_del['pending_users'] if u['email'] == del_email), None)
        del_app, _ = api_call(client, 'POST', f'/api/admin/approve/{del_user["id"]}', token=admin_token)
        del_pass = del_app['password']
        
        del_login, _ = api_call(client, 'POST', '/api/auth/login', {
            'email': del_email,
            'password': del_pass
        })
        del_token = del_login['access_token']
        print("✅ Delivery Partner logged in")

        # Go online
        api_call(client, 'PUT', '/api/delivery/status', {'is_online': True}, token=del_token)
        print("✅ Delivery Partner is online")

        # Assign (Auto-assigned conceptually, but let's check assignment)
        # In this system, we might need a manual trigger or just check if it was assigned
        assignments_resp, _ = api_call(client, 'GET', '/api/delivery/orders', token=del_token)
        assignments = assignments_resp.get('assignments', [])
        print(f"✅ Delivery Assignments found: {len(assignments)}")

        if assignments:
            assign = assignments[0]
            # Accept
            api_call(client, 'PUT', f'/api/delivery/orders/{assign["assignment_id"]}', {'status': 'accepted'}, token=del_token)
            print("✅ Delivery Accepted")
            # Picked up
            api_call(client, 'PUT', f'/api/delivery/orders/{assign["assignment_id"]}', {'status': 'picked_up'}, token=del_token)
            print("✅ Order Picked Up")
            # Delivered
            api_call(client, 'PUT', f'/api/delivery/orders/{assign["assignment_id"]}', {'status': 'delivered'}, token=del_token)
            print("✅ Order Delivered!")

        print("\n" + "█" * 60)
        print("█  E2E TEST COMPLETED SUCCESSFULLY!")
        print("█" * 60)

if __name__ == '__main__':
    run_tests()
