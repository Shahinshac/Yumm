"""
Entry point for the Flask application
"""
import os
from app import create_app, db


# Set environment
os.environ.setdefault("FLASK_ENV", "development")
app = create_app(os.getenv("FLASK_ENV", "development"))


@app.shell_context_processor
def make_shell_context():
    """Add objects to shell context for flask shell"""
    return {"db": db}


if __name__ == "__main__":
    app.run(debug=app.config["DEBUG"], host="0.0.0.0", port=5000)
