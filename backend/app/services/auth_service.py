
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import (
    create_access_token,
    hash_password,
    verify_password,
)
from app.models.user import User, UserRole


def register_user(
    db: Session,
    full_name: str,
    email: str,
    password: str,
) -> User:
    """Register a new member account."""

    existing_user = db.scalar(
        select(User).where(User.email == email)
    )

    if existing_user:
        raise ValueError("Email address is already registered")

    new_user = User(
        full_name=full_name,
        email=email,
        hashed_password=hash_password(password),
        role=UserRole.MEMBER,
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


def authenticate_user(
    db: Session,
    email: str,
    password: str,
) -> tuple[User, str] | None:
    """Verify credentials and generate an access token."""

    user = db.scalar(
        select(User).where(User.email == email)
    )

    if not user:
        return None

    if not verify_password(password, user.hashed_password):
        return None

    if not user.is_active:
        return None

    access_token = create_access_token(user.id)

    return user, access_token