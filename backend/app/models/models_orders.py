from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.types import Enum as SQLEnum
from datetime import datetime, timezone

from app.db.db_base import Base
from app.models.models_enums import OrderStatus
class Order(Base):
    """
    Modelo de base de datos para los pedidos de los clientes.
    """
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    order_date = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    total_amount = Column(Float, nullable=False)
    status = Column(SQLEnum(OrderStatus), default=OrderStatus.PENDING, nullable=False)
    delivery_address = Column(String(255), nullable=True)
    notes = Column(String(500), nullable=True)
    customer = relationship("Usuario", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="order", cascade="all, delete-orphan")

class OrderItem(Base):
    """
    Modelo de base de datos para los ítems individuales dentro de un pedido.
    """
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    menu_item_id = Column(Integer, ForeignKey("menu_items.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    price_at_time_of_order = Column(Float, nullable=False)

    order = relationship("Order", back_populates="items")
    menu_item = relationship("MenuItem", back_populates="order_items")