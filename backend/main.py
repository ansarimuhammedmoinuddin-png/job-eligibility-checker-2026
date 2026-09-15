import os
import sys
from pathlib import Path
import logging
from typing import Dict, Any, List
from contextlib import asynccontextmanager

# Ensure repository root and backend directory are in sys.path
_current_dir = Path(__file__).resolve().parent
_repo_root = _current_dir.parent
if str(_repo_root) not in sys.path:
    sys.path.insert(0, str(_repo_root))
if str(_current_dir) not in sys.path:
    sys.path.insert(0, str(_current_dir))

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from dotenv import load_dotenv

from backend.schemas.eligibility import CandidateProfileRequest, EligibilityAnalysisResponse
from backend.services.eligibility_engine import EligibilityEngine
from backend.ml.predictor import ModelPredictor

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("job_checker_api")

# Global engine reference
engine: EligibilityEngine = None


def get_engine() -> EligibilityEngine:
    """Returns the cached EligibilityEngine instance, initializing on first access."""
    global engine
    if engine is None:
        logger.info("Initializing ML model predictor and evaluation engine...")
        model_path = os.getenv("MODEL_PATH", None)
        predictor = ModelPredictor(model_path=model_path)
        engine = EligibilityEngine(
            predictor=predictor,
            api_version=os.getenv("API_VERSION", "v1.4.2-py")
        )
        logger.info(f"Engine successfully initialized with model '{predictor.model_name}'.")
    return engine


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initializes and caches the ML model and evaluation engine upon startup."""
    get_engine()
    yield
    logger.info("Shutting down Job Eligibility Checker API.")


app = FastAPI(
    title="Job Eligibility Checker API",
    description="Machine Learning candidate assessment & career eligibility evaluation engine.",
    version="1.4.2",
    lifespan=lifespan
)

# Configure CORS - allow production Vercel frontend and local development origins
default_origins = [
    "https://job-eligibility-checker-2026.vercel.app",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000"
]
cors_env = os.getenv("CORS_ORIGINS", os.getenv("ALLOWED_ORIGINS", ""))
allowed_origins = list(default_origins)
if cors_env.strip():
    extra_origins = [orig.strip() for orig in cors_env.split(",") if orig.strip()]
    for orig in extra_origins:
        if orig not in allowed_origins:
            allowed_origins.append(orig)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https://job-eligibility-checker.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Sanitizes validation errors so frontend receives clean diagnostics without stack traces."""
    errors: List[Dict[str, Any]] = []
    for err in exc.errors():
        field_loc = " -> ".join([str(loc) for loc in err.get("loc", [])])
        errors.append({
            "field": field_loc,
            "message": err.get("msg", "Invalid input value")
        })
    
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": "Validation Error",
            "message": "The candidate profile submitted contains invalid or missing fields.",
            "details": errors
        }
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Catches unhandled errors and ensures stack traces are never exposed to clients."""
    logger.error(f"Unhandled error on request {request.method} {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "Internal Server Error",
            "message": "An unexpected error occurred during profile evaluation. Please try again."
        }
    )


@app.get("/", tags=["Info"])
async def root():
    return {
        "name": "Job Eligibility Checker API",
        "status": "operational",
        "docs": "/docs",
        "version": os.getenv("API_VERSION", "v1.4.2-py")
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """Verifies service health, ML model availability, and runtime metadata."""
    current_engine = get_engine()
    is_loaded = current_engine.predictor.is_loaded if current_engine else False
    model_name = current_engine.predictor.model_name if current_engine else "Uninitialized"
    
    return {
        "status": "healthy",
        "service": "job-eligibility-checker-api",
        "version": os.getenv("API_VERSION", "v1.4.2-py"),
        "model_loaded": is_loaded,
        "model_name": model_name,
        "metrics": current_engine.predictor.metrics if current_engine else {}
    }


@app.post(
    "/api/v1/evaluate-eligibility",
    response_model=EligibilityAnalysisResponse,
    status_code=status.HTTP_200_OK,
    tags=["Evaluation"]
)
async def evaluate_eligibility(profile: CandidateProfileRequest):
    """
    Evaluates a candidate profile against the selected target job role.
    
    Steps:
    1. Validates input profile schemas and boundaries.
    2. Normalizes candidate skills with alias mapping.
    3. Extracts candidate-job vectors for supervised ML inference.
    4. Computes probability-weighted ML scores and tier classification.
    5. Runs explainability layer for matched skills, missing skills, and bonus skills.
    6. Produces prioritized action recommendations and verdict summary.
    7. Returns the exact JSON payload expected by the React + TypeScript frontend.
    """
    current_engine = get_engine()
    if current_engine is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Eligibility evaluation engine is not ready."
        )

    try:
        result = current_engine.evaluate_profile(profile)
        return result
    except ValueError as val_err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(val_err)
        )
    except Exception as exc:
        logger.error(f"Error evaluating candidate profile: {exc}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to evaluate profile due to an internal server error."
        )


if __name__ == "__main__":
    import uvicorn
    host = os.getenv("API_HOST", "0.0.0.0")
    port = int(os.getenv("PORT", os.getenv("API_PORT", "8000")))
    reload_flag = os.getenv("RELOAD", "false").lower() in ("true", "1", "yes")
    uvicorn.run("backend.main:app", host=host, port=port, reload=reload_flag)
