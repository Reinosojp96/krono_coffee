from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime

class OfferBase(BaseModel):
    """
    Esquema base para propiedades comunes de una oferta.
    """
    name: str = Field(..., min_length=3, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    discount_percentage: float = Field(..., gt=0, le=100)
    start_date: datetime
    end_date: datetime
    menu_item_id: Optional[int] = Field(None, gt=0)

class OfferCreate(OfferBase):
    """
    Esquema para la creación de una nueva oferta.
    """
    pass

class OfferUpdate(OfferBase):
    """
    Esquema para la actualización de una oferta existente.
    Todos los campos son opcionales.
    """
    name: Optional[str] = Field(None, min_length=3, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    discount_percentage: Optional[float] = Field(None, gt=0, le=100)
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    menu_item_id: Optional[int] = Field(None, gt=0)

class OfferOut(OfferBase):
    """
    Esquema para la representación de una oferta al ser devuelta por la API.
    """
    id: int

    model_config = ConfigDict(from_attributes=True)
