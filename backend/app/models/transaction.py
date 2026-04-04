"""
Transaction model for bank transactions
"""
from app import db
from datetime import datetime
from enum import Enum


class TransactionTypeEnum(Enum):
    """Transaction types"""
    DEPOSIT = "deposit"
    WITHDRAWAL = "withdrawal"
    TRANSFER = "transfer"
    BILL_PAYMENT = "bill_payment"
    LOAN_DISBURSEMENT = "loan_disbursement"
    LOAN_REPAYMENT = "loan_repayment"
    INTEREST_CREDIT = "interest_credit"


class TransactionStatusEnum(Enum):
    """Transaction status"""
    SUCCESS = "success"
    PENDING = "pending"
    FAILED = "failed"
    CANCELLED = "cancelled"


class Transaction(db.Model):
    """Transaction model"""
    __tablename__ = "transactions"

    id = db.Column(db.Integer, primary_key=True)

    # Transaction Identification
    reference_id = db.Column(db.String(50), nullable=False, index=True)
    transaction_type = db.Column(db.String(50), nullable=False)
    status = db.Column(
        db.String(20),
        nullable=False,
        default=TransactionStatusEnum.SUCCESS.value
    )

    # Amount and Description
    amount = db.Column(db.Numeric(15, 2), nullable=False)
    description = db.Column(db.String(255), nullable=True)

    # Account Information
    account_id = db.Column(db.Integer, db.ForeignKey("accounts.id"), nullable=False, index=True)

    # For transfers - receiver account
    recipient_account_id = db.Column(db.Integer, db.ForeignKey("accounts.id"), nullable=True)

    # For user-level transaction history
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)

    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    def to_dict(self):
        """Convert to dictionary"""
        return {
            "id": self.id,
            "reference_id": self.reference_id,
            "transaction_type": self.transaction_type,
            "status": self.status,
            "amount": float(self.amount),
            "description": self.description,
            "account_id": self.account_id,
            "recipient_account_id": self.recipient_account_id,
            "created_at": self.created_at.isoformat(),
        }

    def __repr__(self):
        return f"<Transaction {self.reference_id}>"
