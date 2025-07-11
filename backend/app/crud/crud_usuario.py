# backend/app/crud/crud_usuario.py
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.models import models_usuario
from app.schemas import schemas_usuario
from app.core import core_security
from app.models.models_enums import Role

def get_user(db: Session, user_id: int) -> Optional[models_usuario.Usuario]:
    """
    Obtiene un usuario por su ID.
    """
    return db.query(models_usuario.Usuario).filter(models_usuario.Usuario.id == user_id).first()

def get_user_by_username(db: Session, username: str) -> Optional[models_usuario.Usuario]:
    """
    Obtiene un usuario por su nombre de usuario.
    """
    return db.query(models_usuario.Usuario).filter(models_usuario.Usuario.username == username).first()

def get_user_by_email(db: Session, email: str) -> Optional[models_usuario.Usuario]:
    """
    Obtiene un usuario por su correo electrónico.
    """
    return db.query(models_usuario.Usuario).filter(models_usuario.Usuario.email == email).first()

def get_users(db: Session, skip: int = 0, limit: int = 100) -> List[models_usuario.Usuario]:
    """
    Obtiene una lista de usuarios.
    """
    return db.query(models_usuario.Usuario).offset(skip).limit(limit).all()

def create_user(db: Session, user: schemas_usuario.UserCreate, role: Role = Role.CUSTOMER) -> models_usuario.Usuario:
    """
    Crea un nuevo usuario en la base de datos.
    Hashea la contraseña antes de almacenarla.
    """
    
    hashed_password = core_security.get_password_hash(user.password)
    db_user = models_usuario.Usuario(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password,
        full_name=user.full_name,
        role=role
    )
    try:
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
    except IntegrityError:
        db.rollback()
        raise ValueError("El nombre de usuario o el correo electrónico ya existen.")

def authenticate_user(db: Session, username: str, password: str) -> Optional[models_usuario.Usuario]:
    """
    Autentica un usuario verificando su nombre de usuario y contraseña.
    Se asume que 'username' es el email para el login con OAuth2PasswordRequestForm.
    """
    user = get_user_by_email(db, email=username)

    if not user:
        return None

    if not core_security.verify_password(password, user.hashed_password):
        return None

    return user

def update_user(db: Session, db_obj: models_usuario.Usuario, obj_in: schemas_usuario.UserUpdate) -> models_usuario.Usuario:
    """
    Actualiza la información de un usuario.
    """
    
    update_data = obj_in.dict(exclude_unset=True)
    if "password" in update_data:
        update_data["hashed_password"] = core_security.get_password_hash(update_data.pop("password"))
    
    for field, value in update_data.items():
        if field == "role":
            setattr(db_obj, field, Role(value))
        else:
            setattr(db_obj, field, value)
    
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def delete_user(db: Session, user_id: int) -> Optional[models_usuario.Usuario]:
    """
    Elimina un usuario de la base de datos.
    """
    user = db.query(models_usuario.Usuario).filter(models_usuario.Usuario.id == user_id).first()
    if user:
        db.delete(user)
        db.commit()
        return user
    return None