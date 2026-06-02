from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel


class LowStockProduct(BaseModel):
    id: UUID
    name: str
    sku: str
    stock_quantity: int
    price: Decimal


class DashboardStats(BaseModel):
    total_products: int
    total_customers: int
    total_orders: int
    low_stock_products: list[LowStockProduct]
