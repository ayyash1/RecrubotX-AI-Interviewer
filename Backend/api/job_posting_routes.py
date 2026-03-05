"""
Job Posting API Routes
"""

from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from bson import ObjectId
from database.connection import get_database
from database.job_posting_crud import (
    create_job_posting,
    get_job_posting_by_id,
    get_job_postings_by_recruiter,
    get_all_job_postings,
    update_job_posting,
    delete_job_posting,
    create_job_cv_file,
    get_cv_files_by_ids,
    count_cv_files_for_job,
    record_application,
    has_candidate_applied,
    get_candidate_applications,
    get_candidate_applications_with_dates,
    close_expired_jobs
)

router = APIRouter(prefix="/jobs", tags=["Job Postings"])


class JobQuestion(BaseModel):
    text: str
    type: str  # e.g., "behavioral", "technical"
    difficulty: str  # e.g., "easy", "medium", "hard"


class JobPostingRequest(BaseModel):
    recruiterId: str
    interviewField: str
    positionLevel: str
    workModel: str
    status: str  # Employment Status
    location: str
    salaryRange: str
    experienceRange: str
    industryDomain: str
    numberOfVacancies: int = 1
    questions: Optional[List[JobQuestion]] = []
    specificInstruction: Optional[str] = None
    jobDescription: Optional[str] = None
    deadline: Optional[str] = None  # ISO date string e.g. "2026-03-15"


class JobPostingUpdateRequest(BaseModel):
    interviewField: Optional[str] = None
    positionLevel: Optional[str] = None
    workModel: Optional[str] = None
    status: Optional[str] = None
    location: Optional[str] = None
    salaryRange: Optional[str] = None
    experienceRange: Optional[str] = None
    industryDomain: Optional[str] = None
    numberOfVacancies: Optional[int] = None
    questions: Optional[List[JobQuestion]] = None
    specificInstruction: Optional[str] = None
    jobDescription: Optional[str] = None
    deadline: Optional[str] = None


@router.post("/create", response_model=dict)
async def create_job(
    job_data: JobPostingRequest,
    db=Depends(get_database)
):
    """
    Create a new job posting.
    
    NOTE: This endpoint ONLY creates a job posting. 
    To screen CVs and create rankings, use the CV Screening page (/api/screen-cvs-batch).
    
    Uses Reference Pattern: CVs are stored individually in job_cv_files collection,
    and only the IDs are stored in the job posting document.
    """
    if db is None:
        raise HTTPException(
            status_code=503,
            detail="Database connection unavailable. MongoDB is not connected."
        )
    
    # Parse deadline if provided
    parsed_deadline = None
    if job_data.deadline:
        try:
            parsed_deadline = datetime.fromisoformat(job_data.deadline.replace("Z", "+00:00"))
        except ValueError:
            try:
                parsed_deadline = datetime.strptime(job_data.deadline, "%Y-%m-%d")
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid deadline format. Use YYYY-MM-DD.")

    # Close any already-expired jobs first
    await close_expired_jobs(db)

    # Create job posting
    job_id = await create_job_posting(
        db,
        job_data.recruiterId,
        job_data.interviewField,
        job_data.positionLevel,
        job_data.workModel,
        job_data.status,
        job_data.location,
        job_data.salaryRange,
        job_data.experienceRange,
        job_data.industryDomain,
        [q.dict() for q in job_data.questions],
        job_data.specificInstruction,
        job_data.jobDescription,
        parsed_deadline,
        job_data.numberOfVacancies
    )
    
    job = await get_job_posting_by_id(db, job_id)
    
    return {
        "success": True,
        "message": "Job posting created successfully. Use CV Screening to rank candidates.",
        "job": {
            "id": job["_id"],
            "recruiterId": job["recruiter_id"],
            "interviewField": job["interview_field"],
            "positionLevel": job["position_level"],
            "numberOfVacancies": job.get("number_of_vacancies", 1),
            "jobDescription": job.get("job_description"),
            "experienceRange": job.get("experience_range"),
            "industryDomain": job.get("industry_domain"),
            "questions": job.get("questions", []),
            "specificInstruction": job.get("specific_instruction"),
            "deadline": job.get("deadline").isoformat() if job.get("deadline") else None,
            "createdAt": job["created_at"].isoformat(),
            "isActive": job["is_active"]
        }
    }


