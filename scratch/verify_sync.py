import requests
import time

BASE_URL = "http://localhost:5000/api"

def test_sync():
    print("--- Verifying Order Synchronization Fix ---")
    
    # 1. Login as Admin
    print("1. Logging in as Admin...")
    admin_login_res = requests.post(f"{BASE_URL}/auth/login", json={
        "email": "admin@yumm.com",
        "password": "admin123"
    })
    if admin_login_res.status_code != 200:
        print(f"❌ Admin login failed. Status: {admin_login_res.status_code}, Body: {admin_login_res.text}")
        return
    
    admin_login = admin_login_res.json()
    admin_token = admin_login.get('access_token')
    headers = {"Authorization": f"Bearer {admin_token}"}
    
    # 2. Get Pending Approvals
    print("2. Fetching pending approvals...")
    res = requests.get(f"{BASE_URL}/admin/pending-users", headers=headers)
    if res.status_code != 200:
        print(f"❌ Failed to fetch pending. Status: {res.status_code}, Body: {res.text}")
        return
    
    approvals = res.json().get('pending_users', [])
    # Find our pending grill
    target = next((u for u in approvals if u['email'] == 'pending_rest@yumm.com'), None)
    
    merchant_pass = 'rest123' # Default from seed
    
    if not target:
        print("ℹ️ 'pending_rest@yumm.com' not in pending list. Assuming already approved or missing.")
    else:
        # 3. Approve
        print(f"3. Approving {target['email']}...")
        approve_res = requests.post(f"{BASE_URL}/admin/approve/{target['id']}", headers=headers).json()
        password = approve_res.get('password') # admin.py returns 'password' not 'provisional_password'
        if password:
            merchant_pass = password
        print(f"✅ Approved. Password: {merchant_pass}")

    # 4. Login as Merchant
    print(f"4. Logging in as Merchant (pending_rest@yumm.com) with pass '{merchant_pass}'...")
    m_login_res = requests.post(f"{BASE_URL}/auth/login", json={
        "email": "pending_rest@yumm.com",
        "password": merchant_pass
    })
    
    if m_login_res.status_code != 200:
        print(f"❌ Merchant login failed. Status: {m_login_res.status_code}, Body: {m_login_res.text}")
        return
        
    m_login = m_login_res.json()
    m_token = m_login.get('access_token')
    m_headers = {"Authorization": f"Bearer {m_token}"}
    
    # 5. Get Restaurant ID
    m_profile = requests.get(f"{BASE_URL}/restaurant-dashboard/profile", headers=m_headers).json()
    restaurant_id = m_profile.get('id')
    if not restaurant_id:
        print(f"❌ Failed to get restaurant ID from profile. Body: {m_profile}")
        return
    print(f"✅ Merchant logged in. Restaurant ID: {restaurant_id}")

    # 6. Place Order as Customer (using bypass)
    print("6. Placing order as Customer...")
    c_login = requests.post(f"{BASE_URL}/auth/test-customer-login").json()
    c_token = c_login.get('access_token')
    c_headers = {"Authorization": f"Bearer {c_token}"}
    
    order_data = {
        "restaurant_id": restaurant_id,
        "items": [{"id": "item1", "name": "Burger", "price": 100, "qty": 1}],
        "total_amount": 100,
        "delivery_address": "Test Street",
        "payment_method": "cod"
    }
    order_res = requests.post(f"{BASE_URL}/customer/orders/place", json=order_data, headers=c_headers).json()
    if 'order' not in order_res:
        print(f"❌ Order placement failed. Body: {order_res}")
        return
        
    order_id = order_res['order']['id']
    print(f"✅ Order placed. Order ID: {order_id}")

    # 7. VERIFY SYNC: Check Merchant Dashboard
    print("7. VERIFYING: Checking Merchant Dashboard for the new order...")
    # This was the bottleneck - if it returns { orders: [...] } and the order is there, it's FIXED.
    m_orders_res = requests.get(f"{BASE_URL}/restaurant-dashboard/orders", headers=m_headers).json()
    
    if 'orders' in m_orders_res:
        found = any(o['id'] == order_id for o in m_orders_res['orders'])
        if found:
            print(f"🚀 SUCCESS: Order {order_id} found in Merchant Dashboard!")
            print(f"Structure verification: 'orders' key exists. Count: {m_orders_res.get('count')}")
        else:
            print(f"❌ FAILURE: Order not found in Merchant Dashboard list. Keys: {m_orders_res.keys()}")
            if 'orders' in m_orders_res:
                print(f"Visible IDs: {[o['id'] for o in m_orders_res['orders']]}")
    else:
        print(f"❌ FAILURE: Merchant Dashboard response missing 'orders' key. Got: {m_orders_res.keys()}")

if __name__ == "__main__":
    test_sync()
