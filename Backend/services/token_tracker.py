"""
Token Usage Tracking Service
==============================

Logs LLM token usage per request to MongoDB and provides
cost calculation based on Gemini pricing.
"""

from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
from motor.motor_asyncio import AsyncIOMotorDatabase

# Gemini 2.5 Flash pricing (per 1M tokens) — updated Feb 2026
# See: https://ai.google.dev/pricing
PRICING = {
    "gemini-2.5-flash": {"input": 0.15, "output": 0.60},
    "gemini-1.5-flash": {"input": 0.075, "output": 0.30},
    "gemini-1.5-flash-8b": {"input": 0.0375, "output": 0.15},
    "gemini-2.0-flash-exp": {"input": 0.15, "output": 0.60},
    "gemini-1.5-pro": {"input": 1.25, "output": 5.00},
}

DEFAULT_PRICING = {"input": 0.15, "output": 0.60}


async def log_token_usage(
    db: AsyncIOMotorDatabase,
    user_id: str,
    user_email: str,
    user_role: str,
    action_type: str,
    model_name: str,
    input_tokens: int,
    output_tokens: int,
    total_tokens: int = None,
    file_name: str = None,
) -> str:
    """Log a single LLM token usage event."""
    if total_tokens is None:
        total_tokens = input_tokens + output_tokens

    pricing = PRICING.get(model_name, DEFAULT_PRICING)
    input_cost = (input_tokens / 1_000_000) * pricing["input"]
    output_cost = (output_tokens / 1_000_000) * pricing["output"]
    total_cost = input_cost + output_cost

    doc = {
        "user_id": user_id,
        "user_email": user_email,
        "user_role": user_role,
        "action_type": action_type,
        "model_name": model_name,
        "input_tokens": input_tokens,
        "output_tokens": output_tokens,
        "total_tokens": total_tokens,
        "input_cost_usd": round(input_cost, 8),
        "output_cost_usd": round(output_cost, 8),
        "total_cost_usd": round(total_cost, 8),
        "file_name": file_name,
        "timestamp": datetime.utcnow(),
    }
    result = await db.token_usage.insert_one(doc)
    return str(result.inserted_id)


async def get_token_usage_summary(db: AsyncIOMotorDatabase) -> dict:
    """Get aggregate token usage statistics."""
    pipeline = [
        {"$group": {
            "_id": None,
            "total_input_tokens": {"$sum": "$input_tokens"},
            "total_output_tokens": {"$sum": "$output_tokens"},
            "total_tokens": {"$sum": "$total_tokens"},
            "total_cost_usd": {"$sum": "$total_cost_usd"},
            "total_requests": {"$sum": 1},
        }}
    ]
    result = await db.token_usage.aggregate(pipeline).to_list(1)
    if result:
        r = result[0]
        r.pop("_id", None)
        return r
    return {"total_input_tokens": 0, "total_output_tokens": 0, "total_tokens": 0, "total_cost_usd": 0, "total_requests": 0}


async def get_token_usage_by_user(db: AsyncIOMotorDatabase) -> List[dict]:
    """Get token usage grouped by user, sorted by total tokens descending."""
    pipeline = [
        {"$group": {
            "_id": {"user_id": "$user_id", "user_email": "$user_email", "user_role": "$user_role"},
            "total_input_tokens": {"$sum": "$input_tokens"},
            "total_output_tokens": {"$sum": "$output_tokens"},
            "total_tokens": {"$sum": "$total_tokens"},
            "total_cost_usd": {"$sum": "$total_cost_usd"},
            "request_count": {"$sum": 1},
            "last_used": {"$max": "$timestamp"},
        }},
        {"$sort": {"total_tokens": -1}},
    ]
    results = []
    async for doc in db.token_usage.aggregate(pipeline):
        results.append({
            "userId": doc["_id"]["user_id"],
            "userEmail": doc["_id"]["user_email"],
            "userRole": doc["_id"]["user_role"],
            "totalInputTokens": doc["total_input_tokens"],
            "totalOutputTokens": doc["total_output_tokens"],
            "totalTokens": doc["total_tokens"],
            "totalCostUsd": round(doc["total_cost_usd"], 6),
            "requestCount": doc["request_count"],
            "lastUsed": doc["last_used"].isoformat() if isinstance(doc["last_used"], datetime) else str(doc["last_used"]),
        })
    return results


async def get_token_usage_by_model(db: AsyncIOMotorDatabase) -> List[dict]:
    """Get token usage grouped by model."""
    pipeline = [
        {"$group": {
            "_id": "$model_name",
            "total_tokens": {"$sum": "$total_tokens"},
            "total_cost_usd": {"$sum": "$total_cost_usd"},
            "request_count": {"$sum": 1},
        }},
        {"$sort": {"total_tokens": -1}},
    ]
    results = []
    async for doc in db.token_usage.aggregate(pipeline):
        results.append({
            "model": doc["_id"],
            "totalTokens": doc["total_tokens"],
            "totalCostUsd": round(doc["total_cost_usd"], 6),
            "requestCount": doc["request_count"],
        })
    return results


async def get_token_usage_by_action(db: AsyncIOMotorDatabase) -> List[dict]:
    """Get token usage grouped by action type."""
    pipeline = [
        {"$group": {
            "_id": "$action_type",
            "total_tokens": {"$sum": "$total_tokens"},
            "total_cost_usd": {"$sum": "$total_cost_usd"},
            "request_count": {"$sum": 1},
        }},
        {"$sort": {"total_cost_usd": -1}},
    ]
    results = []
    async for doc in db.token_usage.aggregate(pipeline):
        results.append({
            "actionType": doc["_id"],
            "totalTokens": doc["total_tokens"],
            "totalCostUsd": round(doc["total_cost_usd"], 6),
            "requestCount": doc["request_count"],
        })
    return results
