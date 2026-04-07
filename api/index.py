"""
Vercel Serverless API Entry Point
Exports Flask app for Vercel Functions
"""
import sys
import os

# Add backend directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.run import app

# Export the app for Vercel
__all__ = ['app']
