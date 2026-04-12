"""
Payments Routes
Handles Razorpay order creation and payment verification
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import razorpay
import os
import logging
from backend.app.models.models import Order
from backend.app.middleware.role_auth import customer_required

logger = logging.getLogger(__name__)

bp = Blueprint('payments', __name__, url_prefix='/api/payments')

def get_razorpay_client():
    return razorpay.Client(auth=(
        os.getenv('RAZORPAY_KEY_ID', 'rzp_test_placeholder'),
        os.getenv('RAZORPAY_KEY_SECRET', 'placeholder')
    ))

@bp.route('/create-razorpay-order', methods=['POST'])
@customer_required
def create_razorpay_order():
    """Create a Razorpay order from a pending FoodHub order"""
    try:
        data = request.get_json()
        order_id = data.get('order_id')
        
        if not order_id:
            return jsonify({'error': 'order_id required'}), 400
            
        order = Order.objects(id=order_id).first()
        if not order:
            return jsonify({'error': 'Order not found'}), 404
            
        # Amount must be in paise (₹1 = 100 paise)
        amount_paise = int(order.total_amount * 100)
        
        razorpay_order_data = {
            'amount': amount_paise,
            'currency': 'INR',
            'receipt': str(order.id),
            'payment_capture': 1
        }
        
        # Create Razorpay order
        client = get_razorpay_client()
        razorpay_order = client.order.create(data=razorpay_order_data)
        
        # Save Razorpay order ID to our order
        order.razorpay_order_id = razorpay_order['id']
        order.save()
        
        return jsonify({
            'razorpay_order_id': razorpay_order['id'],
            'amount': amount_paise,
            'currency': 'INR',
            'key_id': os.getenv('RAZORPAY_KEY_ID')
        }), 200
        
    except Exception as e:
        logger.error(f"Razorpay order creation failed: {str(e)}")
        return jsonify({'error': 'Failed to initialize payment gateway'}), 500

@bp.route('/verify-payment', methods=['POST'])
@customer_required
def verify_payment():
    """Verify Razorpay signature after payment"""
    try:
        data = request.get_json()
        
        # Razorpay sends these from the frontend
        razorpay_order_id = data.get('razorpay_order_id')
        razorpay_payment_id = data.get('razorpay_payment_id')
        razorpay_signature = data.get('razorpay_signature')
        
        if not all([razorpay_order_id, razorpay_payment_id, razorpay_signature]):
            return jsonify({'error': 'Missing payment verification data'}), 400
            
        # Verify the signature
        params_dict = {
            'razorpay_order_id': razorpay_order_id,
            'razorpay_payment_id': razorpay_payment_id,
            'razorpay_signature': razorpay_signature
        }
        
        try:
            client = get_razorpay_client()
            client.utility.verify_payment_signature(params_dict)
        except Exception:
            return jsonify({'error': 'Payment verification failed (Invalid signature)'}), 400
            
        # Update order status
        order = Order.objects(razorpay_order_id=razorpay_order_id).first()
        if order:
            order.payment_status = 'paid'
            order.razorpay_payment_id = razorpay_payment_id
            order.save()
            return jsonify({'message': 'Payment verified successfully', 'status': 'paid'}), 200
            
        return jsonify({'error': 'Order not found for this payment'}), 404
        
    except Exception as e:
        logger.error(f"Payment verification system error: {str(e)}")
        return jsonify({'error': 'Internal server error during verification'}), 500
