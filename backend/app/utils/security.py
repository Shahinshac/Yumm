"""
Security utilities
"""
from bcrypt import hashpw, checkpw, gensalt

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
