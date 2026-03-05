"""
Initialize Interview CVs Collection
====================================

Creates the interview_cvs collection with appropriate indexes.
Run this script once to set up the collection for voice interview CV storage.

Usage:
    python init_interview_cvs_collection.py
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")
DATABASE_NAME = os.getenv("DATABASE_NAME", "recrubotx_db")


async def init_interview_cvs_collection():
    """Initialize the interview_cvs collection with indexes."""
    
    client = AsyncIOMotorClient(MONGODB_URI)
    db = client[DATABASE_NAME]
    
    collection_name = "interview_cvs"
    
    print(f"🔧 Initializing '{collection_name}' collection...")
    
    # Create collection if it doesn't exist
    collections = await db.list_collection_names()
    if collection_name not in collections:
        await db.create_collection(collection_name)
        print(f"✅ Created collection: {collection_name}")
    else:
        print(f"ℹ️  Collection '{collection_name}' already exists")
    
    collection = db[collection_name]
    
    # Create indexes
    print("\n📊 Creating indexes...")
    
    # 1. Session ID (unique)
    await collection.create_index("session_id", unique=True, name="session_id_unique")
    print("✅ Created unique index on 'session_id'")
    
    # 2. Created at (for sorting)
    await collection.create_index("created_at", name="created_at_idx")
    print("✅ Created index on 'created_at'")
    
    # 3. Interview field (for filtering)
    await collection.create_index("interview_field", name="interview_field_idx")
    print("✅ Created index on 'interview_field'")
    
    # 4. Position level (for filtering)
    await collection.create_index("position_level", name="position_level_idx")
    print("✅ Created index on 'position_level'")
    
    # 5. Email address (for candidate lookup)
    await collection.create_index("email_address", name="email_address_idx")
    print("✅ Created index on 'email_address'")
    
    # 6. Compound index: interview_field + position_level
    await collection.create_index(
        [("interview_field", 1), ("position_level", 1)],
        name="field_level_compound_idx"
    )
    print("✅ Created compound index on 'interview_field' + 'position_level'")
    
    # Verify indexes
    print("\n📋 Current indexes:")
    indexes = await collection.list_indexes().to_list(length=None)
    for idx in indexes:
        print(f"  - {idx['name']}: {idx['key']}")
    
    print(f"\n✨ Successfully initialized '{collection_name}' collection!")
    print(f"📦 Database: {DATABASE_NAME}")
    
    # Get collection stats
    stats = await db.command("collstats", collection_name)
    print(f"📊 Current document count: {stats['count']}")
    
    client.close()


if __name__ == "__main__":
    print("=" * 60)
    print("Interview CVs Collection Initialization")
    print("=" * 60)
    asyncio.run(init_interview_cvs_collection())
    print("=" * 60)
