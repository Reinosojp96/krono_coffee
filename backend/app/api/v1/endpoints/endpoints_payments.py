# backend/app/api/v1/endpoints/payments.py
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.schemas import schemas_payments, schemas_usuario
from app.crud import crud_payments
from app.api.api_deps import get_db, get_current_customer_user, get_current_employee_user, get_current_admin_user

router = APIRouter()

@router.post("/payments/initiate", response_model=schemas_payments.PaymentOut, status_code=status.HTTP_201_CREATED, summary="Iniciar un proceso de pago")
async def initiate_payment(
    payment_in: schemas_payments.PaymentCreate,
    db: Session = Depends(get_db),
    current_user: schemas_usuario.UserOut = Depends(get_current_customer_user)
):
    """
    Inicia un proceso de pago para un pedido.
    Esto podría generar un QR, un enlace de pago, o simplemente registrar la intención de pago.
    """
    new_payment = crud_payments.create_payment(db=db, payment=payment_in)
    return new_payment

@router.get("/payments/{payment_id}/status", response_model=schemas_payments.PaymentOut, summary="Consultar estado de un pago")
async def get_payment_status(
    payment_id: int,
    db: Session = Depends(get_db)
):
    """
    Consulta el estado de un pago específico.
    """
    payment = crud_payments.get_payment(db=db, payment_id=payment_id)
    if not payment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pago no encontrado.")
    return payment

@router.post("/employee/payments/record_cash", response_model=schemas_payments.PaymentOut, status_code=status.HTTP_201_CREATED, summary="Registrar pago en efectivo (Empleado)",
            dependencies=[Depends(get_current_employee_user)])
async def record_cash_payment(
    payment_data: schemas_payments.PaymentCreate,
    db: Session = Depends(get_db)
):
    """
    Permite a un Empleado registrar un pago en efectivo recibido.
    """
    if payment_data.payment_method.value != "CASH":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Método de pago no válido para esta ruta.")
    
    payment_data.status = schemas_payments.PaymentStatus.COMPLETED
    new_payment = crud_payments.create_payment(db=db, payment=payment_data)
    return new_payment

@router.put("/employee/payments/{payment_id}/status", response_model=schemas_payments.PaymentOut, summary="Actualizar estado de pago (Empleado/Admin)",
            dependencies=[Depends(get_current_employee_user)])
async def update_payment_status_employee(
    payment_id: int,
    new_status: schemas_payments.PaymentStatus,
    db: Session = Depends(get_db)
):
    """
    Permite a un Empleado o Administrador actualizar el estado de un pago.
    """
    payment = crud_payments.update_payment_status(db=db, payment_id=payment_id, new_status=new_status)
    if not payment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pago no encontrado.")
    return payment

@router.get("/admin/payments", response_model=List[schemas_payments.PaymentOut], summary="Ver historial de todos los pagos (Solo Admin)",
            dependencies=[Depends(get_current_admin_user)])
async def read_all_payments_admin(
    db: Session = Depends(get_db),
    status: Optional[schemas_payments.PaymentStatus] = None,
    method: Optional[schemas_payments.PaymentMethod] = None
):
    """
    Permite a un Administrador ver el historial completo de pagos, con filtros.
    """
    payments = crud_payments.get_all_payments(db=db, status=status, method=method)
    return payments