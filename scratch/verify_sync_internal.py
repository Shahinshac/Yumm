import sys
import os
import json
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
os.environ['FLASK_ENV'] = 'production'

from backend.app import create_app
from backend.app.models.user import User
from backend.app.models.restaurant import Restaurant
from backend.app.models.models import Order
from flask_jwt_extended import create_access_token

def verify_sync():
    print("--- Verifying Order Synchronization Fix (Internal Test) ---")
    app = create_app()
    client = app.test_client()
    
    with app.app_context():
        # 1. Setup Admin
        admin = User.objects(email='admin@yumm.com').first()
        admin_token = create_access_token(identity=str(admin.id))
        admin_headers = {"Authorization": f"Bearer {admin_token}"}
        
        # 2. Setup Merchant
        merchant_user = User.objects(email='pending_rest@yumm.com').first()
        # Approve if not (just in case)
        merchant_user.is_approved = True
        merchant_user.save()
        restaurant = Restaurant.objects(user=merchant_user).first()
        restaurant.is_approved = True
        restaurant.save()
        
        merchant_token = create_access_token(identity=str(merchant_user.id))
        m_headers = {"Authorization": f"Bearer {merchant_token}"}
        
        # 3. Setup Customer
        customer = User.objects(email='testcust@yumm.com').first()
        c_token = create_access_token(identity=str(customer.id))
        c_headers = {"Authorization": f"Bearer {c_token}"}
        
        print(f"✅ Users setup: Admin, Merchant (Rest ID: {restaurant.id}), Customer.")

        # 4. Place Order as Customer
        print("4. Placing order via API...")
        order_data = {
            "restaurant_id": str(restaurant.id),
            "items": [{"id": "item1", "name": "Burger", "price": 100, "qty": 1}],
            "total_amount": 100,
            "delivery_address": "Test Street",
            "payment_method": "cod"
        }
        res = client.post('/api/customer/orders/place', 
                         data=json.dumps(order_data), 
                         headers=c_headers, 
                         content_type='application/json')
        
        if res.status_code != 201:
            print(f"❌ Order placement failed. Status: {res.status_code}, Body: {res.data.decode()}")
            return
            
        order_id = res.get_json()['order']['id']
        print(f"✅ Order placed. Order ID: {order_id}")

        # 5. VERIFY SYNC: Check Merchant Dashboard API for the new order
        print("5. VERIFYING: Checking Merchant Dashboard API for the new order...")
        res = client.get('/api/restaurant-dashboard/orders', headers=m_headers)
        if res.status_code != 200:
            print(f"❌ Failed to fetch merchant orders. Status: {res.status_code}, Body: {res.data.decode()}")
            return
        m_data = res.get_json()
        if 'orders' in m_data and any(o['id'] == order_id for o in m_data['orders']):
            print(f"🚀 SUCCESS: Order {order_id} found in Merchant Dashboard!")
        else:
            print(f"❌ FAILURE: Order {order_id} not found in Dashboard list. Got: {m_data.keys()}")
            return

        # 6. MERCHANT: Mark order as Preparing then Ready
        print("6. MERCHANT: Marking order as Preparing...")
        client.put(f'/api/restaurant-dashboard/orders/{order_id}/status', 
                  data=json.dumps({"status": "preparing"}), 
                  headers=m_headers, content_type='application/json')
        
        print("7. MERCHANT: Marking order as Ready...")
        client.put(f'/api/restaurant-dashboard/orders/{order_id}/status', 
                  data=json.dumps({"status": "ready"}), 
                  headers=m_headers, content_type='application/json')

        # 8. RIDER: Setup and Claim
        rider_user = User.objects(email='pending_rider@yumm.com').first()
        rider_user.is_approved = True
        rider_user.save()
        rider_token = create_access_token(identity=str(rider_user.id))
        r_headers = {"Authorization": f"Bearer {rider_token}"}
        
        print("8. RIDER: Checking available (READY) orders...")
        res = client.get('/api/delivery-dashboard/available', headers=r_headers)
        if res.status_code != 200:
            print(f"❌ Failed to fetch available orders. Status: {res.status_code}, Body: {res.data.decode()}")
            return
        
        available = res.get_json()
        if any(o['id'] == order_id for o in available):
            print(f"🚀 SUCCESS: Order {order_id} is visible to Riders!")
        else:
            print(f"❌ FAILURE: Order not visible to Riders. Available IDs: {[o['id'] for o in available]}")
            return

        print(f"9. RIDER: Claiming order {order_id}...")
        res = client.post(f'/api/delivery-dashboard/orders/{order_id}/claim', headers=r_headers)
        if res.status_code != 200:
            print(f"❌ Claim failed. Status: {res.status_code}, Body: {res.data.decode()}")
            return
        
        print("10. RIDER: Marking as Delivered...")
        res = client.put(f'/api/delivery-dashboard/orders/{order_id}/status', 
                        data=json.dumps({"status": "done"}), 
                        headers=r_headers, content_type='application/json')
        
        if res.status_code == 200:
            print("🏆 FINAL SUCCESS: Full Lifecycle Verified (Customer -> Merchant -> Rider)!")
        else:
            print(f"❌ Final delivery failed. Status: {res.status_code}, Body: {res.data.decode()}")

if __name__ == "__main__":
    verify_sync()
