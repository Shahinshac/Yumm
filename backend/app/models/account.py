"""
Account model for bank accounts
"""
from app import db
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


class Account(db.Model):
    """Bank Account model"""
    __tablename__ = "accounts"

    id = db.Column(db.Integer, primary_key=True)

    # Account Identification
    account_number = db.Column(db.String(20), unique=True, nullable=False, index=True)
    account_type = db.Column(
        db.String(20),
        nullable=False,
        default=AccountTypeEnum.SAVINGS.value
    )

    # Account Balance and Status
    balance = db.Column(db.Numeric(15, 2), default=0.00, nullable=False)
    status = db.Column(
        db.String(20),
        nullable=False,
        default=AccountStatusEnum.ACTIVE.value
    )

    # Foreign Key
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)

    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    # Relationships
    transactions = db.relationship(
        "Transaction",
        backref="account",
        lazy=True,
        cascade="all, delete-orphan",
        foreign_keys="Transaction.account_id"
    )
    beneficiaries = db.relationship(
        "Beneficiary",
        backref="account",
        lazy=True,
        cascade="all, delete-orphan"
    )
    cards = db.relationship(
        "Card",
        backref="account",
        lazy=True,
        cascade="all, delete-orphan"
    )
    loans = db.relationship(
        "Loan",
        backref="account",
        lazy=True,
        cascade="all, delete-orphan"
    )

    def to_dict(self):
        """Convert to dictionary"""
        return {
            "id": self.id,
            "account_number": self.account_number,
            "account_type": self.account_type,
            "balance": float(self.balance),
            "status": self.status,
            "user_id": self.user_id,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }

    def __repr__(self):
        return f"<Account {self.account_number}>"
