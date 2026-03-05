"""
API Routes for CV Screening with MongoDB Integration
"""

import os
from typing import List, Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends, Request
from pydantic import BaseModel

from cv_screener.gemini_screener import GeminiCVScreener
from cv_screener.cv_parser import parse_cv_file
from database.connection import get_database
from database import crud
from database.job_posting_crud import create_job_cv_file, create_job_posting
from database.ranking_crud import create_candidate_ranking

from api.job_posting_routes import router as job_posting_router
from api.ranking_routes import router as ranking_router
from api.interview_routes import router as new_interview_router

router = APIRouter()

# Include routes
router.include_router(job_posting_router)
router.include_router(ranking_router)
router.include_router(new_interview_router)

# Initialize the Gemini screener
screener = GeminiCVScreener()

# Import activity logger
from services.activity_logger import log_activity


class JobDescriptionRequest(BaseModel):
    title: str
    content: str


class JobDescriptionResponse(BaseModel):
    id: str
    title: str
    content: str
    is_active: bool
    created_at: str


class CVResponse(BaseModel):
    id: str
    file_name: str
    uploaded_at: str
    file_size: int


class ScreeningResultResponse(BaseModel):
    candidate_name: str
    file_name: str
    overall_score: float
    skills_match: float
    experience_match: float
    education_match: float
    strengths: List[str]
    weaknesses: List[str]
    recommendation: str
    summary: str


# ==================== Job Description Endpoints ====================

@router.post("/upload-jd", response_model=dict)
async def upload_job_description(
    jd_file: Optional[UploadFile] = File(None),
    jd_text: Optional[str] = Form(None),
    jd_title: Optional[str] = Form("Untitled Position"),
    db=Depends(get_database)
):
    """
    Upload a Job Description either as a file or text.
    Stores in MongoDB and sets as active.
    """
    jd_content = None
    
    if jd_file:
        content = await jd_file.read()
        try:
            jd_content = content.decode("utf-8")
        except UnicodeDecodeError:
            temp_path = f"temp_{jd_file.filename}"
            with open(temp_path, "wb") as f:
                f.write(content)
            try:
                jd_content = parse_cv_file(temp_path)
            finally:
                if os.path.exists(temp_path):
                    os.remove(temp_path)
    elif jd_text:
        jd_content = jd_text
    else:
        raise HTTPException(
            status_code=400,
            detail="Please provide either a file or text for the job description"
        )
    
    # Deactivate all previous JDs
    await crud.deactivate_all_job_descriptions(db)
    
    # Create new active JD
    jd_id = await crud.create_job_description(db, jd_title, jd_content)
    
    return {
        "message": "Job description uploaded successfully",
        "id": jd_id,
        "title": jd_title,
        "preview": jd_content[:500] + "..." if len(jd_content) > 500 else jd_content
    }


@router.get("/current-jd")
async def get_current_job_description(db=Depends(get_database)):
    """Get the currently active job description."""
    jd = await crud.get_active_job_description(db)
    
    if not jd:
        raise HTTPException(status_code=404, detail="No active job description found")
    
    return {
        "id": jd["_id"],
        "title": jd.get("title", "Untitled"),
        "content": jd["content"],
        "created_at": jd["created_at"].isoformat()
    }


@router.get("/job-descriptions/{jd_id}")
async def get_job_description(jd_id: str, db=Depends(get_database)):
    """Get a specific job description by ID."""
    jd = await crud.get_job_description(db, jd_id)
    
    if not jd:
        raise HTTPException(status_code=404, detail="Job description not found")
    
    return jd


# ==================== CV Upload Endpoints ====================

@router.post("/upload-cvs")
async def upload_cvs(
    files: List[UploadFile] = File(...),
    db=Depends(get_database)
):
    """
    Upload multiple CV files (PDF, DOCX, or TXT).
    Stores them in MongoDB.
    """
    uploaded_cv_ids = []
    uploaded_files = []
    
    for file in files:
        content = await file.read()
        temp_path = f"temp_{file.filename}"
        
        try:
            with open(temp_path, "wb") as f:
                f.write(content)
            
            parsed_content = parse_cv_file(temp_path)
            
            # Store in database
            cv_id = await crud.create_cv(
                db,
                file_name=file.filename,
                content=parsed_content,
                file_size=len(content)
            )
            
            uploaded_cv_ids.append(cv_id)
            uploaded_files.append({
                "id": cv_id,
                "file_name": file.filename,
                "size": len(content)
            })
            
        except Exception as e:
            print(f"Error parsing {file.filename}: {str(e)}")
            continue
        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)
    
    return {
        "message": f"Successfully uploaded {len(uploaded_cv_ids)} CVs",
        "files": uploaded_files,
        "cv_ids": uploaded_cv_ids
    }


