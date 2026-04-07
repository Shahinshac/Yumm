"""
Security utilities
"""
from bcrypt import hashpw, checkpw, gensalt
import secrets

class PasswordSecurity:
    """Password hashing and verification"""

    @staticmethod
    def hash_password(password: str) -> str:
        """Hash password using bcrypt"""
        return hashpw(password.encode(), gensalt()).decode()

    @staticmethod
    def verify_password(password: str, hash_str: str) -> bool:
        """Verify password against hash"""
        try:
            return checkpw(password.encode(), hash_str.encode())
        except Exception:
            return False

    @staticmethod
    def generate_secure_password(length: int = 16) -> str:
        """Generate a secure random password using secrets

        Args:
            length: Desired length of password (default 16)

        Returns:
            Cryptographically secure random string (URL-safe base64 encoded)
        """
        return secrets.token_urlsafe(length)

