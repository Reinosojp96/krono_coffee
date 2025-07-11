# backend/app/api/v1/endpoints/endpoints_menu.py
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.schemas import schemas_menu
from app.crud import crud_menu
from app.api.api_deps import get_db, get_current_admin_user, get_current_employee_user

router = APIRouter()

@router.get("/menu", response_model=List[schemas_menu.MenuItemOut], summary="Obtener todos los ítems del menú disponibles")
async def read_menu_items(db: Session = Depends(get_db)):
    """
    Obtiene la lista de todos los ítems del menú que están disponibles para los clientes.
    """
    items = crud_menu.get_menu_items(db=db, is_available=True)
    return items

@router.get("/menu/{item_id}", response_model=schemas_menu.MenuItemOut, summary="Obtener un ítem de menú por ID")
async def read_menu_item_by_id(item_id: int, db: Session = Depends(get_db)):
    """
    Obtiene los detalles de un ítem de menú específico por su ID.
    """
    item = crud_menu.get_menu_item(db=db, item_id=item_id)
    if not item or not item.is_available:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ítem de menú no encontrado o no disponible.")
    return item

@router.get("/admin/menu/all", response_model=List[schemas_menu.MenuItemOut], summary="Obtener todos los ítems del menú (incluye no disponibles)",
            dependencies=[Depends(get_current_employee_user)])
async def read_all_menu_items(db: Session = Depends(get_db)):
    """
    Permite a un Empleado o Administrador ver todos los ítems del menú, incluyendo los no disponibles.
    """
    items = crud_menu.get_menu_items(db=db, is_available=None)
    return items

@router.put("/admin/menu/{item_id}/availability", response_model=schemas_menu.MenuItemOut, summary="Actualizar disponibilidad de un ítem",
            dependencies=[Depends(get_current_employee_user)])
async def update_menu_item_availability(item_id: int, is_available: bool, db: Session = Depends(get_db)):
    """
    Permite a un Empleado o Administrador cambiar la disponibilidad de un ítem del menú.
    """
    item = crud_menu.update_menu_item(db=db, item_id=item_id, update_data={"is_available": is_available})
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ítem de menú no encontrado.")
    return item

@router.post("/admin/menu", response_model=schemas_menu.MenuItemOut, status_code=status.HTTP_201_CREATED, summary="Crear un nuevo ítem de menú",
            dependencies=[Depends(get_current_admin_user)])
async def create_new_menu_item(item: schemas_menu.MenuItemCreate, db: Session = Depends(get_db)):
    """
    Permite a un Administrador crear un nuevo ítem en el menú.
    """
    new_item = crud_menu.create_menu_item(db=db, item=item)
    return new_item

@router.put("/admin/menu/{item_id}", response_model=schemas_menu.MenuItemOut, summary="Actualizar un ítem de menú",
            dependencies=[Depends(get_current_admin_user)])
async def update_existing_menu_item(item_id: int, item_update: schemas_menu.MenuItemUpdate, db: Session = Depends(get_db)):
    """
    Permite a un Administrador actualizar los detalles de un ítem de menú existente.
    """
    item = crud_menu.update_menu_item(db=db, item_id=item_id, update_data=item_update.dict(exclude_unset=True))
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ítem de menú no encontrado.")
    return item

@router.delete("/admin/menu/{item_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Eliminar un ítem de menú",
            dependencies=[Depends(get_current_admin_user)])
async def delete_existing_menu_item(item_id: int, db: Session = Depends(get_db)):
    """
    Permite a un Administrador eliminar un ítem de menú.
    """
    success = crud_menu.delete_menu_item(db=db, item_id=item_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ítem de menú no encontrado.")
    return