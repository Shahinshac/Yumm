import os
import random
import logging
from flask_mail import Message
from backend.app import mail

logger = logging.getLogger(__name__)

class CommunicationService:
    @staticmethod
    def generate_otp():
        """Generates a 6-digit numeric OTP"""
        return str(random.randint(100000, 999999))

    @staticmethod
    def send_email_otp(email, otp):
        """
        Sends OTP via Email (100% Free via SMTP)
        """
        try:
            msg = Message(
                "Your Yumm Verification Code",
                recipients=[email]
            )
            msg.body = f"Welcome to Yumm! Your verification code is: {otp}. This code expires in 10 minutes."
            msg.html = f"""
                <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #e23744;">Yumm Verification</h2>
                    <p>Welcome to the platform! Use the code below to verify your identity:</p>
                    <div style="background: #fdf2f2; padding: 15px; border-radius: 8px; text-align: center;">
                        <span style="font-size: 24px; font-weight: 900; color: #e23744; letter-spacing: 5px;">{otp}</span>
                    </div>
                    <p style="color: #999; font-size: 12px; margin-top: 20px;">If you didn't request this, please ignore this email.</p>
                </div>
            """
            mail.send(msg)
            return True
        except Exception as e:
            logger.error(f"Failed to send email OTP: {str(e)}")
            return False

    @staticmethod
    def send_sms_otp(phone, otp):
        """
        FREE SMS SIMULATION - Zero Setup
        Prints the OTP to the backend console for the developer to see.
        """
        # Professional-looking terminal box
        box_width = 46
        print("\n" + "╔" + "═" * box_width + "╗")
        print("║" + " " * 12 + "📱 YUMM SMS SIMULATION" + " " * 12 + "║")
        print("╠" + "═" * box_width + "╣")
        print(f"║ SENDING TO: {phone.ljust(30)} ║")
        print(f"║ YOUR OTP IS : {otp.center(29)} ║")
        print("╠" + "═" * box_width + "╣")
        print("║ (Enter this code in your app to verify)      ║")
        print("╚" + "═" * box_width + "╝\n")
        
        logger.info(f"[SIMULATION] OTP {otp} sent to {phone}")
        return True

    @staticmethod
    def verify_otp(provided_otp, actual_otp):
        """Verifies if the provided OTP matches"""
        return str(provided_otp) == str(actual_otp)