@router.get("/cvs")
async def get_uploaded_cvs(
    limit: int = 50,
    db=Depends(get_database)
):
    """Get list of recently uploaded CVs."""
    cvs = await crud.get_recent_cvs(db, limit)
    
    return {
        "total": len(cvs),
        "cvs": [
            {
                "id": cv["_id"],
                "file_name": cv["file_name"],
                "uploaded_at": cv["uploaded_at"].isoformat(),
                "size": cv["file_size"]
            }
            for cv in cvs
        ]
    }


@router.delete("/cvs/{cv_id}")
async def delete_cv_endpoint(cv_id: str, db=Depends(get_database)):
    """Delete a specific CV."""
    deleted = await crud.delete_cv(db, cv_id)
    
    if not deleted:
        raise HTTPException(status_code=404, detail="CV not found")
    
    return {"message": "CV deleted successfully"}


# ==================== Screening Endpoints ====================

@router.post("/screen-cvs")
async def screen_cvs(
    jd_id: Optional[str] = Form(None),
    cv_ids: Optional[List[str]] = Form(None),
    db=Depends(get_database)
):
    """
    Screen CVs against a job description.
    If no parameters provided, uses active JD and recent CVs.
    """
    # Get job description
    if jd_id:
        jd = await crud.get_job_description(db, jd_id)
    else:
        jd = await crud.get_active_job_description(db)
    
    if not jd:
        raise HTTPException(status_code=400, detail="No job description found")
    
    # Get CVs to screen
    if cv_ids:
        cvs_to_screen = []
        for cv_id in cv_ids:
            cv = await crud.get_cv(db, cv_id)
            if cv:
                cvs_to_screen.append(cv)
    else:
        cvs_to_screen = await crud.get_recent_cvs(db, limit=50)
    
    if not cvs_to_screen:
        raise HTTPException(status_code=400, detail="No CVs found to screen")
    
    # Create screening batch
    batch_id = await crud.create_screening_batch(
        db,
        jd["_id"],
        [cv["_id"] for cv in cvs_to_screen]
    )
    
    # Screen all CVs
    results = []
    result_ids = []
    
    for cv in cvs_to_screen:
        try:
            screening_result = await screener.screen_cv(
                job_description=jd["content"],
                cv_content=cv["content"],
                file_name=cv["file_name"]
            )
            
            # Store result in database
            result_id = await crud.create_screening_result(
                db,
                jd["_id"],
                cv["_id"],
                screening_result
            )
            result_ids.append(result_id)
            
            screening_result["id"] = result_id
            results.append(screening_result)
            
        except Exception as e:
            print(f"Error screening {cv['file_name']}: {str(e)}")
            results.append({
                "candidate_name": "Unknown",
                "file_name": cv["file_name"],
                "overall_score": 0,
                "skills_match": 0,
                "experience_match": 0,
                "education_match": 0,
                "strengths": [],
                "weaknesses": ["Error processing CV"],
                "recommendation": "Error",
                "summary": f"Error: {str(e)}"
            })
    
    # Update batch with results
    await crud.update_batch_results(db, batch_id, result_ids)
    
    # Sort by overall score
    results.sort(key=lambda x: x.get("overall_score", 0), reverse=True)
    
    return {
        "batch_id": batch_id,
        "job_description_id": jd["_id"],
        "job_title": jd.get("title", "Untitled"),
        "total_candidates": len(results),
        "results": results
    }


@router.get("/screening-results/{jd_id}")
async def get_screening_results(jd_id: str, db=Depends(get_database)):
    """Get all screening results for a job description."""
    results = await crud.get_screening_results_by_jd(db, jd_id)
    
    return {
        "job_description_id": jd_id,
        "total_results": len(results),
        "results": results
    }


@router.get("/top-candidates/{jd_id}")
async def get_top_candidates(
    jd_id: str,
    limit: int = 10,
    db=Depends(get_database)
):
    """Get top candidates for a job description."""
    candidates = await crud.get_top_candidates(db, jd_id, limit)
    
    return {
        "job_description_id": jd_id,
        "total": len(candidates),
        "top_candidates": candidates
    }


