"""
JWT Auth Middleware for Superuser
==================================

Provides JWT token creation, verification, and a FastAPI dependency
that enforces superuser-only access on protected endpoints.
"""

import os
from datetime import datetime, timedelta
from typing import Optional

import jwt
from fastapi import Request, HTTPException, Depends
from dotenv import load_dotenv

load_dotenv()

# Secret key for JWT — loaded from .env (MUST match across restarts)
JWT_SECRET = os.getenv("JWT_SECRET", "recrubotx-jwt-s3cret-k3y-2026-prod")
JWT_ALGORITHM = "HS256"
JWT_EXPIRY_HOURS = 24


def create_jwt_token(user_id: str, role: str, email: str) -> str:
    """Create a JWT token for a superuser session."""
    payload = {
        "sub": user_id,
        "role": role,
        "email": email,
        "iat": datetime.utcnow(),
        "exp": datetime.utcnow() + timedelta(hours=JWT_EXPIRY_HOURS),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def verify_jwt_token(token: str) -> Optional[dict]:
    """Verify and decode a JWT token. Returns payload or None."""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


async def require_superuser(request: Request) -> dict:
    """
    FastAPI dependency that extracts and validates a superuser JWT token.
    Raises 401 if no token, 403 if not a superuser.
    """
    auth_header = request.headers.get("Authorization", "")

    if not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Missing or invalid Authorization header",
        )

    token = auth_header[7:]  # Strip "Bearer "
    payload = verify_jwt_token(token)

    if payload is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token",
        )

    if payload.get("role") != "superuser":
        raise HTTPException(
            status_code=403,
            detail="Access denied. Superuser role required.",
        )

    return payload
