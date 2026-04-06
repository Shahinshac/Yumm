"""
Food Delivery App - Backend Entry Point
"""
import os
from backend.app import create_app, socketio

# Create app at module level so gunicorn can find it
app = create_app()

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_ENV') == 'development'
    # Use socketio.run() instead of app.run() to support WebSockets
    socketio.run(app, debug=debug, host='0.0.0.0', port=port)
