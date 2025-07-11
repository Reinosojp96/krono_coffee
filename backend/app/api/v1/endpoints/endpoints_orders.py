# backend/app/api/v1/endpoints/orders.py
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.schemas import schemas_orders, schemas_usuario
from app.crud import crud_orders
from app.api.api_deps import (
    get_db,
    get_current_user,
    get_current_customer_user,
    get_current_employee_user,
    get_current_admin_user
)

router = APIRouter()

@router.post("/orders", response_model=schemas_orders.OrderOut, status_code=status.HTTP_201_CREATED, summary="Crear un nuevo pedido")
async def create_new_order(
    order_in: schemas_orders.OrderCreate,
    db: Session = Depends(get_db),
    current_user: schemas_usuario.UserOut = Depends(get_current_customer_user)
):
    """
    Permite a un cliente crear un nuevo pedido.
    """
    new_order = crud_orders.create_order(db=db, order=order_in, customer_id=current_user.id)
    return new_order

@router.get("/orders/me", response_model=List[schemas_orders.OrderOut], summary="Ver historial de pedidos del cliente actual")
async def read_my_orders(
    db: Session = Depends(get_db),
    current_user: schemas_usuario.UserOut = Depends(get_current_customer_user)
):
    """
    Permite a un cliente ver su historial de pedidos.
    """
    orders = crud_orders.get_orders_by_customer(db=db, customer_id=current_user.id)
    return orders

@router.get("/orders/{order_id}", response_model=schemas_orders.OrderOut, summary="Ver detalles de un pedido específico (Cliente/Empleado/Admin)")
async def read_order_details(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: schemas_usuario.UserOut = Depends(get_current_user) 
):
    """
    Permite a un cliente ver los detalles de su propio pedido, o a un empleado/admin ver cualquier pedido.
    """
    order = crud_orders.get_order(db=db, order_id=order_id)
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pedido no encontrado.")

    if current_user.role.value not in ["ADMIN", "EMPLOYEE"] and order.customer_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tienes permisos para ver este pedido.")

    return order

@router.get("/employee/orders", response_model=List[schemas_orders.OrderOut], summary="Ver todos los pedidos (filtrable por estado)",
            dependencies=[Depends(get_current_employee_user)])
async def read_all_orders_for_employee(
    db: Session = Depends(get_db),
    status: Optional[schemas_orders.OrderStatus] = None
):
    """
    Permite a un Empleado o Administrador ver todos los pedidos, con opción de filtrar por estado.
    """
    orders = crud_orders.get_all_orders(db=db, status=status)
    return orders

@router.put("/employee/orders/{order_id}/status", response_model=schemas_orders.OrderOut, summary="Actualizar estado de un pedido",
            dependencies=[Depends(get_current_employee_user)])
async def update_order_status_employee(
    order_id: int,
    new_status: schemas_orders.OrderUpdateStatus,
    db: Session = Depends(get_db)
):
    """
    Permite a un Empleado o Administrador actualizar el estado de un pedido.
    """
    order = crud_orders.update_order_status(db=db, order_id=order_id, new_status=new_status.status)
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pedido no encontrado.")
    return order


@router.delete("/admin/orders/{order_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Eliminar un pedido (Solo Admin)",
            dependencies=[Depends(get_current_admin_user)])
async def delete_order_admin(order_id: int, db: Session = Depends(get_db)):
    """
    Permite a un Administrador eliminar un pedido.
    """
    success = crud_orders.delete_order(db=db, order_id=order_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pedido no encontrado.")
    return
