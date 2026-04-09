
import mongoengine
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

MONGODB_URI = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/fooddelivery')

def clear_database():
    print(f"Connecting to: {MONGODB_URI}")
    try:
        db = mongoengine.connect(host=MONGODB_URI)
        print("Connected to MongoDB.")
        
        # Get database instance
        db_instance = db.get_database('fooddelivery')
        
        # List of collections to drop
        collections = [
            'users', 
            'restaurants', 
            'menu_items', 
            'orders', 
            'payments', 
            'reviews', 
            'promo_codes', 
            'delivery_assignments'
        ]
        
        for col_name in collections:
            print(f"Dropping collection: {col_name}")
            db_instance.drop_collection(col_name)
            
        print("✅ Database wiped successfully.")
        
    except Exception as e:
        print(f"❌ Error wiping database: {e}")
    finally:
        mongoengine.disconnect()

if __name__ == "__main__":
    clear_database()
