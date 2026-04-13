"""
Email Service - Handle automated email notifications
"""
from flask_mail import Message
from backend.app import mail
from flask import current_app
import logging

logger = logging.getLogger(__name__)

class EmailService:
    """Service to handle all outgoing emails"""

    @staticmethod
    def send_email(subject, recipient, body, html=None):
        """Generic email sender"""
        try:
            # Gmail SMTP strictly requires the 'sender' to match the 'MAIL_USERNAME' account.
            # Using any other address in the sender field often causes authentication or relay errors.
            sender = current_app.config.get('MAIL_USERNAME') or current_app.config.get('MAIL_DEFAULT_SENDER')
            mail_password = current_app.config.get('MAIL_PASSWORD')

            if not sender or not mail_password:
                logger.warning(f"⚠️  Email config missing, skipping send to {recipient}")
                return False

            msg = Message(
                subject=subject,
                recipients=[recipient],
                body=body,
                html=html,
                sender=sender
            )
            mail.send(msg)
            logger.info(f"✅ Email sent successfully to {recipient}")
            return True
        except Exception as e:
            logger.error(f"❌ SMTP Error sending to {recipient}: {str(e)}")
            # We log the full error but don't crash the calling process
            return False

    @staticmethod
    def send_credentials_email(user_email, user_name, username, password):
        """Send generated credentials to the user"""
        subject = "Welcome to Yumm FoodHub - Your Account is Approved!"
        body = f"""
Hi {user_name},

Great news! Your registration on Yumm FoodHub has been approved by the admin.

You can now log in to the portal using the following credentials:

Username: {username}
Temporary Password: {password}

(You can also use your email {user_email} to log in)

Please log in at https://yummfoodhub.vercel.app/login and change your password as soon as possible.

Welcome to the team!

Regards,
Yumm FoodHub Team
"""
        html = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f0f0f0; border-radius: 10px;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #ff4b3a;">Yumm FoodHub</h1>
            </div>
            <h2 style="color: #333;">Welcome aboard, {user_name}!</h2>
            <p>Great news! Your registration has been <strong>approved</strong> by our administration team.</p>
            <div style="background-color: #f9f9f9; padding: 20px; border-radius: 10px; margin: 25px 0;">
                <p style="margin: 0; font-weight: bold; color: #666;">Account Credentials:</p>
                <p style="margin: 10px 0 0 0;"><strong>Username:</strong> {username}</p>
                <p style="margin: 5px 0 0 0;"><strong>Password:</strong> <code style="background: #eee; padding: 2px 5px; border-radius: 3px;">{password}</code></p>
                <p style="margin: 10px 0 0 0; font-size: 11px; color: #999;">Email: {user_email}</p>
            </div>
            <p>You can access your dashboard here:</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="https://yummfoodhub.vercel.app/login" style="background-color: #ff4b3a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Login to Dashboard</a>
            </div>
            <p style="color: #999; font-size: 12px; margin-top: 40px;">If you didn't expect this email, please ignore it.</p>
        </div>
        """
        return EmailService.send_email(subject, user_email, body, html)

    @staticmethod
    def send_rejection_email(user_email, user_name, reason="Your account application did not meet our current requirements."):
        """Send rejection notice to the user"""
        subject = "Update regarding your Yumm FoodHub Application"
        body = f"""
Hi {user_name},

Thank you for your interest in joining Yumm FoodHub.

After reviewing your application, we regret to inform you that we are unable to approve your account at this time.

Reason: {reason}

If you have any questions, you can contact our support team.

Regards,
Yumm FoodHub Team
"""
        html = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f0f0f0; border-radius: 10px;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #666;">Yumm FoodHub</h1>
            </div>
            <h2 style="color: #333;">Application Update</h2>
            <p>Hi {user_name},</p>
            <p>Thank you for your interest in joining the Yumm network.</p>
            <div style="background-color: #f9f9f9; padding: 20px; border-radius: 10px; margin: 25px 0;">
                <p style="margin: 0; font-weight: bold; color: #e23744;">Update Status: Not Approved</p>
                <p style="margin: 10px 0 0 0; color: #666;"><strong>Reason:</strong> {reason}</p>
            </div>
            <p>While we cannot move forward with your application at this time, we appreciate your interest and wish you the best.</p>
            <p style="color: #999; font-size: 12px; margin-top: 40px;">This is an automated notification.</p>
        </div>
        """
        return EmailService.send_email(subject, user_email, body, html)
