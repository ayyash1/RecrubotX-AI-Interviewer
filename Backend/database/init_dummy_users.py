"""
Initialize Dummy Users in MongoDB
==================================

This script creates sample candidate users in the MongoDB database.
Run this once to populate the database with test users.
"""

import asyncio
from database.connection import db_manager
from database.crud import create_candidate_user, get_user_by_email


async def init_dummy_users():
    """Initialize database with dummy candidate users."""
    
    try:
        # Connect to database
        await db_manager.connect()
        db = db_manager.db
        
        print("Connected to MongoDB successfully!")
        print("Creating dummy users...")
        
        # List of dummy users
        dummy_users = [
            {
                "first_name": "John",
                "last_name": "Doe",
                "email": "john.doe@example.com",
                "password": "password123"
            },
            {
                "first_name": "Jane",
                "last_name": "Smith",
                "email": "jane.smith@example.com",
                "password": "password123"
            },
            {
                "first_name": "Mike",
                "last_name": "Johnson",
                "email": "mike.johnson@example.com",
                "password": "password123"
            },
            {
                "first_name": "Sarah",
                "last_name": "Williams",
                "email": "sarah.williams@example.com",
                "password": "password123"
            },
            {
                "first_name": "David",
                "last_name": "Brown",
                "email": "david.brown@example.com",
                "password": "password123"
            }
        ]
        
        created_count = 0
        skipped_count = 0
        
        for user_data in dummy_users:
            # Check if user already exists
            existing_user = await get_user_by_email(db, user_data["email"])
            
            if existing_user:
                print(f"  ⏭️  Skipped: {user_data['email']} (already exists)")
                skipped_count += 1
            else:
                # Create new user
                user_id = await create_candidate_user(
                    db,
                    user_data["first_name"],
                    user_data["last_name"],
                    user_data["email"],
                    user_data["password"]
                )
                print(f"  ✅ Created: {user_data['first_name']} {user_data['last_name']} ({user_data['email']})")
                created_count += 1
        
        print(f"\n✨ Done!")
        print(f"   Created: {created_count} users")
        print(f"   Skipped: {skipped_count} users (already existed)")
        
        # List all users
        total_users = await db.candidates.count_documents({})
        print(f"   Total users in database: {total_users}")
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
    finally:
        await db_manager.disconnect()


if __name__ == "__main__":
    print("=" * 60)
    print("RecruBotX - Initialize Dummy Users")
    print("=" * 60)
    asyncio.run(init_dummy_users())
