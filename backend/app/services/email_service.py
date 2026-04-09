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
            msg = Message(
                subject=subject,
                recipients=[recipient],
                body=body,
                html=html,
                sender=current_app.config.get('MAIL_DEFAULT_SENDER')
            )
            mail.send(msg)
            logger.info(f"✅ Email sent to {recipient} with subject: {subject}")
            return True
        except Exception as e:
            logger.error(f"❌ Failed to send email to {recipient}: {str(e)}")
            # Even if it fails, we don't want to crash the approval process
            # just log it so the admin knows something went wrong with the mailer
            return False

    @staticmethod
    def send_credentials_email(user_email, user_name, password):
        """Send generated credentials to the user"""
        subject = "Welcome to Yumm FoodHub - Your Account is Approved!"
        body = f"""
Hi {user_name},

Great news! Your registration on Yumm FoodHub has been approved by the admin.

You can now log in to the portal using the following credentials:

Email: {user_email}
Temporary Password: {password}

Please log in at https://yummfoodhub.vercel.app/login and change your password as soon as possible.

Welcome to the team!

Regards,
Yumm FoodHub Team
"""
        # For a premium feel, let's add a basic HTML version too
        html = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f0f0f0; border-radius: 10px;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #ff4b3a;">Yumm FoodHub</h1>
            </div>
            <h2 style="color: #333;">Welcome aboard, {user_name}!</h2>
            <p>Great news! Your registration has been <strong>approved</strong> by our administration team.</p>
            <div style="background-color: #f9f9f9; padding: 20px; border-radius: 10px; margin: 25px 0;">
                <p style="margin: 0; font-weight: bold; color: #666;">Account Credentials:</p>
                <p style="margin: 10px 0 0 0;"><strong>Email:</strong> {user_email}</p>
                <p style="margin: 5px 0 0 0;"><strong>Password:</strong> <code style="background: #eee; padding: 2px 5px; border-radius: 3px;">{password}</code></p>
            </div>
            <p>You can access your dashboard here:</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="https://yummfoodhub.vercel.app/login" style="background-color: #ff4b3a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Login to Dashboard</a>
            </div>
            <p style="color: #999; font-size: 12px; margin-top: 40px;">If you didn't expect this email, please ignore it.</p>
        </div>
        """
        return EmailService.send_email(subject, user_email, body, html)
