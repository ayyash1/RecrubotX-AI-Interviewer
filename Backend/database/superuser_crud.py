"""
Superuser & Activity Log CRUD Operations
"""

from datetime import datetime
from typing import Optional, Dict, Any, List
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase
import bcrypt


# ==================== Superuser Operations ====================

async def create_superuser(
    db: AsyncIOMotorDatabase,
    email: str,
    password: str,
    first_name: str,
    last_name: str,
    created_by: str = None,
) -> str:
    password_hash = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    doc = {
        "email": email,
        "password_hash": password_hash,
        "first_name": first_name,
        "last_name": last_name,
        "role": "superuser",
        "created_by": created_by,   # None = root superuser; str = sub-admin (cannot create admins)
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "is_active": True,
    }
    result = await db.superusers.insert_one(doc)
    return str(result.inserted_id)


async def get_superuser_by_email(db, email: str) -> Optional[dict]:
    doc = await db.superusers.find_one({"email": email})
    if doc:
        doc["_id"] = str(doc["_id"])
    return doc


async def get_superuser_by_id(db, user_id: str) -> Optional[dict]:
    doc = await db.superusers.find_one({"_id": ObjectId(user_id)})
    if doc:
        doc["_id"] = str(doc["_id"])
    return doc


async def get_all_superusers(db) -> List[dict]:
    cursor = db.superusers.find({}).sort("created_at", -1)
    results = []
    async for doc in cursor:
        results.append({
            "id": str(doc["_id"]),
            "email": doc.get("email", ""),
            "firstName": doc.get("first_name", ""),
            "lastName": doc.get("last_name", ""),
            "role": "superuser",
            "createdBy": doc.get("created_by"),       # None means root superuser
            "isRoot": doc.get("created_by") is None,  # root = can create admins
            "createdAt": doc.get("created_at", datetime.utcnow()).isoformat(),
            "isActive": doc.get("is_active", True),
        })
    return results


def verify_superuser_password(stored_hash: str, password: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), stored_hash.encode("utf-8"))


# ==================== Activity Log Operations ====================

async def create_activity_log(
    db,
    user_id: str,
    user_email: str,
    user_role: str,
    action_type: str,
    action_detail: Dict[str, Any] = None,
    ip_address: str = None,
    resource_type: str = None,
    resource_id: str = None,
) -> str:
    doc = {
        "user_id": user_id,
        "user_email": user_email,
        "user_role": user_role,
        "action_type": action_type,
        "action_detail": action_detail or {},
        "ip_address": ip_address,
        "resource_type": resource_type,
        "resource_id": resource_id,
        "timestamp": datetime.utcnow(),
    }
    result = await db.activity_logs.insert_one(doc)
    return str(result.inserted_id)


async def get_activity_logs(
    db,
    user_id: str = None,
    user_role: str = None,
    action_type: str = None,
    start_date: datetime = None,
    end_date: datetime = None,
    search: str = None,
    page: int = 1,
    limit: int = 50,
) -> List[dict]:
    query: Dict[str, Any] = {}
    if user_id:
        query["user_id"] = user_id
    if user_role:
        query["user_role"] = user_role
    if action_type:
        query["action_type"] = action_type
    if start_date or end_date:
        ts_filter: Dict[str, Any] = {}
        if start_date:
            ts_filter["$gte"] = start_date
        if end_date:
            ts_filter["$lte"] = end_date
        query["timestamp"] = ts_filter
    if search:
        query["$or"] = [
            {"user_email": {"$regex": search, "$options": "i"}},
            {"action_type": {"$regex": search, "$options": "i"}},
        ]

    skip = (page - 1) * limit
    cursor = db.activity_logs.find(query).sort("timestamp", -1).skip(skip).limit(limit)
    logs = await cursor.to_list(length=limit)
    for log in logs:
        log["_id"] = str(log["_id"])
        if isinstance(log.get("timestamp"), datetime):
            log["timestamp"] = log["timestamp"].isoformat()
    return logs


async def get_activity_logs_count(
    db,
    user_id: str = None,
    user_role: str = None,
    action_type: str = None,
    start_date: datetime = None,
    end_date: datetime = None,
    search: str = None,
) -> int:
    query: Dict[str, Any] = {}
    if user_id:
        query["user_id"] = user_id
    if user_role:
        query["user_role"] = user_role
    if action_type:
        query["action_type"] = action_type
    if start_date or end_date:
        ts_filter: Dict[str, Any] = {}
        if start_date:
            ts_filter["$gte"] = start_date
        if end_date:
            ts_filter["$lte"] = end_date
        query["timestamp"] = ts_filter
    if search:
        query["$or"] = [
            {"user_email": {"$regex": search, "$options": "i"}},
            {"action_type": {"$regex": search, "$options": "i"}},
        ]
    return await db.activity_logs.count_documents(query)


async def get_dashboard_stats(db) -> dict:
    now = datetime.utcnow()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)

    total_candidates = await db.candidates.count_documents({})
    total_jobs = await db.job_descriptions.count_documents({})
    total_screenings = await db.screening_results.count_documents({})
    total_job_postings = await db.job_postings.count_documents({})
    total_activity_logs = await db.activity_logs.count_documents({})
    total_superusers = await db.superusers.count_documents({})
    logins_today = await db.activity_logs.count_documents({
        "action_type": "user_login",
        "timestamp": {"$gte": today_start},
    })

    try:
        total_recruiters = await db.recruiters.count_documents({})
    except Exception:
        total_recruiters = 0

    # Total API cost from token_usage collection
    total_api_cost = 0.0
    total_tokens = 0
    try:
        pipeline = [{"$group": {"_id": None, "total_cost": {"$sum": "$total_cost_usd"}, "total_tokens": {"$sum": "$total_tokens"}}}]
        cost_result = await db.token_usage.aggregate(pipeline).to_list(1)
        if cost_result:
            total_api_cost = round(cost_result[0].get("total_cost", 0), 4)
            total_tokens = cost_result[0].get("total_tokens", 0)
    except Exception:
        pass

    return {
        "total_candidates": total_candidates,
        "total_recruiters": total_recruiters,
        "total_jobs": total_jobs,
        "total_job_postings": total_job_postings,
        "total_screenings": total_screenings,
        "total_activity_logs": total_activity_logs,
        "total_superusers": total_superusers,
        "logins_today": logins_today,
        "total_api_cost_usd": total_api_cost,
        "total_tokens_used": total_tokens,
    }


