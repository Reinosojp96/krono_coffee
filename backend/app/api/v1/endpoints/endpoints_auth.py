from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.api.api_deps import get_db, get_settings
from app.core.core_security import create_access_token
from app.core.settings import Settings
from app.crud.crud_usuario import authenticate_user, get_user_by_username, create_user
from app.schemas.schemas_token import Token
from app.schemas.schemas_usuario import UserOut, UserCreate
from app.models.models_enums import Role

router = APIRouter()


@router.post(
    "/token",
    response_model=Token,
    summary="Obtener token de acceso (login)",
    description="Autentica a un usuario y devuelve un JWT Bearer token."
)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
    settings: Settings = Depends(get_settings),
):
    user = authenticate_user(db, username=form_data.username, password=form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario o contraseña incorrectos.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    expires_delta = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    token = create_access_token(
        data={
            "sub": user.username,
            "roles": [user.role.value]
        },
        expires_delta=expires_delta
    )

    return {
        "access_token": token,
        "token_type": "bearer"
    }


@router.post(
    "/register",
    response_model=UserOut,
    status_code=status.HTTP_201_CREATED,
    summary="Registrar nuevo usuario (solo CLIENTE)",
    description="Crea un usuario con rol CLIENTE; no permite registro con roles administrativos."
)
async def register_new_user(
    user_in: UserCreate,
    db: Session = Depends(get_db),
):

    existing = get_user_by_username(db, username=user_in.username)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"El nombre de usuario '{user_in.username}' ya está en uso."
        )

    new_user = create_user(
        db=db,
        user=user_in,
        role=Role.CUSTOMER
    )

    return new_user