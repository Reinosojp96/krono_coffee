# backend/app/crud/crud_offers.py
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from app.models import models_offers
from app.schemas import schemas_offers

def get_offer(db: Session, offer_id: int) -> Optional[models_offers.Offer]:
    """
    Obtiene una oferta por su ID.
    """
    return db.query(models_offers.Offer).filter(models_offers.Offer.id == offer_id).first()

def get_all_offers(db: Session, skip: int = 0, limit: int = 100) -> List[models_offers.Offer]:
    """
    Obtiene todas las ofertas, activas o inactivas.
    """
    return db.query(models_offers.Offer).offset(skip).limit(limit).all()

def get_active_offers(db: Session, skip: int = 0, limit: int = 100) -> List[models_offers.Offer]:
    """
    Obtiene solo las ofertas que están activas actualmente (fecha actual entre start_date y end_date).
    """
    now = datetime.now(timezone.utc)
    return db.query(models_offers.Offer).filter(
        models_offers.Offer.start_date <= now,
        models_offers.Offer.end_date >= now
    ).offset(skip).limit(limit).all()

def create_offer(db: Session, offer: schemas_offers.OfferCreate) -> models_offers.Offer:
    """
    Crea una nueva oferta.
    """
    db_offer = models_offers.Offer(**offer.dict())
    db.add(db_offer)
    db.commit()
    db.refresh(db_offer)
    return db_offer

def update_offer(db: Session, offer_id: int, update_data: Dict[str, Any]) -> Optional[models_offers.Offer]:
    """
    Actualiza la información de una oferta.
    `update_data` puede ser un diccionario directamente o de `offer_update.dict(exclude_unset=True)`.
    """
    db_offer = db.query(models_offers.Offer).filter(models_offers.Offer.id == offer_id).first()
    if db_offer:
        for field, value in update_data.items():
            setattr(db_offer, field, value)
        db.add(db_offer)
        db.commit()
        db.refresh(db_offer)
        return db_offer
    return None

def delete_offer(db: Session, offer_id: int) -> bool:
    """
    Elimina una oferta.
    """
    db_offer = db.query(models_offers.Offer).filter(models_offers.Offer.id == offer_id).first()
    if db_offer:
        db.delete(db_offer)
        db.commit()
        return True
    return False
