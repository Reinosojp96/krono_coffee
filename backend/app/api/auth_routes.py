from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.db.db_session import get_db
from app.crud.crud_usuario import authenticate_user
from app.core.core_security import create_access_token
from app.schemas.schemas_token import Token
from app.models import models_usuario
from app.schemas.schemas_usuario import UserCreate
from app.core.core_security import get_password_hash

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciales inválidas")

    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}
@router.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(models_usuario.Usuario).filter(
        models_usuario.Usuario.username == user.username
    ).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="El nombre de usuario ya existe")

    new_user = models_usuario.Usuario(
        id=user.id,
        document_type=user.document_type,
        full_name=user.full_name,
        username=user.username,
        email=user.email,
        hashed_password=get_password_hash(user.password)
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"msg": "Usuario registrado correctamente"}