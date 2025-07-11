# backend/app/api/v1/endpoints/offers.py
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.schemas import schemas_offers
from app.crud import crud_offers
from app.api.api_deps import get_db, get_current_admin_user, get_current_employee_user

router = APIRouter()

@router.get("/offers", response_model=List[schemas_offers.OfferOut], summary="Obtener ofertas activas")
async def read_active_offers(db: Session = Depends(get_db)):
    """
    Obtiene la lista de todas las ofertas actualmente activas.
    """
    offers = crud_offers.get_active_offers(db=db)
    return offers

@router.get("/employee/offers/all", response_model=List[schemas_offers.OfferOut], summary="Obtener todas las ofertas (Empleado/Admin)",
            dependencies=[Depends(get_current_employee_user)])
async def read_all_offers(db: Session = Depends(get_db)):
    """
    Permite a un Empleado o Administrador ver todas las ofertas, incluyendo las inactivas.
    """
    offers = crud_offers.get_all_offers(db=db)
    return offers

@router.post("/admin/offers", response_model=schemas_offers.OfferOut, status_code=status.HTTP_201_CREATED, summary="Crear una nueva oferta (Solo Admin)",
            dependencies=[Depends(get_current_admin_user)])
async def create_new_offer(offer: schemas_offers.OfferCreate, db: Session = Depends(get_db)):
    """
    Permite a un Administrador crear una nueva oferta.
    """
    new_offer = crud_offers.create_offer(db=db, offer=offer)
    return new_offer

@router.put("/admin/offers/{offer_id}", response_model=schemas_offers.OfferOut, summary="Actualizar una oferta (Solo Admin)",
            dependencies=[Depends(get_current_admin_user)])
async def update_existing_offer(offer_id: int, offer_update: schemas_offers.OfferUpdate, db: Session = Depends(get_db)):
    """
    Permite a un Administrador actualizar una oferta existente.
    """
    offer = crud_offers.update_offer(db=db, offer_id=offer_id, update_data=offer_update.dict(exclude_unset=True))
    if not offer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Oferta no encontrada.")
    return offer

@router.delete("/admin/offers/{offer_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Eliminar una oferta (Solo Admin)",
            dependencies=[Depends(get_current_admin_user)])
async def delete_existing_offer(offer_id: int, db: Session = Depends(get_db)):
    """
    Permite a un Administrador eliminar una oferta.
    """
    success = crud_offers.delete_offer(db=db, offer_id=offer_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Oferta no encontrada.")
    return