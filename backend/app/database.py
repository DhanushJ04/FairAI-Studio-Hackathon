from motor.motor_asyncio import AsyncIOMotorClient
from app.config import MONGODB_URI, MONGODB_DB_NAME

client: AsyncIOMotorClient = None
db = None


async def connect_db():
    """Initialize the Motor client and database reference."""
    global client, db
    client = AsyncIOMotorClient(MONGODB_URI)
    db = client[MONGODB_DB_NAME]
    print(f"Connected to MongoDB database: {MONGODB_DB_NAME}")


async def close_db():
    """Close the Motor client connection."""
    global client
    if client:
        client.close()
        print("MongoDB connection closed.")


async def get_db():
    """Dependency that returns the Motor database instance."""
    return db


async def init_db():
    """Create indexes for collections on startup."""
    await connect_db()

    # Users collection indexes
    await db.users.create_index("email", unique=True)
    await db.users.create_index("username", unique=True)
    await db.users.create_index("provider_id")

    # Uploaded files collection indexes
    await db.uploaded_files.create_index("user_id")

    # Audit reports collection indexes
    await db.audit_reports.create_index("user_id")
    await db.audit_reports.create_index("status")
    await db.audit_reports.create_index("created_at")

    print("MongoDB indexes ensured.")
