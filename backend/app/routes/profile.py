from fastapi import APIRouter, Depends, HTTPException, Request
from ..core.security import get_current_user, AuthUser, log_activity
from ..core.database import get_db, Database
from ..schemas.user import ProfileCreate, ProfileUpdate, ProfileResponse
from ..repositories.user_repository import UserRepository
from ..core.logging import get_logger

router = APIRouter(prefix="/profile", tags=["Profile"])
logger = get_logger(__name__)


@router.get("/me", response_model=ProfileResponse)
async def get_my_profile(
    current_user: AuthUser = Depends(get_current_user),
    db: Database = Depends(get_db),
    request: Request = None
):
    """Get current user's profile"""
    query = """
        SELECT id, user_id, bio, avatar_url, github_username, linkedin_url,
               website_url, location, skills, created_at, updated_at
        FROM user_profiles
        WHERE user_id = $1
    """
    profile = await db.fetch_one(query, current_user.user_id)

    if not profile:
        # Create default profile if not exists
        insert_query = """
            INSERT INTO user_profiles (user_id)
            VALUES ($1)
            RETURNING id, user_id, bio, avatar_url, github_username, linkedin_url,
                      website_url, location, skills, created_at, updated_at
        """
        profile = await db.fetch_one(insert_query, current_user.user_id)

    await log_activity(db, current_user.user_id, "profile.get_me", request=request)

    return profile


@router.put("/me", response_model=ProfileResponse)
async def update_my_profile(
    profile_data: ProfileUpdate,
    current_user: AuthUser = Depends(get_current_user),
    db: Database = Depends(get_db),
    request: Request = None
):
    """Update current user's profile"""
    # Check if profile exists
    query = "SELECT id FROM user_profiles WHERE user_id = $1"
    existing = await db.fetch_one(query, current_user.user_id)

    if not existing:
        # Create profile first
        insert_query = """
            INSERT INTO user_profiles (user_id, bio, avatar_url, github_username,
                                     linkedin_url, website_url, location, skills)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id, user_id, bio, avatar_url, github_username, linkedin_url,
                      website_url, location, skills, created_at, updated_at
        """
        profile = await db.fetch_one(insert_query, current_user.user_id,
                                   profile_data.bio, profile_data.avatar_url,
                                   profile_data.github_username, profile_data.linkedin_url,
                                   profile_data.website_url, profile_data.location,
                                   profile_data.skills)
    else:
        # Update existing profile
        update_query = """
            UPDATE user_profiles
            SET bio = COALESCE($2, bio),
                avatar_url = COALESCE($3, avatar_url),
                github_username = COALESCE($4, github_username),
                linkedin_url = COALESCE($5, linkedin_url),
                website_url = COALESCE($6, website_url),
                location = COALESCE($7, location),
                skills = COALESCE($8, skills),
                updated_at = NOW()
            WHERE user_id = $1
            RETURNING id, user_id, bio, avatar_url, github_username, linkedin_url,
                      website_url, location, skills, created_at, updated_at
        """
        profile = await db.fetch_one(update_query, current_user.user_id,
                                   profile_data.bio, profile_data.avatar_url,
                                   profile_data.github_username, profile_data.linkedin_url,
                                   profile_data.website_url, profile_data.location,
                                   profile_data.skills)

    await log_activity(db, current_user.user_id, "profile.update_me", request=request)

    return profile


@router.get("/user/{user_id}", response_model=ProfileResponse)
async def get_user_profile(
    user_id: str,
    current_user: AuthUser = Depends(get_current_user),
    db: Database = Depends(get_db),
    request: Request = None
):
    """Get another user's public profile"""
    query = """
        SELECT id, user_id, bio, avatar_url, github_username, linkedin_url,
               website_url, location, skills, created_at, updated_at
        FROM user_profiles
        WHERE user_id = $1
    """
    profile = await db.fetch_one(query, user_id)

    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    await log_activity(db, current_user.user_id, "profile.get_user", request=request,
                      metadata={"target_user_id": user_id})

    return profile
