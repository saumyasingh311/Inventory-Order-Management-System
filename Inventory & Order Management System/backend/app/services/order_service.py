from decimal import Decimal
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.orm import Session, joinedload

from app.models.order import Order, OrderItem
from app.models.product import Product
from app.schemas.order import OrderCreate, OrderItemResponse, OrderResponse
from app.services.customer_service import get_customer


def _order_to_response(order: Order) -> OrderResponse:
    items = [
        OrderItemResponse(
            id=item.id,
            product_id=item.product_id,
            quantity=item.quantity,
            price_at_order=item.price_at_order,
            product_name=item.product.name if item.product else None,
        )
        for item in order.items
    ]
    return OrderResponse(
        id=order.id,
        customer_id=order.customer_id,
        total_amount=order.total_amount,
        created_at=order.created_at,
        items=items,
        customer_name=order.customer.full_name if order.customer else None,
    )


def get_orders(db: Session) -> list[OrderResponse]:
    orders = (
        db.query(Order)
        .options(joinedload(Order.items).joinedload(OrderItem.product), joinedload(Order.customer))
        .order_by(Order.created_at.desc())
        .all()
    )
    return [_order_to_response(o) for o in orders]


def get_order(db: Session, order_id: UUID) -> OrderResponse:
    order = (
        db.query(Order)
        .options(joinedload(Order.items).joinedload(OrderItem.product), joinedload(Order.customer))
        .filter(Order.id == order_id)
        .first()
    )
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return _order_to_response(order)


def create_order(db: Session, data: OrderCreate) -> OrderResponse:
    get_customer(db, data.customer_id)

    qty_by_product: dict[UUID, int] = {}
    for item in data.items:
        qty_by_product[item.product_id] = qty_by_product.get(item.product_id, 0) + item.quantity

    line_totals: list[tuple[Product, int, Decimal]] = []
    for product_id, qty in qty_by_product.items():
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {product_id} not found")
        if product.stock_quantity < qty:
            raise HTTPException(status_code=400, detail="Insufficient inventory")
        line_totals.append((product, qty, product.price))

    total = sum(Decimal(qty) * price for _, qty, price in line_totals)

    order = Order(customer_id=data.customer_id, total_amount=total)
    db.add(order)
    db.flush()

    for product, qty, price in line_totals:
        order_item = OrderItem(
            order_id=order.id,
            product_id=product.id,
            quantity=qty,
            price_at_order=price,
        )
        db.add(order_item)
        product.stock_quantity -= qty

    db.commit()

    order = (
        db.query(Order)
        .options(joinedload(Order.items).joinedload(OrderItem.product), joinedload(Order.customer))
        .filter(Order.id == order.id)
        .first()
    )
    return _order_to_response(order)


def delete_order(db: Session, order_id: UUID) -> None:
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    db.delete(order)
    db.commit()
