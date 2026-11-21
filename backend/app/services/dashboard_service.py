
from datetime import UTC, datetime

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.task import Task, TaskPriority, TaskStatus
from app.models.user import User, UserRole


def get_dashboard_summary(db: Session, current_user: User) -> dict:
    query = select(Task)

    if current_user.role != UserRole.ADMIN:
        query = query.where(
            (Task.created_by == current_user.id)
            | (Task.assignee_id == current_user.id)
        )

    now = datetime.now(UTC)

    total_tasks = db.scalar(
        select(func.count()).select_from(query.subquery())
    ) or 0

    completed_tasks = db.scalar(
        select(func.count()).select_from(
            query.where(Task.status == TaskStatus.COMPLETED).subquery()
        )
    ) or 0

    pending_tasks = db.scalar(
        select(func.count()).select_from(
            query.where(Task.status != TaskStatus.COMPLETED).subquery()
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

    status_counts = {}
    for task_status in TaskStatus:
        status_counts[task_status.value] = db.scalar(
            select(func.count()).select_from(
                query.where(Task.status == task_status).subquery()
            )
        ) or 0

    priority_counts = {}
    for task_priority in TaskPriority:
        priority_counts[task_priority.value] = db.scalar(
            select(func.count()).select_from(
                query.where(Task.priority == task_priority).subquery()
            )
        ) or 0

    return {
        "total_tasks": total_tasks,
        "completed_tasks": completed_tasks,
        "pending_tasks": pending_tasks,
        "overdue_tasks": overdue_tasks,
        "status_counts": status_counts,
        "priority_counts": priority_counts,
    }
