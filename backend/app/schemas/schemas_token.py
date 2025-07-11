from pydantic import BaseModel

class Token(BaseModel):
    """
    Esquema para el token de acceso JWT.
    """
    access_token: str
    token_type: str

class TokenData(BaseModel):
    """
    Esquema para los datos contenidos dentro del token JWT.
    """
    username: str | None = None
    roles: list[str] = []