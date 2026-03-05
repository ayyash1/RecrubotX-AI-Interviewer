"""
Superuser API Routes
=====================

Protected endpoints for the superuser monitoring dashboard.
All endpoints (except login) require a valid superuser JWT.
"""

import csv
import io
import json
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from api.auth_middleware import create_jwt_token, require_superuser
from database.connection import get_database
from database.superuser_crud import (
    create_superuser,
    get_superuser_by_email,
    get_superuser_by_id,
    get_all_superusers,
    verify_superuser_password,
    get_activity_logs,
    get_activity_logs_count,
    get_dashboard_stats,
    get_all_candidates_with_activity,
    get_all_recruiters_with_activity,
    get_all_users_with_activity,
    delete_candidate_by_id,
    delete_recruiter_by_id,
    delete_superuser_by_id,
)
from services.activity_logger import log_activity

router = APIRouter(prefix="/superuser", tags=["Superuser"])


# ==================== Auth ====================

class SuperuserLoginRequest(BaseModel):
    email: str
    password: str


@router.post("/auth/login")
async def superuser_login(
    login_data: SuperuserLoginRequest,
    db=Depends(get_database),
):
    """Authenticate a superuser and return a JWT token."""
    if db is None:
        raise HTTPException(status_code=503, detail="Database unavailable")

    user = await get_superuser_by_email(db, login_data.email)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not verify_superuser_password(user["password_hash"], login_data.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not user.get("is_active", True):
        raise HTTPException(status_code=403, detail="Account is inactive")

    is_root = user.get("created_by") is None  # Root = no parent, can create admins

    token = create_jwt_token(
        user_id=user["_id"],
        role="superuser",
        email=user["email"],
    )

    await log_activity(
        db=db,
        user_id=user["_id"],
        user_email=user["email"],
        user_role="superuser",
        action_type="superuser_login",
        action_detail={"method": "jwt"},
    )

    return {
        "success": True,
        "token": token,
        "user": {
            "id": user["_id"],
            "email": user["email"],
            "firstName": user["first_name"],
            "lastName": user["last_name"],
            "role": "superuser",
            "isRoot": is_root,  # False = sub-admin, cannot create further admins
        },
    }


# ==================== Dashboard Stats ====================

@router.get("/dashboard/stats")
async def dashboard_stats(
    db=Depends(get_database),
    _user=Depends(require_superuser),
):
    stats = await get_dashboard_stats(db)
    return stats


# ==================== Activity Logs ====================

@router.get("/activity-logs")
async def list_activity_logs(
    user_id: Optional[str] = Query(None),
    user_role: Optional[str] = Query(None),
    action_type: Optional[str] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=200),
    db=Depends(get_database),
    _user=Depends(require_superuser),
):
    sd = datetime.fromisoformat(start_date) if start_date else None
    ed = datetime.fromisoformat(end_date) if end_date else None
    logs = await get_activity_logs(db, user_id=user_id, user_role=user_role, action_type=action_type, start_date=sd, end_date=ed, search=search, page=page, limit=limit)
    total = await get_activity_logs_count(db, user_id=user_id, user_role=user_role, action_type=action_type, start_date=sd, end_date=ed, search=search)
    return {"logs": logs, "total": total, "page": page, "limit": limit, "total_pages": (total + limit - 1) // limit}


# ==================== Activity Log Export ====================

@router.get("/activity-logs/export")
async def export_activity_logs(
    user_id: Optional[str] = Query(None),
    user_role: Optional[str] = Query(None),
    action_type: Optional[str] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    format: str = Query("csv", regex="^(csv|json)$"),
    db=Depends(get_database),
    _user=Depends(require_superuser),
):
    sd = datetime.fromisoformat(start_date) if start_date else None
    ed = datetime.fromisoformat(end_date) if end_date else None
    logs = await get_activity_logs(db, user_id=user_id, user_role=user_role, action_type=action_type, start_date=sd, end_date=ed, search=search, page=1, limit=10000)

    if format == "json":
        content = json.dumps(logs, indent=2, default=str)
        return StreamingResponse(io.BytesIO(content.encode()), media_type="application/json",
            headers={"Content-Disposition": "attachment; filename=activity_logs.json"})

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Timestamp", "User ID", "User Email", "Role", "Action Type", "Details", "IP Address"])
    for log in logs:
        writer.writerow([log.get("timestamp", ""), log.get("user_id", ""), log.get("user_email", ""), log.get("user_role", ""), log.get("action_type", ""), json.dumps(log.get("action_detail", {})), log.get("ip_address", "")])
    return StreamingResponse(io.BytesIO(output.getvalue().encode("utf-8")), media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=activity_logs.csv"})


# ==================== User Management ====================

@router.get("/users")
async def list_all_users(db=Depends(get_database), _user=Depends(require_superuser)):
    users = await get_all_users_with_activity(db)
    return {"users": users, "total": len(users)}

@router.get("/candidates")
async def list_candidates(db=Depends(get_database), _user=Depends(require_superuser)):
    candidates = await get_all_candidates_with_activity(db)
    return {"users": candidates, "total": len(candidates)}

@router.get("/recruiters")
async def list_recruiters(db=Depends(get_database), _user=Depends(require_superuser)):
    recruiters = await get_all_recruiters_with_activity(db)
    return {"users": recruiters, "total": len(recruiters)}

@router.get("/users/{user_id}/activity")
async def user_activity_history(
    user_id: str,
    page: int = Query(1, ge=1),
    limit: int = Query(100, ge=1, le=500),
    db=Depends(get_database),
    _user=Depends(require_superuser),
):
    logs = await get_activity_logs(db, user_id=user_id, page=page, limit=limit)
    total = await get_activity_logs_count(db, user_id=user_id)
    return {"user_id": user_id, "logs": logs, "total": total, "page": page, "limit": limit}

@router.delete("/candidates/{user_id}")
async def delete_candidate(
    user_id: str,
    db=Depends(get_database),
    _user=Depends(require_superuser),
):
    """Permanently delete a candidate user and all their activity logs."""
    success = await delete_candidate_by_id(db, user_id)
    if not success:
        raise HTTPException(status_code=404, detail="Candidate not found or could not be deleted")
    return {"success": True, "message": "Candidate deleted successfully"}

@router.delete("/recruiters/{recruiter_id}")
async def delete_recruiter(
    recruiter_id: str,
    db=Depends(get_database),
    _user=Depends(require_superuser),
):
    """Permanently delete a recruiter, their job postings, and activity logs."""
    success = await delete_recruiter_by_id(db, recruiter_id)
    if not success:
        raise HTTPException(status_code=404, detail="Recruiter not found or could not be deleted")
    return {"success": True, "message": "Recruiter and all associated job postings deleted"}


# ==================== Superuser (Admin) Management ====================

class CreateSuperuserRequest(BaseModel):
    email: str
    password: str
    firstName: str
    lastName: str

@router.get("/admins")
async def list_admins(db=Depends(get_database), _user=Depends(require_superuser)):
    admins = await get_all_superusers(db)
    return {"admins": admins, "total": len(admins)}

@router.post("/admins/add")
async def add_superuser(
    data: CreateSuperuserRequest,
    db=Depends(get_database),
    current_user=Depends(require_superuser),
):
    """
    Add a new admin account.
    ONLY the root superuser (created_by=None) can create new admins.
    Sub-admins are blocked from this endpoint.
    """
    # Look up the calling superuser to check if they are root
    caller = await get_superuser_by_id(db, current_user.get("sub"))
    if caller is None:
        raise HTTPException(status_code=401, detail="Caller not found")

    if caller.get("created_by") is not None:
        raise HTTPException(
            status_code=403,
            detail="Only the root superuser can create new admin accounts. Sub-admins do not have this permission.",
        )

    existing = await get_superuser_by_email(db, data.email)
    if existing:
        raise HTTPException(status_code=409, detail="A superuser with this email already exists")

    new_id = await create_superuser(
        db, email=data.email, password=data.password,
        first_name=data.firstName, last_name=data.lastName,
        created_by=current_user.get("sub"),
    )

    await log_activity(
        db=db,
        user_id=current_user.get("sub"),
        user_email=current_user.get("email"),
        user_role="superuser",
        action_type="superuser_create",
        action_detail={"new_admin_email": data.email, "new_admin_id": new_id},
    )

    return {"success": True, "message": f"Admin {data.email} created successfully", "id": new_id}


# ==================== Dashboard Stats ====================

@router.get("/dashboard/stats")
async def dashboard_stats(
    db=Depends(get_database),
    _user=Depends(require_superuser),
):
    """Get aggregate statistics for the superuser dashboard."""
    stats = await get_dashboard_stats(db)
    return stats


# ==================== Activity Logs ====================

@router.get("/activity-logs")
async def list_activity_logs(
    user_id: Optional[str] = Query(None),
    user_role: Optional[str] = Query(None),
    action_type: Optional[str] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=200),
    db=Depends(get_database),
    _user=Depends(require_superuser),
):
    """Get paginated & filterable activity logs."""
    sd = datetime.fromisoformat(start_date) if start_date else None
    ed = datetime.fromisoformat(end_date) if end_date else None

    logs = await get_activity_logs(
        db,
        user_id=user_id,
        user_role=user_role,
        action_type=action_type,
        start_date=sd,
        end_date=ed,
        search=search,
        page=page,
        limit=limit,
    )
    total = await get_activity_logs_count(
        db,
        user_id=user_id,
        user_role=user_role,
        action_type=action_type,
        start_date=sd,
        end_date=ed,
        search=search,
    )

    return {
        "logs": logs,
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": (total + limit - 1) // limit,
    }


# ==================== Activity Log Export ====================

@router.get("/activity-logs/export")
async def export_activity_logs(
    user_id: Optional[str] = Query(None),
    user_role: Optional[str] = Query(None),
    action_type: Optional[str] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    format: str = Query("csv", regex="^(csv|json)$"),
    db=Depends(get_database),
    _user=Depends(require_superuser),
):
    """Export activity logs as CSV or JSON."""
    sd = datetime.fromisoformat(start_date) if start_date else None
    ed = datetime.fromisoformat(end_date) if end_date else None

    logs = await get_activity_logs(
        db,
        user_id=user_id,
        user_role=user_role,
        action_type=action_type,
        start_date=sd,
        end_date=ed,
        search=search,
        page=1,
        limit=10000,
    )

    if format == "json":
        content = json.dumps(logs, indent=2, default=str)
        return StreamingResponse(
            io.BytesIO(content.encode()),
            media_type="application/json",
            headers={"Content-Disposition": "attachment; filename=activity_logs.json"},
        )

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Timestamp", "User ID", "User Email", "Role",
        "Action Type", "Details", "IP Address",
        "Resource Type", "Resource ID",
    ])
    for log in logs:
        writer.writerow([
            log.get("timestamp", ""),
            log.get("user_id", ""),
            log.get("user_email", ""),
            log.get("user_role", ""),
            log.get("action_type", ""),
            json.dumps(log.get("action_detail", {})),
            log.get("ip_address", ""),
            log.get("resource_type", ""),
            log.get("resource_id", ""),
        ])

    csv_bytes = output.getvalue().encode("utf-8")
    return StreamingResponse(
        io.BytesIO(csv_bytes),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=activity_logs.csv"},
    )


