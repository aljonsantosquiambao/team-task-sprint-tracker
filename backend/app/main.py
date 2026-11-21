from fastapi import FastAPI

from app.api.auth import router as auth_router
from app.api.tasks import router as tasks_router
from app.api.dashboard import router as dashboard_router
from app.api.users import router as users_router


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

# Task management endpoints
app.include_router(
    tasks_router,
    prefix="/api/v1/tasks",
    tags=["Tasks"],
)

# Dashboard endpoints
app.include_router(
    dashboard_router,
    prefix="/api/v1/dashboard",
    tags=["Dashboard"],
)

# User management endpoints
app.include_router(
    users_router,
    prefix="/api/v1/users",
    tags=["Users"],
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
