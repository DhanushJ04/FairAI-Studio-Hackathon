import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import init_db
from app.routers import upload, analysis, reports

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Initializing database...")
    await init_db()
    
    # We can pre-create a dummy user if needed since we are bypassing auth
    from app.database import async_session
    from app.models import User
    from sqlalchemy import select
    
    async with async_session() as session:
        result = await session.execute(select(User).where(User.username == "dummy_user"))
        user = result.scalars().first()
        if not user:
            logger.info("Creating dummy user since auth is bypassed...")
            dummy_user = User(
                id="dummy-user-id",
                username="dummy_user",
                email="dummy@example.com",
                hashed_password="dummy_password",
                full_name="Dummy User"
            )
            session.add(dummy_user)
            await session.commit()
            
    logger.info("Application started gracefully.")
    yield
    # Shutdown
    logger.info("Application shutting down.")


app = FastAPI(
    title="AI Bias Detection & Audit Platform API",
    description="Backend services for detecting and mitigating AI bias",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configurations
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routes
app.include_router(upload.router, prefix="/api", tags=["Upload"])
app.include_router(analysis.router, prefix="/api", tags=["Analysis"])
app.include_router(reports.router, prefix="/api", tags=["Reports"])

@app.get("/")
def read_root():
    return {"message": "Welcome to the AI Bias Detection API. View /docs for Swagger documentation."}
