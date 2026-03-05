"""
Superuser Model
================

Pydantic model for the superuser MongoDB document.
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field
from bson import ObjectId

from database.models import PyObjectId


class SuperuserModel(BaseModel):
    """Superuser account model with hashed password."""

    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    email: str
    password_hash: str  # bcrypt hashed
    first_name: str
    last_name: str
    role: str = "superuser"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = True

    model_config = ConfigDict(
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str},
        populate_by_name=True,
    )
