# backend/app/crud/crud_orders.py
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session, joinedload
from datetime import datetime, timezone

from app.models import models_orders, models_menu, models_enums
from app.schemas import schemas_orders

def get_order(db: Session, order_id: int) -> Optional[models_orders.Order]:
    """
    Obtiene un pedido por su ID, incluyendo sus ítems.
    """
    return db.query(models_orders.Order).options(joinedload(models_orders.Order.items)).filter(models_orders.Order.id == order_id).first()

def get_orders_by_customer(db: Session, customer_id: int, skip: int = 0, limit: int = 100) -> List[models_orders.Order]:
    """
    Obtiene los pedidos de un cliente específico.
    """
    return db.query(models_orders.Order).options(joinedload(models_orders.Order.items)).filter(models_orders.Order.customer_id == customer_id).offset(skip).limit(limit).all()

def get_all_orders(db: Session, status: Optional[models_enums.OrderStatus] = None, skip: int = 0, limit: int = 100) -> List[models_orders.Order]:
    """
    Obtiene todos los pedidos, opcionalmente filtrados por estado.
    """
    query = db.query(models_orders.Order).options(joinedload(models_orders.Order.items))
    if status:
        query = query.filter(models_orders.Order.status == status)
    return query.order_by(models_orders.Order.order_date.desc()).offset(skip).limit(limit).all()

def create_order(db: Session, order: schemas_orders.OrderCreate, customer_id: int) -> models_orders.Order:
    """
    Crea un nuevo pedido. Calcula el monto total y el estado inicial.
    """
    total_amount = 0.0
    order_items_db = []

    for item_in in order.items:
        menu_item = db.query(models_menu.MenuItem).filter(models_menu.MenuItem.id == item_in.menu_item_id).first()
        if not menu_item or not menu_item.is_available:
            raise ValueError(f"Ítem de menú con ID {item_in.menu_item_id} no encontrado o no disponible.")
        
        price_at_time_of_order = menu_item.price
        total_amount += price_at_time_of_order * item_in.quantity
        
        order_item_db = models_orders.OrderItem(
            menu_item_id=item_in.menu_item_id,
            quantity=item_in.quantity,
            price_at_time_of_order=price_at_time_of_order
        )
        order_items_db.append(order_item_db)

    db_order = models_orders.Order(
        customer_id=customer_id,
        total_amount=total_amount,
        status=models_enums.OrderStatus.PENDING,
        delivery_address=order.delivery_address,
        notes=order.notes,
        order_date=datetime.now(timezone.utc)
    )
    db.add(db_order)
    db.flush()

    for item_db in order_items_db:
        item_db.order_id = db_order.id
        db.add(item_db)

    db.commit()
    db.refresh(db_order)
    return db_order

def update_order_status(db: Session, order_id: int, new_status: models_enums.OrderStatus) -> Optional[models_orders.Order]:
    """
    Actualiza el estado de un pedido.
    """
    db_order = db.query(models_orders.Order).filter(models_orders.Order.id == order_id).first()
    if db_order:
        db_order.status = new_status
        db.add(db_order)
        db.commit()
        db.refresh(db_order)
        return db_order
    return None

def delete_order(db: Session, order_id: int) -> bool:
    """
    Elimina un pedido y sus ítems asociados.
    """
    db_order = db.query(models_orders.Order).filter(models_orders.Order.id == order_id).first()
    if db_order:
        db.query(models_orders.OrderItem).filter(models_orders.OrderItem.order_id == order_id).delete()
        db.delete(db_order)
        db.commit()
        return True
    return False