@router.post("/screen-single-cv")
async def screen_single_cv(
    cv_file: UploadFile = File(...),
    jd_id: Optional[str] = Form(None),
    jd_text: Optional[str] = Form(None),
    db=Depends(get_database)
):
    """Screen a single CV against a job description."""
    
    # Get or create JD
    if jd_id:
        jd = await crud.get_job_description(db, jd_id)
        if not jd:
            raise HTTPException(status_code=404, detail="Job description not found")
        job_content = jd["content"]
    elif jd_text:
        job_content = jd_text
        # Create temporary JD
        jd_id = await crud.create_job_description(db, "Quick Screen", jd_text)
    else:
        jd = await crud.get_active_job_description(db)
        if not jd:
            raise HTTPException(status_code=400, detail="No job description provided")
        jd_id = jd["_id"]
        job_content = jd["content"]
    
    # Parse CV
    content = await cv_file.read()
    temp_path = f"temp_{cv_file.filename}"
    
    try:
        with open(temp_path, "wb") as f:
            f.write(content)
        
        parsed_content = parse_cv_file(temp_path)
        
        # Store CV
        cv_id = await crud.create_cv(
            db,
            file_name=cv_file.filename,
            content=parsed_content,
            file_size=len(content)
        )
        
        # Screen CV
        result = await screener.screen_cv(
            job_description=job_content,
            cv_content=parsed_content,
            file_name=cv_file.filename
        )
        
        # Store result
        result_id = await crud.create_screening_result(db, jd_id, cv_id, result)
        result["id"] = result_id
        result["cv_id"] = cv_id
        
        return result
        
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)


# ==================== Statistics & Management ====================

@router.get("/statistics")
async def get_statistics(db=Depends(get_database)):
    """Get system statistics."""
    stats = await crud.get_statistics(db)
    return stats


@router.delete("/clear-all")
async def clear_all(db=Depends(get_database)):
    """Clear all data (use with caution!)."""
    await db.job_descriptions.delete_many({})
    await db.cvs.delete_many({})
    await db.screening_results.delete_many({})
    await db.screening_batches.delete_many({})
    
    return {"message": "All data cleared successfully"}


# ==================== User Authentication ====================

class UserRegisterRequest(BaseModel):
    firstName: str
    lastName: str
    email: str
    password: str
    otpCode: str = ""  # OTP code for email verification


class UserLoginRequest(BaseModel):
    email: str
    password: str


class RecruiterRegisterRequest(BaseModel):
    firstName: str
    lastName: str
    companyName: str
    email: str
    password: str
    otpCode: str = ""  # OTP code for email verification


