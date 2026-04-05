"""
Account model for bank accounts using MongoEngine
"""
from mongoengine import Document, StringField, DecimalField, DateTimeField, ReferenceField
from datetime import datetime
from enum import Enum


class AccountTypeEnum(Enum):
    """Bank account types"""
    SAVINGS = "savings"
    CURRENT = "current"
    SALARY = "salary"


class AccountStatusEnum(Enum):
    """Account status"""
    ACTIVE = "active"
    FROZEN = "frozen"
    CLOSED = "closed"


class Account(Document):
    """Bank Account model"""
    meta = {
        'collection': 'accounts',
        'indexes': [
            'account_number',
            'user_id',
            'status',
            'account_type',
            '-created_at',
            # Compound indexes for common queries
            ('user_id', 'status'),  # User's active accounts
            ('user_id', '-created_at'),  # User's accounts sorted by date
            ('account_type', 'status'),  # Accounts by type and status
        ]
    }

    # Account Identification
    account_number = StringField(required=True, unique=True, max_length=20)
    account_type = StringField(
        required=True,
        max_length=20,
        default=AccountTypeEnum.SAVINGS.value,
        choices=[e.value for e in AccountTypeEnum]
    )

    # Account Balance and Status
    balance = DecimalField(default=0.00, precision=2)
    status = StringField(
        required=True,
        max_length=20,
        default=AccountStatusEnum.ACTIVE.value,
        choices=[e.value for e in AccountStatusEnum]
    )

    # Foreign Key - User Reference
    user_id = ReferenceField('User', required=True)

    # Timestamps
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)

    def to_dict(self):
        """Convert to dictionary"""
        return {
            "id": str(self.id),
            "account_number": self.account_number,
            "account_type": self.account_type,
            "balance": float(self.balance) if self.balance else 0.0,
            "status": self.status,
            "user_id": str(self.user_id.id) if self.user_id else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

    def __repr__(self):
        return f"<Account {self.account_number}>"
