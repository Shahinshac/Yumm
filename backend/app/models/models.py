"""
Card, Loan, and Bill Models
"""
from mongoengine import Document, StringField, FloatField, ReferenceField, DateTimeField, IntField, BooleanField
from datetime import datetime

class Card(Document):
    """Debit/Credit Card model"""
    user = ReferenceField('User', required=True)
    account = ReferenceField('Account', required=True)
    card_number = StringField(required=True, unique=True)
    card_type = StringField(default='debit')
    cvv_hash = StringField()
    expiry_date = StringField()
    is_active = BooleanField(default=True)
    is_blocked = BooleanField(default=False)
    pin_hash = StringField()
    created_at = DateTimeField(default=datetime.utcnow)

    meta = {'collection': 'cards', 'indexes': ['card_number']}

    def to_dict(self):
        return {
            'id': str(self.id),
            'user_id': str(self.user.id),
            'card_number': f"****{self.card_number[-4:]}",
            'expiry_date': self.expiry_date,
            'is_active': self.is_active,
            'is_blocked': self.is_blocked,
        }

class Loan(Document):
    """Loan model"""
    user = ReferenceField('User', required=True)
    account = ReferenceField('Account', required=True)
    loan_type = StringField(required=True, choices=['personal', 'home', 'auto', 'education'])
    amount = FloatField(required=True)
    rate_of_interest = FloatField(default=8.5)
    tenure_months = IntField(default=12)
    status = StringField(default='approved', choices=['pending', 'approved', 'rejected', 'closed'])
    balance = FloatField()
    created_at = DateTimeField(default=datetime.utcnow)

    meta = {'collection': 'loans', 'indexes': ['user']}

    def to_dict(self):
        return {
            'id': str(self.id),
            'user_id': str(self.user.id),
            'loan_type': self.loan_type,
            'amount': self.amount,
            'balance': self.balance or self.amount,
            'status': self.status,
            'created_at': self.created_at.isoformat(),
        }

class Bill(Document):
    """Bill payment model"""
    user = ReferenceField('User', required=True)
    account = ReferenceField('Account', required=True)
    bill_type = StringField(required=True, choices=['mobile', 'electricity', 'internet', 'other'])
    amount = FloatField(required=True)
    status = StringField(default='pending', choices=['pending', 'paid', 'failed'])
    bill_date = DateTimeField(default=datetime.utcnow)
    due_date = DateTimeField()
    paid_date = DateTimeField()
    created_at = DateTimeField(default=datetime.utcnow)

    meta = {'collection': 'bills', 'indexes': ['user']}

    def to_dict(self):
        return {
            'id': str(self.id),
            'user_id': str(self.user.id),
            'bill_type': self.bill_type,
            'amount': self.amount,
            'status': self.status,
            'created_at': self.created_at.isoformat(),
        }
