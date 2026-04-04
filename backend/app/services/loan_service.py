"""
Loan service - Business logic for loan management
"""
from app import db
from app.models.base import Loan, LoanPayment
from app.models.account import Account
from app.models.transaction import Transaction, TransactionTypeEnum
from app.utils.validators import Validators
from app.utils.exceptions import (
    ResourceNotFoundError,
    ValidationError,
    InsufficientBalanceError,
)
from datetime import datetime, timedelta
from decimal import Decimal
import math


class LoanService:
    """Handle loan operations"""

    # Loan type interest rates (annual percentage)
    INTEREST_RATES = {
        "personal": 8.5,
        "home": 6.5,
        "auto": 7.5,
        "education": 5.5,
    }

    # Minimum and maximum tenure
    MIN_TENURE = 6
    MAX_TENURE = 360

    @staticmethod
    def apply_for_loan(
        user_id: int,
        account_id: int,
        loan_amount: float,
        loan_type: str,
        tenure_months: int,
    ) -> Loan:
        """
        Apply for a new loan

        Args:
            user_id: User applying for loan
            account_id: Account to disburse loan to
            loan_amount: Amount requested
            loan_type: Type of loan (personal, home, auto, education)
            tenure_months: Repayment duration in months

        Returns:
            Loan object in PENDING status

        Raises:
            ResourceNotFoundError: If account not found
            ValidationError: If inputs invalid
        """
        # Validate account exists
        account = Account.query.get(account_id)
        if not account:
            raise ResourceNotFoundError(f"Account with ID {account_id} not found")

        # Validate loan type
        loan_type = loan_type.lower()
        if loan_type not in LoanService.INTEREST_RATES:
            raise ValidationError(
                f"Invalid loan type. Allowed: {list(LoanService.INTEREST_RATES.keys())}"
            )

        # Validate amount
        if loan_amount <= 0:
            raise ValidationError("Loan amount must be greater than 0")
        if loan_amount > 5000000:
            raise ValidationError("Loan amount exceeds maximum limit (50 lakhs)")

        # Validate tenure
        if tenure_months < LoanService.MIN_TENURE or tenure_months > LoanService.MAX_TENURE:
            raise ValidationError(
                f"Tenure must be between {LoanService.MIN_TENURE} and {LoanService.MAX_TENURE} months"
            )

        # Calculate EMI and interest rate
        interest_rate = LoanService.INTEREST_RATES[loan_type]
        emi = LoanService._calculate_emi(loan_amount, interest_rate, tenure_months)

        # Create loan
        loan = Loan(
            loan_amount=Decimal(str(loan_amount)),
            loan_type=loan_type,
            interest_rate=interest_rate,
            tenure_months=tenure_months,
            emi=emi,
            remaining_amount=Decimal(str(loan_amount)),
            user_id=user_id,
            account_id=account_id,
            status="pending",
        )

        try:
            db.session.add(loan)
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            raise ValidationError(f"Failed to apply for loan: {str(e)}")

        return loan

    @staticmethod
    def _calculate_emi(principal: float, annual_rate: float, tenure_months: int) -> Decimal:
        """
        Calculate EMI using standard formula:
        EMI = P * r * (1+r)^n / ((1+r)^n - 1)
        where r = monthly rate, n = number of months
        """
        monthly_rate = annual_rate / 12 / 100
        if monthly_rate == 0:
            emi = principal / tenure_months
        else:
            numerator = principal * monthly_rate * ((1 + monthly_rate) ** tenure_months)
            denominator = ((1 + monthly_rate) ** tenure_months) - 1
            emi = numerator / denominator

        return Decimal(str(round(emi, 2)))

    @staticmethod
    def get_loan(loan_id: int) -> Loan:
        """
        Get loan by ID

        Args:
            loan_id: Loan ID

        Returns:
            Loan object

        Raises:
            ResourceNotFoundError: If not found
        """
        loan = Loan.query.get(loan_id)
        if not loan:
            raise ResourceNotFoundError(f"Loan with ID {loan_id} not found")
        return loan

    @staticmethod
    def get_user_loans(user_id: int, status: str = None) -> list:
        """
        Get all loans for user

        Args:
            user_id: User ID
            status: Filter by status (optional)

        Returns:
            List of Loan objects
        """
        query = Loan.query.filter_by(user_id=user_id).order_by(Loan.created_at.desc())

        if status:
            query = query.filter_by(status=status)

        return query.all()

    @staticmethod
    def approve_loan(loan_id: int, approved_by_user_id: int, disburse: bool = True) -> Loan:
        """
        Approve and optionally disburse loan

        Args:
            loan_id: Loan ID to approve
            approved_by_user_id: Staff/Manager who approved
            disburse: Whether to immediately disburse amount

        Returns:
            Updated Loan

        Raises:
            ResourceNotFoundError: If loan not found
            ValidationError: If loan already processed
        """
        loan = LoanService.get_loan(loan_id)

        if loan.status != "pending":
            raise ValidationError(f"Loan already {loan.status}")

        # Update approval details
        loan.status = "approved"
        loan.approved_by = approved_by_user_id
        loan.approved_at = datetime.utcnow()

        # Calculate next due date (EMI starts after 1 month)
        loan.next_due_date = datetime.utcnow() + timedelta(days=30)

        # Create EMI schedule immediately (but not yet due)
        LoanService._create_emi_schedule(loan)

        db.session.commit()

        # Disburse if requested
        if disburse:
            LoanService.disburse_loan(loan_id)

        return loan

    @staticmethod
    def disburse_loan(loan_id: int) -> Loan:
        """
        Disburse approved loan to account

        Args:
            loan_id: Loan ID

        Returns:
            Updated Loan

        Raises:
            ResourceNotFoundError: If loan not found
            ValidationError: If loan not approved
        """
        loan = LoanService.get_loan(loan_id)

        if loan.status == "pending":
            raise ValidationError("Loan must be approved first")
        if loan.status in ["closed", "default"]:
            raise ValidationError(f"Cannot disburse {loan.status} loan")

        # Get account
        account = Account.query.get(loan.account_id)

        # Create disbursement transaction
        from app.services.transaction_service import TransactionService

        transaction = TransactionService.deposit(
            account_id=loan.account_id,
            amount=float(loan.loan_amount),
            description=f"Loan Disbursement - {loan.loan_type.title()} Loan",
        )

        # Update loan
        loan.status = "active"
        loan.disbursed_amount = loan.loan_amount
        loan.disbursed_at = datetime.utcnow()

        db.session.commit()

        return loan

    @staticmethod
    def reject_loan(loan_id: int, rejection_reason: str) -> Loan:
        """
        Reject pending loan

        Args:
            loan_id: Loan ID
            rejection_reason: Why loan was rejected

        Returns:
            Updated Loan

        Raises:
            ResourceNotFoundError: If loan not found
            ValidationError: If loan not pending
        """
        loan = LoanService.get_loan(loan_id)

        if loan.status != "pending":
            raise ValidationError(f"Cannot reject {loan.status} loan")

        loan.status = "rejected"
        loan.rejection_reason = rejection_reason

        db.session.commit()

        return loan

    @staticmethod
    def pay_emi(loan_id: int, account_id: int, amount: float) -> dict:
        """
        Make EMI payment for loan

        Args:
            loan_id: Loan ID
            account_id: Account making payment
            amount: Amount to pay

        Returns:
            Payment details

        Raises:
            ResourceNotFoundError: If loan not found
            ValidationError: If payment invalid
            InsufficientBalanceError: If insufficient balance
        """
        loan = LoanService.get_loan(loan_id)

        # Validate loan is active
        if loan.status != "active":
            raise ValidationError(f"Cannot pay EMI for {loan.status} loan")

        # Validate account has sufficient balance
        account = Account.query.get(account_id)
        if account.balance < Decimal(str(amount)):
            raise InsufficientBalanceError(
                f"Insufficient balance. Available: {account.balance}"
            )

        # Get next pending EMI
        next_emi = (
            LoanPayment.query.filter_by(loan_id=loan_id, status="pending")
            .order_by(LoanPayment.emi_number)
            .first()
        )

        if not next_emi:
            raise ValidationError("No pending EMI found for this loan")

        # Validate amount
        if Decimal(str(amount)) < next_emi.amount:
            raise ValidationError(
                f"Amount must be at least {next_emi.amount} (EMI amount)"
            )

        # Create payment transaction
        from app.services.transaction_service import TransactionService

        transaction = TransactionService.withdraw(
            account_id=account_id,
            amount=amount,
            description=f"Loan EMI Payment - Loan #{loan.id} EMI #{next_emi.emi_number}",
        )

        # Update EMI payment record
        next_emi.status = "paid"
        next_emi.paid_on = datetime.utcnow()
        next_emi.transaction_id = transaction.id

        # Update loan
        paid_amount = Decimal(str(amount))
        loan.paid_amount += paid_amount
        loan.remaining_amount = loan.loan_amount - loan.paid_amount

        # Check if loan is fully paid
        if loan.remaining_amount <= 0:
            loan.status = "closed"

        # Set next due date
        next_pending = (
            LoanPayment.query.filter_by(loan_id=loan_id, status="pending")
            .order_by(LoanPayment.emi_number)
            .first()
        )
        if next_pending:
            loan.next_due_date = next_pending.due_date
        else:
            loan.next_due_date = None

        db.session.commit()

        return {
            "message": "EMI paid successfully",
            "loan_id": loan_id,
            "emi_number": next_emi.emi_number,
            "amount_paid": float(amount),
            "remaining_amount": float(loan.remaining_amount),
            "transaction_id": transaction.id,
            "timestamp": transaction.created_at.isoformat(),
        }

    @staticmethod
    def _create_emi_schedule(loan: Loan):
        """
        Create EMI payment schedule for approved loan

        Args:
            loan: Loan object (must be approved)
        """
        start_date = loan.approved_at + timedelta(days=30)

        for emi_num in range(1, loan.tenure_months + 1):
            due_date = start_date + timedelta(days=30 * (emi_num - 1))

            emi_payment = LoanPayment(
                loan_id=loan.id,
                emi_number=emi_num,
                amount=loan.emi,
                due_date=due_date,
                status="pending",
            )
            db.session.add(emi_payment)

        db.session.commit()

    @staticmethod
    def get_emi_schedule(loan_id: int) -> list:
        """
        Get EMI payment schedule for loan

        Args:
            loan_id: Loan ID

        Returns:
            List of LoanPayment objects in schedule order
        """
        return (
            LoanPayment.query.filter_by(loan_id=loan_id)
            .order_by(LoanPayment.emi_number)
            .all()
        )

    @staticmethod
    def get_loan_summary(loan_id: int) -> dict:
        """
        Get comprehensive loan summary

        Args:
            loan_id: Loan ID

        Returns:
            Summary with KPIs

        Raises:
            ResourceNotFoundError: If loan not found
        """
        loan = LoanService.get_loan(loan_id)

        # Get payment schedule
        payments = LoanService.get_emi_schedule(loan_id)
        pending_payments = [p for p in payments if p.status == "pending"]
        paid_payments = [p for p in payments if p.status == "paid"]

        # Calculate overdue
        now = datetime.utcnow()
        overdue_payments = [
            p for p in pending_payments if p.due_date < now
        ]

        return {
            "loan_id": loan_id,
            "loan_type": loan.loan_type,
            "loan_amount": float(loan.loan_amount),
            "interest_rate": loan.interest_rate,
            "tenure_months": loan.tenure_months,
            "emi": float(loan.emi),
            "status": loan.status,
            "disbursed_amount": float(loan.disbursed_amount),
            "paid_amount": float(loan.paid_amount),
            "remaining_amount": float(loan.remaining_amount),
            "total_interest_payable": float((loan.emi * loan.tenure_months) - loan.loan_amount),
            "emis_paid": len(paid_payments),
            "emis_pending": len(pending_payments),
            "emis_overdue": len(overdue_payments),
            "next_due_date": loan.next_due_date.isoformat() if loan.next_due_date else None,
            "approved_at": loan.approved_at.isoformat() if loan.approved_at else None,
            "created_at": loan.created_at.isoformat(),
        }

    @staticmethod
    def get_pending_approvals() -> list:
        """
        Get all pending loan applications (for admin queue)

        Returns:
            List of Loan objects in PENDING status
        """
        return Loan.query.filter_by(status="pending").order_by(Loan.created_at.desc()).all()

    @staticmethod
    def get_loan_statistics() -> dict:
        """
        Get loan system statistics

        Returns:
            Summary statistics
        """
        all_loans = Loan.query.all()
        total_amount = sum(l.loan_amount for l in all_loans)
        total_paid = sum(l.paid_amount for l in all_loans)
        total_remaining = sum(l.remaining_amount for l in all_loans)

        return {
            "total_loans": len(all_loans),
            "active_loans": len([l for l in all_loans if l.status == "active"]),
            "pending_approval": len([l for l in all_loans if l.status == "pending"]),
            "closed_loans": len([l for l in all_loans if l.status == "closed"]),
            "total_disbursed": float(sum(l.disbursed_amount for l in all_loans)),
            "total_remaining": float(total_remaining),
            "total_paid": float(total_paid),
            "total_amount_sanctioned": float(total_amount),
        }
