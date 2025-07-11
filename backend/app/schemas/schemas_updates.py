from __future__ import annotations

from datetime import date
from typing import Annotated

from pydantic import BaseModel, Field, ConfigDict


class DailyUpdateBase(BaseModel):
    """
    Esquema base para propiedades comunes de una actualización diaria.
    """
    title: Annotated[
        str,
        Field(..., min_length=3, max_length=100)
    ]
    content: Annotated[
        str,
        Field(..., min_length=10, max_length=1000)
    ]
    date: Annotated[
        date,
        Field(default_factory=date.today)
    ]
    related_menu_item_id: Annotated[
        int, Field(gt=0)
    ] | None = None


class DailyUpdateCreate(DailyUpdateBase):
    """
    Esquema para la creación de una nueva actualización diaria.
    """
    pass


class DailyUpdateUpdate(DailyUpdateBase):
    """
    Esquema para la actualización de una actualización diaria existente.
    Todos los campos son opcionales.
    """
    title: Annotated[
        str, Field(min_length=3, max_length=100)
    ] | None = None

    content: Annotated[
        str, Field(min_length=10, max_length=1000)
    ] | None = None

    date: Annotated[
        date, Field()
    ] | None = None

    related_menu_item_id: Annotated[
        int, Field(gt=0)
    ] | None = None


class DailyUpdateOut(DailyUpdateBase):
    """
    Esquema para la representación de una actualización diaria al ser devuelta por la API.
    """
    id: int

    model_config = ConfigDict(from_attributes=True)
