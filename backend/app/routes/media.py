"""
Media Routes - Handle file uploads
"""
import os
import secrets
from flask import Blueprint, request, jsonify, current_app, send_from_directory
from werkzeug.utils import secure_filename
from flask_jwt_extended import jwt_required
import logging

logger = logging.getLogger(__name__)

bp = Blueprint('media', __name__, url_prefix='/api/media')

UPLOAD_FOLDER = os.path.join('backend', 'app', 'static', 'uploads')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@bp.route('/upload', methods=['POST'])
@jwt_required()
def upload_file():
    """Upload a file to the server"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file part'}), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400
        
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            # Add a random prefix to avoid collisions
            random_hex = secrets.token_hex(8)
            _, extension = os.path.splitext(filename)
            new_filename = f"{random_hex}{extension}"
            
            # Ensure the upload folder exists
            if not os.path.exists(UPLOAD_FOLDER):
                os.makedirs(UPLOAD_FOLDER)
                
            file_path = os.path.join(UPLOAD_FOLDER, new_filename)
            file.save(file_path)
            
            # Use real host or fallback to localhost if not set in config
            base_url = current_app.config.get('BASE_URL', request.host_url).rstrip('/')
            file_url = f"{base_url}/api/media/serve/{new_filename}"
            
            logger.info(f"File uploaded successfully: {new_filename}")
            
            return jsonify({
                'success': True,
                'filename': new_filename,
                'url': file_url
            }), 201
        
        return jsonify({'error': 'File type not allowed'}), 400
        
    except Exception as e:
        logger.error(f"Error uploading file: {str(e)}")
        return jsonify({'error': str(e)}), 500

@bp.route('/serve/<filename>')
def serve_file(filename):
    """Serve an uploaded file"""
    return send_from_directory(os.path.abspath(UPLOAD_FOLDER), filename)
