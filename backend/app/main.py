from fastapi import FastAPI

from app.api.auth import router as auth_router


app = FastAPI(
    title="Team Task & Sprint Tracker API",
    description="REST API for managing team tasks and sprints.",
    version="1.0.0",
)


# Authentication endpoints
app.include_router(
    auth_router,
    prefix="/api/v1/auth",
    tags=["Authentication"],
)


@app.get("/")
def root():
    return {
        "success": True,
        "message": "Team Task & Sprint Tracker API is running!",
        "data": {
            "application": "Team Task & Sprint Tracker",
            "version": "1.0.0",
        },
    }


@app.get("/api/v1/health")
def health_check():
    return {
        "success": True,
        "message": "API is healthy",
        "data": {
            "status": "UP",
        },
    }
