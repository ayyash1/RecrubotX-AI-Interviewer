"""
Initialize MongoDB Atlas Collections for CV Screening
======================================================

Run this script to set up all necessary collections and indexes
for the RecruBotX CV screening system.

Usage:
    python database/init_collections.py
"""

import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()


async def init_collections():
    """Initialize all MongoDB collections with proper schema and indexes."""
    
    mongodb_url = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    db_name = os.getenv("MONGODB_DB_NAME", "recrubotx")
    
    print(f"🔗 Connecting to MongoDB Atlas: {db_name}")
    if "localhost" in mongodb_url:
        print("ℹ Using local MongoDB URL")
    client = AsyncIOMotorClient(mongodb_url)
    db = client[db_name]
    
    try:
        # Test connection
        await client.admin.command('ping')
        print("✅ Connected to MongoDB Atlas")
        
        # ==================== JOB DESCRIPTIONS COLLECTION ====================
        print("\n📋 Setting up 'job_descriptions' collection...")
        
        # Create indexes
        await db.job_descriptions.create_index("created_at", background=True)
        await db.job_descriptions.create_index("is_active", background=True)
        await db.job_descriptions.create_index(
            [("is_active", -1), ("created_at", -1)], 
            background=True
        )
        
        # Create validation schema
        await db.command({
            "collMod": "job_descriptions",
            "validator": {
                "$jsonSchema": {
                    "bsonType": "object",
                    "required": ["title", "content", "is_active", "created_at"],
                    "properties": {
                        "title": {
                            "bsonType": "string",
                            "description": "Job title - required"
                        },
                        "content": {
                            "bsonType": "string",
                            "description": "Full job description - required"
                        },
                        "is_active": {
                            "bsonType": "bool",
                            "description": "Whether JD is currently active - required"
                        },
                        "created_at": {
                            "bsonType": "date",
                            "description": "Creation timestamp - required"
                        },
                        "updated_at": {
                            "bsonType": "date",
                            "description": "Last update timestamp"
                        }
                    }
                }
            },
            "validationLevel": "moderate"
        })
        
        print("   ✓ Indexes created")
        print("   ✓ Indexes created")
        print("   ✓ Schema validation set")
        
        # ==================== JOB POSTINGS COLLECTION ====================
        print("\n📢 Setting up 'job_postings' collection...")
        
        # Create indexes
        await db.job_postings.create_index("recruiter_id", background=True)
        await db.job_postings.create_index("created_at", background=True)
        await db.job_postings.create_index("is_active", background=True)
        
        await db.command({
            "collMod": "job_postings",
            "validator": {
                "$jsonSchema": {
                    "bsonType": "object",
                    "required": [
                        "recruiter_id", "interview_field", "position_level", 
                        "work_model", "status", "location", "is_active", "created_at"
                    ],
                    "properties": {
                        "recruiter_id": {
                            "bsonType": "string",
                            "description": "ID of the recruiter - required"
                        },
                        "interview_field": {
                            "bsonType": "string",
                            "description": "Job domain/field - required"
                        },
                        "position_level": {
                            "bsonType": "string",
                            "description": "Seniority level - required"
                        },
                        "work_model": {
                            "bsonType": "string",
                            "description": "Remote/Hybrid/Onsite - required"
                        },
                        "status": {
                            "bsonType": "string",
                            "description": "Employment type - required"
                        },
                        "location": {
                            "bsonType": "string",
                            "description": "Job location - required"
                        },
                        "salary_range": {
                            "bsonType": "string",
                            "description": "Salary range"
                        },
                        "cv_file_ids": {
                            "bsonType": "array",
                            "items": {"bsonType": "objectId"},
                            "description": "List of linked CV file IDs"
                        },
                        "job_description": {
                            "bsonType": ["string", "null"],
                            "description": "Full job description text"
                        },
                        "is_active": {
                            "bsonType": "bool",
                            "description": "Whether job is active - required"
                        },
                        "created_at": {
                            "bsonType": "date",
                            "description": "Creation timestamp - required"
                        }
                    }
                }
            },
            "validationLevel": "moderate"
        })
        
        print("   ✓ Indexes created")
        print("   ✓ Schema validation set")
        
        # ==================== CVS COLLECTION ====================
        print("\n📄 Setting up 'cvs' collection...")
        
        await db.cvs.create_index("uploaded_at", background=True)
        await db.cvs.create_index("file_name", background=True)
        
        await db.command({
            "collMod": "cvs",
            "validator": {
                "$jsonSchema": {
                    "bsonType": "object",
                    "required": ["file_name", "content", "file_size", "uploaded_at"],
                    "properties": {
                        "file_name": {
                            "bsonType": "string",
                            "description": "Original filename - required"
                        },
                        "content": {
                            "bsonType": "string",
                            "description": "Parsed CV text content - required"
                        },
                        "file_size": {
                            "bsonType": "int",
                            "minimum": 0,
                            "description": "File size in bytes - required"
                        },
                        "uploaded_at": {
                            "bsonType": "date",
                            "description": "Upload timestamp - required"
                        }
                    }
                }
            },
            "validationLevel": "moderate"
        })
        
        print("   ✓ Indexes created")
        print("   ✓ Schema validation set")
        
        # ==================== SCREENING_RESULTS COLLECTION ====================
        print("\n🎯 Setting up 'screening_results' collection (CV SCREENING)...")
        
        # Create indexes optimized for Atlas
        await db.screening_results.create_index("job_description_id", background=True)
        await db.screening_results.create_index("cv_id", background=True)
        await db.screening_results.create_index([("overall_score", -1)], background=True)
        await db.screening_results.create_index("created_at", background=True)
        
        # Compound index for top candidates query (most used)
        await db.screening_results.create_index(
            [("job_description_id", 1), ("overall_score", -1)],
            background=True,
            name="top_candidates_idx"
        )
        
        # Create validation schema
        await db.command({
            "collMod": "screening_results",
            "validator": {
                "$jsonSchema": {
                    "bsonType": "object",
                    "required": [
                        "job_description_id", "cv_id", "candidate_name", 
                        "file_name", "overall_score", "skills_match", 
                        "experience_match", "education_match", "strengths", 
                        "weaknesses", "recommendation", "summary", "created_at"
                    ],
                    "properties": {
                        "job_description_id": {
                            "bsonType": "objectId",
                            "description": "Reference to job description - required"
                        },
                        "cv_id": {
                            "bsonType": "objectId",
                            "description": "Reference to CV document - required"
                        },
                        "candidate_name": {
                            "bsonType": "string",
                            "description": "Extracted candidate name - required"
                        },
                        "file_name": {
                            "bsonType": "string",
                            "description": "Original CV filename - required"
                        },
                        "overall_score": {
                            "bsonType": "double",
                            "minimum": 0,
                            "maximum": 100,
                            "description": "Overall match score (0-100) - required"
                        },
                        "skills_match": {
                            "bsonType": "double",
                            "minimum": 0,
                            "maximum": 100,
                            "description": "Skills match score (0-100) - required"
                        },
                        "experience_match": {
                            "bsonType": "double",
                            "minimum": 0,
                            "maximum": 100,
                            "description": "Experience match score (0-100) - required"
                        },
                        "education_match": {
                            "bsonType": "double",
                            "minimum": 0,
                            "maximum": 100,
                            "description": "Education match score (0-100) - required"
                        },
                        "strengths": {
                            "bsonType": "array",
                            "items": {"bsonType": "string"},
                            "description": "List of candidate strengths - required"
                        },
                        "weaknesses": {
                            "bsonType": "array",
                            "items": {"bsonType": "string"},
                            "description": "List of candidate weaknesses - required"
                        },
                        "recommendation": {
                            "bsonType": "string",
                            "enum": [
                                "Strongly Recommend", "Recommend", 
                                "Consider", "Not Recommended", "Error"
                            ],
                            "description": "Hiring recommendation - required"
                        },
                        "summary": {
                            "bsonType": "string",
                            "description": "Executive summary of candidate fit - required"
                        },
                        "created_at": {
                            "bsonType": "date",
                            "description": "Screening timestamp - required"
                        }
                    }
                }
            },
            "validationLevel": "moderate"
        })
        
        print("   ✓ Indexes created (including compound index for queries)")
        print("   ✓ Schema validation set with score ranges (0-100)")
        print("   ✓ Recommendation enum validation enabled")
        
        # ==================== SCREENING_BATCHES COLLECTION ====================
        print("\n📦 Setting up 'screening_batches' collection...")
        
        await db.screening_batches.create_index("job_description_id", background=True)
        await db.screening_batches.create_index("created_at", background=True)
        
        await db.command({
            "collMod": "screening_batches",
            "validator": {
                "$jsonSchema": {
                    "bsonType": "object",
                    "required": [
                        "job_description_id", "cv_ids", "result_ids", 
                        "total_candidates", "created_at"
                    ],
                    "properties": {
                        "job_description_id": {
                            "bsonType": "objectId",
                            "description": "Reference to job description - required"
                        },
                        "cv_ids": {
                            "bsonType": "array",
                            "items": {"bsonType": "objectId"},
                            "description": "List of CV IDs in batch - required"
                        },
                        "result_ids": {
                            "bsonType": "array",
                            "items": {"bsonType": "objectId"},
                            "description": "List of screening result IDs - required"
                        },
                        "total_candidates": {
                            "bsonType": "int",
                            "minimum": 0,
                            "description": "Total number of candidates - required"
                        },
                        "created_at": {
                            "bsonType": "date",
                            "description": "Batch creation timestamp - required"
                        },
                        "completed_at": {
                            "bsonType": ["date", "null"],
                            "description": "Batch completion timestamp"
                        }
                    }
                }
            },
            "validationLevel": "moderate"
        })
        
        print("   ✓ Indexes created")
        print("   ✓ Schema validation set")
        
        # ==================== COLLECTION INFO ====================
        print("\n📊 Collection Summary:")
        collections = await db.list_collection_names()
        for coll_name in ["job_descriptions", "cvs", "screening_results", "screening_batches"]:
            if coll_name in collections:
                count = await db[coll_name].count_documents({})
                indexes = await db[coll_name].index_information()
                print(f"   ✓ {coll_name}: {count} documents, {len(indexes)} indexes")
        
        print("\n✅ All collections initialized successfully!")
        print("\n💡 Collections created:")
        print("   - job_descriptions: Store job postings")
        print("   - cvs: Store uploaded resumes")
        print("   - screening_results: Store AI screening analysis (CV SCREENING)")
        print("   - screening_batches: Track batch screening sessions")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
    finally:
        client.close()
        print("\n🔌 Disconnected from MongoDB")


if __name__ == "__main__":
    print("=" * 60)
    print("MongoDB Atlas Collection Initialization")
    print("RecruBotX CV Screening System")
    print("=" * 60)
    asyncio.run(init_collections())
