import uuid
from datetime import datetime

from sqlalchemy import Column, String, Integer, Numeric, DateTime, CheckConstraint
from sqlalchemy.dialects.postgresql import UUID

from app.database.session import Base


class Product(Base):
    __tablename__ = "products"
    __table_args__ = (CheckConstraint("stock_quantity >= 0", name="stock_quantity_non_negative"),)

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    sku = Column(String(100), unique=True, nullable=False)
    price = Column(Numeric(10, 2), nullable=False)
    stock_quantity = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