async def _get_user_token_cost(db, user_id: str) -> float:
    """Get total LLM cost for a user from token_usage collection."""
    try:
        pipeline = [
            {"$match": {"user_id": user_id}},
            {"$group": {"_id": None, "total_cost": {"$sum": "$total_cost_usd"}, "total_tokens": {"$sum": "$total_tokens"}}},
        ]
        result = await db.token_usage.aggregate(pipeline).to_list(1)
        if result:
            return round(result[0].get("total_cost", 0), 6), result[0].get("total_tokens", 0)
    except Exception:
        pass
    return 0.0, 0


async def get_all_candidates_with_activity(db) -> List[dict]:
    """
    Get all CANDIDATE users (those NOT in job_postings as a recruiter_id).
    Sorted by API cost descending.
    """
    users = []
    async for user in db.candidates.find({}):
        user_id = str(user["_id"])
        activity_count = await db.activity_logs.count_documents({"user_id": user_id})
        last_activity = await db.activity_logs.find_one({"user_id": user_id}, sort=[("timestamp", -1)])
        cost, tokens = await _get_user_token_cost(db, user_id)
        users.append({
            "id": user_id,
            "firstName": user.get("first_name", ""),
            "lastName": user.get("last_name", ""),
            "email": user.get("email", ""),
            "role": "candidate",
            "createdAt": user.get("created_at", datetime.utcnow()).isoformat() if isinstance(user.get("created_at"), datetime) else "",
            "isActive": user.get("is_active", True),
            "activityCount": activity_count,
            "lastActivity": last_activity["timestamp"].isoformat() if last_activity and isinstance(last_activity.get("timestamp"), datetime) else None,
            "totalCostUsd": cost,
            "totalTokens": tokens,
        })
    users.sort(key=lambda u: u["totalCostUsd"], reverse=True)
    return users


async def get_all_recruiters_with_activity(db) -> List[dict]:
    """
    Get all RECRUITER users (those who have at least one job posting).
    Sorted by API cost descending.
    """
    recruiters = []
    async for user in db.recruiters.find({}):
        rid = str(user["_id"])
        activity_count = await db.activity_logs.count_documents({"user_id": rid})
        last_activity = await db.activity_logs.find_one({"user_id": rid}, sort=[("timestamp", -1)])
        cost, tokens = await _get_user_token_cost(db, rid)

        # jobCount derived from job_postings
        job_count = 0
        try:
            job_count = await db.job_postings.count_documents({"recruiter_id": rid})
        except Exception:
            job_count = 0

        recruiters.append({
            "id": rid,
            "firstName": user.get("first_name", ""),
            "lastName": user.get("last_name", ""),
            "email": user.get("email", ""),
            "role": "recruiter",
            "company": user.get("company", ""),
            "jobCount": job_count,
            "createdAt": user.get("created_at", datetime.utcnow()).isoformat() if isinstance(user.get("created_at"), datetime) else "",
            "isActive": user.get("is_active", True),
            "activityCount": activity_count,
            "lastActivity": last_activity["timestamp"].isoformat() if last_activity and isinstance(last_activity.get("timestamp"), datetime) else None,
            "totalCostUsd": cost,
            "totalTokens": tokens,
        })
    recruiters.sort(key=lambda u: u["totalCostUsd"], reverse=True)
    return recruiters


async def get_all_users_with_activity(db) -> List[dict]:
    candidates = await get_all_candidates_with_activity(db)
    recruiters = await get_all_recruiters_with_activity(db)
    combined = candidates + recruiters
    combined.sort(key=lambda u: u["totalCostUsd"], reverse=True)
    return combined


async def delete_candidate_by_id(db, user_id: str) -> bool:
    """Delete a candidate user and their activity logs."""
    try:
        result = await db.candidates.delete_one({"_id": ObjectId(user_id)})
        await db.activity_logs.delete_many({"user_id": user_id})
        return result.deleted_count > 0
    except Exception:
        return False


async def delete_recruiter_by_id(db, recruiter_id: str) -> bool:
    """
    Delete a recruiter: removes their job postings and recruiter record.
    """
    try:
        await db.job_postings.delete_many({"recruiter_id": recruiter_id})
        await db.activity_logs.delete_many({"user_id": recruiter_id})
        if ObjectId.is_valid(recruiter_id):
            result = await db.recruiters.delete_one({"_id": ObjectId(recruiter_id)})
            return result.deleted_count > 0
        return False
    except Exception:
        return False


async def delete_superuser_by_id(db, user_id: str) -> bool:
    """Delete a superuser admin. Root superuser cannot be deleted."""
    try:
        user = await db.superusers.find_one({"_id": ObjectId(user_id)})
        if not user:
            return False
        
        # Protect root superuser (created_by is None)
        if user.get("created_by") is None:
            return False
            
        result = await db.superusers.delete_one({"_id": ObjectId(user_id)})
        return result.deleted_count > 0
    except Exception:
        return False
