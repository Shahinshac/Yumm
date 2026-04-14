"""
Delivery Service - Delivery partner management
"""
from datetime import datetime
from backend.app.models.delivery_partner import DeliveryPartner
from backend.app.models.models import DeliveryAssignment, Order
from backend.app.models.user import User


class DeliveryService:
    """Handle delivery operations"""
    
    @staticmethod
    def register_delivery_partner(user_id: str, phone: str, vehicle_type: str, vehicle_number: str = ""):
        """Register delivery partner"""
        valid_vehicles = ['bike', 'scooter', 'car', 'bicycle']
        if vehicle_type not in valid_vehicles:
            return None, f"Invalid vehicle type. Must be one of {valid_vehicles}"
        
        try:
            user = User.objects(id=user_id).first()
            if not user:
                return None, "User not found"
            
            # Check if already registered
            existing = DeliveryPartner.objects(user=user_id).first()
            if existing:
                return None, "Delivery partner already registered for this user"
            
            partner = DeliveryPartner(
                user=user,
                phone=phone,
                vehicle_type=vehicle_type,
                vehicle_number=vehicle_number
            )
            partner.save()
            
            return partner, None
        except Exception as e:
            return None, str(e)
    
    @staticmethod
    def toggle_availability(user_id: str, is_available: bool):
        """Toggle delivery partner availability"""
        try:
            partner = DeliveryPartner.objects(user=user_id).first()
            if not partner:
                return None, "Delivery partner not found"
            
            partner.is_available = is_available
            partner.is_online = is_available
            partner.last_online_at = datetime.utcnow()
            partner.save()
            
            status = "online" if is_available else "offline"
            return {
                "message": f"Delivery partner is now {status}",
                "is_available": partner.is_available,
                "is_online": partner.is_online
            }, None
        except Exception as e:
            return None, str(e)
    
    @staticmethod
    def update_location(user_id: str, lat: float, lng: float):
        """Update delivery partner current location"""
        try:
            partner = DeliveryPartner.objects(user=user_id).first()
            if not partner:
                return None, "Delivery partner not found"
            
            partner.current_location = {"lat": lat, "lng": lng}
            partner.save()
            
            return partner.to_dict(), None
        except Exception as e:
            return None, str(e)
    
    @staticmethod
    def get_assigned_orders(user_id: str):
        """Get all assigned orders for delivery partner"""
        try:
            partner = DeliveryPartner.objects(user=user_id).first()
            if not partner:
                return None, "Delivery partner not found"
            
            orders = Order.objects(delivery_partner=user_id, status__ne='delivered')
            return [order.to_dict() for order in orders], None
        except Exception as e:
            return None, str(e)
    
    @staticmethod
    def update_delivery_status(order_id: str, new_status: str):
        """Update delivery status for an order"""
        valid_statuses = ['picked', 'on_the_way', 'delivered']
        if new_status not in valid_statuses:
            return None, f"Invalid status. Must be one of {valid_statuses}"
        
        try:
            order = Order.objects(id=order_id).first()
            if not order:
                return None, "Order not found"
            
            order.status = new_status
            order.updated_at = datetime.utcnow()
            
            if new_status == 'delivered':
                order.delivered_at = datetime.utcnow()
                # Mark delivery partner as available
                if order.delivery_partner:
                    partner = DeliveryPartner.objects(user=order.delivery_partner.id).first()
                    if partner:
                        partner.is_available = True
                        partner.total_deliveries += 1
                        partner.save()
            
            order.save()
            return order.to_dict(), None
        except Exception as e:
            return None, str(e)
    
    @staticmethod
    def get_delivery_partner_by_user(user_id: str):
        """Get delivery partner details"""
        try:
            partner = DeliveryPartner.objects(user=user_id).first()
            return partner.to_dict() if partner else None, None
        except Exception as e:
            return None, str(e)

    @staticmethod
    def get_available_orders():
        """Get all orders ready for delivery that aren't assigned yet"""
        try:
            # Look for orders that are 'ready' but have no delivery partner
            orders = Order.objects(status='ready', delivery_partner=None)
            return [order.to_dict() for order in orders], None
        except Exception as e:
            return None, str(e)

    @staticmethod
    def claim_order(order_id: str, user_id: str):
        """Claim an available order for delivery"""
        try:
            partner = DeliveryPartner.objects(user=user_id).first()
            if not partner:
                return None, "Delivery partner not found"
            
            # Check if partner is already busy
            active = Order.objects(delivery_partner=user_id, status__in=['picked', 'on_the_way']).first()
            if active:
                return None, "You already have an active delivery. Complete it first."

            order = Order.objects(id=order_id, delivery_partner=None).first()
            if not order:
                return None, "Order no longer available or already assigned"
            
            partner_user = User.objects(id=user_id).first()
            order.delivery_partner = partner_user
            order.status = 'picked' # Immediately mark as picked for simplicity in this flow
            order.updated_at = datetime.utcnow()
            order.save()

            partner.is_available = False
            partner.save()

            assignment = DeliveryAssignment(
                order=order,
                delivery_partner=partner_user,
                status='accepted',
                accepted_at=datetime.utcnow()
            )
            assignment.save()
            
            return order.to_dict(), None
        except Exception as e:
            return None, str(e)
