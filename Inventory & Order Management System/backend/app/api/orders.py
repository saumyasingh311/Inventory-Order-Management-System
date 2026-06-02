from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.order import OrderCreate, OrderResponse
from app.services import order_service

router = APIRouter(prefix="/orders", tags=["orders"])


@router.post("", response_model=OrderResponse, status_code=201)
def create_order(data: OrderCreate, db: Session = Depends(get_db)):
    return order_service.create_order(db, data)


@router.get("", response_model=list[OrderResponse])
def list_orders(db: Session = Depends(get_db)):
    return order_service.get_orders(db)


@router.get("/{order_id}", response_model=OrderResponse)
def get_order(order_id: UUID, db: Session = Depends(get_db)):
    return order_service.get_order(db, order_id)


@router.delete("/{order_id}", status_code=204)
def delete_order(order_id: UUID, db: Session = Depends(get_db)):
    order_service.delete_order(db, order_id)