@router.get("/recruiter/{recruiter_id}", response_model=list)
async def get_recruiter_jobs(
    recruiter_id: str,
    db=Depends(get_database)
):
    """Get all job postings by a specific recruiter."""
    if db is None:
        raise HTTPException(
            status_code=503,
            detail="Database connection unavailable. MongoDB is not connected."
        )
    # Auto-close expired jobs
    await close_expired_jobs(db)
    jobs = await get_job_postings_by_recruiter(db, recruiter_id)
    # Get recruiter company name
    recruiter_doc = await db.recruiters.find_one({"_id": ObjectId(recruiter_id)}) if ObjectId.is_valid(recruiter_id) else None
    company_name = recruiter_doc.get("company", "") if recruiter_doc else ""
    return [
        {
            "id": job["_id"],
            "recruiterId": job["recruiter_id"],
            "companyName": company_name,
            "interviewField": job["interview_field"],
            "positionLevel": job["position_level"],
            "numberOfVacancies": job.get("number_of_vacancies", 1),
            "numberOfQuestions": job.get("number_of_questions", 3),
            "topNCvs": job.get("top_n_cvs", 10),
            "workModel": job.get("work_model", "Remote"),
            "status": job.get("status", "Full-time"),
            "location": job.get("location", "Not specified"),
            "salaryRange": job.get("salary_range", "Not specified"),
            "cvFileIds": [str(cid) for cid in job.get("cv_file_ids", [])],
            "cvFilesCount": len(job.get("cv_file_ids", [])),
            "jobDescription": job.get("job_description"),
            "experienceRange": job.get("experience_range"),
            "industryDomain": job.get("industry_domain"),
            "questions": job.get("questions", []),
            "specificInstruction": job.get("specific_instruction"),
            "deadline": job.get("deadline").isoformat() if job.get("deadline") else None,
            "createdAt": job["created_at"].isoformat(),
            "isActive": job["is_active"]
        }
        for job in jobs
    ]


@router.get("/all", response_model=list)
async def get_all_jobs(
    db=Depends(get_database)
):
    """Get all job postings from all recruiters."""
    if db is None:
        raise HTTPException(
            status_code=503,
            detail="Database connection unavailable. MongoDB is not connected."
        )
    # Auto-close expired jobs
    await close_expired_jobs(db)
    jobs = await get_all_job_postings(db)

    # Batch-fetch recruiter company names
    recruiter_ids = list({job["recruiter_id"] for job in jobs if ObjectId.is_valid(job["recruiter_id"])})
    recruiter_map = {}
    if recruiter_ids:
        cursor = db.recruiters.find(
            {"_id": {"$in": [ObjectId(rid) for rid in recruiter_ids]}},
            {"_id": 1, "company": 1}
        )
        async for rec in cursor:
            recruiter_map[str(rec["_id"])] = rec.get("company", "")

    return [
        {
            "id": job["_id"],
            "recruiterId": job["recruiter_id"],
            "companyName": recruiter_map.get(job["recruiter_id"], ""),
            "interviewField": job["interview_field"],
            "positionLevel": job["position_level"],
            "numberOfVacancies": job.get("number_of_vacancies", 1),
            "numberOfQuestions": job.get("number_of_questions", 3),
            "topNCvs": job.get("top_n_cvs", 10),
            "workModel": job.get("work_model", "Remote"),
            "status": job.get("status", "Full-time"),
            "location": job.get("location", "Not specified"),
            "salaryRange": job.get("salary_range", "Not specified"),
            "cvFileIds": [str(cid) for cid in job.get("cv_file_ids", [])],
            "cvFilesCount": len(job.get("cv_file_ids", [])),
            "jobDescription": job.get("job_description"),
            "experienceRange": job.get("experience_range"),
            "industryDomain": job.get("industry_domain"),
            "questions": job.get("questions", []),
            "specificInstruction": job.get("specific_instruction"),
            "deadline": job.get("deadline").isoformat() if job.get("deadline") else None,
            "createdAt": job["created_at"].isoformat(),
            "isActive": job["is_active"]
        }
        for job in jobs
    ]


@router.get("/{job_id}", response_model=dict)
async def get_job(
    job_id: str,
    db=Depends(get_database)
):
    """Get a specific job posting by ID."""
    job = await get_job_posting_by_id(db, job_id)
    
    if not job:
        raise HTTPException(status_code=404, detail="Job posting not found")
    
    return {
        "id": job["_id"],
        "recruiterId": job["recruiter_id"],
        "interviewField": job["interview_field"],
        "positionLevel": job["position_level"],
        "jobDescription": job.get("job_description"),
        "experienceRange": job.get("experience_range"),
        "industryDomain": job.get("industry_domain"),
        "questions": job.get("questions", []),
        "specificInstruction": job.get("specific_instruction"),
        "deadline": job.get("deadline").isoformat() if job.get("deadline") else None,
        "createdAt": job["created_at"].isoformat(),
        "isActive": job["is_active"]
    }


