# backend/app/api/api_routes.py
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.api.v1.endpoints import (
    endpoints_auth,
    endpoints_menu,
    endpoints_offers,
    endpoints_orders,
    endpoints_payments,
    endpoints_updates,
    endpoints_users
)

router = APIRouter()

router.include_router(endpoints_auth, prefix="/auth", tags=["Autenticación"])

router.include_router(endpoints_menu, prefix="/menu", tags=["Menú"])

router.include_router(endpoints_offers, prefix="/offers", tags=["Ofertas"])

router.include_router(endpoints_orders, prefix="/orders", tags=["Pedidos"])

router.include_router(endpoints_payments, prefix="/payments", tags=["Pagos"])

router.include_router(endpoints_updates, prefix="/updates", tags=["Actualizaciones"])

router.include_router(endpoints_users, prefix="/users", tags=["Usuarios"]) 