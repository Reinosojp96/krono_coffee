from datetime import datetime, timedelta, timezone
from typing import Optional, Union
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
from jose import JWTError, jwt
from passlib.context import cryptcontext

ph = PasswordHasher()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifica si una contraseña plana coincide con una contraseña hasheada usando Argon2.
    """
    try:
        ph.verify(hashed_password, plain_password)
        return True
    except VerifyMismatchError:
        return False
    except Exception as e:
        print(f"Error al verificar contraseña con Argon2: {e}")
        return False

def get_password_hash(password: str) -> str:
    """
    Hashea una contraseña para almacenarla de forma segura usando Argon2.
    """
    return ph.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    from app.core.settings import settings
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Union[dict, None]:
    from app.core.settings import settings
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        return None
    
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)