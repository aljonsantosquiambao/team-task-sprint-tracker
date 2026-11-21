
import os
import sys
from pathlib import Path

# Add the backend directory to Python's import path.
BACKEND_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_DIR))

# Force automated tests to use the dedicated test database.
os.environ["DATABASE_URL"] = (
    "postgresql+psycopg://task_admin:task_password_2026"
    "@localhost:5433/task_tracker_test"
)

import pytest
from app.db.database import Base, get_db
from app.main import app
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

TEST_DATABASE_URL = os.environ["DATABASE_URL"]

# Safety check: never run tests against the application database.
if not TEST_DATABASE_URL.endswith("/task_tracker_test"):
    raise RuntimeError("Tests must use task_tracker_test!")

test_engine = create_engine(
    TEST_DATABASE_URL,
    pool_pre_ping=True,
)

TestingSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=test_engine,
)


@pytest.fixture(scope="session", autouse=True)
def setup_test_database():
    Base.metadata.create_all(bind=test_engine)

    yield

    Base.metadata.drop_all(bind=test_engine)
    test_engine.dispose()


@pytest.fixture
def db_session():
    connection = test_engine.connect()
    transaction = connection.begin()

    session = TestingSessionLocal(bind=connection)

    yield session

    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture
def client(db_session):
    def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()
