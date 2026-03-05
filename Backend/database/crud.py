"""
Database CRUD Operations
=========================

Helper functions for database operations.
"""

from datetime import datetime
from typing import List, Optional, Dict, Any
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from database.models import (
    JobDescriptionModel,
    CVModel,
    ScreeningResultModel,
    ScreeningBatchModel,
    InterviewCVModel
)


# ==================== Job Descriptions ====================

async def create_job_description(
    db: AsyncIOMotorDatabase,
    title: str,
    content: str
) -> str:
    """Create a new job description."""
    jd = {
        "title": title,
        "content": content,
        "is_active": True,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    result = await db.job_descriptions.insert_one(jd)
    return str(result.inserted_id)


async def get_job_description(
    db: AsyncIOMotorDatabase,
    jd_id: str
) -> Optional[Dict[str, Any]]:
    """Get a job description by ID."""
    jd = await db.job_descriptions.find_one({"_id": ObjectId(jd_id)})
    if jd:
        jd["_id"] = str(jd["_id"])
    return jd


async def get_active_job_description(
    db: AsyncIOMotorDatabase
) -> Optional[Dict[str, Any]]:
    """Get the most recent active job description."""
    jd = await db.job_descriptions.find_one(
        {"is_active": True},
        sort=[("created_at", -1)]
    )
    if jd:
        jd["_id"] = str(jd["_id"])
    return jd


async def update_job_description(
    db: AsyncIOMotorDatabase,
    jd_id: str,
    content: str
) -> bool:
    """Update a job description."""
    result = await db.job_descriptions.update_one(
        {"_id": ObjectId(jd_id)},
        {"$set": {"content": content, "updated_at": datetime.utcnow()}}
    )
    return result.modified_count > 0


async def deactivate_all_job_descriptions(db: AsyncIOMotorDatabase):
    """Deactivate all job descriptions."""
    await db.job_descriptions.update_many(
        {},
        {"$set": {"is_active": False}}
    )


# ==================== CVs ====================

async def create_cv(
    db: AsyncIOMotorDatabase,
    file_name: str,
    content: str,
    file_size: int
) -> str:
    """Create a new CV record."""
    cv = {
        "file_name": file_name,
        "content": content,
        "file_size": file_size,
        "uploaded_at": datetime.utcnow()
    }
    result = await db.cvs.insert_one(cv)
    return str(result.inserted_id)


async def get_cv(
    db: AsyncIOMotorDatabase,
    cv_id: str
) -> Optional[Dict[str, Any]]:
    """Get a CV by ID."""
    cv = await db.cvs.find_one({"_id": ObjectId(cv_id)})
    if cv:
        cv["_id"] = str(cv["_id"])
    return cv


async def get_recent_cvs(
    db: AsyncIOMotorDatabase,
    limit: int = 10
) -> List[Dict[str, Any]]:
    """Get recent CVs."""
    cursor = db.cvs.find().sort("uploaded_at", -1).limit(limit)
    cvs = await cursor.to_list(length=limit)
    for cv in cvs:
        cv["_id"] = str(cv["_id"])
    return cvs


async def delete_cv(
    db: AsyncIOMotorDatabase,
    cv_id: str
) -> bool:
    """Delete a CV."""
    result = await db.cvs.delete_one({"_id": ObjectId(cv_id)})
    return result.deleted_count > 0


# ==================== Screening Results ====================

async def create_screening_result(
    db: AsyncIOMotorDatabase,
    jd_id: str,
    cv_id: str,
    result_data: Dict[str, Any]
) -> str:
    """Create a screening result."""
    result = {
        "job_description_id": ObjectId(jd_id),
        "cv_id": ObjectId(cv_id),
        "candidate_name": result_data.get("candidate_name", "Unknown"),
        "file_name": result_data.get("file_name", ""),
        "overall_score": float(result_data.get("overall_score", 0)),
        "skills_match": float(result_data.get("skills_match", 0)),
        "experience_match": float(result_data.get("experience_match", 0)),
        "education_match": float(result_data.get("education_match", 0)),
        "strengths": result_data.get("strengths", []),
        "weaknesses": result_data.get("weaknesses", []),
        "recommendation": result_data.get("recommendation", ""),
        "summary": result_data.get("summary", ""),
        "created_at": datetime.utcnow()
    }
    res = await db.screening_results.insert_one(result)
    return str(res.inserted_id)


async def get_screening_results_by_jd(
    db: AsyncIOMotorDatabase,
    jd_id: str
) -> List[Dict[str, Any]]:
    """Get all screening results for a job description."""
    cursor = db.screening_results.find(
        {"job_description_id": ObjectId(jd_id)}
    ).sort("overall_score", -1)
    
    results = await cursor.to_list(length=None)
    for result in results:
        result["_id"] = str(result["_id"])
        result["job_description_id"] = str(result["job_description_id"])
        result["cv_id"] = str(result["cv_id"])
    
    return results


async def get_top_candidates(
    db: AsyncIOMotorDatabase,
    jd_id: str,
    limit: int = 10
) -> List[Dict[str, Any]]:
    """Get top candidates for a job description."""
    cursor = db.screening_results.find(
        {"job_description_id": ObjectId(jd_id)}
    ).sort("overall_score", -1).limit(limit)
    
    results = await cursor.to_list(length=limit)
    for result in results:
        result["_id"] = str(result["_id"])
        result["job_description_id"] = str(result["job_description_id"])
        result["cv_id"] = str(result["cv_id"])
    
    return results


# ==================== Batch Operations ====================

async def create_screening_batch(
    db: AsyncIOMotorDatabase,
    jd_id: str,
    cv_ids: List[str]
) -> str:
    """Create a screening batch."""
    batch = {
        "job_description_id": ObjectId(jd_id),
        "cv_ids": [ObjectId(cv_id) for cv_id in cv_ids],
        "result_ids": [],
        "total_candidates": len(cv_ids),
        "created_at": datetime.utcnow(),
        "completed_at": None
    }
    result = await db.screening_batches.insert_one(batch)
    return str(result.inserted_id)


async def update_batch_results(
    db: AsyncIOMotorDatabase,
    batch_id: str,
    result_ids: List[str]
):
    """Update batch with screening results."""
    await db.screening_batches.update_one(
        {"_id": ObjectId(batch_id)},
        {
            "$set": {
                "result_ids": [ObjectId(rid) for rid in result_ids],
                "completed_at": datetime.utcnow()
            }
        }
    )


# ==================== Statistics ====================

async def get_statistics(db: AsyncIOMotorDatabase) -> Dict[str, Any]:
    """Get database statistics."""
    total_jds = await db.job_descriptions.count_documents({})
    active_jds = await db.job_descriptions.count_documents({"is_active": True})
    total_cvs = await db.cvs.count_documents({})
    total_screenings = await db.screening_results.count_documents({})
    
    return {
        "total_job_descriptions": total_jds,
        "active_job_descriptions": active_jds,
        "total_cvs": total_cvs,
        "total_screenings": total_screenings
    }


# ==================== Candidates ====================

async def create_candidate_user(
    db: AsyncIOMotorDatabase,
    first_name: str,
    last_name: str,
    email: str,
    password: str
) -> str:
    """Create a new candidate user with bcrypt-hashed password."""
    import bcrypt
    password_hash = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    user = {
        "first_name": first_name,
        "last_name": last_name,
        "email": email.lower(),
        "password": password_hash,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "is_active": True
    }
    result = await db.candidates.insert_one(user)
    return str(result.inserted_id)


async def get_user_by_email(
    db: AsyncIOMotorDatabase,
    email: str
) -> Optional[Dict[str, Any]]:
    """Get a user by email."""
    user = await db.candidates.find_one({"email": email.lower()})
    if user:
        user["_id"] = str(user["_id"])
    return user


async def get_user_by_id(
    db: AsyncIOMotorDatabase,
    user_id: str
) -> Optional[Dict[str, Any]]:
    """Get a user by ID."""
    user = await db.candidates.find_one({"_id": ObjectId(user_id)})
    if user:
        user["_id"] = str(user["_id"])
    return user


async def get_all_users(
    db: AsyncIOMotorDatabase
) -> List[Dict[str, Any]]:
    """Get all candidate users."""
    users = []
    cursor = db.candidates.find({})
    async for user in cursor:
        user["_id"] = str(user["_id"])
        users.append(user)
    return users


async def update_user(
    db: AsyncIOMotorDatabase,
    user_id: str,
    update_data: Dict[str, Any]
) -> bool:
    """Update user information."""
    update_data["updated_at"] = datetime.utcnow()
    result = await db.candidates.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": update_data}
    )
    return result.modified_count > 0


