from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.schemas import schemas_usuario
from app.crud import crud_usuario
from app.api.api_deps import (
    get_db,
    get_current_user,
    get_current_admin_user,
    get_current_employee_user
)

router = APIRouter()

@router.get("/me", response_model=schemas_usuario.UserOut, summary="obtener informacion del usuario autenticado")
async def read_user_me(
    current_user: schemas_usuario.UserOut = Depends(get_current_user)
):
    """
    obtiene la informacion del perfil del usuario actualmente autenticado.
    """
    return current_user

@router.get("/{user_id}", response_model=schemas_usuario.UserOut, summary="Obtener información de un usuario por ID (Admin/Empleado)")
async def read_user_by_id(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: schemas_usuario.UserOut = Depends(get_current_employee_user)
):
    """
    Permite a un Administrador o Empleado obtener la información de un usuario específico.
    """
    user = crud_usuario.get_user(db, user_id=user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")
    return user

@router.put("/{user_id}", response_model=schemas_usuario.UserOut, summary="Actualizar información de un usuario (Admin/Propio Usuario)")
async def update_user_info(
    user_id: int,
    user_in: schemas_usuario.UserUpdate,
    db: Session = Depends(get_db),
    current_user: schemas_usuario.UserOut = Depends(get_current_user)
):
    """
    Permite a un Administrador actualizar cualquier usuario o a un usuario actualizar su propio perfil.
    """
    if current_user.id != user_id and current_user.role.value != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para actualizar este usuario."
        )

    user = crud_usuario.get_user(db, user_id=user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")

    updated_user = crud_usuario.update_user(db, db_obj=user, obj_in=user_in)
    return updated_user

@router.get("/", response_model=List[schemas_usuario.UserOut], summary="Listar todos los usuarios (Solo Admin)")
async def read_all_users(
    db: Session = Depends(get_db),
    current_user: schemas_usuario.UserOut = Depends(get_current_admin_user)
):
    """
    Permite a un Administrador listar todos los usuarios registrados.
    """
    users = crud_usuario.get_users(db)
    return users