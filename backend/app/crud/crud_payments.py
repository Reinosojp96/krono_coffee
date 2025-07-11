# backend/app/crud/crud_payments.py
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from app.models import models_payments, models_enums
from app.schemas import schemas_payments

def get_payment(db: Session, payment_id: int) -> Optional[models_payments.Payment]:
    """
    Obtiene un registro de pago por su ID.
    """
    return db.query(models_payments.Payment).filter(models_payments.Payment.id == payment_id).first()

def get_payments_by_order(db: Session, order_id: int, skip: int = 0, limit: int = 100) -> List[models_payments.Payment]:
    """
    Obtiene los registros de pago asociados a un pedido específico.
    """
    return db.query(models_payments.Payment).filter(models_payments.Payment.order_id == order_id).offset(skip).limit(limit).all()

def get_all_payments(db: Session, status: Optional[models_enums.PaymentStatus] = None, method: Optional[models_enums.PaymentMethod] = None, skip: int = 0, limit: int = 100) -> List[models_payments.Payment]:
    """
    Obtiene todos los registros de pago, opcionalmente filtrados por estado y método.
    """
    query = db.query(models_payments.Payment)
    if status:
        query = query.filter(models_payments.Payment.status == status)
    if method:
        query = query.filter(models_payments.Payment.payment_method == method)
    return query.order_by(models_payments.Payment.payment_date.desc()).offset(skip).limit(limit).all()

def create_payment(db: Session, payment: schemas_payments.PaymentCreate) -> models_payments.Payment:
    """
    Crea un nuevo registro de pago.
    """
    db_payment = models_payments.Payment(
        order_id=payment.order_id,
        amount=payment.amount,
        payment_method=payment.payment_method,
        transaction_id=payment.transaction_id,
        status=payment.status or models_enums.PaymentStatus.PENDING,
        payment_date=datetime.now(timezone.utc)
    )
    db.add(db_payment)
    db.commit()
    db.refresh(db_payment)
    return db_payment

def update_payment_status(db: Session, payment_id: int, new_status: models_enums.PaymentStatus) -> Optional[models_payments.Payment]:
    """
    Actualiza el estado de un registro de pago.
    """
    db_payment = db.query(models_payments.Payment).filter(models_payments.Payment.id == payment_id).first()
    if db_payment:
        db_payment.status = new_status
        db.add(db_payment)
        db.commit()
        db.refresh(db_payment)
        return db_payment
    return None

def delete_payment(db: Session, payment_id: int) -> bool:
    """
    Elimina un registro de pago.
    """
    db_payment = db.query(models_payments.Payment).filter(models_payments.Payment.id == payment_id).first()
    if db_payment:
        db.delete(db_payment)
        db.commit()
        return True
    return False
