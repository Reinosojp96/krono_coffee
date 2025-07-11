# backend/app/models/models_menu.py
from sqlalchemy import Column, Integer, String, Float, Boolean
from sqlalchemy.orm import relationship

from app.db.db_base import Base
class MenuItem(Base):
    """
    Modelo de base de datos para los ítems del menú de la cafetería.
    """
    __tablename__ = "menu_items"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)
    description = Column(String(500), nullable=True)
    price = Column(Float, nullable=False)
    category = Column(String(50), nullable=False)
    image_url = Column(String(255), nullable=True)
    is_available = Column(Boolean, default=True, nullable=False)
    order_items = relationship("OrderItem", back_populates="menu_item")
    offers = relationship("Offer", back_populates="menu_item")
