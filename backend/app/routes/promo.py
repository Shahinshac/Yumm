"""
Promo Code Routes
"""
from flask import Blueprint, request, jsonify
from datetime import datetime
from backend.app.models.models import PromoCode
from backend.app.middleware.auth import role_required

bp = Blueprint('promo', __name__, url_prefix='/api/promo')

@bp.route('/validate', methods=['POST'])
def validate_promo():
    """Validate promo code"""
    data = request.get_json()
    code = data.get('code', '').upper()

    promo = PromoCode.objects(code=code).first()

    if not promo:
        return jsonify({'error': 'Invalid promo code'}), 404

    if not promo.is_active:
        return jsonify({'error': 'Promo code is inactive'}), 400

    if promo.valid_till and promo.valid_till < datetime.utcnow():
        return jsonify({'error': 'Promo code has expired'}), 400

    if promo.max_uses and promo.current_uses >= promo.max_uses:
        return jsonify({'error': 'Promo code usage limit reached'}), 400

    return jsonify({
        'valid': True,
        'discount_type': promo.discount_type,
        'discount_value': promo.discount_value,
        'min_order_amount': promo.min_order_amount,
        'max_discount': promo.max_discount
    }), 200

@bp.route('', methods=['POST'])
@role_required('admin')
def create_promo():
    """Create new promo code (Admin only)"""
    data = request.get_json()

    promo = PromoCode(
        code=data.get('code', '').upper(),
        discount_type=data.get('discount_type', 'percentage'),
        discount_value=float(data.get('discount_value', 0)),
        min_order_amount=float(data.get('min_order_amount', 0)),
        max_discount=float(data.get('max_discount')) if data.get('max_discount') else None,
        max_uses=int(data.get('max_uses')) if data.get('max_uses') else None,
        is_active=True
    )
    promo.save()

    return jsonify({
        'message': 'Promo code created',
        'promo': promo.to_dict()
    }), 201

@bp.route('', methods=['GET'])
@role_required('admin')
def list_promos():
    """List all promo codes (Admin only)"""
    promos = PromoCode.objects()

    return jsonify({
        'count': len(promos),
        'promos': [p.to_dict() for p in promos]
    }), 200
