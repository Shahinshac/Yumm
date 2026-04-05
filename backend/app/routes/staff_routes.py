"""
Staff-only routes - /api/staff/*
"""
from flask import Blueprint, request, jsonify
from app.middleware.rbac import role_required, get_current_user_dict
from app.services.transaction_service import TransactionService
from app.services.account_service import AccountService
import logging

logger = logging.getLogger(__name__)

staff_routes = Blueprint("staff_routes", __name__, url_prefix="/api/staff")


@staff_routes.route("/dashboard", methods=["GET"])
@role_required("staff", "admin")
def staff_dashboard():
    """
    Staff dashboard
    
    Returns:
        200: Dashboard data
    """
    try:
        current_user = get_current_user_dict()
        
        return jsonify({
            "message": "Staff Dashboard",
            "current_user": current_user,
            "permissions": [
                "process_deposits",
                "process_withdrawals",
                "view_transactions",
                "assist_customers"
            ]
        }), 200
        
    except Exception as e:
        logger.error(f"Staff dashboard error: {str(e)}")
        return jsonify({"error": "Failed to load dashboard"}), 500


@staff_routes.route("/deposit", methods=["POST"])
@role_required("staff", "admin")
def process_deposit():
    """
    Process deposit (staff/admin only)
    
    Body:
        {
            "account_id": "string",
            "amount": 1000.00,
            "description": "Cash deposit"
        }
    
    Returns:
        201: Deposit processed
        400: Validation error
    """
    try:
        data = request.get_json()
        
        if not data.get("account_id") or not data.get("amount"):
            return jsonify({"error": "account_id and amount are required"}), 400
        
        if data["amount"] <= 0:
            return jsonify({"error": "Amount must be positive"}), 400
        
        transaction = TransactionService.deposit(
            account_id=data["account_id"],
            amount=data["amount"],
            description=data.get("description", "Staff deposit")
        )
        
        staff = get_current_user_dict()
        logger.info(f"Staff {staff['username']} processed deposit of {data['amount']} to account {data['account_id']}")
        
        return jsonify({
            "message": "Deposit processed successfully",
            "transaction": transaction.to_dict(),
            "processed_by": staff["username"]
        }), 201
        
    except Exception as e:
        logger.error(f"Deposit error: {str(e)}")
        return jsonify({"error": str(e)}), 500


@staff_routes.route("/withdrawal", methods=["POST"])
@role_required("staff", "admin")
def process_withdrawal():
    """
    Process withdrawal (staff/admin only)
    
    Body:
        {
            "account_id": "string",
            "amount": 500.00,
            "description": "Cash withdrawal"
        }
    
    Returns:
        201: Withdrawal processed
    """
    try:
        data = request.get_json()
        
        if not data.get("account_id") or not data.get("amount"):
            return jsonify({"error": "account_id and amount are required"}), 400
        
        if data["amount"] <= 0:
            return jsonify({"error": "Amount must be positive"}), 400
        
        transaction = TransactionService.withdraw(
            account_id=data["account_id"],
            amount=data["amount"],
            description=data.get("description", "Staff withdrawal")
        )
        
        staff = get_current_user_dict()
        logger.info(f"Staff {staff['username']} processed withdrawal of {data['amount']} from account {data['account_id']}")
        
        return jsonify({
            "message": "Withdrawal processed successfully",
            "transaction": transaction.to_dict(),
            "processed_by": staff["username"]
        }), 201
        
    except Exception as e:
        logger.error(f"Withdrawal error: {str(e)}")
        return jsonify({"error": str(e)}), 500


@staff_routes.route("/accounts/<account_id>", methods=["GET"])
@role_required("staff", "admin")
def get_account_details(account_id):
    """
    Get account details (staff can view any account)
    
    Returns:
        200: Account details
        404: Account not found
    """
    try:
        account = AccountService.get_account_by_id(account_id)
        
        return jsonify({
            "account": account.to_dict()
        }), 200
        
    except Exception as e:
        logger.error(f"Get account error: {str(e)}")
        return jsonify({"error": str(e)}), 404


@staff_routes.route("/transactions", methods=["GET"])
@role_required("staff", "admin")
def get_all_transactions():
    """
    View all transactions (staff can view all)
    
    Query params:
        account_id: Filter by account
        page: Page number
        per_page: Items per page
    
    Returns:
        200: Transaction list
    """
    try:
        account_id = request.args.get("account_id")
        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 20, type=int)
        
        if account_id:
            result = TransactionService.get_account_transactions(
                account_id=account_id,
                page=page,
                per_page=per_page
            )
        else:
            # Get all transactions (staff privilege)
            from app.models.transaction import Transaction
            transactions = Transaction.objects().skip((page - 1) * per_page).limit(per_page)
            total = Transaction.objects().count()
            
            result = {
                "transactions": [t.to_dict() for t in transactions],
                "total": total,
                "page": page,
                "per_page": per_page
            }
        
        return jsonify(result), 200
        
    except Exception as e:
        logger.error(f"Get transactions error: {str(e)}")
        return jsonify({"error": str(e)}), 500
