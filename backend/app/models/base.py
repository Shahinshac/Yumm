"""
Stub models for other entities (will be fully implemented in later steps)
"""
from app import db
from datetime import datetime


class Card(db.Model):
    """Debit Card model"""
    __tablename__ = "cards"

    id = db.Column(db.Integer, primary_key=True)
    card_number = db.Column(db.String(20), unique=True, nullable=False)
    card_type = db.Column(db.String(20), default="debit")
    pin_hash = db.Column(db.String(255), nullable=False)
    expiry_date = db.Column(db.String(5), nullable=False)
    is_active = db.Column(db.Boolean, default=True)

    account_id = db.Column(db.Integer, db.ForeignKey("accounts.id"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Beneficiary(db.Model):
    """Beneficiary model for transfers"""
    __tablename__ = "beneficiaries"

    id = db.Column(db.Integer, primary_key=True)
    account_number = db.Column(db.String(20), nullable=False)
    name = db.Column(db.String(120), nullable=False)
    is_approved = db.Column(db.Boolean, default=False)

    account_id = db.Column(db.Integer, db.ForeignKey("accounts.id"), nullable=False)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Loan(db.Model):
    """Loan model"""
    __tablename__ = "loans"

    id = db.Column(db.Integer, primary_key=True)
    loan_amount = db.Column(db.Numeric(15, 2), nullable=False)
    loan_type = db.Column(db.String(50), nullable=False)
    status = db.Column(db.String(20), default="active")

    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    account_id = db.Column(db.Integer, db.ForeignKey("accounts.id"), nullable=False)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class LoanPayment(db.Model):
    """Loan Payment model"""
    __tablename__ = "loan_payments"

    id = db.Column(db.Integer, primary_key=True)
    loan_id = db.Column(db.Integer, db.ForeignKey("loans.id"), nullable=False)
    amount = db.Column(db.Numeric(15, 2), nullable=False)
    status = db.Column(db.String(20), default="pending")

    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class Notification(db.Model):
    """Notification model"""
    __tablename__ = "notifications"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    message = db.Column(db.Text, nullable=False)
    is_read = db.Column(db.Boolean, default=False)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class ScheduledPayment(db.Model):
    """Scheduled Payment model"""
    __tablename__ = "scheduled_payments"

    id = db.Column(db.Integer, primary_key=True)
    account_id = db.Column(db.Integer, db.ForeignKey("accounts.id"), nullable=False)
    recipient_account_id = db.Column(db.Integer, nullable=False)
    amount = db.Column(db.Numeric(15, 2), nullable=False)
    scheduled_date = db.Column(db.DateTime, nullable=False)
    status = db.Column(db.String(20), default="pending")

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