# ==================== Recruiters ====================

async def create_recruiter_user(
    db: AsyncIOMotorDatabase,
    first_name: str,
    last_name: str,
    email: str,
    password: str,
    company: str,
) -> str:
    """Create a new recruiter user with bcrypt-hashed password."""
    import bcrypt

    password_hash = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    recruiter = {
        "first_name": first_name,
        "last_name": last_name,
        "company": company,
        "email": email.lower(),
        "password": password_hash,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "is_active": True,
    }
    result = await db.recruiters.insert_one(recruiter)
    return str(result.inserted_id)


async def get_recruiter_by_email(
    db: AsyncIOMotorDatabase,
    email: str,
) -> Optional[Dict[str, Any]]:
    recruiter = await db.recruiters.find_one({"email": email.lower()})
    if recruiter:
        recruiter["_id"] = str(recruiter["_id"])
    return recruiter


async def get_recruiter_by_id(
    db: AsyncIOMotorDatabase,
    recruiter_id: str,
) -> Optional[Dict[str, Any]]:
    recruiter = await db.recruiters.find_one({"_id": ObjectId(recruiter_id)})
    if recruiter:
        recruiter["_id"] = str(recruiter["_id"])
    return recruiter


# ==================== Interview CV Details ====================

async def create_interview_cv(
    db: AsyncIOMotorDatabase,
    session_id: str,
    cv_data: Dict[str, Any]
) -> str:
    """Create a new interview CV record with extracted details."""
    interview_cv = {
        "session_id": session_id,
        "candidate_name": cv_data.get("candidate_name"),
        "phone_number": cv_data.get("phone_number"),
        "email_address": cv_data.get("email_address"),
        "linkedin_profile": cv_data.get("linkedin_profile"),
        "education": cv_data.get("education", []),
        "projects": cv_data.get("projects", []),
        "skills": cv_data.get("skills", []),
        "experience": cv_data.get("experience"),
        "certifications": cv_data.get("certifications", []),
        "summary": cv_data.get("summary"),
        "cv_file_name": cv_data.get("cv_file_name"),
        "cv_file_path": cv_data.get("cv_file_path"),
        "job_id": cv_data.get("job_id"),
        "interview_field": cv_data.get("interview_field"),
        "position_level": cv_data.get("position_level"),
        "parsed_cv": cv_data.get("parsed_cv"),
        "created_at": datetime.utcnow()
    }
    result = await db.interview_cvs.insert_one(interview_cv)
    return str(result.inserted_id)


