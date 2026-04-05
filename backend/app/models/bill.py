"""
Bill and BillPayment models for bill payment system using MongoEngine
"""
from mongoengine import Document, StringField, DecimalField, DateTimeField, ReferenceField
from datetime import datetime
from enum import Enum


class BillTypeEnum(Enum):
    """Bill types for payment"""
    MOBILE_RECHARGE = "mobile_recharge"
    ELECTRICITY = "electricity"
    INTERNET = "internet"


class BillPaymentStatusEnum(Enum):
    """Bill payment status"""
    SUCCESS = "success"
    PENDING = "pending"
    FAILED = "failed"


class Bill(Document):
    """Bill payment record"""
    meta = {
        'collection': 'bills',
        'indexes': [
            'bill_id',
            'user_id',
            'account_id',
            'created_at'
        ]
    }

    # Bill Identification
    bill_id = StringField(required=True, max_length=50, unique=True)
    bill_type = StringField(
        required=True,
        max_length=50,
        choices=[e.value for e in BillTypeEnum]
    )
    status = StringField(
        required=True,
        max_length=20,
        default=BillPaymentStatusEnum.SUCCESS.value,
        choices=[e.value for e in BillPaymentStatusEnum]
    )

    # Amount and Description
    amount = DecimalField(required=True, precision=2)
    description = StringField(max_length=255)

    # Beneficiary Information (phone/account number depending on bill type)
    recipient_identifier = StringField(required=True, max_length=50)  # phone/account number
    recipient_name = StringField(max_length=255)

    # Account Information
    account_id = ReferenceField('Account', required=True)
    user_id = ReferenceField('User', required=True)

    # Reference to transaction record
    transaction_id = ReferenceField('Transaction')

    # Timestamps
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)

    def to_dict(self):
        """Convert to dictionary"""
        return {
            "id": str(self.id),
            "bill_id": self.bill_id,
            "bill_type": self.bill_type,
            "status": self.status,
            "amount": float(self.amount) if self.amount else 0.0,
            "description": self.description,
            "recipient_identifier": self.recipient_identifier,
            "recipient_name": self.recipient_name,
            "account_id": str(self.account_id.id) if self.account_id else None,
            "user_id": str(self.user_id.id) if self.user_id else None,
            "transaction_id": str(self.transaction_id.id) if self.transaction_id else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

    def __repr__(self):
        return f"<Bill {self.bill_id}>"


class BillPayment(Document):
    """Bill payment history (for analytics and tracking)"""
    meta = {
        'collection': 'bill_payments',
        'indexes': [
            'payment_id',
            'user_id',
            'account_id',
            'bill_type',
            'created_at'
        ]
    }

    # Payment Identification
    payment_id = StringField(required=True, max_length=50, unique=True)
    bill_type = StringField(
        required=True,
        max_length=50,
        choices=[e.value for e in BillTypeEnum]
    )
    status = StringField(
        required=True,
        max_length=20,
        default=BillPaymentStatusEnum.SUCCESS.value,
        choices=[e.value for e in BillPaymentStatusEnum]
    )

    # Amount and Description
    amount = DecimalField(required=True, precision=2)
    description = StringField(max_length=255)

    # Beneficiary Information
    recipient_identifier = StringField(required=True, max_length=50)
    recipient_name = StringField(max_length=255)

    # Account Information
    account_id = ReferenceField('Account', required=True)
    user_id = ReferenceField('User', required=True)

    # Reference to transaction
    transaction_id = ReferenceField('Transaction')

    # Error message if failed
    error_message = StringField(max_length=500)

    # Timestamps
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)

    def to_dict(self):
        """Convert to dictionary"""
        return {
            "id": str(self.id),
            "payment_id": self.payment_id,
            "bill_type": self.bill_type,
            "status": self.status,
            "amount": float(self.amount) if self.amount else 0.0,
            "description": self.description,
            "recipient_identifier": self.recipient_identifier,
            "recipient_name": self.recipient_name,
            "account_id": str(self.account_id.id) if self.account_id else None,
            "user_id": str(self.user_id.id) if self.user_id else None,
            "transaction_id": str(self.transaction_id.id) if self.transaction_id else None,
            "error_message": self.error_message,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

    def __repr__(self):
        return f"<BillPayment {self.payment_id}>"
