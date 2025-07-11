from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from datetime import datetime

from app.models.models_enums import OrderStatus

class OrderItemCreate(BaseModel):
    """
    Esquema para un ítem individual dentro de un pedido (al crear el pedido).
    """
    menu_item_id: int = Field(..., gt=0)
    quantity: int = Field(..., gt=0)

class OrderItemOut(BaseModel):
    """
    Esquema para la representación de un ítem de pedido al ser devuelto por la API.
    """
    id: int
    menu_item_id: int
    quantity: int
    price_at_time_of_order: float

    model_config = ConfigDict(from_attributes=True)

class OrderCreate(BaseModel):
    """
    Esquema para la creación de un nuevo pedido.
    """
    items: List[OrderItemCreate] = Field(..., min_items=1)
    delivery_address: Optional[str] = Field(None, max_length=255)
    notes: Optional[str] = Field(None, max_length=500)

class OrderUpdateStatus(BaseModel):
    """
    Esquema para actualizar solo el estado de un pedido.
    """
    status: OrderStatus

class OrderOut(BaseModel):
    """
    Esquema para la representación de un pedido al ser devuelto por la API.
    Incluye los ítems del pedido.
    """
    id: int
    customer_id: int
    order_date: datetime
    total_amount: float
    status: OrderStatus
    delivery_address: Optional[str] = None
    notes: Optional[str] = None
    items: List[OrderItemOut] = []

    model_config = ConfigDict(from_attributes=True)
