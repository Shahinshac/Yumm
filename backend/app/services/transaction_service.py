"""
Transaction management service - Business logic for financial transactions
"""
from app import db
from app.models.account import Account
from app.models.transaction import Transaction, TransactionTypeEnum, TransactionStatusEnum
from app.models.user import User
from app.utils.generators import Generators
from app.utils.exceptions import (
    ResourceNotFoundError,
    ValidationError,
    InsufficientBalanceError,
)
from datetime import datetime, timedelta
from decimal import Decimal


class TransactionService:
    """Handle all transaction operations"""

    @staticmethod
    def deposit(account_id: int, amount: float, description: str = "") -> Transaction:
        """
        Deposit money into account

        Args:
            account_id: Account ID
            amount: Amount to deposit
            description: Transaction description

        Returns:
            Created transaction

        Raises:
            ResourceNotFoundError: If account not found
            ValidationError: If amount invalid
        """
        # Validate account exists
        account = Account.query.get(account_id)
        if not account:
            raise ResourceNotFoundError(f"Account with ID {account_id} not found")

        # Validate amount
        if amount <= 0:
            raise ValidationError("Deposit amount must be greater than 0")

        # Create transaction record
        transaction = Transaction(
            reference_id=Generators.generate_transaction_reference(),
            transaction_type=TransactionTypeEnum.DEPOSIT.value,
            status=TransactionStatusEnum.SUCCESS.value,
            amount=Decimal(str(amount)),
            description=description or f"Deposit to account {account.account_number}",
            account_id=account_id,
            user_id=account.user_id,
        )

        try:
            # Update account balance
            account.balance += Decimal(str(amount))
            account.updated_at = datetime.utcnow()

            db.session.add(transaction)
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            raise ValidationError(f"Deposit failed: {str(e)}")

        return transaction

    @staticmethod
    def withdraw(account_id: int, amount: float, description: str = "") -> Transaction:
        """
        Withdraw money from account

        Args:
            account_id: Account ID
            amount: Amount to withdraw
            description: Transaction description

        Returns:
            Created transaction

        Raises:
            ResourceNotFoundError: If account not found
            InsufficientBalanceError: If insufficient balance
            ValidationError: If amount invalid
        """
        # Validate account exists
        account = Account.query.get(account_id)
        if not account:
            raise ResourceNotFoundError(f"Account with ID {account_id} not found")

        # Validate amount
        if amount <= 0:
            raise ValidationError("Withdrawal amount must be greater than 0")

        # Check balance
        if account.balance < Decimal(str(amount)):
            raise InsufficientBalanceError(
                f"Insufficient balance. Available: {account.balance}, Required: {amount}"
            )

        # Create transaction record
        transaction = Transaction(
            reference_id=Generators.generate_transaction_reference(),
            transaction_type=TransactionTypeEnum.WITHDRAWAL.value,
            status=TransactionStatusEnum.SUCCESS.value,
            amount=Decimal(str(amount)),
            description=description or f"Withdrawal from account {account.account_number}",
            account_id=account_id,
            user_id=account.user_id,
        )

        try:
            # Update account balance
            account.balance -= Decimal(str(amount))
            account.updated_at = datetime.utcnow()

            db.session.add(transaction)
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            raise ValidationError(f"Withdrawal failed: {str(e)}")

        return transaction

    @staticmethod
    def transfer(
        from_account_id: int,
        to_account_id: int,
        amount: float,
        description: str = "",
    ) -> dict:
        """
        Transfer money between accounts (atomic operation)

        Args:
            from_account_id: Source account ID
            to_account_id: Destination account ID
            amount: Amount to transfer
            description: Transaction description

        Returns:
            Dictionary with both transactions

        Raises:
            ResourceNotFoundError: If account not found
            InsufficientBalanceError: If insufficient balance
            ValidationError: If invalid transfer
        """
        # Validate accounts exist
        from_account = Account.query.get(from_account_id)
        if not from_account:
            raise ResourceNotFoundError(f"Source account with ID {from_account_id} not found")

        to_account = Account.query.get(to_account_id)
        if not to_account:
            raise ResourceNotFoundError(f"Destination account with ID {to_account_id} not found")

        # Validate amount
        if amount <= 0:
            raise ValidationError("Transfer amount must be greater than 0")

        # Check balance
        if from_account.balance < Decimal(str(amount)):
            raise InsufficientBalanceError(
                f"Insufficient balance. Available: {from_account.balance}, Required: {amount}"
            )

        # Cannot transfer to same account
        if from_account_id == to_account_id:
            raise ValidationError("Cannot transfer to the same account")

        # Generate reference ID (same for both transactions)
        reference_id = Generators.generate_transaction_reference()

        # Create debit transaction (from account)
        debit_txn = Transaction(
            reference_id=reference_id,
            transaction_type=TransactionTypeEnum.TRANSFER.value,
            status=TransactionStatusEnum.SUCCESS.value,
            amount=Decimal(str(amount)),
            description=description
            or f"Transfer to account {to_account.account_number}",
            account_id=from_account_id,
            recipient_account_id=to_account_id,
            user_id=from_account.user_id,
        )

        # Create credit transaction (to account)
        credit_txn = Transaction(
            reference_id=reference_id,
            transaction_type=TransactionTypeEnum.TRANSFER.value,
            status=TransactionStatusEnum.SUCCESS.value,
            amount=Decimal(str(amount)),
            description=description
            or f"Transfer from account {from_account.account_number}",
            account_id=to_account_id,
            recipient_account_id=from_account_id,
            user_id=to_account.user_id,
        )

        try:
            # ATOMIC: Both must succeed or both must fail
            # Debit from source
            from_account.balance -= Decimal(str(amount))
            from_account.updated_at = datetime.utcnow()

            # Credit to destination
            to_account.balance += Decimal(str(amount))
            to_account.updated_at = datetime.utcnow()

            # Save both transactions
            db.session.add(debit_txn)
            db.session.add(credit_txn)
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            raise ValidationError(f"Transfer failed: {str(e)}")

        return {
            "reference_id": reference_id,
            "from_transaction": debit_txn.to_dict(),
            "to_transaction": credit_txn.to_dict(),
            "status": "completed",
        }

    @staticmethod
    def get_transaction(transaction_id: int) -> Transaction:
        """
        Get transaction by ID

        Args:
            transaction_id: Transaction ID

        Returns:
            Transaction object

        Raises:
            ResourceNotFoundError: If transaction not found
        """
        transaction = Transaction.query.get(transaction_id)

        if not transaction:
            raise ResourceNotFoundError(f"Transaction with ID {transaction_id} not found")

        return transaction

    @staticmethod
    def get_account_transactions(
        account_id: int,
        transaction_type: str = None,
        start_date: datetime = None,
        end_date: datetime = None,
        page: int = 1,
        per_page: int = 20,
    ) -> dict:
        """
        Get transaction history for account with filters

        Args:
            account_id: Account ID
            transaction_type: Filter by type (deposit, withdrawal, transfer, etc.)
            start_date: Filter transactions from this date
            end_date: Filter transactions until this date
            page: Page number
            per_page: Items per page

        Returns:
            Dictionary with transactions and pagination info

        Raises:
            ResourceNotFoundError: If account not found
        """
        # Validate account exists
        account = Account.query.get(account_id)
        if not account:
            raise ResourceNotFoundError(f"Account with ID {account_id} not found")

        # Build query
        query = Transaction.query.filter_by(account_id=account_id).order_by(
            Transaction.created_at.desc()
        )

        # Apply filters
        if transaction_type:
            query = query.filter_by(transaction_type=transaction_type)

        if start_date:
            query = query.filter(Transaction.created_at >= start_date)

        if end_date:
            # Add 1 day to include all transactions until end of day
            end_date = end_date + timedelta(days=1)
            query = query.filter(Transaction.created_at < end_date)

        # Paginate
        paginated = query.paginate(page=page, per_page=per_page)

        return {
            "account_id": account_id,
            "account_number": account.account_number,
            "total": paginated.total,
            "pages": paginated.pages,
            "current_page": page,
            "transactions": [txn.to_dict() for txn in paginated.items],
        }

    @staticmethod
    def get_user_transactions(
        user_id: int,
        transaction_type: str = None,
        start_date: datetime = None,
        end_date: datetime = None,
        page: int = 1,
        per_page: int = 20,
    ) -> dict:
        """
        Get all transactions for a user across all accounts

        Args:
            user_id: User ID
            transaction_type: Filter by type
            start_date: Filter from date
            end_date: Filter until date
            page: Page number
            per_page: Items per page

        Returns:
            Dictionary with transactions and pagination info

        Raises:
            ResourceNotFoundError: If user not found
        """
        # Validate user exists
        user = User.query.get(user_id)
        if not user:
            raise ResourceNotFoundError(f"User with ID {user_id} not found")

        # Build query
        query = Transaction.query.filter_by(user_id=user_id).order_by(
            Transaction.created_at.desc()
        )

        # Apply filters
        if transaction_type:
            query = query.filter_by(transaction_type=transaction_type)

        if start_date:
            query = query.filter(Transaction.created_at >= start_date)

        if end_date:
            end_date = end_date + timedelta(days=1)
            query = query.filter(Transaction.created_at < end_date)

        # Paginate
        paginated = query.paginate(page=page, per_page=per_page)

        return {
            "user_id": user_id,
            "total": paginated.total,
            "pages": paginated.pages,
            "current_page": page,
            "transactions": [txn.to_dict() for txn in paginated.items],
        }

    @staticmethod
    def get_transaction_summary(account_id: int, days: int = 30) -> dict:
        """
        Get transaction summary for account

        Args:
            account_id: Account ID
            days: Number of days to include (default 30)

        Returns:
            Dictionary with summary statistics

        Raises:
            ResourceNotFoundError: If account not found
        """
        account = Account.query.get(account_id)
        if not account:
            raise ResourceNotFoundError(f"Account with ID {account_id} not found")

        # Calculate date range
        start_date = datetime.utcnow() - timedelta(days=days)

        # Get transactions
        transactions = Transaction.query.filter(
            (Transaction.account_id == account_id)
            & (Transaction.created_at >= start_date)
        ).all()

        # Calculate totals by type
        deposits = sum(
            txn.amount
            for txn in transactions
            if txn.transaction_type == TransactionTypeEnum.DEPOSIT.value
        )
        withdrawals = sum(
            txn.amount
            for txn in transactions
            if txn.transaction_type == TransactionTypeEnum.WITHDRAWAL.value
        )

        # For transfers, only count debit (outgoing)
        transfers_out = sum(
            txn.amount
            for txn in transactions
            if txn.transaction_type == TransactionTypeEnum.TRANSFER.value
            and txn.account_id == account_id
            and txn.recipient_account_id is not None
        )

        transfers_in = sum(
            txn.amount
            for txn in transactions
            if txn.transaction_type == TransactionTypeEnum.TRANSFER.value
            and txn.recipient_account_id == account_id
        )

        return {
            "account_id": account_id,
            "period_days": days,
            "transaction_count": len(transactions),
            "deposits": {
                "count": len([t for t in transactions if t.transaction_type == "deposit"]),
                "total": float(deposits),
            },
            "withdrawals": {
                "count": len([t for t in transactions if t.transaction_type == "withdrawal"]),
                "total": float(withdrawals),
            },
            "transfers_incoming": {
                "count": len(
                    [
                        t
                        for t in transactions
                        if t.transaction_type == "transfer" and t.recipient_account_id == account_id
                    ]
                ),
                "total": float(transfers_in),
            },
            "transfers_outgoing": {
                "count": len(
                    [
                        t
                        for t in transactions
                        if t.transaction_type == "transfer" and t.account_id == account_id and t.recipient_account_id is not None
                    ]
                ),
                "total": float(transfers_out),
            },
            "net_change": float(deposits + transfers_in - withdrawals - transfers_out),
            "current_balance": float(account.balance),
        }
