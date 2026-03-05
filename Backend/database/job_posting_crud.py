"""
Job Posting CRUD Operations
"""

from datetime import datetime
from typing import List, Optional, Dict, Any
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase


async def create_job_posting(
    db: AsyncIOMotorDatabase,
    recruiter_id: str,
    interview_field: str,
    position_level: str,
    work_model: str,
    status: str,
    location: str,
    salary_range: str,
    experience_range: str,
    industry_domain: str,
    questions: List[Dict[str, Any]],
    specific_instruction: Optional[str] = None,
    job_description: Optional[str] = None,
    deadline: Optional[datetime] = None,
    number_of_vacancies: int = 1
) -> str:
    """Create a new job posting."""
    job_posting = {
        "recruiter_id": recruiter_id,
        "interview_field": interview_field,
        "position_level": position_level,
        "work_model": work_model,
        "status": status,
        "location": location,
        "salary_range": salary_range,
        "experience_range": experience_range,
        "industry_domain": industry_domain,
        "number_of_vacancies": number_of_vacancies,
        "questions": questions,
        "specific_instruction": specific_instruction,
        "cv_file_ids": [],
        "job_description": job_description,
        "deadline": deadline,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "is_active": True
    }
    result = await db.job_postings.insert_one(job_posting)
    return str(result.inserted_id)


async def get_job_posting_by_id(
    db: AsyncIOMotorDatabase,
    job_id: str
) -> Optional[Dict[str, Any]]:
    """Get a job posting by ID."""
    job = await db.job_postings.find_one({"_id": ObjectId(job_id)})
    if job:
        job["_id"] = str(job["_id"])
    return job


async def get_job_postings_by_recruiter(
    db: AsyncIOMotorDatabase,
    recruiter_id: str
) -> List[Dict[str, Any]]:
    """Get all job postings by a specific recruiter."""
    jobs = []
    cursor = db.job_postings.find({"recruiter_id": recruiter_id})
    async for job in cursor:
        job["_id"] = str(job["_id"])
        jobs.append(job)
    return jobs


async def get_all_job_postings(
    db: AsyncIOMotorDatabase
) -> List[Dict[str, Any]]:
    """Get all job postings."""
    jobs = []
    cursor = db.job_postings.find({})
    async for job in cursor:
        job["_id"] = str(job["_id"])
        jobs.append(job)
    return jobs


async def update_job_posting(
    db: AsyncIOMotorDatabase,
    job_id: str,
    update_data: Dict[str, Any]
) -> bool:
    """Update job posting information."""
    update_data["updated_at"] = datetime.utcnow()
    result = await db.job_postings.update_one(
        {"_id": ObjectId(job_id)},
        {"$set": update_data}
    )
    return result.modified_count > 0


async def delete_job_posting(
    db: AsyncIOMotorDatabase,
    job_id: str
) -> bool:
    """Delete a job posting and all associated data."""
    # Delete associated candidate rankings
    await db.candidate_rankings.delete_many({"job_posting_id": job_id})
    
    # Delete associated evaluation reports
    await db.evaluation_reports.delete_many({"job_posting_id": job_id})
    
    # Delete associated CV files from job_cv_files collection
    await db.job_cv_files.delete_many({"job_posting_id": job_id})
    
    # Delete the job posting itself
    result = await db.job_postings.delete_one({"_id": ObjectId(job_id)})
    return result.deleted_count > 0


# ==================== Job CV Files (Reference Pattern) ====================

async def create_job_cv_file(
    db: AsyncIOMotorDatabase,
    job_posting_id: str,
    file_name: str,
    file_content: Any,  # str or bytes
    file_size: int
) -> str:
    """
    Store a single CV file in the job_cv_files collection.
    Each CV is stored as a separate document to avoid the 16MB limit.
    """
    cv_file = {
        "job_posting_id": job_posting_id,
        "file_name": file_name,
        "file_content": file_content,
        "file_size": file_size,
        "created_at": datetime.utcnow()
    }
    result = await db.job_cv_files.insert_one(cv_file)
    return str(result.inserted_id)


async def add_cv_to_job(
    db: AsyncIOMotorDatabase,
    job_id: str,
    cv_file_id: str
) -> bool:
    """Add a CV file ID to the job posting's cv_file_ids list."""
    result = await db.job_postings.update_one(
        {"_id": ObjectId(job_id)},
        {"$push": {"cv_file_ids": ObjectId(cv_file_id)}}
    )
    return result.modified_count > 0


