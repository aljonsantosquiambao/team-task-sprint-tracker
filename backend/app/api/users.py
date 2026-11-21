
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import require_admin
from app.db.database import get_db
from app.models.user import User
from app.schemas.user import UserResponse

router = APIRouter()


@router.get("/")
def get_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Retrieve all active users. Admin access only."""

    users = db.scalars(
        select(User)
        .where(User.is_active.is_(True))
        .order_by(User.full_name.asc())
    ).all()

    return {
        "success": True,
        "message": "Users retrieved successfully",
        "data": [
            UserResponse.model_validate(user).model_dump(mode="json")
            for user in users
        ],
        "meta": {
            "total": len(users),
        },
    }
