
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.models.task import Task, TaskPriority, TaskStatus
from app.models.user import User, UserRole


def validate_assignee(db: Session, assignee_id: UUID | None):
    """Ensure the assigned user exists and is active."""

    if assignee_id is None:
        return None

    assignee = db.get(User, assignee_id)

    if assignee is None or not assignee.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assignee not found or inactive",
        )

    return assignee


def create_task(
    db: Session,
    task_data: dict,
    current_user: User,
) -> Task:
    """Create a task."""

    assignee_id = task_data.get("assignee_id")

    if current_user.role != UserRole.ADMIN and assignee_id is not None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can assign tasks",
        )

    validate_assignee(db, assignee_id)

    new_task = Task(
        **task_data,
        created_by=current_user.id,
    )

    db.add(new_task)
    db.commit()
    db.refresh(new_task)

    return new_task


def get_task(
    db: Session,
    task_id: UUID,
    current_user: User | None = None,
) -> Task:
    """Retrieve a task with visibility checks."""

    task = db.get(Task, task_id)

    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    if current_user and current_user.role != UserRole.ADMIN:
        if (
            task.created_by != current_user.id
            and task.assignee_id != current_user.id
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have access to this task",
            )

    return task


def list_tasks(
    db: Session,
    current_user: User,
    page: int = 1,
    limit: int = 10,
    task_status: TaskStatus | None = None,
    priority: TaskPriority | None = None,
    assignee_id: UUID | None = None,
    search: str | None = None,
):
    """Retrieve visible, filtered, and paginated tasks."""

    query = select(Task)

    if current_user.role != UserRole.ADMIN:
        query = query.where(
            or_(
                Task.created_by == current_user.id,
                Task.assignee_id == current_user.id,
            )
        )

    if task_status is not None:
        query = query.where(Task.status == task_status)

    if priority is not None:
        query = query.where(Task.priority == priority)

    if assignee_id is not None:
        query = query.where(Task.assignee_id == assignee_id)

    if search:
        query = query.where(
            Task.title.ilike(f"%{search}%")
        )

    total = db.scalar(
        select(func.count()).select_from(query.subquery())
    )

    tasks = db.scalars(
        query.order_by(Task.created_at.desc())
        .offset((page - 1) * limit)
        .limit(limit)
    ).all()

    return tasks, total or 0


def update_task(
    db: Session,
    task_id: UUID,
    update_data: dict,
    current_user: User,
) -> Task:
    """Update a task with role-based permission checks."""

    task = get_task(db, task_id, current_user)

    is_admin = current_user.role == UserRole.ADMIN

    if not is_admin and "assignee_id" in update_data:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can assign tasks",
        )

    protected_non_nullable_fields = {
        "title",
        "status",
        "priority",
    }

    for field in protected_non_nullable_fields:
        if field in update_data and update_data[field] is None:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"{field} cannot be null",
            )

    if is_admin and "assignee_id" in update_data:
        validate_assignee(db, update_data["assignee_id"])

    for field, value in update_data.items():
        setattr(task, field, value)

    db.commit()
    db.refresh(task)

    return task


def delete_task(
    db: Session,
    task_id: UUID,
) -> None:
    """Delete a task."""

    task = get_task(db, task_id)

    db.delete(task)
    db.commit()