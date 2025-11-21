from fastapi import APIRouter, Depends, HTTPException, Request
from app.core.security import get_current_user, AuthUser, log_activity
from app.core.database import get_db, Database
from app.schemas.auth import UserResponse
from app.core.logging import get_logger

router = APIRouter(prefix="/auth", tags=["Authentication"])
logger = get_logger(__name__)


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: AuthUser = Depends(get_current_user),
    db: Database = Depends(get_db),
    request: Request = None
):
    """Get current authenticated user information"""
    query = """
        SELECT id, firebase_uid, email, display_name, role, is_active, created_at, last_login
        FROM users
        WHERE id = $1
    """
    user = await db.fetch_one(query, current_user.user_id)
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    await log_activity(db, current_user.user_id, "auth.me", request=request)
    
    return user


@router.post("/verify")
async def verify_token(
    current_user: AuthUser = Depends(get_current_user),
    db: Database = Depends(get_db)
):
    """Verify Firebase token (implicitly done by dependency)"""
    return {
        "valid": True,
        "user_id": current_user.user_id,
        "email": current_user.email
    }
