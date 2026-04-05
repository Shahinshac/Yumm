"""
Account Model
"""
from mongoengine import Document, StringField, FloatField, ReferenceField, DateTimeField, BooleanField, IntField
from datetime import datetime
import uuid

class Account(Document):
    """Bank account model"""

    account_number = StringField(required=True, unique=True)
    user = ReferenceField('User', required=True)
    account_type = StringField(required=True, choices=['savings', 'current', 'salary'])
    balance = FloatField(default=0.0)
    status = StringField(default='active', choices=['active', 'frozen', 'closed'])

    monthly_limit = FloatField(default=100000)
    transactions_count = IntField(default=0)

    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)

    meta = {
        'collection': 'accounts',
        'indexes': ['account_number', 'user'],
        'strict': False
    }

    @staticmethod
    def generate_account_number():
        return f"ACC{int(uuid.uuid4().int / 1000000000)}"

    def to_dict(self):
        return {
            'id': str(self.id),
            'account_number': self.account_number,
            'user_id': str(self.user.id),
            'account_type': self.account_type,
            'balance': self.balance,
            'status': self.status,
            'monthly_limit': self.monthly_limit,
            'transactions_count': self.transactions_count,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
        }
