"""
Food Delivery App - Backend Entry Point
"""
import os
import sys

# Ensure the parent directory is in sys.path so 'from backend.app...' works from inside this directory
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.app import create_app, socketio

# Create app at module level so gunicorn can find it
app = create_app()

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_ENV') == 'development'
    # Use socketio.run() instead of app.run() to support WebSockets
    socketio.run(app, debug=debug, host='0.0.0.0', port=port)