# ==================== User Management ====================

@router.get("/users")
async def list_all_users(
    db=Depends(get_database),
    _user=Depends(require_superuser),
):
    """Get all users (candidates + recruiters) combined."""
    users = await get_all_users_with_activity(db)
    return {"users": users, "total": len(users)}


@router.get("/candidates")
async def list_candidates(
    db=Depends(get_database),
    _user=Depends(require_superuser),
):
    """Get all candidate users with activity summaries."""
    candidates = await get_all_candidates_with_activity(db)
    return {"users": candidates, "total": len(candidates)}


@router.get("/recruiters")
async def list_recruiters(
    db=Depends(get_database),
    _user=Depends(require_superuser),
):
    """Get all recruiters with activity summaries."""
    recruiters = await get_all_recruiters_with_activity(db)
    return {"users": recruiters, "total": len(recruiters)}


@router.get("/users/{user_id}/activity")
async def user_activity_history(
    user_id: str,
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=200),
    db=Depends(get_database),
    _user=Depends(require_superuser),
):
    """Get a specific user's full activity history."""
    logs = await get_activity_logs(db, user_id=user_id, page=page, limit=limit)
    total = await get_activity_logs_count(db, user_id=user_id)

    return {
        "user_id": user_id,
        "logs": logs,
        "total": total,
        "page": page,
        "limit": limit,
    }


