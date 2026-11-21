from fastapi import FastAPI

app = FastAPI(
    title="Team Task & Sprint Tracker API",
    description="REST API for managing team tasks and sprints.",
    version="1.0.0",
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
