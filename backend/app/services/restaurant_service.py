"""
Restaurant Service - Restaurant management
"""
from datetime import datetime
from backend.app.models.restaurant import Restaurant, MenuItem
from backend.app.models.user import User
from backend.app.services.notification_service import NotificationService


class RestaurantService:
    """Handle restaurant operations"""
    
    @staticmethod
    def register_restaurant(user_id: str, name: str, address: str, phone: str, license_number: str = ""):
        """Register new restaurant"""
        try:
            user = User.objects(id=user_id).first()
            if not user:
                return None, "User not found"
            
            # Check if already registered
            existing = Restaurant.objects(user=user_id).first()
            if existing:
                return None, "Restaurant already registered for this user"
            
            restaurant = Restaurant(
                user=user,
                name=name,
                address=address,
                phone=phone,
                license_number=license_number,
                category="General",
                is_approved=False
            )
            restaurant.save()
            
            return restaurant, None
        except Exception as e:
            return None, str(e)
    
    @staticmethod
    def approve_restaurant(restaurant_id: str):
        """Approve restaurant (admin only)"""
        try:
            restaurant = Restaurant.objects(id=restaurant_id).first()
            if not restaurant:
                return None, "Restaurant not found"
            
            restaurant.is_approved = True
            restaurant.approved_at = datetime.utcnow()
            restaurant.save()
            
            NotificationService.restaurant_approved(restaurant.name)
            
            return restaurant, None
        except Exception as e:
            return None, str(e)
    
    @staticmethod
    def reject_restaurant(restaurant_id: str, reason: str = ""):
        """Reject restaurant (admin only)"""
        try:
            restaurant = Restaurant.objects(id=restaurant_id).first()
            if not restaurant:
                return None, "Restaurant not found"
            
            restaurant.is_approved = False
            restaurant.is_active = False
            restaurant.save()
            
            NotificationService.restaurant_rejected(restaurant.name, reason)
            
            return restaurant, None
        except Exception as e:
            return None, str(e)
    
    @staticmethod
    def add_menu_item(restaurant_id: str, name: str, price: float, description: str = "", category: str = "General", is_veg: bool = True):
        """Add menu item"""
        try:
            restaurant = Restaurant.objects(id=restaurant_id).first()
            if not restaurant:
                return None, "Restaurant not found"
            
            item = MenuItem(
                restaurant=restaurant,
                name=name,
                price=price,
                description=description,
                category=category,
                is_veg=is_veg
            )
            item.save()
            
            return item, None
        except Exception as e:
            return None, str(e)
    
    @staticmethod
    def update_menu_item(item_id: str, name: str = None, price: float = None, is_available: bool = None):
        """Update menu item"""
        try:
            item = MenuItem.objects(id=item_id).first()
            if not item:
                return None, "Menu item not found"
            
            if name:
                item.name = name
            if price is not None:
                item.price = price
            if is_available is not None:
                item.is_available = is_available
            
            item.save()
            return item, None
        except Exception as e:
            return None, str(e)
    
    @staticmethod
    def delete_menu_item(item_id: str):
        """Delete menu item"""
        try:
            item = MenuItem.objects(id=item_id).first()
            if not item:
                return None, "Menu item not found"
            
            item.delete()
            return {"message": "Menu item deleted"}, None
        except Exception as e:
            return None, str(e)
    
    @staticmethod
    def get_restaurant_by_user(user_id: str):
        """Get restaurant for user"""
        try:
            restaurant = Restaurant.objects(user=user_id).first()
            return restaurant.to_dict() if restaurant else None, None
        except Exception as e:
            return None, str(e)
    
    @staticmethod
    def get_menu_items(restaurant_id: str):
        """Get all menu items for restaurant"""
        try:
            items = MenuItem.objects(restaurant=restaurant_id)
            return [item.to_dict() for item in items], None
        except Exception as e:
            return None, str(e)
