from flask import Blueprint, request, jsonify
from backend.app.services.cloudinary_service import CloudinaryService
import logging

logger = logging.getLogger(__name__)

bp = Blueprint('uploads', __name__, url_prefix='/api/uploads')

@bp.route('/identity-proof', methods=['POST'])
def upload_identity_proof():
    """
    Handles identity document uploads for partners
    """
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file part in the request'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400

        # Upload to Cloudinary
        url = CloudinaryService.upload_document(file, folder="partner_kyc")
        
        if not url:
            return jsonify({'error': 'Failed to upload to cloud storage'}), 500

        return jsonify({
            'message': 'Upload successful',
            'url': url
        }), 200

    except Exception as e:
        logger.error(f"Upload error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500
