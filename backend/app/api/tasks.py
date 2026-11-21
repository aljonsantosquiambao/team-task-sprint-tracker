
from math import ceil
from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_admin
from app.db.database import get_db
from app.models.task import TaskPriority, TaskStatus
from app.models.user import User
from app.schemas.task import TaskCreate, TaskResponse, TaskUpdate
from app.services.task_service import (
    create_task,
    delete_task,
    get_task,
    list_tasks,
    update_task,
)

router = APIRouter()


@router.get("/")
def get_tasks(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=100),
    task_status: TaskStatus | None = None,
    priority: TaskPriority | None = None,
    assignee_id: UUID | None = None,
    search: str | None = Query(default=None, max_length=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    tasks, total = list_tasks(
        db=db,
        current_user=current_user,
        page=page,
        limit=limit,
        task_status=task_status,
        priority=priority,
        assignee_id=assignee_id,
        search=search,
    )

    total_pages = ceil(total / limit) if total else 0

    return {
        "success": True,
        "message": "Tasks retrieved successfully",
        "data": [
            TaskResponse.model_validate(task).model_dump(mode="json")
            for task in tasks
        ],
        "meta": {
            "page": page,
            "limit": limit,
            "total": total,
            "total_pages": total_pages,
        },
    }


@router.post(
    "/",
    status_code=status.HTTP_201_CREATED,
)
def create_new_task(
    payload: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = create_task(
        db=db,
        task_data=payload.model_dump(),
        current_user=current_user,
    )

    return {
        "success": True,
        "message": "Task created successfully",
        "data": TaskResponse.model_validate(task).model_dump(mode="json"),
    }


@router.get("/{task_id}")
def get_task_by_id(
    task_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = get_task(db, task_id, current_user)

    return {
        "success": True,
        "message": "Task retrieved successfully",
        "data": TaskResponse.model_validate(task).model_dump(mode="json"),
    }


@router.put("/{task_id}")
def update_existing_task(
    task_id: UUID,
    payload: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = update_task(
        db=db,
        task_id=task_id,
        update_data=payload.model_dump(exclude_unset=True),
        current_user=current_user,
    )

    return {
        "success": True,
        "message": "Task updated successfully",
        "data": TaskResponse.model_validate(task).model_dump(mode="json"),
    }


@router.delete("/{task_id}")
def delete_existing_task(
    task_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    delete_task(db, task_id)

    return {
        "success": True,
        "message": "Task deleted successfully",
        "data": None,
    }
