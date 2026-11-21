import sys
from pathlib import Path

from sqlalchemy import select

sys.path.insert(0, str(Path(__file__).resolve().parent))

from app.db.database import SessionLocal
from app.models.user import User, UserRole


ADMIN_EMAIL = "admin.test@example.com"


def promote_user_to_admin():
    with SessionLocal() as db:
        user = db.scalar(
            select(User).where(User.email == ADMIN_EMAIL)
        )

        if user is None:
            print(f"User not found: {ADMIN_EMAIL}")
            return

        user.role = UserRole.ADMIN
        db.commit()

        print("Administrator role assigned successfully.")
        print(f"Name: {user.full_name}")
        print(f"Email: {user.email}")
        print(f"Role: {user.role.value}")


if __name__ == "__main__":
    promote_user_to_admin()
