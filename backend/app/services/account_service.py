"""
Account management service - Business logic for account operations
"""
from app.models.account import Account, AccountTypeEnum, AccountStatusEnum
from app.models.user import User
from app.utils.generators import Generators
from app.utils.exceptions import (
    ResourceNotFoundError,
    ValidationError,
    InsufficientBalanceError,
)
from datetime import datetime
from decimal import Decimal


class AccountService:
    """Handle bank account operations"""

    @staticmethod
    def create_account(
        user_id: str,
        account_type: str = "savings",
        initial_balance: float = 0.0,
    ) -> Account:
        """
        Create a new bank account for a user

        Args:
            user_id: User ID
            account_type: Account type (savings, current, salary)
            initial_balance: Initial balance

        Returns:
            Created account object

        Raises:
            ResourceNotFoundError: If user not found
            ValidationError: If validation fails
        """
        # Validate user exists
        try:
            user = User.objects(id=user_id).first()
        except Exception:
            user = None

        if not user:
            raise ResourceNotFoundError(f"User with ID {user_id} not found")

        # Validate account type
        if account_type not in [e.value for e in AccountTypeEnum]:
            valid_types = ", ".join([e.value for e in AccountTypeEnum])
            raise ValidationError(f"Invalid account type. Valid: {valid_types}")

        # Validate initial balance
        if initial_balance < 0:
            raise ValidationError("Initial balance cannot be negative")

        # Generate unique account number
        account_number = AccountService._generate_unique_account_number()

        # Create account
        account = Account(
            account_number=account_number,
            account_type=account_type,
            balance=Decimal(str(initial_balance)),
            status=AccountStatusEnum.ACTIVE.value,
            user_id=user_id,
        )

        try:
            account.save()
        except Exception as e:
            raise ValidationError(f"Failed to create account: {str(e)}")

        return account

    @staticmethod
    def _generate_unique_account_number() -> str:
        """
        Generate a unique account number

        Returns:
            Unique 18-digit account number
        """
        while True:
            account_number = Generators.generate_account_number()
            # Check if it already exists
            existing = Account.objects(account_number=account_number).first()
            if not existing:
                return account_number

    @staticmethod
    def get_account_by_id(account_id: str) -> Account:
        """
        Get account by ID

        Args:
            account_id: Account ID

        Returns:
            Account object

        Raises:
            ResourceNotFoundError: If account not found
        """
        try:
            account = Account.objects(id=account_id).first()
        except Exception:
            account = None

        if not account:
            raise ResourceNotFoundError(f"Account with ID {account_id} not found")

        return account

    @staticmethod
    def get_account_by_number(account_number: str) -> Account:
        """
        Get account by account number

        Args:
            account_number: Account number

        Returns:
            Account object

        Raises:
            ResourceNotFoundError: If account not found
        """
        account = Account.objects(account_number=account_number).first()

        if not account:
            raise ResourceNotFoundError(f"Account {account_number} not found")

        return account

    @staticmethod
    def get_user_accounts(user_id: str) -> list:
        """
        Get all accounts for a user

        Args:
            user_id: User ID

        Returns:
            List of accounts

        Raises:
            ResourceNotFoundError: If user not found
        """
        try:
            user = User.objects(id=user_id).first()
        except Exception:
            user = None

        if not user:
            raise ResourceNotFoundError(f"User with ID {user_id} not found")

        return list(Account.objects(user_id=user_id).order_by("-created_at"))

    @staticmethod
    def get_account_balance(account_id: str) -> dict:
        """
        Get account balance

        Args:
            account_id: Account ID

        Returns:
            Dictionary with balance and account info

        Raises:
            ResourceNotFoundError: If account not found
        """
        account = AccountService.get_account_by_id(account_id)

        return {
            "account_number": account.account_number,
            "account_type": account.account_type,
            "balance": float(account.balance),
            "status": account.status,
        }

    @staticmethod
    def update_balance(account_id: str, amount: float, operation: str = "add") -> Account:
        """
        Update account balance

        Args:
            account_id: Account ID
            amount: Amount to add or subtract
            operation: "add" or "deduct"

        Returns:
            Updated account

        Raises:
            ValueError: If operation invalid
            InsufficientBalanceError: If deducting more than balance
        """
        if operation not in ["add", "deduct"]:
            raise ValueError("Operation must be 'add' or 'deduct'")

        account = AccountService.get_account_by_id(account_id)

        if operation == "add":
            account.balance += Decimal(str(amount))
        elif operation == "deduct":
            if account.balance < Decimal(str(amount)):
                raise InsufficientBalanceError(
                    f"Insufficient balance. Available: {account.balance}, Required: {amount}"
                )
            account.balance -= Decimal(str(amount))

        account.updated_at = datetime.utcnow()
        account.save()

        return account

    @staticmethod
    def freeze_account(account_id: str) -> Account:
        """
        Freeze account (block transactions)

        Args:
            account_id: Account ID

        Returns:
            Updated account

        Raises:
            ResourceNotFoundError: If account not found
        """
        account = AccountService.get_account_by_id(account_id)

        if account.status == AccountStatusEnum.FROZEN.value:
            raise ValidationError("Account is already frozen")

        account.status = AccountStatusEnum.FROZEN.value
        account.updated_at = datetime.utcnow()
        account.save()

        return account

    @staticmethod
    def unfreeze_account(account_id: str) -> Account:
        """
        Unfreeze account (allow transactions)

        Args:
            account_id: Account ID

        Returns:
            Updated account

        Raises:
            ResourceNotFoundError: If account not found
        """
        account = AccountService.get_account_by_id(account_id)

        if account.status != AccountStatusEnum.FROZEN.value:
            raise ValidationError("Account is not frozen")

        account.status = AccountStatusEnum.ACTIVE.value
        account.updated_at = datetime.utcnow()
        account.save()

        return account

    @staticmethod
    def close_account(account_id: str) -> Account:
        """
        Close account (permanent closure)

        Args:
            account_id: Account ID

        Returns:
            Updated account

        Raises:
            ResourceNotFoundError: If account not found
            ValidationError: If account has balance or already closed
        """
        account = AccountService.get_account_by_id(account_id)

        if account.status == AccountStatusEnum.CLOSED.value:
            raise ValidationError("Account is already closed")

        if account.balance > 0:
            raise ValidationError(
                f"Cannot close account with remaining balance: {account.balance}"
            )

        account.status = AccountStatusEnum.CLOSED.value
        account.updated_at = datetime.utcnow()
        account.save()

        return account

    @staticmethod
    def get_account_status(account_id: str) -> dict:
        """
        Get account status details

        Args:
            account_id: Account ID

        Returns:
            Dictionary with status information
        """
        account = AccountService.get_account_by_id(account_id)

        return {
            "account_number": account.account_number,
            "status": account.status,
            "is_active": account.status == AccountStatusEnum.ACTIVE.value,
            "is_frozen": account.status == AccountStatusEnum.FROZEN.value,
            "is_closed": account.status == AccountStatusEnum.CLOSED.value,
            "balance": float(account.balance),
        }
