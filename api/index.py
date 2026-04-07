"""
Vercel Serverless API Entry Point
Exports Flask app as ASGI application for Vercel Functions
"""
import sys
import os

# Add backend directory to Python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import and configure Flask app
from backend.run import app

# Export app for Vercel to recognize as a serverless function
__all__ = ['app']