async def get_interview_cv_by_session(
    db: AsyncIOMotorDatabase,
    session_id: str
) -> Optional[Dict[str, Any]]:
    """Get interview CV details by session ID."""
    cv = await db.interview_cvs.find_one({"session_id": session_id})
    if cv:
        cv["_id"] = str(cv["_id"])
    return cv


async def get_interview_cv_by_id(
    db: AsyncIOMotorDatabase,
    cv_id: str
) -> Optional[Dict[str, Any]]:
    """Get interview CV details by ID."""
    cv = await db.interview_cvs.find_one({"_id": ObjectId(cv_id)})
    if cv:
        cv["_id"] = str(cv["_id"])
    return cv


async def get_all_interview_cvs(
    db: AsyncIOMotorDatabase,
    limit: int = 100
) -> List[Dict[str, Any]]:
    """Get all interview CV records."""
    cvs = []
    cursor = db.interview_cvs.find({}).sort("created_at", -1).limit(limit)
    async for cv in cursor:
        cv["_id"] = str(cv["_id"])
        cvs.append(cv)
    return cvs


async def update_interview_cv(
    db: AsyncIOMotorDatabase,
    cv_id: str,
    update_data: Dict[str, Any]
) -> bool:
    """Update interview CV information."""
    result = await db.interview_cvs.update_one(
        {"_id": ObjectId(cv_id)},
        {"$set": update_data}
    )
    return result.modified_count > 0
