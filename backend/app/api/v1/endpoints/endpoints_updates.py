# backend/app/api/v1/endpoints/updates.py
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.schemas import schemas_updates
from app.crud import crud_updates
from app.api.api_deps import get_db, get_current_admin_user

router = APIRouter()

@router.get("/updates/daily", response_model=List[schemas_updates.DailyUpdateOut], summary="Obtener actualizaciones diarias")
async def read_daily_updates(db: Session = Depends(get_db)):
    """
    Obtiene la lista de actualizaciones diarias (noticias, eventos, etc.).
    """
    updates = crud_updates.get_daily_updates(db=db)
    return updates

@router.get("/updates/daily/{update_id}", response_model=schemas_updates.DailyUpdateOut, summary="Obtener una actualización diaria por ID")
async def read_daily_update_by_id(update_id: int, db: Session = Depends(get_db)):
    """
    Obtiene los detalles de una actualización diaria específica por su ID.
    """
    update = crud_updates.get_daily_update(db=db, update_id=update_id)
    if not update:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Actualización diaria no encontrada.")
    return update

@router.post("/admin/updates/daily", response_model=schemas_updates.DailyUpdateOut, status_code=status.HTTP_201_CREATED, summary="Crear una nueva actualización diaria (Solo Admin)",
            dependencies=[Depends(get_current_admin_user)])
async def create_new_daily_update(update: schemas_updates.DailyUpdateCreate, db: Session = Depends(get_db)):
    """
    Permite a un Administrador crear una nueva actualización diaria.
    """
    new_update = crud_updates.create_daily_update(db=db, update=update)
    return new_update

@router.put("/admin/updates/daily/{update_id}", response_model=schemas_updates.DailyUpdateOut, summary="Actualizar una actualización diaria (Solo Admin)",
            dependencies=[Depends(get_current_admin_user)])
async def update_existing_daily_update(update_id: int, update_data: schemas_updates.DailyUpdateUpdate, db: Session = Depends(get_db)):
    """
    Permite a un Administrador actualizar una actualización diaria existente.
    """
    update = crud_updates.update_daily_update(db=db, update_id=update_id, update_data=update_data.dict(exclude_unset=True))
    if not update:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Actualización diaria no encontrada.")
    return update

@router.delete("/admin/updates/daily/{update_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Eliminar una actualización diaria (Solo Admin)",
            dependencies=[Depends(get_current_admin_user)])
async def delete_existing_daily_update(update_id: int, db: Session = Depends(get_db)):
    """
    Permite a un Administrador eliminar una actualización diaria.
    """
    success = crud_updates.delete_daily_update(db=db, update_id=update_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Actualización diaria no encontrada.")
    return