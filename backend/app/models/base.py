"""
Additional models for banking system using MongoEngine
"""
from mongoengine import Document, StringField, BooleanField, IntField, DecimalField, DateTimeField, ReferenceField, TextField
from datetime import datetime


class Card(Document):
    """Debit Card model"""
    meta = {
        'collection': 'cards',
        'indexes': [
            'card_number',
            'account_id',
            'user_id'
        ]
    }

    # Card Identification
    card_number = StringField(required=True, unique=True, max_length=20)
    card_type = StringField(required=True, max_length=20, default="debit")

    # Security
    pin_hash = StringField(required=True, max_length=255)

    # Card Details
    expiry_date = StringField(required=True, max_length=5)  # MM/YY format
    cvv_hash = StringField(max_length=255)

    # Status
    is_active = BooleanField(default=True)
    is_blocked = BooleanField(default=False)

    # Foreign Keys
    account_id = ReferenceField('Account', required=True)
    user_id = ReferenceField('User', required=True)

    # Timestamps
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)

    def to_dict(self, include_sensitive=False):
        """Convert to dictionary"""
        data = {
            "id": str(self.id),
            "card_number": f"****{self.card_number[-4:]}",  # Mask card number
            "card_type": self.card_type,
            "expiry_date": self.expiry_date,
            "is_active": self.is_active,
            "is_blocked": self.is_blocked,
            "account_id": str(self.account_id.id) if self.account_id else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
        if include_sensitive:
            data["full_card_number"] = self.card_number
        return data

    def __repr__(self):
        return f"<Card {self.card_number[-4:]}>"


class Beneficiary(Document):
    """Beneficiary model for transfers"""
    meta = {
        'collection': 'beneficiaries',
        'indexes': [
            'account_id'
        ]
    }

    account_id = ReferenceField('Account', required=True)

    # Beneficiary Details
    beneficiary_account_number = StringField(required=True, max_length=20)
    beneficiary_name = StringField(required=True, max_length=120)
    beneficiary_account_id = ReferenceField('Account')

    # Approval Status
    is_approved = BooleanField(default=False)
    approved_by = ReferenceField('User')
    approved_at = DateTimeField()

    # Tracking
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)

    def to_dict(self):
        """Convert to dictionary"""
        return {
            "id": str(self.id),
            "account_id": str(self.account_id.id) if self.account_id else None,
            "beneficiary_account_number": self.beneficiary_account_number,
            "beneficiary_name": self.beneficiary_name,
            "is_approved": self.is_approved,
            "approved_at": self.approved_at.isoformat() if self.approved_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

    def __repr__(self):
        return f"<Beneficiary {self.beneficiary_account_number}>"


class Loan(Document):
    """Loan model - Complete loan lifecycle tracking"""
    meta = {
        'collection': 'loans',
        'indexes': [
            'user_id',
            'account_id',
            'created_at'
        ]
    }

    # Loan Details
    loan_amount = DecimalField(required=True, precision=2)
    loan_type = StringField(required=True, max_length=50)  # PERSONAL, HOME, AUTO, EDUCATION
    interest_rate = DecimalField(required=True, precision=2)  # Annual percentage rate
    tenure_months = IntField(required=True)  # Loan duration in months
    emi = DecimalField(required=True, precision=2)  # Calculated EMI amount

    # Disbursement
    disbursed_amount = DecimalField(default=0, precision=2)
    disbursed_at = DateTimeField()

    # Outstanding
    remaining_amount = DecimalField(required=True, precision=2)
    paid_amount = DecimalField(default=0, precision=2)
    next_due_date = DateTimeField()

    # Status
    status = StringField(
        required=True,
        max_length=20,
        default="pending"
    )

    # Approval/Rejection
    approved_by = ReferenceField('User')
    approved_at = DateTimeField()
    rejection_reason = TextField()

    # Foreign Keys
    user_id = ReferenceField('User', required=True)
    account_id = ReferenceField('Account', required=True)

    # Timestamps
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)

    def to_dict(self):
        """Convert to dictionary"""
        return {
            "id": str(self.id),
            "loan_amount": float(self.loan_amount) if self.loan_amount else 0.0,
            "loan_type": self.loan_type,
            "interest_rate": float(self.interest_rate) if self.interest_rate else 0.0,
            "tenure_months": self.tenure_months,
            "emi": float(self.emi) if self.emi else 0.0,
            "disbursed_amount": float(self.disbursed_amount) if self.disbursed_amount else 0.0,
            "remaining_amount": float(self.remaining_amount) if self.remaining_amount else 0.0,
            "paid_amount": float(self.paid_amount) if self.paid_amount else 0.0,
            "status": self.status,
            "account_id": str(self.account_id.id) if self.account_id else None,
            "approved_at": self.approved_at.isoformat() if self.approved_at else None,
            "next_due_date": self.next_due_date.isoformat() if self.next_due_date else None,
            "disbursed_at": self.disbursed_at.isoformat() if self.disbursed_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

    def __repr__(self):
        return f"<Loan {self.id} {self.loan_type} {self.status}>"


class LoanPayment(Document):
    """Loan Payment model - EMI payment tracking"""
    meta = {
        'collection': 'loan_payments',
        'indexes': [
            'loan_id'
        ]
    }

    # Loan Reference
    loan_id = ReferenceField(Loan, required=True)

    # Payment Details
    emi_number = IntField(required=True)
    amount = DecimalField(required=True, precision=2)
    due_date = DateTimeField(required=True)
    paid_on = DateTimeField()

    # Status
    status = StringField(required=True, max_length=20, default="pending")

    # Transaction Reference
    transaction_id = ReferenceField(Transaction)

    # Timestamps
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)

    def to_dict(self):
        """Convert to dictionary"""
        return {
            "id": str(self.id),
            "loan_id": str(self.loan_id.id) if self.loan_id else None,
            "emi_number": self.emi_number,
            "amount": float(self.amount) if self.amount else 0.0,
            "due_date": self.due_date.isoformat() if self.due_date else None,
            "paid_on": self.paid_on.isoformat() if self.paid_on else None,
            "status": self.status,
            "days_overdue": self._calculate_days_overdue() if self.status == "overdue" else 0,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

    def _calculate_days_overdue(self):
        """Calculate days overdue"""
        if self.status == "overdue" and self.paid_on is None:
            return (datetime.utcnow() - self.due_date).days
        return 0

    def __repr__(self):
        return f"<LoanPayment {self.loan_id} EMI#{self.emi_number} {self.status}>"


class Notification(Document):
    """Notification model"""
    meta = {
        'collection': 'notifications',
        'indexes': [
            'user_id'
        ]
    }

    user_id = ReferenceField('User', required=True)
    title = StringField(required=True, max_length=255)
    message = TextField(required=True)
    is_read = BooleanField(default=False)
    created_at = DateTimeField(default=datetime.utcnow)

    def to_dict(self):
        """Convert to dictionary"""
        return {
            "id": str(self.id),
            "title": self.title,
            "message": self.message,
            "is_read": self.is_read,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class ScheduledPayment(Document):
    """Scheduled Payment model"""
    meta = {
        'collection': 'scheduled_payments',
        'indexes': [
            'account_id',
            'scheduled_date'
        ]
    }

    # Payment Details
    account_id = ReferenceField('Account', required=True)
    recipient_account_number = StringField(required=True, max_length=20)
    recipient_account_id = ReferenceField('Account')
    amount = DecimalField(required=True, precision=2)
    description = StringField(max_length=255)

    # Schedule Details
    frequency = StringField(required=True, max_length=20, default="once")
    scheduled_date = DateTimeField(required=True)
    next_execution = DateTimeField()
    last_executed = DateTimeField()

    # Recurring Configuration
    max_executions = IntField()
    execution_count = IntField(default=0)

    # Status
    status = StringField(required=True, max_length=20, default="pending")
    cancellation_reason = StringField(max_length=255)

    # Failed Execution Tracking
    failure_count = IntField(default=0)
    last_failure_reason = TextField()

    # Timestamps
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)

    def to_dict(self):
        """Convert to dictionary"""
        return {
            "id": str(self.id),
            "account_id": str(self.account_id.id) if self.account_id else None,
            "recipient_account_number": self.recipient_account_number,
            "amount": float(self.amount) if self.amount else 0.0,
            "description": self.description,
            "frequency": self.frequency,
            "scheduled_date": self.scheduled_date.isoformat() if self.scheduled_date else None,
            "next_execution": self.next_execution.isoformat() if self.next_execution else None,
            "last_executed": self.last_executed.isoformat() if self.last_executed else None,
            "status": self.status,
            "execution_count": self.execution_count,
            "max_executions": self.max_executions,
            "failure_count": self.failure_count,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

    def __repr__(self):
        return f"<ScheduledPayment {self.id} {self.frequency} {self.status}>"
