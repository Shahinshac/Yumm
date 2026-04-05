"""
Bills Routes
"""
from flask import Blueprint

bp = Blueprint('bills', __name__, url_prefix='/api/bills')
