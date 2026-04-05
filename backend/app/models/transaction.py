"""
Transaction Model
"""
from mongoengine import Document, StringField, FloatField, ReferenceField, DateTimeField, DictField
from datetime import datetime

class Transaction(Document):
    """Transaction model"""

    account = ReferenceField('Account', required=True)
    type = StringField(required=True, choices=['deposit', 'withdrawal', 'transfer', 'payment'])
    amount = FloatField(required=True)
    status = StringField(default='completed', choices=['pending', 'completed', 'failed'])

    description = StringField()
    reference_id = StringField(unique=True)

    from_account = StringField()
    to_account = StringField()
    to_user = ReferenceField('User')

    metadata = DictField()
    created_at = DateTimeField(default=datetime.utcnow)

    meta = {
        'collection': 'transactions',
        'indexes': ['account', 'reference_id'],
        'strict': False
    }

    def to_dict(self):
        return {
            'id': str(self.id),
            'account_id': str(self.account.id),
            'type': self.type,
            'amount': self.amount,
            'status': self.status,
            'description': self.description,
            'reference_id': self.reference_id,
            'from_account': self.from_account,
            'to_account': self.to_account,
            'to_user_id': str(self.to_user.id) if self.to_user else None,
            'created_at': self.created_at.isoformat(),
        }
