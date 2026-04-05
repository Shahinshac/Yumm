"""
Account Management Routes
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from backend.app.models.account import Account
from backend.app.models.user import User
from backend.app.middleware.auth import role_required, get_current_user

bp = Blueprint('accounts', __name__, url_prefix='/api/accounts')

@bp.route('', methods=['POST'])
@role_required('admin', 'staff')
def create_account():
    """Create account for customer"""
    data = request.get_json()
    current = get_current_user()

    customer_id = data.get('customer_id')
    if not customer_id:
        return jsonify({'error': 'customer_id is required'}), 400

    customer = User.objects(id=customer_id).first()
    if not customer:
        return jsonify({'error': 'Customer not found'}), 404

    if customer.role != 'customer':
        return jsonify({'error': 'Target user must be a customer'}), 400

    if str(customer.id) == current['user_id']:
        return jsonify({'error': 'Cannot create account for yourself'}), 403

    account = Account(
        account_number=Account.generate_account_number(),
        user=customer,
        account_type=data.get('account_type', 'savings'),
        balance=float(data.get('initial_balance', 0))
    )
    account.save()

    return jsonify({
        'message': f'Account created for {customer.first_name} {customer.last_name}',
        'account': account.to_dict(),
        'customer': {
            'id': str(customer.id),
            'username': customer.username,
            'first_name': customer.first_name,
            'last_name': customer.last_name
        }
    }), 201

@bp.route('', methods=['GET'])
@jwt_required()
def list_accounts():
    """List accounts for current user"""
    current = get_current_user()

    if current['is_admin']:
        accounts = Account.objects()
    else:
        accounts = Account.objects(user=current['user_id'])

    return jsonify({
        'accounts': [a.to_dict() for a in accounts]
    }), 200

@bp.route('/<account_id>', methods=['GET'])
@jwt_required()
def get_account(account_id):
    """Get account details"""
    current = get_current_user()
    account = Account.objects(id=account_id).first()

    if not account:
        return jsonify({'error': 'Account not found'}), 404

    if not current['is_admin'] and str(account.user.id) != current['user_id']:
        return jsonify({'error': 'Forbidden'}), 403

    return jsonify(account.to_dict()), 200

@bp.route('/<account_id>', methods=['DELETE'])
@role_required('admin')
def delete_account(account_id):
    """Delete account (Admin only)"""
    account = Account.objects(id=account_id).first()
    if not account:
        return jsonify({'error': 'Account not found'}), 404

    account.delete()
    return jsonify({'message': 'Account deleted'}), 200
