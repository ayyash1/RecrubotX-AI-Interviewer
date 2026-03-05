"""
Database Configuration and Connection
======================================

MongoDB connection management for RecruBotX.
"""

import os
from typing import Optional

from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from pymongo.uri_parser import parse_uri

load_dotenv()


class DatabaseManager:
    """
    MongoDB connection manager using Motor (async driver).
    
    Attributes:
        client: MongoDB async client
        db: Database instance
    """
    
    def __init__(self):
        self.client: Optional[AsyncIOMotorClient] = None
        self.db: Optional[AsyncIOMotorDatabase] = None
    
    async def connect(self):
        """Connect to MongoDB Atlas database."""
        mongodb_url = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
        
        if "localhost" in mongodb_url or "127.0.0.1" in mongodb_url:
            print("ℹ Using local MongoDB URL. If you intended to use Atlas, check your .env file.")
            print("  Required env var: MONGODB_URL=mongodb+srv://...")

        # Prefer explicit env var, otherwise try to infer DB name from URI.
        db_name = os.getenv("MONGODB_DB_NAME")
        if not db_name:
            try:
                parsed = parse_uri(mongodb_url)
                db_name = parsed.get("database")
            except Exception:
                db_name = None
        db_name = db_name or "recrubotx"
        
        try:
            # MongoDB Atlas optimized settings
            client_options = {
                "serverSelectionTimeoutMS": 5000,  # 5 seconds is enough for fail-fast
                "connectTimeoutMS": 5000,
                "socketTimeoutMS": 45000,
                "maxPoolSize": 50,
                "minPoolSize": 10,
                "maxIdleTimeMS": 45000,
            }
            
            # Add retryWrites for Atlas
            if "mongodb+srv://" in mongodb_url or "retryWrites" not in mongodb_url:
                client_options["retryWrites"] = True
            
            self.client = AsyncIOMotorClient(mongodb_url, **client_options)
            self.db = self.client[db_name]
            
            # Test connection
            await self.client.admin.command('ping')
            print(f"✓ Connected to MongoDB: {db_name}")
            
            # Create indexes
            await self._create_indexes()
            
        except Exception as e:
            error_msg = str(e)
            print(f"✗ Failed to connect to MongoDB: {mongodb_url.split('@')[-1]}")
            print(f"  Error: {error_msg}")
            
            if "[Errno 11001]" in error_msg or "getaddrinfo failed" in error_msg or "DNS" in error_msg:
                print("\n🔴 DNS RESOLUTION ERROR DETECTED")
                print("Your computer cannot resolve the MongoDB Atlas address.")
                print("FIX: See MONGODB_DNS_FIX.md in the project root.")
                print("Quick Fix: Change your Windows DNS to 8.8.8.8 (Google DNS).\n")
            elif "timed out" in error_msg.lower():
                print("\n🔴 CONNECTION TIMEOUT")
                print("Could not reach the database. Check if your IP is whitelisted in MongoDB Atlas.")
                print("Or if you are using localhost, ensure MongoDB is actually running locally.\n")
            
            raise
    
    async def disconnect(self):
        """Close MongoDB connection."""
        if self.client:
            self.client.close()
            print("✓ Disconnected from MongoDB")
    
    async def _create_indexes(self):
        """Create database indexes optimized for MongoDB Atlas."""
        try:
            # Job descriptions indexes with background creation for Atlas
            await self.db.job_descriptions.create_index(
                "created_at", background=True
            )
            await self.db.job_descriptions.create_index(
                "is_active", background=True
            )
            # Compound index for active JD queries
            await self.db.job_descriptions.create_index(
                [("is_active", -1), ("created_at", -1)], background=True
            )
            
            # CVs indexes
            await self.db.cvs.create_index("uploaded_at", background=True)
            await self.db.cvs.create_index("file_name", background=True)
            
            # Screening results indexes with compound indexes for Atlas performance
            await self.db.screening_results.create_index(
                "job_description_id", background=True
            )
            await self.db.screening_results.create_index("cv_id", background=True)
            await self.db.screening_results.create_index(
                [("overall_score", -1)], background=True
            )
            await self.db.screening_results.create_index(
                "created_at", background=True
            )
            # Compound index for top candidates queries (most common)
            await self.db.screening_results.create_index(
                [("job_description_id", 1), ("overall_score", -1)],
                background=True
            )
            
            # Candidates indexes
            await self.db.candidates.create_index(
                "email", unique=True, background=True
            )
            await self.db.candidates.create_index(
                "created_at", background=True
            )
            await self.db.candidates.create_index(
                "is_active", background=True
            )

            # Recruiters indexes
            await self.db.recruiters.create_index(
                "email", unique=True, background=True
            )
            await self.db.recruiters.create_index(
                "created_at", background=True
            )
            await self.db.recruiters.create_index(
                "is_active", background=True
            )

            # Superuser indexes
            await self.db.superusers.create_index(
                "email", unique=True, background=True
            )

            # Activity log indexes
            await self.db.activity_logs.create_index(
                [("timestamp", -1)], background=True
            )
            await self.db.activity_logs.create_index(
                [("user_id", 1), ("timestamp", -1)], background=True
            )
            await self.db.activity_logs.create_index(
                [("action_type", 1), ("timestamp", -1)], background=True
            )

            # Job vacancies indexes — unique per candidate+job, fast lookups
            await self.db.job_applications.create_index(
                [("job_id", 1), ("candidate_id", 1)],
                unique=True,
                background=True,
                name="unique_candidate_job_application"
            )
            await self.db.job_applications.create_index(
                "candidate_id", background=True
            )
            await self.db.job_applications.create_index(
                "job_id", background=True
            )

            # Job postings indexes
            await self.db.job_postings.create_index(
                "recruiter_id", background=True
            )
            await self.db.job_postings.create_index(
                [("is_active", -1), ("created_at", -1)], background=True
            )
            await self.db.job_postings.create_index(
                "deadline", background=True
            )

            print("✓ Database indexes created successfully")
        except Exception as e:
            print(f"⚠ Warning: Could not create some indexes: {e}")
            # Don't raise - indexes might already exist
    
    def get_collection(self, name: str):
        """Get a collection from the database."""
        return self.db[name]


# Global database instance
db_manager = DatabaseManager()


async def get_database() -> AsyncIOMotorDatabase:
    """Dependency to get database instance."""
    return db_manager.db
