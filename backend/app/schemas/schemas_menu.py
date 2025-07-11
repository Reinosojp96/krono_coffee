from pydantic import BaseModel, Field, HttpUrl, ConfigDict
from typing import Optional

class MenuItemBase(BaseModel):
    """
    Esquema base para propiedades comunes de un ítem del menú.
    """
    name: str = Field(..., min_length=2, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    price: float = Field(..., gt=0)
    category: str = Field(..., min_length=2, max_length=50)
    image_url: Optional[HttpUrl] = None
class MenuItemCreate(MenuItemBase):
    """
    Esquema para la creación de un nuevo ítem del menú.
    """
    is_available: bool = True

class MenuItemUpdate(MenuItemBase):
    """
    Esquema para la actualización de un ítem del menú existente.
    Todos los campos son opcionales.
    """
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    price: Optional[float] = Field(None, gt=0)
    category: Optional[str] = Field(None, min_length=2, max_length=50)
    image_url: Optional[HttpUrl] = None
    is_available: Optional[bool] = None

class MenuItemOut(MenuItemBase):
    """
    Esquema para la representación de un ítem del menú al ser devuelto por la API.
    """
    id: int
    is_available: bool

    model_config = ConfigDict(from_attributes=True)
