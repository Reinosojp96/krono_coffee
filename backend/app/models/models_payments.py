# backend/app/models/models_payments.py
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.types import Enum as SQLEnum
from datetime import datetime, timezone

from app.db.db_base import Base
from app.models.models_enums import PaymentMethod, PaymentStatus
class Payment(Base):
    """
    Modelo de base de datos para los registros de pagos.
    """
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    amount = Column(Float, nullable=False)
    payment_method = Column(SQLEnum(PaymentMethod), nullable=False)
    transaction_id = Column(String(100), unique=True, nullable=True)
    status = Column(SQLEnum(PaymentStatus), default=PaymentStatus.PENDING, nullable=False)
    payment_date = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    order = relationship("Order", back_populates="payments")
