"""
Candidate Ranking and Evaluation CRUD Operations
"""

from datetime import datetime
from typing import List, Optional, Dict, Any
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase


# ==================== Candidate Rankings ====================

async def create_candidate_ranking(
    db: AsyncIOMotorDatabase,
    job_posting_id: str,
    recruiter_id: str,
    candidate_name: str,
    rank: int,
    score: float = 0.0,
    candidate_id: str = "",
    email: str = "",
    cv_score: float = 0.0,
    cv_technical_score: float = 0.0,
    cv_experience_score: float = 0.0,
    cv_project_score: float = 0.0,
    cv_education_score: float = 0.0,
    interview_score: float = 0.0,
    technical_score: float = 0.0,
    communication_score: float = 0.0,
    confidence_score: float = 0.0,
    facial_recognition_score: float = 0.0,
    completion: int = 100,
    interview_status: str = "Pending",
    cv_data: Optional[Dict[str, Any]] = None,
    evaluation_details: Optional[Dict[str, Any]] = None
) -> str:
    """Create a new candidate ranking with individual scores."""
    ranking = {
        "job_posting_id": job_posting_id,
        "recruiter_id": recruiter_id,
        "candidate_id": candidate_id,
        "candidate_name": candidate_name,
        "email": email,
        "rank": rank,
        "score": score,  # Final weighted score
        "cv_score": cv_score,
        "cv_technical_score": cv_technical_score,
        "cv_experience_score": cv_experience_score,
        "cv_project_score": cv_project_score,
        "cv_education_score": cv_education_score,
        "interview_score": interview_score,
        "technical_score": technical_score,
        "communication_score": communication_score,
        "confidence_score": confidence_score,
        "facial_recognition_score": facial_recognition_score,
        "completion": completion,
        "interview_status": interview_status,
        "cv_data": cv_data,
        "evaluation_details": evaluation_details,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    result = await db.candidate_rankings.insert_one(ranking)
    return str(result.inserted_id)


async def get_rankings_by_job(
    db: AsyncIOMotorDatabase,
    job_posting_id: str
) -> List[Dict[str, Any]]:
    """Get all candidate rankings for a specific job."""
    rankings = []
    cursor = db.candidate_rankings.find({"job_posting_id": job_posting_id}).sort("rank", 1)
    async for ranking in cursor:
        ranking["_id"] = str(ranking["_id"])
        rankings.append(ranking)
    return rankings


async def get_rankings_by_recruiter(
    db: AsyncIOMotorDatabase,
    recruiter_id: str
) -> List[Dict[str, Any]]:
    """Get all candidate rankings by recruiter."""
    rankings = []
    cursor = db.candidate_rankings.find({"recruiter_id": recruiter_id}).sort("created_at", -1)
    async for ranking in cursor:
        ranking["_id"] = str(ranking["_id"])
        rankings.append(ranking)
    return rankings


async def update_ranking_status(
    db: AsyncIOMotorDatabase,
    ranking_id: str,
    status: str
) -> bool:
    """Update candidate interview status."""
    result = await db.candidate_rankings.update_one(
        {"_id": ObjectId(ranking_id)},
        {"$set": {"interview_status": status, "updated_at": datetime.utcnow()}}
    )
    return result.modified_count > 0


# ==================== Evaluation Reports ====================

async def create_evaluation_report(
    db: AsyncIOMotorDatabase,
    job_posting_id: str,
    recruiter_id: str,
    candidate_ranking_id: str,
    candidate_name: str,
    position: str,
    overall_score: float,
    skill_scores: Dict[str, float],
    detailed_analysis: Optional[str] = None,
    recommendations: Optional[str] = None
) -> str:
    """Create a new evaluation report."""
    report = {
        "job_posting_id": job_posting_id,
        "recruiter_id": recruiter_id,
        "candidate_ranking_id": candidate_ranking_id,
        "candidate_name": candidate_name,
        "position": position,
        "overall_score": overall_score,
        "skill_scores": skill_scores,
        "detailed_analysis": detailed_analysis,
        "recommendations": recommendations,
        "created_at": datetime.utcnow()
    }
    result = await db.evaluation_reports.insert_one(report)
    return str(result.inserted_id)


async def get_evaluations_by_job(
    db: AsyncIOMotorDatabase,
    job_posting_id: str
) -> List[Dict[str, Any]]:
    """Get all evaluation reports for a specific job."""
    reports = []
    cursor = db.evaluation_reports.find({"job_posting_id": job_posting_id})
    async for report in cursor:
        report["_id"] = str(report["_id"])
        reports.append(report)
    return reports


async def get_evaluations_by_recruiter(
    db: AsyncIOMotorDatabase,
    recruiter_id: str
) -> List[Dict[str, Any]]:
    """Get all evaluation reports by recruiter."""
    reports = []
    cursor = db.evaluation_reports.find({"recruiter_id": recruiter_id})
    async for report in cursor:
        report["_id"] = str(report["_id"])
        reports.append(report)
    return reports


async def get_evaluation_by_id(
    db: AsyncIOMotorDatabase,
    evaluation_id: str
) -> Optional[Dict[str, Any]]:
    """Get a specific evaluation report."""
    report = await db.evaluation_reports.find_one({"_id": ObjectId(evaluation_id)})
    if report:
        report["_id"] = str(report["_id"])
    return report
