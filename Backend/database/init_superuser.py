"""
Initialize Superuser Account
==============================

Seeds the default superuser account in MongoDB on startup.
Credentials are loaded from environment variables for security.
"""

import os
from dotenv import load_dotenv
from database.superuser_crud import create_superuser, get_superuser_by_email

load_dotenv()


async def init_superuser(db):
    """
    Create the default superuser if it does not already exist.
    Credentials are read from env vars (never hardcoded).
    Called during application startup.
    """
    email = os.getenv("SUPERUSER_EMAIL")
    password = os.getenv("SUPERUSER_PASSWORD")
    first_name = os.getenv("SUPERUSER_FIRST_NAME", "Super")
    last_name = os.getenv("SUPERUSER_LAST_NAME", "Admin")

    if not email or not password:
        print("  ⚠️  SUPERUSER_EMAIL / SUPERUSER_PASSWORD env vars not set — skipping superuser init")
        return

    existing = await get_superuser_by_email(db, email)
    if existing:
        print(f"  ⏭️  Superuser already exists: {email}")
        return

    await create_superuser(
        db,
        email=email,
        password=password,
        first_name=first_name,
        last_name=last_name,
    )
    print(f"  ✅ Default superuser created: {email}")
