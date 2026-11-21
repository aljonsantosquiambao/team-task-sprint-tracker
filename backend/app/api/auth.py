
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import (
    get_current_user as get_authenticated_user,
)
from app.api.deps import (
    require_admin,
)
from app.db.database import get_db
from app.models.user import User
from app.schemas.auth import LoginRequest, TokenResponse
from app.schemas.user import UserRegister, UserResponse
from app.services.auth_service import (
    authenticate_user,
    register_user,
)

router = APIRouter()


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(
    payload: UserRegister,
    db: Session = Depends(get_db),
):
    try:
        user = register_user(
            db=db,
            full_name=payload.full_name,
            email=payload.email,
            password=payload.password,
        )
        return user

    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(error),
        ) from error


@router.post(
    "/login",
    response_model=TokenResponse,
)
def login(
    payload: LoginRequest,
    db: Session = Depends(get_db),
):
    result = authenticate_user(
        db=db,
        email=payload.email,
        password=payload.password,
    )

    if result is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user, access_token = result

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=user,
    )


@router.get(
    "/me",
    response_model=UserResponse,
)
def get_me(
    current_user: User = Depends(get_authenticated_user),
):
    return current_user


@router.get("/admin-check")
def admin_check(
    current_user: User = Depends(require_admin),
):
    return {
        "success": True,
        "message": "Administrator access granted",
        "data": {
            "email": current_user.email,
            "role": current_user.role.value,
        },
    }


@router.get("/member-check")
def member_check(
    current_user: User = Depends(get_authenticated_user),
):
    return {
        "success": True,
        "message": "Authenticated user access granted",
        "data": {
            "email": current_user.email,
            "role": current_user.role.value,
        },
    }
