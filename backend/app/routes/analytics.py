"""Analytics and Reporting routes - Admin dashboard"""
from flask import Blueprint, request, jsonify
from app.middleware.rbac import require_role, get_current_user
from app.models.user import User
from app.models.account import Account
from app.models.transaction import Transaction
from app.models.base import Card, Loan, ScheduledPayment, Notification
from app import db
from datetime import datetime, timedelta

analytics_bp = Blueprint("analytics", __name__, url_prefix="/api/analytics")

@analytics_bp.route("/dashboard", methods=["GET"])
@require_role("manager", "admin")
def dashboard():
    """Get admin dashboard"""
    total_users = User.query.count()
    total_accounts = Account.query.count()
    total_transactions = Transaction.query.count()
    total_loans = Loan.query.count()
    
    active_accounts = Account.query.filter_by(status="active").count()
    frozen_accounts = Account.query.filter_by(status="frozen").count()
    
    return jsonify({
        "users": total_users,
        "accounts": total_accounts,
        "active_accounts": active_accounts,
        "frozen_accounts": frozen_accounts,
        "transactions": total_transactions,
        "loans": total_loans,
    }), 200

@analytics_bp.route("/users", methods=["GET"])
@require_role("manager", "admin")
def user_analytics():
    """User statistics"""
    total = User.query.count()
    active = User.query.filter_by(is_active=True).count()
    verified = User.query.filter_by(is_verified=True).count()
    
    return jsonify({
        "total_users": total,
        "active_users": active,
        "verified_users": verified,
        "inactive_users": total - active,
    }), 200

@analytics_bp.route("/accounts", methods=["GET"])
@require_role("manager", "admin")
def account_analytics():
    """Account statistics"""
    total = Account.query.count()
    savings = Account.query.filter_by(account_type="savings").count()
    current = Account.query.filter_by(account_type="current").count()
    salary = Account.query.filter_by(account_type="salary").count()
    
    total_balance = db.session.query(db.func.sum(Account.balance)).scalar() or 0
    
    return jsonify({
        "total_accounts": total,
        "savings_accounts": savings,
        "current_accounts": current,
        "salary_accounts": salary,
        "total_balance": float(total_balance),
    }), 200

@analytics_bp.route("/transactions", methods=["GET"])
@require_role("manager", "admin")
def transaction_analytics():
    """Transaction statistics"""
    days = request.args.get("days", 30, type=int)
    start_date = datetime.utcnow() - timedelta(days=days)
    
    total = Transaction.query.filter(Transaction.created_at >= start_date).count()
    deposits = Transaction.query.filter(
        Transaction.created_at >= start_date,
        Transaction.transaction_type == "deposit"
    ).count()
    withdrawals = Transaction.query.filter(
        Transaction.created_at >= start_date,
        Transaction.transaction_type == "withdrawal"
    ).count()
    transfers = Transaction.query.filter(
        Transaction.created_at >= start_date,
        Transaction.transaction_type == "transfer"
    ).count()
    
    total_amount = db.session.query(db.func.sum(Transaction.amount)).filter(
        Transaction.created_at >= start_date
    ).scalar() or 0
    
    return jsonify({
        "period_days": days,
        "total_transactions": total,
        "deposits": deposits,
        "withdrawals": withdrawals,
        "transfers": transfers,
        "total_amount": float(total_amount),
    }), 200

@analytics_bp.route("/loans", methods=["GET"])
@require_role("manager", "admin")
def loan_analytics():
    """Loan statistics"""
    total = Loan.query.count()
    pending = Loan.query.filter_by(status="pending").count()
    approved = Loan.query.filter_by(status="approved").count()
    active = Loan.query.filter_by(status="active").count()
    closed = Loan.query.filter_by(status="closed").count()
    
    total_disbursed = db.session.query(db.func.sum(Loan.disbursed_amount)).scalar() or 0
    
    return jsonify({
        "total_loans": total,
        "pending": pending,
        "approved": approved,
        "active": active,
        "closed": closed,
        "total_disbursed": float(total_disbursed),
    }), 200

@analytics_bp.route("/cards", methods=["GET"])
@require_role("manager", "admin")
def card_analytics():
    """Card statistics"""
    total = Card.query.count()
    active = Card.query.filter_by(is_active=True, is_blocked=False).count()
    blocked = Card.query.filter_by(is_blocked=True).count()
    
    return jsonify({
        "total_cards": total,
        "active_cards": active,
        "blocked_cards": blocked,
    }), 200

@analytics_bp.route("/payments", methods=["GET"])
@require_role("manager", "admin")
def scheduled_payments_analytics():
    """Scheduled payments statistics"""
    total = ScheduledPayment.query.count()
    active = ScheduledPayment.query.filter_by(status="active").count()
    completed = ScheduledPayment.query.filter_by(status="completed").count()
    cancelled = ScheduledPayment.query.filter_by(status="cancelled").count()
    
    return jsonify({
        "total_scheduled": total,
        "active": active,
        "completed": completed,
        "cancelled": cancelled,
    }), 200

@analytics_bp.route("/daily-report", methods=["GET"])
@require_role("manager", "admin")
def daily_report():
    """Daily transaction report"""
    today = datetime.utcnow().date()
    tomorrow = today + timedelta(days=1)
    
    txns = Transaction.query.filter(
        Transaction.created_at >= today,
        Transaction.created_at < tomorrow
    ).all()
    
    return jsonify({
        "date": str(today),
        "total_transactions": len(txns),
        "total_volume": sum(t.amount for t in txns),
        "by_type": {
            "deposits": len([t for t in txns if t.transaction_type == "deposit"]),
            "withdrawals": len([t for t in txns if t.transaction_type == "withdrawal"]),
            "transfers": len([t for t in txns if t.transaction_type == "transfer"]),
        }
    }), 200
