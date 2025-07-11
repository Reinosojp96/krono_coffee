from sqlalchemy import Column, Integer, String, Date, ForeignKey
from sqlalchemy.orm import relationship
from datetime import date

from app.db.db_base import Base

class DailyUpdate(Base):
    """
    Modelo de base de datos para actualizaciones diarias, noticias o eventos.
    """
    __tablename__ = "daily_updates"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(100), nullable=False)
    content = Column(String(1000), nullable=False)
    date = Column(Date, default=date.today, nullable=False)
    related_menu_item_id = Column(Integer, ForeignKey("menu_items.id"), nullable=True)
