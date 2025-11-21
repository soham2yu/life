from fastapi import APIRouter, Depends, HTTPException
from app.core.security import require_admin, require_moderator, AuthUser
from app.core.database import get_db, Database
from app.repositories.user_repository import UserRepository
from app.core.logging import get_logger

router = APIRouter(prefix="/admin", tags=["Admin"])
logger = get_logger(__name__)


@router.get("/users")
async def get_all_users(
    limit: int = 100,
    offset: int = 0,
    current_user: AuthUser = Depends(require_moderator),
    db: Database = Depends(get_db)
):
    """Get all users (moderator/admin only)"""
    repo = UserRepository(db)
    users = await repo.get_all(limit, offset)
    return users


@router.get("/users/{user_id}")
async def get_user_details(
    user_id: str,
    current_user: AuthUser = Depends(require_moderator),
    db: Database = Depends(get_db)
):
    """Get detailed user information (moderator/admin only)"""
    repo = UserRepository(db)
    user = await repo.get_by_id(user_id)
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    query = "SELECT * FROM get_user_stats($1)"
    stats = await db.fetch_one(query, user_id)
    
    return {
        "user": user,
        "stats": stats
    }


@router.get("/scores")
async def get_all_scores(
    limit: int = 100,
    current_user: AuthUser = Depends(require_moderator),
    db: Database = Depends(get_db)
):
    """Get all user scores (moderator/admin only)"""
    query = """
        SELECT u.id, u.email, u.display_name,
               ls.composite_score as lifescore,
               ls.cognitive_score,
               ls.portfolio_score,
               ls.endorsement_score,
               ls.rank,
               ls.created_at
        FROM users u
        LEFT JOIN latest_lifescores ls ON u.id = ls.user_id
        ORDER BY ls.composite_score DESC NULLS LAST
        LIMIT $1
    """
    scores = await db.fetch_all(query, limit)
    return scores


@router.post("/users/{user_id}/ban")
async def ban_user(
    user_id: str,
    current_user: AuthUser = Depends(require_admin),
    db: Database = Depends(get_db)
):
    """Ban a user (admin only)"""
    if user_id == current_user.user_id:
        raise HTTPException(status_code=400, detail="Cannot ban yourself")
    
    repo = UserRepository(db)
    await repo.ban_user(user_id)
    
    logger.info(f"User {user_id} banned by admin {current_user.user_id}")
    
    return {"message": "User banned successfully"}


@router.delete("/users/{user_id}")
async def delete_user(
    user_id: str,
    current_user: AuthUser = Depends(require_admin),
    db: Database = Depends(get_db)
):
    """Delete a user permanently (admin only)"""
    if user_id == current_user.user_id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")
    
    repo = UserRepository(db)
    await repo.delete(user_id)
    
    logger.warning(f"User {user_id} deleted by admin {current_user.user_id}")
    
    return {"message": "User deleted successfully"}


@router.get("/activity-logs")
async def get_activity_logs(
    limit: int = 100,
    offset: int = 0,
    current_user: AuthUser = Depends(require_moderator),
    db: Database = Depends(get_db)
):
    """Get activity logs (moderator/admin only)"""
    query = """
        SELECT al.id, al.user_id, u.email, al.action, al.resource_type,
               al.resource_id, al.metadata, al.ip_address, al.created_at
        FROM activity_logs al
        LEFT JOIN users u ON al.user_id = u.id
        ORDER BY al.created_at DESC
        LIMIT $1 OFFSET $2
    """
    logs = await db.fetch_all(query, limit, offset)
    return logs
