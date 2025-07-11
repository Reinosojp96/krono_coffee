from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.settings import settings


is_sqlite = settings.DATABASE_URL.startswith("sqlite://")

engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False} if is_sqlite else {}
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()