# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.settings import settings

from app.db.db_base import Base
from app.db.db_session import engine

from app.api.v1.endpoints.endpoints_auth import router as auth_router
from app.api.v1.endpoints.endpoints_users import router as users_router
from app.api.v1.endpoints.endpoints_menu import router as menu_router
from app.api.v1.endpoints.endpoints_orders import router as orders_router
from app.api.v1.endpoints.endpoints_payments import router as payments_router
from app.api.v1.endpoints.endpoints_offers import router as offers_router
from app.api.v1.endpoints.endpoints_updates import router as updates_router

def create_db_and_tables():
    """
    Crea todas las tablas definidas en los modelos de SQLAlchemy en la base de datos.
    Útil para el desarrollo inicial. En producción, se recomienda usar migraciones (Alembic).
    """
    Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Eventos que se ejecutan al iniciar y al apagar la aplicación.
    """
    print("Iniciando la aplicación y creando tablas de la base de datos...")
    create_db_and_tables()
    yield
    print("Apagando la aplicación...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="API para la gestión de la cafetería Krono Coffee",
    version=settings.PROJECT_VERSION,
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/v1/auth", tags=["Autenticación"])
app.include_router(users_router, prefix="/api/v1/users", tags=["Usuarios"])
app.include_router(menu_router, prefix="/api/v1/menu", tags=["Menú"])
app.include_router(orders_router, prefix="/api/v1/orders", tags=["Pedidos"])
app.include_router(payments_router, prefix="/api/v1/payments", tags=["Pagos"])
app.include_router(offers_router, prefix="/api/v1/offers", tags=["Ofertas"])
app.include_router(updates_router, prefix="/api/v1/updates", tags=["Actualizaciones Diarias"])


@app.get("/", tags=["Root"])
async def read_root():
    """
    Endpoint de prueba para verificar que la API está en funcionamiento.
    """
    return {"message": "Bienvenido a la API de Krono Coffee"}