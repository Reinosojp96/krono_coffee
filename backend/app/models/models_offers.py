# backend/app/models/models_offers.py
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone

from app.db.db_base import Base

class Offer(Base):
    """
    Modelo de base de datos para ofertas y promociones.
    """
    __tablename__ = "offers"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(String(500), nullable=True)
    discount_percentage = Column(Float, nullable=False)
    start_date = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    end_date = Column(DateTime, nullable=False)
    menu_item_id = Column(Integer, ForeignKey("menu_items.id"), nullable=True)

    menu_item = relationship("MenuItem", back_populates="offers")
