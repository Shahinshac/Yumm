"""
Transaction model for bank transactions using MongoEngine
"""
from mongoengine import Document, StringField, DecimalField, DateTimeField, ReferenceField
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


class Transaction(Document):
    """Transaction model"""
    meta = {
        'collection': 'transactions',
        'indexes': [
            'reference_id',
            'account_id',
            'user_id',
            'created_at',
            'transaction_type',
            'status',
            'recipient_account_id',
            # Compound indexes for common queries
            ('account_id', '-created_at'),  # Account history queries
            ('user_id', '-created_at'),  # User transaction history
            ('account_id', 'transaction_type', '-created_at'),  # Filtered account queries
            ('transaction_type', 'status'),  # Analytics queries
            ('created_at', 'transaction_type'),  # Time-based analytics
        ]
    }

    # Transaction Identification
    reference_id = StringField(required=True, max_length=50)
    transaction_type = StringField(required=True, max_length=50)
    status = StringField(
        required=True,
        max_length=20,
        default=TransactionStatusEnum.SUCCESS.value,
        choices=[e.value for e in TransactionStatusEnum]
    )

    # Amount and Description
    amount = DecimalField(required=True, precision=2)
    description = StringField(max_length=255)

    # Account Information
    account_id = ReferenceField('Account', required=True)

    # For transfers - receiver account
    recipient_account_id = ReferenceField('Account')

    # For user-level transaction history
    user_id = ReferenceField('User', required=True)

    # Timestamps
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)

    def to_dict(self):
        """Convert to dictionary"""
        return {
            "id": str(self.id),
            "reference_id": self.reference_id,
            "transaction_type": self.transaction_type,
            "status": self.status,
            "amount": float(self.amount) if self.amount else 0.0,
            "description": self.description,
            "account_id": str(self.account_id.id) if self.account_id else None,
            "recipient_account_id": str(self.recipient_account_id.id) if self.recipient_account_id else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

    def __repr__(self):
        return f"<Transaction {self.reference_id}>"
