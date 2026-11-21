# Team Task & Sprint Tracker

A full-stack team task management application designed to help teams organize work, track task progress, manage assignments, and monitor sprint activities.

**Repository:** [GitHub – Team Task & Sprint Tracker](https://github.com/aljonsantosquiambao/team-task-sprint-tracker)

## Overview

Team Task & Sprint Tracker is a mini SaaS application built with Next.js, FastAPI, and PostgreSQL. It provides a centralized workspace where administrators and team members can manage tasks, monitor progress, and collaborate through role-based access.

The application uses JWT authentication, REST APIs, Docker Compose, and automated CI workflows to provide a structured and maintainable development environment.

## Features

### Authentication and Authorization
- User registration and login.
- JWT-based authentication.
- Secure password hashing using Argon2.
- Role-based access control (Admin and Member).
- Protected API endpoints.

### Task Management
- Create, view, update, and delete tasks with appropriate permissions.
- Assign tasks to team members.
- Track task status and priority.
- Filter tasks by status, priority, and assignee.
- Search tasks.
- Server-side pagination.
- Due-date tracking.

### Dashboard
- Overview of task statistics.
- Completed and pending task metrics.
- Overdue task monitoring.
- Recent task activity.
- Dashboard visualizations.

### Administration
- Admin-only user management.
- Role-based task permissions.
- Protected administrative endpoints.

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js, React, TypeScript |
| Styling | Tailwind CSS |
| UI Components | Lucide React |
| Charts | Recharts |
| Form Validation | React Hook Form, Zod |
| HTTP Client | Axios |
| Backend | Python, FastAPI |
| ORM | SQLAlchemy |
| Database | PostgreSQL |
| Database Migrations | Alembic |
| Authentication | JWT, Argon2 |
| Validation | Pydantic |
| Testing | Pytest, HTTPX |
| Code Quality | Ruff, ESLint, TypeScript |
| Containerization | Docker, Docker Compose |
| CI/CD | GitHub Actions |

## System Architecture

```text
                 User / Browser
                       |
                       v
              Next.js Frontend
                localhost:3000
                       |
                       | REST API / JWT
                       v
                FastAPI Backend
                localhost:8000
                       |
              SQLAlchemy ORM
                       |
                       v
                 PostgreSQL
                localhost:5433
```

The frontend communicates with the backend through REST API endpoints. The backend handles authentication, authorization, business logic, validation, and database operations.

## Project Structure

```text
team-task-sprint-tracker/
│
├── .github/
│   └── workflows/
│       ├── backend-ci.yml
│       └── frontend-ci.yml
│
├── backend/
│   ├── alembic/
│   │   └── versions/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── models/
│   │   ├── schemas/
│   │   └── services/
│   ├── tests/
│   ├── Dockerfile
│   ├── alembic.ini
│   └── requirements.txt
│
├── frontend/
│   ├── app/
│   ├── src/
│   ├── public/
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml
├── pyproject.toml
└── README.md
```

## Getting Started

### Prerequisites

Install the following:

- Docker Desktop
- Git
- Node.js 24 or compatible version
- Python 3.12 or compatible version (for local backend development)

### 1. Clone the Repository

```bash
git clone https://github.com/aljonsantosquiambao/team-task-sprint-tracker.git

cd team-task-sprint-tracker
```

### 2. Configure Backend Environment

Create `backend/.env`:

```env
DATABASE_URL=postgresql+psycopg://task_admin:task_password_2026@localhost:5433/task_tracker
SECRET_KEY=your-secure-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

Generate a secure secret key for your environment. Never commit `.env` files or production secrets.

### 3. Configure Frontend Environment

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api/v1
```

### 4. Start the Application with Docker

From the project root, run:

```bash
docker compose up -d --build
```

Docker Compose starts the following services:

| Service | URL / Port |
|---|---|
| Frontend | http://localhost:3000 |
| Backend | http://localhost:8000 |
| API Documentation | http://localhost:8000/docs |
| PostgreSQL | localhost:5433 |

The backend container handles database migrations during startup.

### 5. Stop the Application

```bash
docker compose down
```

To preserve database data, do not remove the `postgres_data` volume.

## Environment Variables

### Backend

| Variable | Description |
|---|---|
| DATABASE_URL | PostgreSQL connection string |
| SECRET_KEY | Secret key used for JWT signing |
| ALGORITHM | JWT signing algorithm |
| ACCESS_TOKEN_EXPIRE_MINUTES | Access token expiration time |

### Frontend

| Variable | Description |
|---|---|
| NEXT_PUBLIC_API_URL | Backend API base URL |

## API Documentation

FastAPI provides interactive API documentation through Swagger UI.

When the backend is running, visit:

**http://localhost:8000/docs**

The API provides endpoints for:

- Authentication and user registration.
- Current-user information.
- Task management and filtering.
- Dashboard statistics.
- Administrative user management.

The interactive API documentation provides the available routes, request schemas, response structures, and authentication requirements.

## Role-Based Access Control

| Capability | Admin | Member |
|---|---|---|
| View dashboard | Yes | Yes |
| View tasks | Yes | Yes |
| Create tasks | Yes | No |
| Edit permitted tasks | Yes | Yes |
| Assign tasks | Yes | No |
| Delete tasks | Yes | No |
| View team members | Yes | No |

Members can edit tasks they created or have been assigned, subject to the application's authorization rules.

## Running Tests

### Backend Tests

From the project root:

```powershell
.\backend-venv\Scripts\python.exe -m pytest backend\tests -v
```

### Backend Linting

```powershell
.\backend-venv\Scripts\python.exe -m ruff check backend
```

### Frontend Linting

```powershell
cd frontend
npm run lint
```

### TypeScript Validation

```powershell
npx tsc --noEmit
```

### Production Build

```powershell
npm run build
```

## Continuous Integration

GitHub Actions automatically validates the backend and frontend when changes are pushed to configured branches or pull requests are created.

### Backend CI
- Installs Python dependencies.
- Starts a PostgreSQL service.
- Runs Ruff.
- Applies Alembic database migrations.
- Executes backend tests.

### Frontend CI
- Installs Node.js dependencies.
- Runs ESLint.
- Validates TypeScript.
- Builds the production application.

## Architecture and Scalability

The application follows a modular client-server architecture that separates presentation, business logic, and data persistence. The Next.js frontend handles the user interface and communicates with the FastAPI backend through REST APIs. The backend is organized into API, service, model, schema, and configuration layers, allowing individual components to evolve independently.

PostgreSQL provides relational data storage, while SQLAlchemy manages database interactions and Alembic maintains schema migrations. JWT authentication and role-based access control protect application resources and enforce permissions at the API level.

Docker Compose simplifies local development by running the frontend, backend, and database as separate services. This separation also provides a foundation for deploying each component independently. GitHub Actions automates code-quality checks, database migrations, and tests to help prevent regressions.

For future scaling, the backend can be deployed behind a load balancer with multiple application instances. PostgreSQL can use connection pooling, indexing, backups, and read replicas as demand increases. Redis could be introduced for caching and background job coordination. Static frontend assets can be delivered through a CDN, while centralized logging and monitoring can improve operational visibility. These improvements provide a path toward supporting larger teams and increased workloads without requiring a complete architectural redesign.

## Project Status

- [x] Backend API implementation
- [x] JWT authentication and authorization
- [x] PostgreSQL integration
- [x] Task management and filtering
- [x] Dashboard and administration
- [x] Frontend implementation
- [x] Docker Compose setup
- [x] Backend automated tests
- [x] Frontend validation
- [x] GitHub Actions CI workflows
- [ ] Production deployment
- [ ] Demo walkthrough

## Author

**Aljon Quiambao**

GitHub: [aljonsantosquiambao](https://github.com/aljonsantosquiambao)

Portfolio: [aljonsantosquiambao.github.io](https://aljonsantosquiambao.github.io)