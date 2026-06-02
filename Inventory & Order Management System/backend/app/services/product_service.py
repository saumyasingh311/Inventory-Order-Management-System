from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.product import Product
from app.schemas.product import ProductCreate, ProductUpdate


def get_products(db: Session) -> list[Product]:
    return db.query(Product).order_by(Product.created_at.desc()).all()


def get_product(db: Session, product_id: UUID) -> Product:
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


def create_product(db: Session, data: ProductCreate) -> Product:
    if db.query(Product).filter(Product.sku == data.sku).first():
        raise HTTPException(status_code=400, detail="SKU already exists")

    product = Product(
        name=data.name,
        sku=data.sku,
        price=data.price,
        stock_quantity=data.stock_quantity,
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


def update_product(db: Session, product_id: UUID, data: ProductUpdate) -> Product:
    product = get_product(db, product_id)

    if data.sku is not None and data.sku != product.sku:
        if db.query(Product).filter(Product.sku == data.sku).first():
            raise HTTPException(status_code=400, detail="SKU already exists")
        product.sku = data.sku

    if data.name is not None:
        product.name = data.name
    if data.price is not None:
        product.price = data.price
    if data.stock_quantity is not None:
        product.stock_quantity = data.stock_quantity

    db.commit()
    db.refresh(product)
    return product


def delete_product(db: Session, product_id: UUID) -> None:
    product = get_product(db, product_id)
    db.delete(product)
    db.commit()