class RecruiterLoginRequest(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    id: str
    firstName: str
    lastName: str
    email: str
    createdAt: str
    isActive: bool


class OtpRequest(BaseModel):
    email: str


class OtpVerifyRequest(BaseModel):
    email: str
    otp: str


# ==================== Password Validation ====================

import re

def validate_password(password: str) -> str | None:
    """
    Enforce complex password requirements.
    Returns None if valid, or an error message describing the failure.
    """
    if len(password) < 8:
        return "Password must be at least 8 characters long"
    if not re.search(r"[A-Z]", password):
        return "Password must contain at least one uppercase letter"
    if not re.search(r"[a-z]", password):
        return "Password must contain at least one lowercase letter"
    if not re.search(r"\d", password):
        return "Password must contain at least one number"
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>_\-+=\[\]\\;'/~`]", password):
        return "Password must contain at least one special character (!@#$%^&* etc.)"
    return None


# ==================== OTP Email Verification ====================

from services.email_service import (
    generate_otp, store_otp, verify_otp as verify_otp_code,
    is_email_verified, send_otp_email
)


@router.post("/auth/send-otp", response_model=dict)
async def send_email_otp(
    data: OtpRequest,
    db=Depends(get_database),
):
    """Send a 6-digit OTP to the user's email for verification."""
    print(f"Request to send OTP to: {data.email}")
    if db is None:
        raise HTTPException(status_code=503, detail="Database unavailable")

    # Check if email is already registered
    existing = await crud.get_user_by_email(db, data.email)
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists")

    otp = generate_otp()
    await store_otp(db, data.email, otp)
    
    # Send email
    success = await send_otp_email(data.email, otp)
    
    if not success:
        raise HTTPException(
            status_code=500,
            detail="Failed to send verification code. Please ensure your email address is correct and check your internet connection."
        )

    return {"success": True, "message": "Verification code sent to your email"}


@router.post("/auth/verify-otp", response_model=dict)
async def verify_email_otp(
    data: OtpVerifyRequest,
    db=Depends(get_database),
):
    """Verify the OTP code sent to the user's email."""
    if db is None:
        raise HTTPException(status_code=503, detail="Database unavailable")

    valid = await verify_otp_code(db, data.email, data.otp)
    if not valid:
        raise HTTPException(status_code=400, detail="Invalid or expired verification code")

    return {"success": True, "message": "Email verified successfully"}


# ==================== User Auth Endpoints ====================


@router.post("/auth/register", response_model=dict)
async def register_user(
    user_data: UserRegisterRequest,
    db=Depends(get_database)
):
    """Register a new user. Requires email OTP verification and complex password."""
    if db is None:
        raise HTTPException(
            status_code=503,
            detail="Database connection unavailable. MongoDB is not connected."
        )

    # 1. Password complexity check
    pwd_error = validate_password(user_data.password)
    if pwd_error:
        raise HTTPException(status_code=400, detail=pwd_error)

    # 2. Email already registered?
    existing_user = await crud.get_user_by_email(db, user_data.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists with this email")

    # 3. Verify OTP was confirmed
    email_ok = await is_email_verified(db, user_data.email)
    if not email_ok:
        raise HTTPException(
            status_code=400,
            detail="Email not verified. Please verify your email with an OTP code first."
        )

    # 4. Create user (password is hashed inside crud.create_candidate_user)
    user_id = await crud.create_candidate_user(
        db,
        user_data.firstName,
        user_data.lastName,
        user_data.email,
        user_data.password,
    )

    user = await crud.get_user_by_id(db, user_id)

    # Log registration activity
    try:
        await log_activity(
            db=db,
            user_id=str(user["_id"]),
            user_email=user["email"],
            user_role="candidate",
            action_type="user_register",
            action_detail={"method": "email_otp"},
        )
    except Exception:
        pass

    return {
        "success": True,
        "message": "User registered successfully",
        "user": {
            "id": user["_id"],
            "firstName": user["first_name"],
            "lastName": user["last_name"],
            "email": user["email"],
            "createdAt": user["created_at"].isoformat(),
            "isActive": user["is_active"]
        }
    }


@router.post("/auth/login", response_model=dict)
async def login_user(
    login_data: UserLoginRequest,
    db=Depends(get_database)
):
    """Login a user with email and password (bcrypt verified)."""
    import bcrypt as _bcrypt

    if db is None:
        raise HTTPException(
            status_code=503,
            detail="Database connection unavailable. MongoDB is not connected."
        )

    user = await crud.get_user_by_email(db, login_data.email)

    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # Verify bcrypt-hashed password
    stored_hash = user.get("password", "")
    try:
        password_ok = _bcrypt.checkpw(
            login_data.password.encode("utf-8"),
            stored_hash.encode("utf-8"),
        )
    except Exception:
        password_ok = False

    if not password_ok:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not user.get("is_active", True):
        raise HTTPException(status_code=403, detail="User account is inactive")

    # Log the login activity
    try:
        await log_activity(
            db=db,
            user_id=str(user["_id"]),
            user_email=user["email"],
            user_role="candidate",
            action_type="user_login",
            action_detail={"method": "email_password"},
        )
    except Exception:
        pass

    return {
        "success": True,
        "message": "Login successful",
        "user": {
            "id": user["_id"],
            "firstName": user["first_name"],
            "lastName": user["last_name"],
            "email": user["email"],
            "createdAt": user["created_at"].isoformat(),
            "isActive": user["is_active"]
        }
    }


# ==================== Recruiter Auth Endpoints ====================


@router.post("/recruiter/auth/register", response_model=dict)
async def register_recruiter(
    user_data: RecruiterRegisterRequest,
    db=Depends(get_database),
):
    """Register a new recruiter. Requires email OTP verification."""
    if db is None:
        raise HTTPException(
            status_code=503,
            detail="Database connection unavailable. MongoDB is not connected."
        )

    # 1. Password complexity check (same as candidate)
    pwd_error = validate_password(user_data.password)
    if pwd_error:
        raise HTTPException(status_code=400, detail=pwd_error)

    # 2. Email already registered as recruiter?
    existing_recruiter = await crud.get_recruiter_by_email(db, user_data.email)
    if existing_recruiter:
        raise HTTPException(status_code=400, detail="Recruiter already exists with this email")

    # 3. Verify OTP was confirmed
    email_ok = await is_email_verified(db, user_data.email)
    if not email_ok:
        raise HTTPException(
            status_code=400,
            detail="Email not verified. Please verify your email with an OTP code first."
        )

    # 4. Create recruiter
    recruiter_id = await crud.create_recruiter_user(
        db,
        user_data.firstName,
        user_data.lastName,
        user_data.email,
        user_data.password,
        user_data.companyName,
    )

    recruiter = await crud.get_recruiter_by_id(db, recruiter_id)

    # Log registration activity
    try:
        await log_activity(
            db=db,
            user_id=str(recruiter["_id"]),
            user_email=recruiter["email"],
            user_role="recruiter",
            action_type="user_register",
            action_detail={"method": "email_otp"},
        )
    except Exception:
        pass

    return {
        "success": True,
        "message": "Recruiter registered successfully",
        "user": {
            "id": recruiter["_id"],
            "firstName": recruiter.get("first_name", ""),
            "lastName": recruiter.get("last_name", ""),
            "companyName": recruiter.get("company", ""),
            "email": recruiter.get("email", ""),
            "createdAt": recruiter.get("created_at").isoformat() if recruiter.get("created_at") else "",
            "isActive": recruiter.get("is_active", True),
        }
    }


@router.post("/recruiter/auth/login", response_model=dict)
async def login_recruiter(
    login_data: RecruiterLoginRequest,
    db=Depends(get_database),
):
    """Login a recruiter with email and password (bcrypt verified)."""
    import bcrypt as _bcrypt

    if db is None:
        raise HTTPException(
            status_code=503,
            detail="Database connection unavailable. MongoDB is not connected."
        )

    recruiter = await crud.get_recruiter_by_email(db, login_data.email)
    if not recruiter:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    stored_hash = recruiter.get("password", "")
    try:
        password_ok = _bcrypt.checkpw(
            login_data.password.encode("utf-8"),
            stored_hash.encode("utf-8"),
        )
    except Exception:
        password_ok = False

    if not password_ok:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not recruiter.get("is_active", True):
        raise HTTPException(status_code=403, detail="User account is inactive")

    # Log login activity
    try:
        await log_activity(
            db=db,
            user_id=str(recruiter["_id"]),
            user_email=recruiter.get("email", ""),
            user_role="recruiter",
            action_type="user_login",
            action_detail={"method": "email_password"},
        )
    except Exception:
        pass

    return {
        "success": True,
        "message": "Login successful",
        "user": {
            "id": recruiter["_id"],
            "firstName": recruiter.get("first_name", ""),
            "lastName": recruiter.get("last_name", ""),
            "companyName": recruiter.get("company", ""),
            "email": recruiter.get("email", ""),
            "createdAt": recruiter.get("created_at").isoformat() if recruiter.get("created_at") else "",
            "isActive": recruiter.get("is_active", True),
        }
    }


@router.get("/auth/users", response_model=List[dict])
async def get_all_users(db=Depends(get_database)):
    """Get all registered users (admin endpoint)."""
    users = await crud.get_all_users(db)
    return [
        {
            "id": user["_id"],
            "firstName": user["first_name"],
            "lastName": user["last_name"],
            "email": user["email"],
            "createdAt": user["created_at"].isoformat(),
            "isActive": user["is_active"]
        }
        for user in users
    ]


# ==================== Candidate Endpoints ====================

@router.post("/candidate/analyze-resume", response_model=dict)
async def candidate_analyze_resume(
    file: UploadFile = File(...),
    job_description: str = Form(...),
    db=Depends(get_database)
):
    """
    Candidate endpoint for analyzing their resume against a job description.
    Job description is REQUIRED for meaningful analysis.
    """
    try:
        # Validate job description
        if not job_description or not job_description.strip():
            raise HTTPException(status_code=400, detail="Job description is required for CV analysis.")
        
        # Parse CV file
        content = await file.read()
        if not content:
            raise HTTPException(status_code=400, detail="Uploaded file is empty")
        
        temp_path = f"temp_{file.filename}"
        
        try:
            with open(temp_path, "wb") as f:
                f.write(content)
            
            cv_content = parse_cv_file(temp_path)
            
            if not cv_content or not cv_content.strip():
                raise HTTPException(status_code=400, detail="Could not parse CV content from file")
            
        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)
        
        # Screen CV using the detailed candidate analysis prompt
        analysis_result = await screener.screen_cv_candidate(
            job_description=job_description.strip(),
            cv_content=cv_content,
            file_name=file.filename
        )
        
        # Format the analysis for better presentation
        formatted_analysis = format_candidate_analysis(analysis_result)
        
        return {
            "success": True,
            "candidate_name": analysis_result.get("candidate_name", "Unknown"),
            "file_name": file.filename,
            "overall_score": analysis_result.get("overall_score", 0),
            "skills_match": analysis_result.get("skills_match", 0),
            "experience_match": analysis_result.get("experience_match", 0),
            "education_match": analysis_result.get("education_match", 0),
            "strengths": analysis_result.get("strengths", []),
            "weaknesses": analysis_result.get("weaknesses", []),
            "recommendation": analysis_result.get("recommendation", "Not Evaluated"),
            "summary": analysis_result.get("summary", ""),
            "professional_summary": analysis_result.get("professional_summary", "") or formatted_analysis.get("professional_summary", ""),
            "core_strengths": formatted_analysis.get("core_strengths", ""),
            "role_recommendations": formatted_analysis.get("role_recommendations", ""),
            "skill_gaps": formatted_analysis.get("skill_gaps", ""),
            "next_steps": formatted_analysis.get("next_steps", ""),
            "next_steps_list": formatted_analysis.get("next_steps_list", []),
            "formatted_analysis": formatted_analysis.get("full_analysis", ""),
            "analysis": formatted_analysis
        }

        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in candidate_analyze_resume: {str(e)}")
        return {
            "success": False,
            "error": str(e),
            "message": f"Error analyzing resume: {str(e)}"
        }


def format_candidate_analysis(analysis_data: dict) -> dict:
    """
    Format the raw AI analysis into structured sections for frontend display.
    Handles both the enhanced candidate analysis prompt (list-based next_steps)
    and the original prompt format.
    """
    formatted = {
        "professional_summary": "",
        "core_strengths": "",
        "role_recommendations": "",
        "skill_gaps": "",
        "next_steps": "",
        "next_steps_list": [],
        "full_analysis": ""
    }
    
    # Professional summary — prefer the dedicated field from the enhanced prompt
    if isinstance(analysis_data.get("professional_summary"), str) and analysis_data["professional_summary"]:
        formatted["professional_summary"] = analysis_data["professional_summary"]
    elif isinstance(analysis_data.get("summary"), str) and analysis_data["summary"]:
        formatted["professional_summary"] = analysis_data["summary"]
    
    # Format strengths
    strengths = analysis_data.get("strengths", [])
    if strengths:
        if isinstance(strengths, list):
            formatted["core_strengths"] = "\n".join([f"• {s}" for s in strengths])
        else:
            formatted["core_strengths"] = str(strengths)
    
    # Format weaknesses as skill gaps
    weaknesses = analysis_data.get("weaknesses", [])
    if weaknesses:
        if isinstance(weaknesses, list):
            formatted["skill_gaps"] = "\n".join([f"• {w}" for w in weaknesses])
        else:
            formatted["skill_gaps"] = str(weaknesses)
    
    # Next steps — handle list-based (from enhanced prompt) or generate from recommendation
    next_steps_raw = analysis_data.get("next_steps", [])
    if isinstance(next_steps_raw, list) and len(next_steps_raw) > 0:
        # Enhanced prompt returns a list of actionable steps
        formatted["next_steps_list"] = next_steps_raw
        formatted["next_steps"] = "\n".join([f"• {s}" for s in next_steps_raw])
    else:
        # Fallback: generate dynamic next steps based on recommendation and score
        recommendation = analysis_data.get("recommendation", "")
        overall_score = analysis_data.get("overall_score", 0)
        
        if recommendation:
            if recommendation == "Strongly Recommend":
                formatted["next_steps"] = (
                    f"Excellent match with {overall_score}% compatibility! You're a strong candidate for this position. "
                    "We recommend applying immediately and preparing for technical interviews. "
                    "Highlight your key strengths during the interview process."
                )
            elif recommendation == "Recommend":
                formatted["next_steps"] = (
                    f"Good match with {overall_score}% compatibility. You meet most of the core requirements. "
                    "Focus on addressing the development areas identified above before your interview. "
                    "Consider taking courses or gaining hands-on experience in the gap areas."
                )
            elif recommendation == "Consider":
                formatted["next_steps"] = (
                    f"Moderate match with {overall_score}% compatibility. While you have relevant experience, "
                    "there are some significant gaps to address. We recommend upskilling in the identified areas "
                    "and gaining more targeted experience before applying for similar roles."
                )
            else:
                formatted["next_steps"] = (
                    f"Current compatibility is {overall_score}%. This role may require skills beyond your current profile. "
                    "Consider exploring roles that better align with your existing strengths, or invest in "
                    "substantial training in the key requirement areas before pursuing similar positions."
                )
    
    # Combine all for full analysis
    full = []
    if formatted["professional_summary"]:
        full.append(f"<strong>Professional Profile:</strong>\n{formatted['professional_summary']}")
    if formatted["core_strengths"]:
        full.append(f"<strong>Strengths:</strong>\n{formatted['core_strengths']}")
    if formatted["skill_gaps"]:
        full.append(f"<strong>Areas for Development:</strong>\n{formatted['skill_gaps']}")
    if formatted["next_steps"]:
        full.append(f"<strong>Recommendations:</strong>\n{formatted['next_steps']}")
    
    formatted["full_analysis"] = "\n\n".join(full)
    
    return formatted


# ==================== CV Screening (Bulk) Endpoint ====================

class CVScreeningRequest(BaseModel):
    """Request model for bulk CV screening from the recruiter dashboard."""
    recruiterId: str
    cvFiles: List[str]  # List of base64 encoded CV files
    jobDescription: str
    weightages: dict  # {"professional_experience": 20, "projects_achievements": 15, ...}


@router.post("/screen-cvs-batch")
async def screen_cvs_batch(
    request: CVScreeningRequest,
    db=Depends(get_database)
):
    """
    Screen multiple CVs against a job description using recruiter-defined weightages.
    
    This endpoint:
    1. Accepts base64 encoded CV files from the frontend
    2. Creates a Job Posting reference for the ranking system
    3. Stores original CV files (Reference Pattern)
    4. Screens each CV using weighted criteria via AI
    5. Computes final scores from weightages
    6. Stores detailed screening results and candidate rankings
    7. Returns all candidates ranked by weighted score
    """
    import base64
    import tempfile
    import os
    from cv_screener import parse_cv_file
    from bson import ObjectId
    from datetime import datetime
    
    if not request.cvFiles or len(request.cvFiles) == 0:
        raise HTTPException(status_code=400, detail="No CV files provided")
    
    if not request.jobDescription.strip():
        raise HTTPException(status_code=400, detail="Job description is required")
    
    # Validate weightages sum to 100
    weightage_sum = sum(request.weightages.values())
    if abs(weightage_sum - 100) > 1:  # Allow 1% tolerance for rounding
        raise HTTPException(status_code=400, detail=f"Weightages must sum to 100%. Current sum: {weightage_sum}%")
    
    # 1. Create a Job Description record
    jd_id = await crud.create_job_description(
        db,
        title="CV Screening",
        content=request.jobDescription
    )
    
    # 2. Create a Job Posting record (for Ranking Page visibility)
    job_posting_id = await create_job_posting(
        db,
        recruiter_id=request.recruiterId,
        interview_field="CV Screening",
        position_level="Not specified",
        work_model="Not specified",
        status="Screening",
        location="Not specified",
        salary_range="Not specified",
        experience_range="Not specified",
        industry_domain="Not specified",
        questions=[],
        job_description=request.jobDescription
    )
    
    # Create screening batch
    batch_id = await crud.create_screening_batch(db, jd_id, [])
    
    results = []
    result_ids = []
    cv_file_ids = []
    
    for idx, cv_base64 in enumerate(request.cvFiles):
        try:
            print(f"[INFO] Processing CV {idx + 1}/{len(request.cvFiles)}")
            
            # Decode base64
            if "," in cv_base64:
                cv_base64_clean = cv_base64.split(",")[1]
            else:
                cv_base64_clean = cv_base64
            
            cv_bytes = base64.b64decode(cv_base64_clean)
            print(f"[INFO] Decoded CV bytes: {len(cv_bytes)} bytes")
            
            # Create temp file with PDF extension
            with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_file:
                temp_file.write(cv_bytes)
                temp_path = temp_file.name
            
            try:
                file_name = f"CV_{idx + 1}.pdf"
                print(f"[INFO] Created temp file: {temp_path}")

                # 3. Store ORIGINAL FILE (Reference Pattern)
                print(f"[INFO] Storing CV file with Reference Pattern...")
                cv_file_id_ref = await create_job_cv_file(
                    db,
                    job_posting_id=job_posting_id,
                    file_name=file_name,
                    file_content=cv_base64_clean,
                    file_size=len(cv_bytes)
                )
                cv_file_ids.append(cv_file_id_ref)
                print(f"[INFO] Stored CV file with ID: {cv_file_id_ref}")

                # Parse CV content for screening
                print(f"[INFO] Parsing CV content...")
                cv_content = parse_cv_file(temp_path)
                print(f"[INFO] Parsed CV content: {len(cv_content)} chars")
                
                # Store CV Metadata/Text in cvs collection
                print(f"[INFO] Saving CV metadata...")
                cv_id = await crud.create_cv(
                    db,
                    file_name=file_name,
                    content=cv_content,
                    file_size=len(cv_bytes)
                )
                print(f"[INFO] Saved CV with ID: {cv_id}")
                
                # 4. Screen the CV with weighted criteria
                print(f"[INFO] Screening CV with weighted criteria...")
                screening_result = await screener.screen_cv_weighted(
                    job_description=request.jobDescription,
                    cv_content=cv_content,
                    file_name=file_name,
                    weightages=request.weightages
                )
                print(f"[INFO] Screening result: overall_score={screening_result.get('overall_score', 'N/A')}")
                
                # Store detailed screening result
                print(f"[INFO] Creating screening result record...")
                result_id = await crud.create_screening_result(
                    db,
                    jd_id,
                    cv_id,
                    screening_result
                )
                result_ids.append(result_id)
                print(f"[INFO] Created screening result with ID: {result_id}")
                
                # Extract candidate info
                candidate_name = screening_result.get("candidate_name", f"Candidate {idx + 1}")
                candidate_email = screening_result.get("email", "")
                candidate_id = f"CAN-{idx + 1:04d}"
                
                # Ensure validation of score 
                raw_score = screening_result.get("overall_score", 0)
                try:
                    if isinstance(raw_score, str):
                        import re
                        match = re.search(r'\d+(\.\d+)?', raw_score)
                        overall_score = float(match.group()) if match else 0.0
                    else:
                        overall_score = float(raw_score)
                except Exception:
                    overall_score = 0.0
                
                print(f"[INFO] Creating candidate ranking: {candidate_name}, score: {overall_score}")
                
                # Sanitize evaluation details
                import json
                evaluation_details_safe = json.loads(json.dumps(screening_result, default=str))

                try:
                    ranking_id = await create_candidate_ranking(
                        db,
                        job_posting_id=job_posting_id,
                        recruiter_id=request.recruiterId,
                        candidate_name=candidate_name,
                        rank=idx + 1,  # Temporary rank, will reorder below
                        score=overall_score,
                        candidate_id=candidate_id,
                        email=candidate_email,
                        cv_score=overall_score,
                        completion=100,
                        interview_status="Shortlisted" if overall_score >= 80 else "Pending",
                        cv_data={"text": cv_content[:500] + "...", "file_id": cv_file_id_ref},
                        evaluation_details=evaluation_details_safe
                    )
                    print(f"[INFO] ✅ Created ranking with ID: {ranking_id}")
                except Exception as ranking_error:
                    print(f"[ERROR] Failed to create ranking: {str(ranking_error)}")
                    import traceback
                    traceback.print_exc()
                
                # Add to results for response
                screening_result["id"] = result_id
                screening_result["cv_id"] = cv_id
                screening_result["candidate_id"] = candidate_id
                results.append(screening_result)
                print(f"[INFO] ✅ CV {idx + 1} processed successfully")
                
            finally:
                # Clean up temp file
                if os.path.exists(temp_path):
                    os.remove(temp_path)
                    
        except Exception as e:
            print(f"[ERROR] Error screening CV {idx + 1}: {str(e)}")
            import traceback
            traceback.print_exc()
            results.append({
                "candidate_name": f"Candidate {idx + 1}",
                "candidate_id": f"CAN-{idx + 1:04d}",
                "email": "",
                "overall_score": 0,
                "score": 0,
                "recommendation": "Error",
                "summary": f"Error: {str(e)}"
            })
    
    # Post-processing: update batch, job posting, and format results
    try:
        if result_ids:
            await crud.update_batch_results(db, batch_id, result_ids)
    except Exception as e:
        print(f"[WARNING] Failed to update batch results: {e}")
        
    try:
        if cv_file_ids:
            object_id_list = [ObjectId(fid) for fid in cv_file_ids]
            await db.job_postings.update_one(
                {"_id": ObjectId(job_posting_id)},
                {"$set": {"cv_file_ids": object_id_list}}
            )
    except Exception as e:
        print(f"[WARNING] Failed to update job posting cv_file_ids: {e}")
    
    # Sort results by weighted score descending
    def get_score(r):
        try:
            s = r.get("overall_score", r.get("score", 0))
            return float(s) if s else 0.0
        except (ValueError, TypeError):
            return 0.0
    
    results.sort(key=get_score, reverse=True)
    
    # Format for frontend ranking table (minimal details)
    formatted_results = []
    for idx, result in enumerate(results):
        try:
            raw = result.get("overall_score", result.get("score", 0))
            score_val = round(float(raw), 2) if raw else 0.0
        except (ValueError, TypeError):
            score_val = 0.0
            
        formatted_results.append({
            "rank": idx + 1,
            "candidate_id": result.get("candidate_id", f"CAN-{idx + 1:04d}"),
            "candidate_name": result.get("candidate_name", f"Candidate {idx + 1}"),
            "email": result.get("email", ""),
            "score": score_val,
        })
    
    return {
        "success": True,
        "batch_id": batch_id,
        "job_description_id": jd_id,
        "job_posting_id": job_posting_id,
        "total_screened": len(results),
        "results": formatted_results
    }

