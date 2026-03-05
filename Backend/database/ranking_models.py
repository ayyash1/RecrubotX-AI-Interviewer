"""
Candidate Ranking and Evaluation Models
"""

from datetime import datetime
from typing import Optional, List, Dict, Any
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


class CandidateRankingModel(BaseModel):
    """Candidate ranking model after CV screening."""
    
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    job_posting_id: str  # Reference to job posting
    recruiter_id: str
    candidate_id: str = ""  # Generated candidate identifier
    candidate_name: str
    email: str = ""  # Email extracted from CV
    rank: int
    score: float = 0.0  # Overall final score out of 100
    cv_score: float = 0.0  # CV screening score out of 100
    cv_technical_score: float = 0.0
    cv_experience_score: float = 0.0
    cv_project_score: float = 0.0
    cv_education_score: float = 0.0
    interview_score: float = 0.0  # Interview performance score out of 100
    technical_score: float = 0.0
    communication_score: float = 0.0
    confidence_score: float = 0.0
    facial_recognition_score: float = 0.0  # Facial analysis score out of 100
    completion: int  # Completion percentage
    interview_status: str  # "Shortlisted", "Review", "Not Selected"
    cv_data: Optional[Dict[str, Any]] = None  # Parsed CV data
    evaluation_details: Optional[Dict[str, Any]] = None  # Detailed evaluation
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    model_config = ConfigDict(
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str},
        populate_by_name=True,
    )


class EvaluationReportModel(BaseModel):
    """Evaluation report model for candidates."""
    
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    job_posting_id: str
    recruiter_id: str
    candidate_ranking_id: str  # Reference to ranking
    candidate_name: str
    position: str
    overall_score: float
    skill_scores: Dict[str, float]  # {"Technical Skills": 85, "Communication": 90, etc.}
    detailed_analysis: Optional[str] = None
    recommendations: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    model_config = ConfigDict(
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str},
        populate_by_name=True,
    )
