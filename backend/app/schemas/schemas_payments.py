from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime

from app.models.models_enums import PaymentMethod, PaymentStatus
class PaymentBase(BaseModel):
    """
    Esquema base para propiedades comunes de un pago.
    """
    order_id: int = Field(..., gt=0)
    amount: float = Field(..., gt=0)
    payment_method: PaymentMethod
    transaction_id: Optional[str] = Field(None, max_length=100)

class PaymentCreate(PaymentBase):
    """
    Esquema para la creación de un nuevo registro de pago.
    El estado puede ser proporcionado o se asumirá PENDING.
    """
    status: Optional[PaymentStatus] = PaymentStatus.PENDING

class PaymentOut(PaymentBase):
    """
    Esquema para la representación de un pago al ser devuelto por la API.
    """
    id: int
    status: PaymentStatus
    payment_date: datetime

    model_config = ConfigDict(from_attributes=True)
