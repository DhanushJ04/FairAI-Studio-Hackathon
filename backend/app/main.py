import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import init_db, close_db
from app.routers import upload, analysis, reports, auth

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Initializing MongoDB...")
    await init_db()
    
    logger.info("Application started gracefully.")
    yield
    # Shutdown
    await close_db()
    logger.info("Application shutting down.")


app = FastAPI(
    title="FairAI Studio API",
    description="AI Bias Detection & Audit Backend",
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
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(upload.router, prefix="/api", tags=["Upload"])
app.include_router(analysis.router, prefix="/api", tags=["Analysis"])
app.include_router(reports.router, prefix="/api", tags=["Reports"])

@app.get("/")
def read_root():
    return {"message": "Welcome to the AI Bias Detection API. View /docs for Swagger documentation."}
