# backend/app/schemas/schemas_usuario.py
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional

from app.models.models_enums import Role
class UserBase(BaseModel):
    """
    Esquema base para propiedades comunes de usuario.
    """
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    full_name: Optional[str] = Field(None, max_length=100)

class UserCreate(UserBase):
    """
    Esquema para la creación de un nuevo usuario.
    Requiere una contraseña.
    """
    document_type: str
    id: str
    full_name: str
    username: str
    email: EmailStr
    password: str = Field(..., min_length=6)

class UserUpdate(UserBase):
    """
    Esquema para la actualización de un usuario existente.
    Todos los campos son opcionales para permitir actualizaciones parciales.
    """
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    email: Optional[EmailStr] = None
    password: Optional[str] = Field(None, min_length=6)
    full_name: Optional[str] = Field(None, max_length=100)
    role: Optional[Role] = None
    is_active: Optional[bool] = None

class UserOut(UserBase):
    """
    Esquema para la representación de un usuario al ser devuelto por la API.
    Incluye el ID y el rol, excluye la contraseña hasheada.
    """
    id: int
    role: Role
    is_active: bool

    model_config = ConfigDict(from_attributes=True)
