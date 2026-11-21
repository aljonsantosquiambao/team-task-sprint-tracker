
from datetime import datetime, timezone

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.task import Task, TaskStatus
from app.models.user import User, UserRole


def get_dashboard_summary(
    db: Session,
    current_user: User,
) -> dict:
    """Calculate task dashboard metrics."""

    query = select(Task)

    # Members only see their own or assigned tasks.
    if current_user.role != UserRole.ADMIN:
        query = query.where(
            (Task.created_by == current_user.id)
            | (Task.assignee_id == current_user.id)
        )

    now = datetime.now(timezone.utc)

    total_tasks = db.scalar(
        select(func.count()).select_from(query.subquery())
    ) or 0

    completed_tasks = db.scalar(
        select(func.count()).select_from(
            query.where(
                Task.status == TaskStatus.COMPLETED
            ).subquery()
        )
    ) or 0

    pending_tasks = db.scalar(
        select(func.count()).select_from(
            query.where(
                Task.status != TaskStatus.COMPLETED
            ).subquery()
        )
    ) or 0

    overdue_tasks = db.scalar(
        select(func.count()).select_from(
            query.where(
                Task.due_date < now,
                Task.status != TaskStatus.COMPLETED,
            ).subquery()
        )
    ) or 0

    return {
        "total_tasks": total_tasks,
        "completed_tasks": completed_tasks,
        "pending_tasks": pending_tasks,
        "overdue_tasks": overdue_tasks,
    }
