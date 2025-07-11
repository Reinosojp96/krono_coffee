# backend/app/models/models_usuario.py
from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.types import Enum as SQLEnum

from app.db.db_base import Base
from app.models.models_enums import Role

class Usuario(Base):
    """
    Modelo de base de datos para los usuarios del sistema.
    """
    __tablename__ = "usuarios"

    id = Column(String, primary_key=True, index=True)
    document_type = Column(String(10))
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=True)
    role = Column(SQLEnum(Role), default=Role.CUSTOMER, nullable=False)
    is_active = Column(Boolean, default=True)

    orders = relationship("Order", back_populates="customer", lazy="selectin") 
