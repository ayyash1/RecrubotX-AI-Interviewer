"""
Job Posting Model for MongoDB
"""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict
from bson import ObjectId


class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, field_schema):
        field_schema.update(type="string")


class JobPostingModel(BaseModel):
    """Job posting model for recruiters."""
    
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    recruiter_id: str  # ID of the recruiter who created this job
    interview_field: str  # Field/domain of the job (e.g., "Software Engineering")
    position_level: str  # Level (e.g., "Junior", "Mid-level", "Senior")
    number_of_questions: int  # Number of interview questions
    top_n_cvs: int  # Number of top CVs to shortlist
    work_model: str  # Work model (Remote, Onsite, Hybrid)
    status: str  # Employment status (Full-time, Part-time, Contract)
    location: str  # Job location
    salary_range: str  # Salary range (e.g., "$70k - $150k")
    number_of_vacancies: int = 1  # Number of open positions
    cv_file_ids: Optional[List[str]] = []  # Array of ObjectIds referencing job_cv_files collection
    job_description: Optional[str] = None  # Optional job description
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = True
    
    model_config = ConfigDict(
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str},
        populate_by_name=True,
    )
