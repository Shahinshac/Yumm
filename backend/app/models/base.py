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
    """Loan model - Complete loan lifecycle tracking"""
    __tablename__ = "loans"

    id = db.Column(db.Integer, primary_key=True)

    # Loan Details
    loan_amount = db.Column(db.Numeric(15, 2), nullable=False)
    loan_type = db.Column(db.String(50), nullable=False)  # PERSONAL, HOME, AUTO, EDUCATION
    interest_rate = db.Column(db.Float, nullable=False)  # Annual percentage rate (e.g., 8.5)
    tenure_months = db.Column(db.Integer, nullable=False)  # Loan duration in months
    emi = db.Column(db.Numeric(15, 2), nullable=False)  # Calculated EMI amount

    # Disbursement
    disbursed_amount = db.Column(db.Numeric(15, 2), default=0)  # Amount disbursed to account
    disbursed_at = db.Column(db.DateTime, nullable=True)  # When loan amount was transferred

    # Outstanding
    remaining_amount = db.Column(db.Numeric(15, 2), nullable=False)  # Remaining balance
    paid_amount = db.Column(db.Numeric(15, 2), default=0)  # Total paid so far
    next_due_date = db.Column(db.DateTime, nullable=True)  # Next EMI due date

    # Status
    status = db.Column(db.String(20), default="pending")  # PENDING, APPROVED, REJECTED, ACTIVE, CLOSED, DEFAULT

    # Approval/Rejection
    approved_by = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)  # Staff/Manager who approved
    approved_at = db.Column(db.DateTime, nullable=True)
    rejection_reason = db.Column(db.Text, nullable=True)  # Why loan was rejected

    # Foreign Keys
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    account_id = db.Column(db.Integer, db.ForeignKey("accounts.id"), nullable=False, index=True)

    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        """Convert to dictionary"""
        return {
            "id": self.id,
            "loan_amount": float(self.loan_amount),
            "loan_type": self.loan_type,
            "interest_rate": self.interest_rate,
            "tenure_months": self.tenure_months,
            "emi": float(self.emi),
            "disbursed_amount": float(self.disbursed_amount),
            "remaining_amount": float(self.remaining_amount),
            "paid_amount": float(self.paid_amount),
            "status": self.status,
            "account_id": self.account_id,
            "approved_at": self.approved_at.isoformat() if self.approved_at else None,
            "next_due_date": self.next_due_date.isoformat() if self.next_due_date else None,
            "disbursed_at": self.disbursed_at.isoformat() if self.disbursed_at else None,
            "created_at": self.created_at.isoformat(),
        }

    def __repr__(self):
        return f"<Loan {self.id} {self.loan_type} {self.status}>"


class LoanPayment(db.Model):
    """Loan Payment model - EMI payment tracking"""
    __tablename__ = "loan_payments"

    id = db.Column(db.Integer, primary_key=True)

    # Loan Reference
    loan_id = db.Column(db.Integer, db.ForeignKey("loans.id"), nullable=False, index=True)

    # Payment Details
    emi_number = db.Column(db.Integer, nullable=False)  # Which EMI (1, 2, 3, ...)
    amount = db.Column(db.Numeric(15, 2), nullable=False)  # EMI amount
    due_date = db.Column(db.DateTime, nullable=False)
    paid_on = db.Column(db.DateTime, nullable=True)

    # Status
    status = db.Column(db.String(20), default="pending")  # PENDING, PAID, OVERDUE, WAIVED

    # Transaction Reference
    transaction_id = db.Column(db.Integer, db.ForeignKey("transactions.id"), nullable=True)  # Links to actual payment transaction

    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        """Convert to dictionary"""
        return {
            "id": self.id,
            "loan_id": self.loan_id,
            "emi_number": self.emi_number,
            "amount": float(self.amount),
            "due_date": self.due_date.isoformat(),
            "paid_on": self.paid_on.isoformat() if self.paid_on else None,
            "status": self.status,
            "days_overdue": self._calculate_days_overdue() if self.status == "overdue" else 0,
            "created_at": self.created_at.isoformat(),
        }

    def _calculate_days_overdue(self):
        """Calculate days overdue"""
        if self.status == "overdue" and self.paid_on is None:
            from datetime import datetime as dt
            return (dt.utcnow() - self.due_date).days
        return 0

    def __repr__(self):
        return f"<LoanPayment {self.loan_id} EMI#{self.emi_number} {self.status}>"


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