async def get_job_cv_file_by_id(
    db: AsyncIOMotorDatabase,
    cv_file_id: str
) -> Optional[Dict[str, Any]]:
    """Get a single CV file by its ID."""
    cv_file = await db.job_cv_files.find_one({"_id": ObjectId(cv_file_id)})
    if cv_file:
        cv_file["_id"] = str(cv_file["_id"])
    return cv_file


async def get_cv_files_by_job_posting(
    db: AsyncIOMotorDatabase,
    job_posting_id: str
) -> List[Dict[str, Any]]:
    """Get all CV files associated with a job posting."""
    cv_files = []
    cursor = db.job_cv_files.find({"job_posting_id": job_posting_id})
    async for cv_file in cursor:
        cv_file["_id"] = str(cv_file["_id"])
        cv_files.append(cv_file)
    return cv_files


async def get_cv_files_by_ids(
    db: AsyncIOMotorDatabase,
    cv_file_ids: List[str]
) -> List[Dict[str, Any]]:
    """Get multiple CV files by their IDs."""
    cv_files = []
    object_ids = [ObjectId(cid) for cid in cv_file_ids]
    cursor = db.job_cv_files.find({"_id": {"$in": object_ids}})
    async for cv_file in cursor:
        cv_file["_id"] = str(cv_file["_id"])
        cv_files.append(cv_file)
    return cv_files


async def count_cv_files_for_job(
    db: AsyncIOMotorDatabase,
    job_posting_id: str
) -> int:
    """Count the number of CV files for a job posting."""
    return await db.job_cv_files.count_documents({"job_posting_id": job_posting_id})


# ==================== Job Vacancies (One-Per-Candidate) ====================

async def record_application(
    db: AsyncIOMotorDatabase,
    job_id: str,
    candidate_id: str,
    candidate_email: str
) -> str:
    """Record that a candidate has applied to a job. Prevents duplicates."""
    existing = await db.job_applications.find_one({
        "job_id": job_id,
        "candidate_id": candidate_id
    })
    if existing:
        return str(existing["_id"])
    doc = {
        "job_id": job_id,
        "candidate_id": candidate_id,
        "candidate_email": candidate_email,
        "applied_at": datetime.utcnow()
    }
    result = await db.job_applications.insert_one(doc)
    return str(result.inserted_id)


async def has_candidate_applied(
    db: AsyncIOMotorDatabase,
    job_id: str,
    candidate_id: str
) -> bool:
    """Check if a candidate has already applied to a job."""
    existing = await db.job_applications.find_one({
        "job_id": job_id,
        "candidate_id": candidate_id
    })
    return existing is not None


async def get_applications_for_job(
    db: AsyncIOMotorDatabase,
    job_id: str
) -> List[Dict[str, Any]]:
    """Get all applications for a job."""
    apps = []
    cursor = db.job_applications.find({"job_id": job_id})
    async for app in cursor:
        app["_id"] = str(app["_id"])
        apps.append(app)
    return apps


async def get_candidate_applications(
    db: AsyncIOMotorDatabase,
    candidate_id: str
) -> List[str]:
    """Get all job IDs a candidate has applied to."""
    job_ids = []
    cursor = db.job_applications.find({"candidate_id": candidate_id}, {"job_id": 1})
    async for app in cursor:
        job_ids.append(app["job_id"])
    return job_ids


async def get_candidate_applications_with_dates(
    db: AsyncIOMotorDatabase,
    candidate_id: str
) -> List[Dict[str, Any]]:
    """Get all job vacancies for a candidate with their applied_at timestamps."""
    apps = []
    cursor = db.job_applications.find(
        {"candidate_id": candidate_id},
        {"job_id": 1, "applied_at": 1}
    ).sort("applied_at", -1)
    async for app in cursor:
        apps.append({
            "jobId": app["job_id"],
            "appliedAt": app.get("applied_at", datetime.utcnow()).isoformat() + "Z"
        })
    return apps


# ==================== Auto-Close Expired Jobs ====================

async def close_expired_jobs(db: AsyncIOMotorDatabase) -> int:
    """Close all jobs whose deadline has passed. Returns count of closed jobs."""
    now = datetime.utcnow()
    result = await db.job_postings.update_many(
        {
            "deadline": {"$lte": now, "$ne": None},
            "is_active": True
        },
        {"$set": {"is_active": False, "updated_at": now}}
    )
    return result.modified_count
