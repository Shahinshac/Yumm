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
import random

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
        print("\n--- Phase 1: Admin Setup ---")
        admin_data, status = api_call(client, 'POST', '/api/auth/login', {
            'email': 'admin',
            'password': 'admin123'
        })
        if status != 200:
            print(f"❌ Admin login failed: {admin_data}")
            return
        admin_token = admin_data['access_token']
        print("✅ Admin logged in")

        invalid_me, invalid_status = api_call(client, 'GET', '/api/auth/me')
        if invalid_status not in [401, 403]:
            print(f"❌ Public access should be denied for /api/auth/me: {invalid_status} {invalid_me}")
            return
        print("✅ Protected endpoints block anonymous users")

        unique_id = str(uuid.uuid4())[:8]
        rest_email = f"rest_{unique_id}@test.com"
        rest_phone = f"9{random.randint(7000000000, 9999999999)}"
        del_phone = f"8{random.randint(7000000000, 9999999999)}"
        cust_phone = f"7{random.randint(7000000000, 9999999999)}"
        cust_username = f"cust_{unique_id}"
        cust_email = f"{cust_username}@test.com"
        cust_password = "CustPass123!"

        print("\n--- Phase 2: Customer Flow ---")
        cust_reg, status = api_call(client, 'POST', '/api/auth/register', {
            'username': cust_username,
            'email': cust_email,
            'password': cust_password,
            'phone': cust_phone,
            'role': 'customer'
        })
        if status != 201:
            print(f"❌ Customer registration failed ({status}): {cust_reg}")
            return
        print("✅ Customer registered")

        cust_login, status = api_call(client, 'POST', '/api/auth/login', {
            'email': cust_email,
            'password': cust_password
        })
        if status != 200:
            print(f"❌ Customer login failed ({status}): {cust_login}")
            return
        cust_token = cust_login['access_token']
        print("✅ Customer logged in")

        me_data, status = api_call(client, 'GET', '/api/auth/me', token=cust_token)
        if status != 200:
            print(f"❌ Customer /api/auth/me failed: {me_data}")
            return
        print("✅ Customer auth profile works")

        change_pw, status = api_call(client, 'POST', '/api/auth/change-password', {
            'current_password': cust_password,
            'new_password': 'NewCustPass$1'
        }, token=cust_token)
        if status != 200:
            print(f"❌ Customer change-password failed: {change_pw}")
            return
        print("✅ Customer changed password")

        cust_login2, status = api_call(client, 'POST', '/api/auth/login', {
            'email': cust_email,
            'password': 'NewCustPass$1'
        })
        if status != 200:
            print(f"❌ Customer login after password change failed: {cust_login2}")
            return
        cust_token = cust_login2['access_token']
        print("✅ Customer login works after password change")

        print("\n--- Phase 3: Restaurant Lifecycle ---")
        reg_data, status = api_call(client, 'POST', '/api/auth/register/restaurant', {
            'name': 'Test Owner',
            'email': rest_email,
            'phone': rest_phone,
            'shop_name': f'Pizza Paradise {unique_id}',
            'category': 'Fast Food',
            'address': '123 Chef Street'
        })
        if status not in [200, 201]:
            print(f"❌ Restaurant registration failed ({status}): {reg_data}")
            return
        rest_user_id = reg_data['user_id']
        print("✅ Restaurant registered")

        app_data, status = api_call(client, 'POST', f'/api/admin/approve/{rest_user_id}', token=admin_token)
        if status != 200:
            print(f"❌ Restaurant approval failed ({status}): {app_data}")
            return
        rest_pass = app_data['password']
        print("✅ Restaurant approved")

        rest_login, status = api_call(client, 'POST', '/api/auth/login', {
            'email': rest_email,
            'password': rest_pass
        })
        if status != 200:
            print(f"❌ Restaurant login failed ({status}): {rest_login}")
            return
        rest_token = rest_login['access_token']
        print("✅ Restaurant logged in")

        profile_data, status = api_call(client, 'GET', '/api/restaurant-dashboard/profile', token=rest_token)
        if status != 200:
            print(f"❌ Restaurant profile fetch failed: {profile_data}")
            return
        rest_db_id = profile_data.get('id')
        if not rest_db_id:
            print(f"❌ Restaurant profile missing id: {profile_data}")
            return
        print("✅ Restaurant profile fetch works")

        profile_update, status = api_call(client, 'PUT', '/api/restaurant-dashboard/profile/update', {
            'name': 'Pizza Paradise HQ',
            'address': '456 Chef Avenue'
        }, token=rest_token)
        if status != 200:
            print(f"❌ Restaurant profile update failed: {profile_update}")
            return
        print("✅ Restaurant profile update works")

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
        print("✅ Menu item created")

        menu_list, status = api_call(client, 'GET', '/api/restaurant-dashboard/menu', token=rest_token)
        if status != 200 or not isinstance(menu_list, list):
            print(f"❌ Restaurant menu listing failed: {menu_list}")
            return
        print("✅ Restaurant menu listing works")

        update_item, status = api_call(client, 'PUT', f'/api/restaurant-dashboard/menu/{menu_item_id}/update', {
            'price': 529,
            'name': 'Classic Margherita Deluxe'
        }, token=rest_token)
        if status != 200:
            print(f"❌ Menu item update failed: {update_item}")
            return
        print("✅ Menu item update works")

        # Place two orders: one to complete, one to cancel
        print("\n--- Phase 4: Ordering ---")
        restaurants, status = api_call(client, 'GET', '/api/customer/restaurants', token=cust_token)
        # Confirm the created restaurant appears in the customer restaurant list
        target_rest = next((r for r in restaurants if r.get('id') == rest_db_id), None)
        if not target_rest:
            print(f"❌ Restaurant not found for ordering: {restaurants}")
            return

        order1, status = api_call(client, 'POST', '/api/customer/orders/place', {
            'restaurant_id': rest_db_id,
            'items': [{
                'id': menu_item_id,
                'name': 'Classic Margherita Deluxe',
                'price': 529,
                'qty': 1
            }],
            'delivery_address': 'Customer Home 456',
            'payment_method': 'cod'
        }, token=cust_token)
        if status != 201:
            print(f"❌ First order placement failed: {order1}")
            return
        order_id = order1['order']['id']
        print("✅ First order placed")

        order2, status = api_call(client, 'POST', '/api/customer/orders/place', {
            'restaurant_id': rest_db_id,
            'items': [{
                'id': menu_item_id,
                'name': 'Classic Margherita Deluxe',
                'price': 529,
                'qty': 1
            }],
            'delivery_address': 'Customer Home 456',
            'payment_method': 'cod'
        }, token=cust_token)
        if status != 201:
            print(f"❌ Second order placement failed: {order2}")
            return
        cancel_order_id = order2['order']['id']
        print("✅ Second order placed for cancellation")

        orders_list, status = api_call(client, 'GET', '/api/customer/orders', token=cust_token)
        if status != 200 or not isinstance(orders_list, list):
            print(f"❌ Customer orders fetch failed: {orders_list}")
            return
        print("✅ Customer order history fetch works")

        order_details, status = api_call(client, 'GET', f'/api/customer/orders/{order_id}', token=cust_token)
        if status != 200:
            print(f"❌ Customer order details fetch failed: {order_details}")
            return
        print("✅ Customer order details fetch works")

        cancel_resp, status = api_call(client, 'POST', f'/api/customer/orders/{cancel_order_id}/cancel', token=cust_token)
        if status != 200:
            print(f"❌ Customer order cancel failed: {cancel_resp}")
            return
        print("✅ Customer order cancel works")

        print("\n--- Phase 5: Restaurant Order Management ---")
        accept_resp, status = api_call(client, 'POST', f'/api/restaurant-dashboard/orders/{order_id}/accept', token=rest_token)
        if status != 200:
            print(f"❌ Restaurant accept order failed ({status}): {accept_resp}")
            return
        print("✅ Restaurant accepted order")

        _, status = api_call(client, 'PUT', f'/api/restaurant-dashboard/orders/{order_id}/status', {
            'status': 'preparing'
        }, token=rest_token)
        if status != 200:
            print("❌ Restaurant set preparing failed")
            return
        print("✅ Restaurant marked preparing")

        _, status = api_call(client, 'PUT', f'/api/restaurant-dashboard/orders/{order_id}/status', {
            'status': 'ready'
        }, token=rest_token)
        if status != 200:
            print("❌ Restaurant set ready failed")
            return
        print("✅ Restaurant marked ready")

        orders_for_rest, status = api_call(client, 'GET', '/api/restaurant-dashboard/orders', token=rest_token)
        if status != 200:
            print(f"❌ Restaurant orders list failed: {orders_for_rest}")
            return
        print("✅ Restaurant orders listing works")

        # Delivery lifecycle
        print("\n--- Phase 6: Delivery Lifecycle ---")
        del_email = f"rider_{unique_id}@test.com"
        delivery_reg, status = api_call(client, 'POST', '/api/auth/register/delivery', {
            'name': 'Speedy Rider',
            'email': del_email,
            'phone': del_phone,
            'vehicle_type': 'bike'
        })
        if status not in [200, 201]:
            print(f"❌ Delivery registration failed: {delivery_reg}")
            return
        print("✅ Delivery partner registered")

        pending_del, status = api_call(client, 'GET', '/api/admin/pending-users', token=admin_token)
        if status != 200:
            print(f"❌ Admin pending users fetch failed: {pending_del}")
            return
        del_user = next((u for u in pending_del['pending_users'] if u['email'] == del_email), None)
        if not del_user:
            print(f"❌ Pending delivery partner not found: {pending_del}")
            return

        del_app, status = api_call(client, 'POST', f'/api/admin/approve/{del_user["id"]}', token=admin_token)
        if status != 200:
            print(f"❌ Delivery approval failed: {del_app}")
            return
        del_pass = del_app['password']
        print("✅ Delivery partner approved")

        del_login, status = api_call(client, 'POST', '/api/auth/login', {
            'email': del_email,
            'password': del_pass
        })
        if status != 200:
            print(f"❌ Delivery login failed: {del_login}")
            return
        del_token = del_login['access_token']
        print("✅ Delivery partner logged in")

        available, status = api_call(client, 'GET', '/api/delivery/available-orders', token=del_token)
        if status != 200 or not isinstance(available.get('orders'), list):
            print(f"❌ Delivery available orders failed: {available}")
            return
        print(f"✅ Delivery sees {available.get('count')} available orders")

        if not available['orders']:
            print("❌ No available orders found for delivery, test cannot continue")
            return

        order_to_accept = next((o['id'] for o in available['orders'] if o['id'] == order_id), None)
        if not order_to_accept:
            print(f"❌ Created order not available for delivery: {available}")
            return
        accept_resp, status = api_call(client, 'POST', f'/api/delivery/accept-order/{order_to_accept}', token=del_token)
        if status != 200:
            print(f"❌ Delivery accept order failed: {accept_resp}")
            return
        print("✅ Delivery accepted order")

        my_orders, status = api_call(client, 'GET', '/api/delivery/my-orders', token=del_token)
        if status != 200 or not isinstance(my_orders.get('orders'), list):
            print(f"❌ Delivery my-orders failed: {my_orders}")
            return
        print("✅ Delivery my-orders fetch works")

        location_resp, status = api_call(client, 'PUT', f'/api/delivery/{order_to_accept}/update-location', {
            'lat': 12.9716,
            'lng': 77.5946
        }, token=del_token)
        if status != 200:
            print(f"❌ Delivery location update failed: {location_resp}")
            return
        print("✅ Delivery location updated")

        delivered_resp, status = api_call(client, 'PUT', f'/api/delivery/{order_to_accept}/mark-delivered', token=del_token)
        if status != 200:
            print(f"❌ Delivery mark delivered failed: {delivered_resp}")
            return
        print("✅ Delivery marked order delivered")

        stats_resp, status = api_call(client, 'GET', '/api/delivery/stats', token=del_token)
        if status != 200:
            print(f"❌ Delivery stats failed: {stats_resp}")
            return
        print("✅ Delivery stats works")

        completed_order, status = api_call(client, 'GET', f'/api/customer/orders/{order_to_accept}', token=cust_token)
        if status != 200 or completed_order.get('status') != 'delivered':
            print(f"❌ Completed order status invalid: {completed_order}")
            return
        print("✅ Customer sees delivered order status")

        print("\n--- Phase 7: Admin Monitoring ---")
        dashboard, status = api_call(client, 'GET', '/api/admin/dashboard', token=admin_token)
        if status != 200:
            print(f"❌ Admin dashboard failed: {dashboard}")
            return
        print("✅ Admin dashboard works")

        users, status = api_call(client, 'GET', '/api/admin/users', token=admin_token)
        if status != 200:
            print(f"❌ Admin users list failed: {users}")
            return
        print("✅ Admin users listing works")

        analytics_orders, status = api_call(client, 'GET', '/api/admin/analytics/orders', token=admin_token)
        if status != 200:
            print(f"❌ Admin order analytics failed: {analytics_orders}")
            return
        print("✅ Admin order analytics works")

        analytics_restaurants, status = api_call(client, 'GET', '/api/admin/analytics/restaurants', token=admin_token)
        if status != 200:
            print(f"❌ Admin restaurant analytics failed: {analytics_restaurants}")
            return
        print("✅ Admin restaurant analytics works")

        print("\n" + "█" * 60)
        print("█  FULL SYSTEM E2E TEST COMPLETED SUCCESSFULLY!  █")
        print("█" * 60)

if __name__ == '__main__':
    run_tests()
