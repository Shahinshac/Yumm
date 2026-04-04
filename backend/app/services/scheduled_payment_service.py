"""Scheduled Payment Service - Handle recurring and future transfers"""
from app import db
from app.models.base import ScheduledPayment
from app.models.account import Account
from app.services.transaction_service import TransactionService
from app.utils.exceptions import (
    ResourceNotFoundError,
    ValidationError,
    InsufficientBalanceError,
)
from datetime import datetime, timedelta
from decimal import Decimal

class ScheduledPaymentService:
    @staticmethod
    def schedule_payment(account_id, recipient_account_number, amount, scheduled_date, frequency="once", max_executions=None, description=None):
        """Schedule a payment for future execution"""
        account = Account.query.get(account_id)
        if not account:
            raise ResourceNotFoundError(f"Account {account_id} not found")
        
        if frequency.upper() not in ["ONCE", "WEEKLY", "MONTHLY", "YEARLY"]:
            raise ValidationError("Invalid frequency")
        if amount <= 0:
            raise ValidationError("Amount must be > 0")
        if scheduled_date <= datetime.utcnow():
            raise ValidationError("Scheduled date must be in future")
        
        payment = ScheduledPayment(
            account_id=account_id,
            recipient_account_number=recipient_account_number,
            amount=Decimal(str(amount)),
            frequency=frequency.upper(),
            scheduled_date=scheduled_date,
            next_execution=scheduled_date,
            status="active",
            max_executions=max_executions,
            description=description,
            execution_count=0,
            failure_count=0,
        )
        db.session.add(payment)
        db.session.commit()
        return payment

    @staticmethod
    def get_scheduled_payment(payment_id):
        payment = ScheduledPayment.query.get(payment_id)
        if not payment:
            raise ResourceNotFoundError(f"Payment {payment_id} not found")
        return payment

    @staticmethod
    def get_account_scheduled_payments(account_id, status=None):
        query = ScheduledPayment.query.filter_by(account_id=account_id).order_by(ScheduledPayment.scheduled_date)
        if status:
            query = query.filter_by(status=status)
        return query.all()

    @staticmethod
    def execute_payment(payment_id):
        """Execute scheduled payment manually or automatically"""
        payment = ScheduledPaymentService.get_scheduled_payment(payment_id)
        
        if payment.status == "cancelled":
            raise ValidationError("Cannot execute cancelled payment")
        
        try:
            TransactionService.transfer(
                from_account_id=payment.account_id,
                to_account_number=payment.recipient_account_number,
                amount=float(payment.amount),
                description=f"Scheduled: {payment.description or 'Payment'}"
            )
            
            payment.last_executed = datetime.utcnow()
            payment.execution_count += 1
            payment.failure_count = 0
            payment.last_failure_reason = None
            
            if payment.frequency == "ONCE":
                payment.status = "completed"
            elif payment.frequency == "WEEKLY":
                payment.next_execution = datetime.utcnow() + timedelta(days=7)
            elif payment.frequency == "MONTHLY":
                payment.next_execution = datetime.utcnow() + timedelta(days=30)
            elif payment.frequency == "YEARLY":
                payment.next_execution = datetime.utcnow() + timedelta(days=365)
            
            if payment.max_executions and payment.execution_count >= payment.max_executions:
                payment.status = "completed"
            
            db.session.commit()
            return payment
        except Exception as e:
            payment.failure_count += 1
            payment.last_failure_reason = str(e)
            db.session.commit()
            raise

    @staticmethod
    def cancel_payment(payment_id, reason=None):
        """Cancel a scheduled payment"""
        payment = ScheduledPaymentService.get_scheduled_payment(payment_id)
        if payment.status == "completed":
            raise ValidationError("Cannot cancel completed payment")
        
        payment.status = "cancelled"
        payment.cancellation_reason = reason
        db.session.commit()
        return payment

    @staticmethod
    def process_due_payments():
        """Process all due payments (called by scheduler)"""
        now = datetime.utcnow()
        due = ScheduledPayment.query.filter(
            ScheduledPayment.next_execution <= now,
            ScheduledPayment.status.in_(["active", "pending"])
        ).all()
        
        executed, failed = [], []
        for p in due:
            try:
                ScheduledPaymentService.execute_payment(p.id)
                executed.append(p.id)
            except:
                failed.append(p.id)
        
        return {"executed": executed, "failed": failed}

    @staticmethod
    def get_statistics():
        """Get statistics"""
        all_p = ScheduledPayment.query.all()
        return {
            "total": len(all_p),
            "active": len([p for p in all_p if p.status == "active"]),
            "completed": len([p for p in all_p if p.status == "completed"]),
            "cancelled": len([p for p in all_p if p.status == "cancelled"]),
        }