@router.put("/{job_id}", response_model=dict)
async def update_job(
    job_id: str,
    update_data: JobPostingUpdateRequest,
    db=Depends(get_database)
):
    """Update a job posting."""
    job = await get_job_posting_by_id(db, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job posting not found")
    
    # Prepare update data
    update_fields = {}
    if update_data.interviewField is not None:
        update_fields["interview_field"] = update_data.interviewField
    if update_data.positionLevel is not None:
        update_fields["position_level"] = update_data.positionLevel
    
    # Map new fields
    if update_data.workModel is not None:
        update_fields["work_model"] = update_data.workModel
    if update_data.status is not None:
        update_fields["status"] = update_data.status
    if update_data.location is not None:
        update_fields["location"] = update_data.location
    if update_data.salaryRange is not None:
        update_fields["salary_range"] = update_data.salaryRange
    if update_data.experienceRange is not None:
        update_fields["experience_range"] = update_data.experienceRange
    if update_data.industryDomain is not None:
        update_fields["industry_domain"] = update_data.industryDomain
    if update_data.numberOfVacancies is not None:
        update_fields["number_of_vacancies"] = update_data.numberOfVacancies
    if update_data.questions is not None:
        update_fields["questions"] = [q.dict() for q in update_data.questions]
    if update_data.specificInstruction is not None:
        update_fields["specific_instruction"] = update_data.specificInstruction
        
    if update_data.jobDescription is not None:
        update_fields["job_description"] = update_data.jobDescription
    if update_data.deadline is not None:
        try:
            update_fields["deadline"] = datetime.fromisoformat(update_data.deadline.replace("Z", "+00:00"))
        except ValueError:
            try:
                update_fields["deadline"] = datetime.strptime(update_data.deadline, "%Y-%m-%d")
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid deadline format.")
    
    success = await update_job_posting(db, job_id, update_fields)
    
    if not success:
        raise HTTPException(status_code=500, detail="Failed to update job posting")
    
    updated_job = await get_job_posting_by_id(db, job_id)
    
    return {
        "success": True,
        "message": "Job posting updated successfully",
        "job": {
            "id": updated_job["_id"],
            "recruiterId": updated_job["recruiter_id"],
            "interviewField": updated_job["interview_field"],
            "positionLevel": updated_job["position_level"],
            "numberOfVacancies": updated_job.get("number_of_vacancies", 1),
            "jobDescription": updated_job.get("job_description"),
            "experienceRange": updated_job.get("experience_range"),
            "industryDomain": updated_job.get("industry_domain"),
            "questions": updated_job.get("questions", []),
            "specificInstruction": updated_job.get("specific_instruction"),
            "deadline": updated_job.get("deadline").isoformat() if updated_job.get("deadline") else None,
            "createdAt": updated_job["created_at"].isoformat(),
            "isActive": updated_job["is_active"]
        }
    }


@router.delete("/{job_id}", response_model=dict)
async def delete_job(
    job_id: str,
    db=Depends(get_database)
):
    """Delete a job posting."""
    job = await get_job_posting_by_id(db, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job posting not found")
    
    success = await delete_job_posting(db, job_id)
    
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete job posting")
    
    return {
        "success": True,
        "message": "Job posting deleted successfully"
    }


# ==================== Application Tracking ====================

class ApplyRequest(BaseModel):
    candidateId: str
    candidateEmail: str


@router.post("/{job_id}/apply", response_model=dict)
async def apply_to_job(
    job_id: str,
    data: ApplyRequest,
    db=Depends(get_database)
):
    """Record a candidate's application to a job. One application per candidate per job."""
    if db is None:
        raise HTTPException(status_code=503, detail="Database unavailable")

    # Check if job exists and is active
    job = await get_job_posting_by_id(db, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job posting not found")
    if not job.get("is_active", True):
        raise HTTPException(status_code=400, detail="This job is closed and no longer accepting applications.")

    # Check deadline
    if job.get("deadline"):
        if datetime.utcnow() > job["deadline"]:
            # Auto-close the job
            await update_job_posting(db, job_id, {"is_active": False})
            raise HTTPException(status_code=400, detail="The deadline for this job has passed.")

    # Check if already applied
    already = await has_candidate_applied(db, job_id, data.candidateId)
    if already:
        raise HTTPException(status_code=409, detail="You have already applied to this job.")

    app_id = await record_application(db, job_id, data.candidateId, data.candidateEmail)
    return {"success": True, "message": "Application recorded successfully", "applicationId": app_id}


@router.get("/{job_id}/has-applied/{candidate_id}", response_model=dict)
async def check_application(
    job_id: str,
    candidate_id: str,
    db=Depends(get_database)
):
    """Check if a candidate has already applied to a job."""
    if db is None:
        raise HTTPException(status_code=503, detail="Database unavailable")
    applied = await has_candidate_applied(db, job_id, candidate_id)
    return {"hasApplied": applied}


@router.get("/candidate/{candidate_id}/applied-jobs", response_model=dict)
async def get_applied_jobs(
    candidate_id: str,
    db=Depends(get_database)
):
    """Get all job IDs a candidate has applied to."""
    if db is None:
        raise HTTPException(status_code=503, detail="Database unavailable")
    job_ids = await get_candidate_applications(db, candidate_id)
    return {"appliedJobIds": job_ids}


@router.get("/candidate/{candidate_id}/applied-jobs-activity", response_model=dict)
async def get_applied_jobs_activity(
    candidate_id: str,
    db=Depends(get_database)
):
    """Get all jobs a candidate applied to, sorted by most-recent first, with timestamps."""
    if db is None:
        raise HTTPException(status_code=503, detail="Database unavailable")
    apps = await get_candidate_applications_with_dates(db, candidate_id)
    return {"applications": apps}
