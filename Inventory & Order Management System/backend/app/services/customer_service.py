from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.customer import Customer
from app.schemas.customer import CustomerCreate


def get_customers(db: Session) -> list[Customer]:
    return db.query(Customer).order_by(Customer.created_at.desc()).all()


def get_customer(db: Session, customer_id: UUID) -> Customer:
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer


def create_customer(db: Session, data: CustomerCreate) -> Customer:
    if db.query(Customer).filter(Customer.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email already exists")

    customer = Customer(
        full_name=data.full_name,
        email=data.email,
        phone=data.phone,
    )
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return customer


def delete_customer(db: Session, customer_id: UUID) -> None:
    customer = get_customer(db, customer_id)
    db.delete(customer)
    db.commit()
