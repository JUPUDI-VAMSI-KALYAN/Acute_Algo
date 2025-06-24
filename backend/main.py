import logging
import uvicorn
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from routes import analysis, ai, database, health, feedback, auth

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting Acute Algo API server")
    yield
    # Shutdown
    logger.info("Shutting down Acute Algo API server")


# Initialize FastAPI app
app = FastAPI(
    title="Acute Algo API",
    description="GitHub Repository Analysis API",
    version="1.0.0",
    lifespan=lifespan,
)

# Dynamic CORS origins based on environment
cors_origins = [
    "http://localhost:3000",  # Local development
    "http://127.0.0.1:3000",  # Alternative local
]

# Add production URL if it exists
frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    cors_origins.append(frontend_url)
    logger.info(f"Added frontend URL to CORS: {frontend_url}")

# Add fallback production URL for backwards compatibility
production_url = "https://walrus-app-2-ono4l.ondigitalocean.app"
if production_url not in cors_origins:
    cors_origins.append(production_url)

logger.info(f"CORS origins configured: {cors_origins}")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router)
app.include_router(auth.router)
app.include_router(analysis.router)
app.include_router(ai.router)
app.include_router(database.router)
app.include_router(feedback.router)


@app.get("/")
async def root():
    return {"message": "Welcome to the Acute Algo API!"}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
