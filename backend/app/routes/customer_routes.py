"""
Customer-only routes - /api/customer/*
"""
from flask import Blueprint, request, jsonify
from app.middleware.rbac import role_required, get_current_user, get_current_user_dict
from app.services.account_service import AccountService
from app.services.transaction_service import TransactionService
from app.models.account import Account
import logging

logger = logging.getLogger(__name__)

customer_routes = Blueprint("customer_routes", __name__, url_prefix="/api/customer")


@customer_routes.route("/me", methods=["GET"])
@role_required("customer", "staff", "admin")
def get_current_customer():
    """
    Get current user's profile
    
    Returns:
        200: User profile
    """
    try:
        user = get_current_user()
        
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        # Get user's accounts
        accounts = Account.objects(user_id=user.id)
        
        return jsonify({
            "user": user.to_dict(),
            "accounts_count": accounts.count(),
            "accounts": [acc.to_dict() for acc in accounts]
        }), 200
        
    except Exception as e:
        logger.error(f"Get profile error: {str(e)}")
        return jsonify({"error": str(e)}), 500


@customer_routes.route("/accounts", methods=["GET"])
@role_required("customer", "staff", "admin")
def get_my_accounts():
    """
    Get customer's own accounts only
    
    Returns:
        200: Account list
    """
    try:
        user = get_current_user()
        
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        accounts = Account.objects(user_id=user.id)
        
        return jsonify({
            "user_id": str(user.id),
            "count": accounts.count(),
            "accounts": [acc.to_dict() for acc in accounts]
        }), 200
        
    except Exception as e:
        logger.error(f"Get accounts error: {str(e)}")
        return jsonify({"error": str(e)}), 500


@customer_routes.route("/accounts/<account_id>", methods=["GET"])
@role_required("customer", "staff", "admin")
def get_my_account(account_id):
    """
    Get specific account details (must own the account)
    
    Returns:
        200: Account details
        403: Not your account
        404: Account not found
    """
    try:
        user = get_current_user()
        account = Account.objects(id=account_id).first()
        
        if not account:
            return jsonify({"error": "Account not found"}), 404
        
        # Customer can only view own accounts (staff/admin bypass this)
        if user.role == "customer" and str(account.user_id.id) != str(user.id):
            return jsonify({"error": "You can only view your own accounts"}), 403
        
        return jsonify({
            "account": account.to_dict()
        }), 200
        
    except Exception as e:
        logger.error(f"Get account error: {str(e)}")
        return jsonify({"error": str(e)}), 500


@customer_routes.route("/transactions", methods=["GET"])
@role_required("customer", "staff", "admin")
def get_my_transactions():
    """
    Get customer's own transactions only
    
    Query params:
        account_id: Specific account (optional, must own it)
        page: Page number
        per_page: Items per page
    
    Returns:
        200: Transaction list
    """
    try:
        user = get_current_user()
        account_id = request.args.get("account_id")
        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 20, type=int)
        
        if account_id:
            # Verify account ownership
            account = Account.objects(id=account_id).first()
            if not account:
                return jsonify({"error": "Account not found"}), 404
            
            if user.role == "customer" and str(account.user_id.id) != str(user.id):
                return jsonify({"error": "You can only view your own transactions"}), 403
            
            result = TransactionService.get_account_transactions(
                account_id=account_id,
                page=page,
                per_page=per_page
            )
        else:
            # Get all user's transactions
            result = TransactionService.get_user_transactions(
                user_id=str(user.id),
                page=page,
                per_page=per_page
            )
        
        return jsonify(result), 200
        
    except Exception as e:
        logger.error(f"Get transactions error: {str(e)}")
        return jsonify({"error": str(e)}), 500


@customer_routes.route("/transfer", methods=["POST"])
@role_required("customer", "staff", "admin")
def transfer_funds():
    """
    Transfer funds between accounts (customer can only transfer from own accounts)
    
    Body:
        {
            "from_account_id": "string",
            "to_account_number": "string",
            "amount": 100.00,
            "description": "Payment"
        }
    
    Returns:
        201: Transfer successful
        403: Not your account
    """
    try:
        user = get_current_user()
        data = request.get_json()
        
        if not all(k in data for k in ["from_account_id", "to_account_number", "amount"]):
            return jsonify({"error": "from_account_id, to_account_number, and amount are required"}), 400
        
        # Verify source account ownership
        from_account = Account.objects(id=data["from_account_id"]).first()
        if not from_account:
            return jsonify({"error": "Source account not found"}), 404
        
        if user.role == "customer" and str(from_account.user_id.id) != str(user.id):
            return jsonify({"error": "You can only transfer from your own accounts"}), 403
        
        # Process transfer
        transaction = TransactionService.transfer(
            from_account_id=data["from_account_id"],
            to_account_number=data["to_account_number"],
            amount=data["amount"],
            description=data.get("description", "Fund transfer")
        )
        
        logger.info(f"User {user.username} transferred {data['amount']} from {from_account.account_number}")
        
        return jsonify({
            "message": "Transfer successful",
            "transaction": transaction.to_dict()
        }), 201
        
    except Exception as e:
        logger.error(f"Transfer error: {str(e)}")
        return jsonify({"error": str(e)}), 500


@customer_routes.route("/balance/<account_id>", methods=["GET"])
@role_required("customer", "staff", "admin")
def get_account_balance(account_id):
    """
    Get account balance (must own the account)
    
    Returns:
        200: Balance info
    """
    try:
        user = get_current_user()
        account = Account.objects(id=account_id).first()
        
        if not account:
            return jsonify({"error": "Account not found"}), 404
        
        if user.role == "customer" and str(account.user_id.id) != str(user.id):
            return jsonify({"error": "You can only view your own account balance"}), 403
        
        balance = AccountService.get_account_balance(account_id)
        
        return jsonify({
            "account_id": account_id,
            "account_number": account.account_number,
            "balance": float(balance),
            "account_type": account.account_type,
            "status": account.status
        }), 200
        
    except Exception as e:
        logger.error(f"Get balance error: {str(e)}")
        return jsonify({"error": str(e)}), 500
