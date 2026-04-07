"""
Input validation utilities
"""
import re


class Validators:
    """Input validation helper"""

    @staticmethod
    def validate_email(email: str) -> bool:
        """Validate email format"""
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return re.match(pattern, email) is not None

    @staticmethod
    def validate_phone(phone: str) -> bool:
        """Validate phone number (10-15 digits)"""
        phone_clean = re.sub(r'\D', '', phone)
        return 10 <= len(phone_clean) <= 15

    @staticmethod
    def validate_password(password: str) -> tuple[bool, str]:
        """Validate password strength"""
        if len(password) < 6:
            return False, "Password must be at least 6 characters"
        return True, ""

    @staticmethod
    def validate_username(username: str) -> bool:
        """Validate username (alphanumeric, underscore, hyphen)"""
        pattern = r'^[a-zA-Z0-9_-]{3,20}$'
        return re.match(pattern, username) is not None

    @staticmethod
    def validate_role(role: str) -> bool:
        """Validate user role"""
        valid_roles = ['customer', 'restaurant', 'delivery', 'admin']
        return role in valid_roles

    @staticmethod
    def validate_vehicle_type(vehicle_type: str) -> bool:
        """Validate vehicle type"""
        valid_types = ['bike', 'scooter', 'car', 'bicycle']
        return vehicle_type in valid_types

    @staticmethod
    def validate_coordinates(lat: float, lng: float) -> bool:
        """Validate latitude and longitude"""
        try:
            lat = float(lat)
            lng = float(lng)
            return -90 <= lat <= 90 and -180 <= lng <= 180
        except (ValueError, TypeError):
            return False

    @staticmethod
    def sanitize_string(text: str, max_length: int = 500) -> str:
        """Sanitize string input"""
        if not isinstance(text, str):
            return ""
        return text.strip()[:max_length]

    @staticmethod
    def validate_google_mock_token(token: str) -> bool:
        """Validate mock Google token format (must start with 'mock_')"""
        if not isinstance(token, str):
            return False
        return token.startswith('mock_') and len(token) >= 5

    @staticmethod
    def validate_name(name: str) -> bool:
        """Validate name (at least 2 chars, alphanumeric + spaces)"""
        if not isinstance(name, str):
            return False
        name = name.strip()
        return len(name) >= 2 and len(name) <= 100

    @staticmethod
    def validate_shop_name(shop_name: str) -> bool:
        """Validate shop/restaurant name"""
        if not isinstance(shop_name, str):
            return False
        shop_name = shop_name.strip()
        return len(shop_name) >= 2 and len(shop_name) <= 200

    @staticmethod
    def validate_address(address: str) -> bool:
        """Validate address"""
        if not isinstance(address, str):
            return False
        address = address.strip()
        return len(address) >= 5 and len(address) <= 500

