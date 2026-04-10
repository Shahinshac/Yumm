import cloudinary
import cloudinary.uploader
import os
from dotenv import load_dotenv

load_dotenv()

# Configuration
cloudinary.config(
    cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
    api_key=os.getenv('CLOUDINARY_API_KEY'),
    api_secret=os.getenv('CLOUDINARY_API_SECRET'),
    secure=True
)

class CloudinaryService:
    @staticmethod
    def upload_document(file_to_upload, folder="partner_docs"):
        """
        Uploads a file to Cloudinary and returns the URL
        """
        try:
            upload_result = cloudinary.uploader.upload(
                file_to_upload,
                folder=folder,
                resource_type="auto"
            )
            return upload_result.get('secure_url')
        except Exception as e:
            print(f"Cloudinary Upload Error: {str(e)}")
            return None

    @staticmethod
    def delete_document(public_id):
        """
        Deletes a file from Cloudinary
        """
        try:
            cloudinary.uploader.destroy(public_id)
            return True
        except Exception:
            return False
