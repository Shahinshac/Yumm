"""
Flask Application Factory
Food Delivery App - Complete System
"""
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from mongoengine import connect
import os
from datetime import timedelta

jwt = JWTManager()

def create_app():
    """Application factory"""
    app = Flask(__name__)

    # Configuration
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'food-delivery-secret-key')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=30)

    # MongoDB
    db_uri = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/fooddelivery')
    connect(host=db_uri, serverSelectionTimeoutMS=5000)
    print(f"✅ MongoDB connected")

    # CORS
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # JWT
    jwt.init_app(app)

    # Register blueprints
    from backend.app.routes import auth, restaurants, orders, delivery, admin, reviews, promo

    app.register_blueprint(auth.bp)
    app.register_blueprint(restaurants.bp)
    app.register_blueprint(orders.bp)
    app.register_blueprint(delivery.bp)
    app.register_blueprint(admin.bp)
    app.register_blueprint(reviews.bp)
    app.register_blueprint(promo.bp)

    # Create default admin & demo data
    create_demo_data()

    return app

def create_demo_data():
    """Create demo restaurants and items"""
    from backend.app.models.restaurant import Restaurant, MenuItem
    from backend.app.models.user import User
    from backend.app.utils.security import PasswordSecurity

    # Create demo restaurants if not exist
    if Restaurant.objects.count() == 0:
        restaurants_data = [
            {
                'name': 'Paragon',
                'category': 'Biryani & Kerala',
                'location': {'lat': 11.0089, 'lng': 76.0305},
                'address': 'Malappuram, Kerala',
                'rating': 4.7,
                'image': '🍛',
                'delivery_time': 30,
                'min_order': 200
            },
            {
                'name': 'Devi Prasad',
                'category': 'Traditional Kerala',
                'location': {'lat': 11.0089, 'lng': 76.0305},
                'address': 'Malappuram, Kerala',
                'rating': 4.5,
                'image': '🥘',
                'delivery_time': 35,
                'min_order': 150
            },
            {
                'name': 'Hot Spot',
                'category': 'Multi-cuisine',
                'location': {'lat': 11.0089, 'lng': 76.0305},
                'address': 'Malappuram, Kerala',
                'rating': 4.4,
                'image': '🍴',
                'delivery_time': 25,
                'min_order': 250
            },
            {
                'name': 'Sree Bhagavathy Palace',
                'category': 'Seafood & Kerala',
                'location': {'lat': 11.0089, 'lng': 76.0305},
                'address': 'Malappuram, Kerala',
                'rating': 4.6,
                'image': '🦐',
                'delivery_time': 40,
                'min_order': 300
            }
        ]

        for rest_data in restaurants_data:
            restaurant = Restaurant(**rest_data)
            restaurant.save()

            # Add specific menu items based on restaurant
            menus = {
                'Paragon': [
                    {'name': 'Chicken Biryani', 'price': 280, 'description': 'Fragrant basmati rice with tender chicken'},
                    {'name': 'Mutton Biryani', 'price': 320, 'description': 'Premium mutton biryani'},
                    {'name': 'Fish Curry', 'price': 250, 'description': 'Spiced fish in coconut gravy'},
                    {'name': 'Paragon Biryanis Combo', 'price': 550, 'description': 'Chicken + Mutton + Naan'}
                ],
                'Devi Prasad': [
                    {'name': 'Puttu Curry', 'price': 120, 'description': 'Traditional Kerala puttu'},
                    {'name': 'Avial', 'price': 150, 'description': 'Mixed vegetables Kerala style'},
                    {'name': 'Appam with Stew', 'price': 180, 'description': 'Soft appam with chicken stew'},
                    {'name': 'Kerala Thali', 'price': 300, 'description': 'Complete Kerala meal'}
                ],
                'Hot Spot': [
                    {'name': 'Biryanis - Chicken', 'price': 250, 'description': 'Fragrant biryani'},
                    {'name': 'Murgh Makhani', 'price': 280, 'description': 'Creamy butter chicken'},
                    {'name': 'Tandoori Chicken', 'price': 350, 'description': 'Spiced grilled chicken'},
                    {'name': 'Mixed Grill', 'price': 450, 'description': 'Assorted kebabs and tandoori'}
                ],
                'Sree Bhagavathy Palace': [
                    {'name': 'Fish Biryanis', 'price': 280, 'description': 'Fresh fish biryani'},
                    {'name': 'Prawn Curry', 'price': 320, 'description': 'Cooking prawn in coconut gravy'},
                    {'name': 'Squid Fry', 'price': 300, 'description': 'Crispy squid fry'},
                    {'name': 'Seafood Special Thali', 'price': 400, 'description': 'Complete seafood meal'}
                ]
            }

            items = menus.get(rest_data['name'], [
                {'name': f'{rest_data["name"]} Special 1', 'price': 250, 'description': 'Popular item'},
                {'name': f'{rest_data["name"]} Special 2', 'price': 350, 'description': 'Premium item'},
                {'name': f'{rest_data["name"]} Special 3', 'price': 450, 'description': 'Deluxe item'},
            ])

            for item in items:
                menu_item = MenuItem(
                    restaurant=restaurant,
                    name=item['name'],
                    price=item['price'],
                    description=item['description'],
                    category=rest_data['category']
                )
                menu_item.save()

        print("✅ Demo data created")

    # Create demo admin if not exist
    if User.objects(role='admin').count() == 0:
        admin = User(
            username='admin',
            email='admin@fooddelivery.com',
            password_hash=PasswordSecurity.hash_password('admin123'),
            phone='9999999999',
            role='admin',
            is_verified=True
        )
        admin.save()
        print("✅ Admin created: admin/admin123")

    # Create demo customer
    if User.objects(role='customer', username='customer').count() == 0:
        customer = User(
            username='customer',
            email='customer@fooddelivery.com',
            password_hash=PasswordSecurity.hash_password('customer123'),
            phone='8888888888',
            role='customer',
            is_verified=True
        )
        customer.save()
        print("✅ Demo customer created: customer/customer123")

    # Create demo restaurant user
    if User.objects(role='restaurant', username='restaurant').count() == 0:
        rest_user = User(
            username='restaurant',
            email='rest@fooddelivery.com',
            password_hash=PasswordSecurity.hash_password('rest123'),
            phone='7777777777',
            role='restaurant',
            is_verified=True
        )
        rest_user.save()
        print("✅ Demo restaurant user created: restaurant/rest123")

    # Create demo delivery partner
    if User.objects(role='delivery', username='delivery').count() == 0:
        delivery = User(
            username='delivery',
            email='delivery@fooddelivery.com',
            password_hash=PasswordSecurity.hash_password('delivery123'),
            phone='6666666666',
            role='delivery',
            is_verified=True
        )
        delivery.save()
        print("✅ Demo delivery partner created: delivery/delivery123")
