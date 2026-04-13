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
    def generate_secure_password(length: int = 6) -> str:
        """Generate a secure 6-digit random password using secrets"""
        import string
        return "".join(secrets.choice(string.digits) for _ in range(6))

