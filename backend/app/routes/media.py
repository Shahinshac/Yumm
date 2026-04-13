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
    """Upload a file to Cloudinary"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file part'}), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400
        
        if file and allowed_file(file.filename):
            from backend.app.services.cloudinary_service import CloudinaryService
            
            # Determine folder based on context if possible, default to general
            folder = request.form.get('folder', 'general')
            
            # Upload to Cloudinary
            url = CloudinaryService.upload_document(file, folder=f"yumm_{folder}")
            
            if not url:
                return jsonify({'error': 'Failed to upload to cloud storage'}), 500
                
            logger.info(f"File uploaded to Cloudinary successfully")
            
            return jsonify({
                'success': True,
                'url': url
            }), 201
        
        return jsonify({'error': 'Invalid file type'}), 400

    except Exception as e:
        logger.error(f"Media upload failed: {str(e)}")
        return jsonify({'error': 'Upload failed', 'details': str(e)}), 500
        
        return jsonify({'error': 'File type not allowed'}), 400
        
    except Exception as e:
        logger.error(f"Error uploading file: {str(e)}")
        return jsonify({'error': str(e)}), 500

@bp.route('/serve/<filename>')
def serve_file(filename):
    """Serve an uploaded file"""
    return send_from_directory(os.path.abspath(UPLOAD_FOLDER), filename)
