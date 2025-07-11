# backend/app/crud/crud_menu.py
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session

from app.models import models_menu
from app.schemas import schemas_menu

def get_menu_item(db: Session, item_id: int) -> Optional[models_menu.MenuItem]:
    """
    Obtiene un ítem del menú por su ID.
    """
    return db.query(models_menu.MenuItem).filter(models_menu.MenuItem.id == item_id).first()

def get_menu_items(db: Session, is_available: Optional[bool] = None, skip: int = 0, limit: int = 100) -> List[models_menu.MenuItem]:
    """
    Obtiene una lista de ítems del menú, opcionalmente filtrados por disponibilidad.
    """
    query = db.query(models_menu.MenuItem)
    if is_available is not None:
        query = query.filter(models_menu.MenuItem.is_available == is_available)
    return query.offset(skip).limit(limit).all()

def create_menu_item(db: Session, item: schemas_menu.MenuItemCreate) -> models_menu.MenuItem:
    """
    Crea un nuevo ítem en el menú.
    """
    db_item = models_menu.MenuItem(**item.dict())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

def update_menu_item(db: Session, item_id: int, update_data: Dict[str, Any]) -> Optional[models_menu.MenuItem]:
    """
    Actualiza la información de un ítem del menú.
    `update_data` puede ser un diccionario directamente o de `item_update.dict(exclude_unset=True)`.
    """
    db_item = db.query(models_menu.MenuItem).filter(models_menu.MenuItem.id == item_id).first()
    if db_item:
        for field, value in update_data.items():
            setattr(db_item, field, value)
        db.add(db_item)
        db.commit()
        db.refresh(db_item)
        return db_item
    return None

def delete_menu_item(db: Session, item_id: int) -> bool:
    """
    Elimina un ítem del menú.
    Retorna True si se eliminó, False si no se encontró.
    """
    db_item = db.query(models_menu.MenuItem).filter(models_menu.MenuItem.id == item_id).first()
    if db_item:
        db.delete(db_item)
        db.commit()
        return True
    return False
