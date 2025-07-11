# backend/app/crud/crud_updates.py
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from datetime import date

from app.models import models_updates
from app.schemas import schemas_updates

def get_daily_update(db: Session, update_id: int) -> Optional[models_updates.DailyUpdate]:
    """
    Obtiene una actualización diaria por su ID.
    """
    return db.query(models_updates.DailyUpdate).filter(models_updates.DailyUpdate.id == update_id).first()

def get_daily_updates(db: Session, skip: int = 0, limit: int = 100) -> List[models_updates.DailyUpdate]:
    """
    Obtiene una lista de actualizaciones diarias, ordenadas por fecha descendente.
    """
    return db.query(models_updates.DailyUpdate).order_by(models_updates.DailyUpdate.date.desc()).offset(skip).limit(limit).all()

def create_daily_update(db: Session, update: schemas_updates.DailyUpdateCreate) -> models_updates.DailyUpdate:
    """
    Crea una nueva actualización diaria.
    """
    db_update = models_updates.DailyUpdate(**update.dict())
    db.add(db_update)
    db.commit()
    db.refresh(db_update)
    return db_update

def update_daily_update(db: Session, update_id: int, update_data: Dict[str, Any]) -> Optional[models_updates.DailyUpdate]:
    """
    Actualiza la información de una actualización diaria.
    """
    db_update = db.query(models_updates.DailyUpdate).filter(models_updates.DailyUpdate.id == update_id).first()
    if db_update:
        for field, value in update_data.items():
            setattr(db_update, field, value)
        db.add(db_update)
        db.commit()
        db.refresh(db_update)
        return db_update
    return None

def delete_daily_update(db: Session, update_id: int) -> bool:
    """
    Elimina una actualización diaria.
    """
    db_update = db.query(models_updates.DailyUpdate).filter(models_updates.DailyUpdate.id == update_id).first()
    if db_update:
        db.delete(db_update)
        db.commit()
        return True
    return False
