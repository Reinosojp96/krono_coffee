# backend/app/api/api_deps.py
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import JWTError, jwt

from app.core.settings import settings
from app.db.db_session import get_db
from app.core import core_security

from app.schemas import schemas_usuario
from app.crud import crud_usuario
from app.models.models_enums import Role

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token")

async def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
) -> schemas_usuario.UserOut:
    """
    Dependencia para obtener el usuario actualmente autenticado a partir de un token JWT.
    """
    
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudieron validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = core_security.decode_access_token(token)
        if payload is None:
            raise credentials_exception
        
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        
        user = crud_usuario.get_user_by_username(db, username=username)
        if user is None:
            raise credentials_exception
        
        return schemas_usuario.UserOut.from_orm(user)
    except JWTError:
        raise credentials_exception

async def get_current_active_user(
    current_user: schemas_usuario.UserOut = Depends(get_current_user)
) -> schemas_usuario.UserOut:
    """
    Dependencia para obtener el usuario activo actualmente autenticado.
    """
    return current_user

async def get_current_admin_user(
    current_user: schemas_usuario.UserOut = Depends(get_current_active_user)
) -> schemas_usuario.UserOut:
    """
    Dependencia para verificar si el usuario autenticado es un ADMINISTRADOR.
    """
    
    if current_user.role != Role.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos de administrador."
        )
    return current_user

async def get_current_employee_user(
    current_user: schemas_usuario.UserOut = Depends(get_current_active_user)
) -> schemas_usuario.UserOut:
    """
    Dependencia para verificar si el usuario autenticado es un EMPLEADO o ADMINISTRADOR.
    """
    
    if current_user.role not in [Role.ADMIN, Role.EMPLOYEE]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos de empleado."
        )
    return current_user

async def get_current_customer_user(
    current_user: schemas_usuario.UserOut = Depends(get_current_active_user)
) -> schemas_usuario.UserOut:
    """
    Dependencia para verificar si el usuario autenticado es un CLIENTE.
    """
    
    if current_user.role != Role.CUSTOMER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos de cliente."
        )
    return current_user

def get_settings():
    """
    Devuelve la configuración cargada desde el archivo .env usando Pydantic Settings.
    """
    return settings