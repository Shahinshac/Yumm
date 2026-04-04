"""
Stub models for other entities (will be fully implemented in later steps)
"""
from app import db
from datetime import datetime


class Card(db.Model):
    """Debit Card model"""
    __tablename__ = "cards"

    id = db.Column(db.Integer, primary_key=True)

    # Card Identification
    card_number = db.Column(db.String(20), unique=True, nullable=False, index=True)
    card_type = db.Column(db.String(20), default="debit", nullable=False)

    # Security
    pin_hash = db.Column(db.String(255), nullable=False)

    # Card Details
    expiry_date = db.Column(db.String(5), nullable=False)  # MM/YY format
    cvv_hash = db.Column(db.String(255), nullable=True)  # Optional

    # Status
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    is_blocked = db.Column(db.Boolean, default=False, nullable=False)

    # Foreign Keys
    account_id = db.Column(db.Integer, db.ForeignKey("accounts.id"), nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)

    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    def to_dict(self, include_sensitive=False):
        """Convert to dictionary"""
        data = {
            "id": self.id,
            "card_number": f"****{self.card_number[-4:]}",  # Mask card number
            "card_type": self.card_type,
            "expiry_date": self.expiry_date,
            "is_active": self.is_active,
            "is_blocked": self.is_blocked,
            "account_id": self.account_id,
            "created_at": self.created_at.isoformat(),
        }
        if include_sensitive:
            data["full_card_number"] = self.card_number
        return data

    def __repr__(self):
        return f"<Card {self.card_number[-4:]}>"


class Beneficiary(db.Model):
    """Beneficiary model for transfers"""
    __tablename__ = "beneficiaries"

    id = db.Column(db.Integer, primary_key=True)
    account_id = db.Column(db.Integer, db.ForeignKey("accounts.id"), nullable=False, index=True)

    # Beneficiary Details
    beneficiary_account_number = db.Column(db.String(20), nullable=False)
    beneficiary_name = db.Column(db.String(120), nullable=False)
    beneficiary_account_id = db.Column(db.Integer, db.ForeignKey("accounts.id"), nullable=True)

    # Approval Status
    is_approved = db.Column(db.Boolean, default=False, nullable=False)
    approved_by = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    approved_at = db.Column(db.DateTime, nullable=True)

    # Tracking
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    def to_dict(self):
        """Convert to dictionary"""
        return {
            "id": self.id,
            "account_id": self.account_id,
            "beneficiary_account_number": self.beneficiary_account_number,
            "beneficiary_name": self.beneficiary_name,
            "is_approved": self.is_approved,
            "approved_at": self.approved_at.isoformat() if self.approved_at else None,
            "created_at": self.created_at.isoformat(),
        }

    def __repr__(self):
        return f"<Beneficiary {self.beneficiary_account_number}>"


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
