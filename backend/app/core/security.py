from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
from app.core.firebase import firebase_auth
from app.core.database import get_db, Database
from app.core.logging import get_logger

logger = get_logger(__name__)

security = HTTPBearer()


class AuthUser:
    """Authenticated user object"""
    
    def __init__(self, user_id: str, firebase_uid: str, email: str, role: str = "user"):
        self.user_id = user_id
        self.firebase_uid = firebase_uid
        self.email = email
        self.role = role
    
    def is_admin(self) -> bool:
        return self.role == "admin"
    
    def is_moderator(self) -> bool:
        return self.role in ["admin", "moderator"]


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Database = Depends(get_db)
) -> AuthUser:
    """
    Verify Firebase token and return authenticated user
    This is the main authentication dependency
    """
    token = credentials.credentials
    
    # Verify Firebase token
    decoded_token = await firebase_auth.verify_token(token)
    if not decoded_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token"
        )
    
    firebase_uid = decoded_token.get("uid")
    email = decoded_token.get("email")
    
    if not firebase_uid or not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload"
        )
    
    # Get or create user in database
    query = """
        SELECT id, firebase_uid, email, role, is_active, is_banned
        FROM users
        WHERE firebase_uid = $1
    """
    user_record = await db.fetch_one(query, firebase_uid)
    
    if not user_record:
        # Auto-create user on first login
        insert_query = """
            INSERT INTO users (firebase_uid, email)
            VALUES ($1, $2)
            RETURNING id, firebase_uid, email, role
        """
        user_record = await db.fetch_one(insert_query, firebase_uid, email)
        logger.info(f"Created new user: {email}")
    
    # Check if user is active (Database layer returns dicts now)
    if not user_record.get('is_active', True) or user_record.get('is_banned', False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive or banned"
        )
    
    # Update last login
    await db.execute(
        "UPDATE users SET last_login = NOW() WHERE id = $1",
        user_record['id']
    )
    
    return AuthUser(
        user_id=str(user_record['id']),
        firebase_uid=user_record['firebase_uid'],
        email=user_record['email'],
        role=user_record['role']
    )


async def require_admin(current_user: AuthUser = Depends(get_current_user)) -> AuthUser:
    """Require admin role"""
    if not current_user.is_admin():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user


async def require_moderator(current_user: AuthUser = Depends(get_current_user)) -> AuthUser:
    """Require moderator or admin role"""
    if not current_user.is_moderator():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Moderator access required"
        )
    return current_user


async def log_activity(
    db: Database,
    user_id: Optional[str],
    action: str,
    resource_type: Optional[str] = None,
    resource_id: Optional[str] = None,
    metadata: Optional[dict] = None,
    request: Optional[Request] = None
):
    """Log user activity"""
    try:
        ip_address = None
        user_agent = None
        
        if request:
            ip_address = request.client.host if request.client else None
            user_agent = request.headers.get("user-agent")
        
        query = """
            INSERT INTO activity_logs 
            (user_id, action, resource_type, resource_id, metadata, ip_address, user_agent)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
        """
        
        await db.execute(
            query,
            user_id,
            action,
            resource_type,
            resource_id,
            metadata,
            ip_address,
            user_agent
        )
    except Exception as e:
        logger.error(f"Failed to log activity: {e}")
