"""
Activity Log Model
===================

Pydantic model for activity log MongoDB documents.
Captures all user actions across the system for auditing.
"""

from datetime import datetime
from typing import Optional, Dict, Any

from pydantic import BaseModel, ConfigDict, Field
from bson import ObjectId

from database.models import PyObjectId


class ActivityLogModel(BaseModel):
    """Activity log document for auditing all user actions."""

    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    user_id: str  # ID of the user who performed the action
    user_email: str
    user_role: str  # "candidate", "recruiter", "superuser"
    action_type: str  # e.g. "user_login", "cv_upload", "job_create", "profile_edit"
    action_detail: Dict[str, Any] = Field(default_factory=dict)  # Extra context
    ip_address: Optional[str] = None
    resource_type: Optional[str] = None  # e.g. "job_description", "cv", "screening"
    resource_id: Optional[str] = None  # ID of the affected resource
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    model_config = ConfigDict(
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str},
        populate_by_name=True,
    )
