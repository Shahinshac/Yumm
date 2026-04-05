"""
Transaction, Loan, Card, Bill Routes
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from backend.app.models.transaction import Transaction
from backend.app.models.account import Account
from backend.app.middleware.auth import role_required, get_current_user
import uuid

# Transaction routes
txn_bp = Blueprint('transactions', __name__, url_prefix='/api/transactions')

@txn_bp.route('', methods=['GET'])
@jwt_required()
def list_transactions():
    """List transactions"""
    current = get_current_user()
    account_id = request.args.get('account_id')

    if account_id:
        txns = Transaction.objects(account=account_id)
    else:
        accounts = Account.objects(user=current['user_id']if not current['is_admin'] else None)
        account_ids = [a.id for a in accounts]
        txns = Transaction.objects(account__in=account_ids)

    return jsonify({'transactions': [t.to_dict() for t in txns]}), 200

@txn_bp.route('', methods=['POST'])
@role_required('admin', 'staff', 'customer')
def create_transaction():
    """Create transaction"""
    data = request.get_json()
    current = get_current_user()

    account = Account.objects(id=data.get('account_id')).first()
    if not account:
        return jsonify({'error': 'Account not found'}), 404

    if not current['is_admin'] and str(account.user.id) != current['user_id']:
        return jsonify({'error': 'Forbidden'}), 403

    txn = Transaction(
        account=account,
        type=data.get('type', 'deposit'),
        amount=float(data.get('amount', 0)),
        description=data.get('description', ''),
        reference_id=f"TXN{uuid.uuid4().hex[:12].upper()}",
        status='completed'
    )
    txn.save()

    account.balance += txn.amount if txn.type == 'deposit' else -txn.amount
    account.transactions_count += 1
    account.save()

    return jsonify(txn.to_dict()), 201

# Loan routes
loan_bp = Blueprint('loans', __name__, url_prefix='/api/loans')

@loan_bp.route('', methods=['GET'])
@jwt_required()
def list_loans():
    """List loans"""
    from backend.app.models.models import Loan
    current = get_current_user()

    loans = Loan.objects(user=current['user_id']) if not current['is_admin'] else Loan.objects()
    return jsonify({'loans': [l.to_dict() for l in loans]}), 200

@loan_bp.route('', methods=['POST'])
@jwt_required()
def apply_loan():
    """Apply for loan"""
    from backend.app.models.models import Loan
    data = request.get_json()
    current = get_current_user()

    user = User.objects(id=current['user_id']).first()
    account = Account.objects(id=data.get('account_id')).first()

    if not account or str(account.user.id) != current['user_id']:
        return jsonify({'error': 'Invalid account'}), 400

    loan = Loan(
        user=user,
        account=account,
        loan_type=data.get('loan_type', 'personal'),
        amount=float(data.get('amount', 0)),
        rate_of_interest=float(data.get('rate', 8.5)),
        tenure_months=int(data.get('tenure', 12)),
        status='approved'
    )
    loan.save()

    return jsonify(loan.to_dict()), 201

# Card routes
card_bp = Blueprint('cards', __name__, url_prefix='/api/cards')

@card_bp.route('', methods=['GET'])
@jwt_required()
def list_cards():
    """List cards"""
    from backend.app.models.models import Card
    current = get_current_user()

    cards = Card.objects(user=current['user_id']) if not current['is_admin'] else Card.objects()
    return jsonify({'cards': [c.to_dict() for c in cards]}), 200

# Bill routes
bill_bp = Blueprint('bills', __name__, url_prefix='/api/bills')

@bill_bp.route('', methods=['GET'])
@jwt_required()
def list_bills():
    """List bills"""
    from backend.app.models.models import Bill
    current = get_current_user()

    bills = Bill.objects(user=current['user_id']) if not current['is_admin'] else Bill.objects()
    return jsonify({'bills': [b.to_dict() for b in bills]}), 200

@bill_bp.route('', methods=['POST'])
@jwt_required()
def pay_bill():
    """Pay bill"""
    from backend.app.models.models import Bill
    from datetime import datetime

    data = request.get_json()
    current = get_current_user()

    account = Account.objects(id=data.get('account_id')).first()
    if not account or str(account.user.id) != current['user_id']:
        return jsonify({'error': 'Invalid account'}), 400

    if account.balance < float(data.get('amount', 0)):
        return jsonify({'error': 'Insufficient balance'}), 400

    bill = Bill(
        user=account.user,
        account=account,
        bill_type=data.get('bill_type', 'other'),
        amount=float(data.get('amount', 0)),
        status='paid',
        paid_date=datetime.utcnow()
    )
    bill.save()

    account.balance -= bill.amount
    account.transactions_count += 1
    account.save()

    return jsonify(bill.to_dict()), 201
