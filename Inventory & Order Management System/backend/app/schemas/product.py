from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class ProductCreate(BaseModel):
    name: str = Field(..., max_length=255)
    sku: str = Field(..., max_length=100)
    price: Decimal = Field(..., ge=0)
    stock_quantity: int = Field(..., ge=0)


class ProductUpdate(BaseModel):
    name: str | None = Field(None, max_length=255)
    sku: str | None = Field(None, max_length=100)
    price: Decimal | None = Field(None, ge=0)
    stock_quantity: int | None = Field(None, ge=0)


class ProductResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    sku: str
    price: Decimal
    stock_quantity: int
    created_at: datetime
