"""
Account management API routes
"""
from flask import Blueprint, request, jsonify
from app.services.account_service import AccountService
from app.services.user_service import UserService
from app.utils.exceptions import BankingException
from app.middleware.rbac import require_role, require_authentication, get_current_user

# Create blueprint
accounts_bp = Blueprint("accounts", __name__, url_prefix="/api/accounts")


@accounts_bp.route("", methods=["POST"])
@require_role("admin", "staff")
def create_account():
    """
    Create a new bank account (Admin/Staff only)

    Request body:
        {
            "user_id": "str_id",
            "account_type": "savings",  # savings, current, salary
            "initial_balance": 1000.00
        }

    Returns:
        201: Account created
        400: Validation error
        403: Unauthorized
    """
    try:
        data = request.get_json()

        # Validate required fields
        if "user_id" not in data:
            return jsonify({"error": "user_id is required"}), 400

        user_id = data.get("user_id")
        account_type = data.get("account_type", "savings")
        initial_balance = data.get("initial_balance", 0.0)

        account = AccountService.create_account(
            user_id=user_id,
            account_type=account_type,
            initial_balance=initial_balance
        )

        return jsonify({
            "message": "Account created successfully",
            "account": account.to_dict()
        }), 201

    except BankingException as e:
        return jsonify({"error": e.message}), e.status_code
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@accounts_bp.route("", methods=["GET"])
@require_authentication
def list_user_accounts():
    """
    Get all accounts for current user

    Query parameters:
        user_id: User ID (Admin/Staff only, otherwise uses current user)

    Returns:
        200: List of accounts
        403: Unauthorized
    """
    try:
        current_user = get_current_user()
        user_id = request.args.get("user_id")

        # Authorization check
        if user_id and current_user["role"] not in ["admin", "manager", "staff"]:
            return jsonify({"error": "Only admin/manager/staff can view other users' accounts"}), 403

        # Use requested user_id or current user
        target_user_id = user_id if user_id else current_user["user_id"]

        accounts = AccountService.get_user_accounts(target_user_id)

        return jsonify({
            "user_id": target_user_id,
            "count": len(accounts),
            "accounts": [account.to_dict() for account in accounts]
        }), 200

    except BankingException as e:
        return jsonify({"error": e.message}), e.status_code
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@accounts_bp.route("/<account_id>", methods=["GET"])
@require_authentication
def get_account(account_id):
    """
    Get account details

    Authorization:
        - Account owner can view
        - Admin/Manager/Staff can view any account

    Returns:
        200: Account details
        404: Account not found
        403: Unauthorized
    """
    try:
        current_user = get_current_user()
        account = AccountService.get_account_by_id(account_id)

        # Check authorization
        if (current_user["role"] not in ["admin", "manager", "staff"] and
                account.user_id != current_user["user_id"]):
            return jsonify({"error": "You can only view your own accounts"}), 403

        return jsonify({
            "account": account.to_dict(),
            "owner": account.user.to_dict()
        }), 200

    except BankingException as e:
        return jsonify({"error": e.message}), e.status_code
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@accounts_bp.route("/<account_id>/balance", methods=["GET"])
@require_authentication
def get_account_balance(account_id):
    """
    Get account balance

    Returns:
        200: Balance information
        404: Account not found
        403: Unauthorized
    """
    try:
        current_user = get_current_user()
        account = AccountService.get_account_by_id(account_id)

        # Check authorization
        if (current_user["role"] not in ["admin", "manager", "staff"] and
                account.user_id != current_user["user_id"]):
            return jsonify({"error": "Unauthorized"}), 403

        balance = AccountService.get_account_balance(account_id)

        return jsonify(balance), 200

    except BankingException as e:
        return jsonify({"error": e.message}), e.status_code
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@accounts_bp.route("/<account_id>/freeze", methods=["POST"])
@require_role("admin", "manager")
def freeze_account(account_id):
    """
    Freeze account (block transactions) - Admin/Manager only

    Returns:
        200: Account frozen
        400: Invalid operation
        404: Account not found
        403: Unauthorized
    """
    try:
        account = AccountService.freeze_account(account_id)

        return jsonify({
            "message": "Account frozen successfully",
            "account": account.to_dict()
        }), 200

    except BankingException as e:
        return jsonify({"error": e.message}), e.status_code
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@accounts_bp.route("/<account_id>/unfreeze", methods=["POST"])
@require_role("admin", "manager")
def unfreeze_account(account_id):
    """
    Unfreeze account (allow transactions) - Admin/Manager only

    Returns:
        200: Account unfrozen
        400: Invalid operation
        404: Account not found
        403: Unauthorized
    """
    try:
        account = AccountService.unfreeze_account(account_id)

        return jsonify({
            "message": "Account unfrozen successfully",
            "account": account.to_dict()
        }), 200

    except BankingException as e:
        return jsonify({"error": e.message}), e.status_code
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@accounts_bp.route("/<account_id>/close", methods=["POST"])
@require_role("admin")
def close_account(account_id):
    """
    Close account permanently - Admin only

    Requirements:
        - Account balance must be 0
        - Account status will be CLOSED

    Returns:
        200: Account closed
        400: Cannot close (has balance or already closed)
        404: Account not found
        403: Unauthorized
    """
    try:
        account = AccountService.close_account(account_id)

        return jsonify({
            "message": "Account closed successfully",
            "account": account.to_dict()
        }), 200

    except BankingException as e:
        return jsonify({"error": e.message}), e.status_code
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@accounts_bp.route("/<account_id>/status", methods=["GET"])
@require_authentication
def get_account_status(account_id):
    """
    Get account status details

    Returns:
        200: Status information
        404: Account not found
        403: Unauthorized
    """
    try:
        current_user = get_current_user()
        account = AccountService.get_account_by_id(account_id)

        # Check authorization
        if (current_user["role"] not in ["admin", "manager", "staff"] and
                account.user_id != current_user["user_id"]):
            return jsonify({"error": "Unauthorized"}), 403

        status = AccountService.get_account_status(account_id)

        return jsonify(status), 200

    except BankingException as e:
        return jsonify({"error": e.message}), e.status_code
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@accounts_bp.errorhandler(BankingException)
def handle_banking_exception(error):
    """Handle custom banking exceptions"""
    return jsonify({"error": error.message}), error.status_code
