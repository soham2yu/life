from pydantic import BaseModel, HttpUrl
from typing import Optional, List
from datetime import datetime


class ProfileCreate(BaseModel):
    bio: Optional[str] = None
    github_username: Optional[str] = None
    linkedin_url: Optional[str] = None
    website_url: Optional[str] = None
    location: Optional[str] = None
    skills: Optional[List[str]] = None


class ProfileUpdate(BaseModel):
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    github_username: Optional[str] = None
    linkedin_url: Optional[str] = None
    website_url: Optional[str] = None
    location: Optional[str] = None
    skills: Optional[List[str]] = None


class ProfileResponse(BaseModel):
    id: str
    user_id: str
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    github_username: Optional[str] = None
    linkedin_url: Optional[str] = None
    website_url: Optional[str] = None
    location: Optional[str] = None
    skills: Optional[List[str]] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
