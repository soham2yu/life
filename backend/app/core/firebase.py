import json
import firebase_admin
from firebase_admin import credentials, auth
from typing import Optional, Dict
from ..config.settings import settings
from ..core.logging import get_logger
import os

logger = get_logger(__name__)


class FirebaseAuth:
    """Firebase authentication manager"""

    def __init__(self):
        self._initialized = False

    def initialize(self):
        """Initialize Firebase Admin SDK"""
        if self._initialized:
            return

        try:
            if not settings.FIREBASE_PROJECT_ID:
                logger.warning("Firebase credentials not configured")
                return

            # Get private key from environment and properly decode newlines
            private_key = settings.FIREBASE_PRIVATE_KEY
            if private_key:
                # Remove surrounding quotes if present
                private_key = private_key.strip('"')
                # Replace literal \n with actual newlines
                private_key = private_key.replace('\\n', '\n')

            # Create credentials from settings
            cred_dict = {
                "type": "service_account",
                "project_id": settings.FIREBASE_PROJECT_ID,
                "private_key": private_key,
                "client_email": settings.FIREBASE_CLIENT_EMAIL,
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
                "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
                "client_x509_cert_url": f"https://www.googleapis.com/robot/v1/metadata/x509/{settings.FIREBASE_CLIENT_EMAIL.replace('@', '%40')}"
            }

            cred = credentials.Certificate(cred_dict)
            firebase_admin.initialize_app(cred)

            self._initialized = True
            logger.info("Firebase Admin SDK initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Firebase: {e}")
            raise

    async def verify_token(self, token: str) -> Optional[Dict]:
        """Verify Firebase ID token"""
        try:
            # Ensure Firebase is initialized
            if not self._initialized:
                self.initialize()

            decoded_token = auth.verify_id_token(token)
            return decoded_token
        except Exception as e:
            logger.warning(f"Token verification failed: {e}")
            return None

    async def get_user(self, uid: str):
        """Get user by Firebase UID"""
        try:
            user = auth.get_user(uid)
            return user
        except Exception as e:
            logger.error(f"Failed to get user {uid}: {e}")
            return None

    async def create_custom_token(self, uid: str, claims: Optional[Dict] = None) -> str:
        """Create a custom token for a user"""
        try:
            token = auth.create_custom_token(uid, claims)
            return token.decode('utf-8')
        except Exception as e:
            logger.error(f"Failed to create custom token: {e}")
            raise


# Global Firebase instance
firebase_auth = FirebaseAuth()
