from __future__ import annotations

import enum
import uuid
from datetime import UTC, datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Enum, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base

if TYPE_CHECKING:
    from app.models.task import Task


class UserRole(str, enum.Enum):
    ADMIN = "ADMIN"
    MEMBER = "MEMBER"


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        default=uuid.uuid4,
    )

    full_name: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
    )

    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        index=True,
        nullable=False,
    )

    hashed_password: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole, name="user_role"),
        default=UserRole.MEMBER,
        nullable=False,
    )

    is_active: Mapped[bool] = mapped_column(
        default=True,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        nullable=False,
    )

    created_tasks: Mapped[list[Task]] = relationship(
        back_populates="creator",
        foreign_keys="Task.created_by",
    )

    assigned_tasks: Mapped[list[Task]] = relationship(
        back_populates="assignee",
        foreign_keys="Task.assignee_id",
    )