# ==================== Superuser Management ====================

class CreateSuperuserRequest(BaseModel):
    email: str
    password: str
    firstName: str
    lastName: str


@router.get("/admins")
async def list_admins(
    db=Depends(get_database),
    _user=Depends(require_superuser),
):
    """Get all superuser accounts."""
    admins = await get_all_superusers(db)
    return {"admins": admins, "total": len(admins)}


@router.post("/admins/add")
async def add_superuser(
    data: CreateSuperuserRequest,
    db=Depends(get_database),
    current_user=Depends(require_superuser),
):
    """Add a new superuser account (created under the current superuser)."""
    # Check if email is already taken
    existing = await get_superuser_by_email(db, data.email)
    if existing:
        raise HTTPException(status_code=409, detail="A superuser with this email already exists")

    new_id = await create_superuser(
        db,
        email=data.email,
        password=data.password,
        first_name=data.firstName,
        last_name=data.lastName,
        created_by=current_user.get("sub"),
    )

    # Log the action
    await log_activity(
        db=db,
        user_id=current_user.get("sub"),
        user_email=current_user.get("email"),
        user_role="superuser",
        action_type="superuser_create",
        action_detail={"new_superuser_email": data.email, "new_superuser_id": new_id},
    )

    return {
        "id": new_id,
    }

@router.delete("/admins/{admin_id}")
async def delete_admin(
    admin_id: str,
    db=Depends(get_database),
    current_user=Depends(require_superuser),
):
    """
    Delete an admin account.
    Only the root superuser (created_by=None) can perform this action.
    """
    # Check if caller is root
    caller = await get_superuser_by_id(db, current_user.get("sub"))
    if not caller:
        raise HTTPException(status_code=404, detail="Current superuser not found")
        
    if caller.get("created_by") is not None:
        raise HTTPException(
            status_code=403,
            detail="Only the root superuser can delete admin accounts."
        )

    success = await delete_superuser_by_id(db, admin_id)
    if not success:
        raise HTTPException(
            status_code=404,
            detail="Admin not found or cannot be deleted (Root accounts are protected)."
        )

    # Log the action
    await log_activity(
        db=db,
        user_id=current_user.get("sub"),
        user_email=current_user.get("email"),
        user_role="superuser",
        action_type="superuser_delete",
        action_detail={"deleted_admin_id": admin_id},
    )

    return {"success": True, "message": "Admin account deleted successfully"}
