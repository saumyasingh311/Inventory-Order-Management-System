from sqlalchemy.orm import Session

from app.models.customer import Customer
from app.models.order import Order
from app.models.product import Product
from app.schemas.dashboard import DashboardStats, LowStockProduct

LOW_STOCK_THRESHOLD = 10


def get_dashboard_stats(db: Session) -> DashboardStats:
    products = db.query(Product).all()
    low_stock = [
        LowStockProduct(
            id=p.id,
            name=p.name,
            sku=p.sku,
            stock_quantity=p.stock_quantity,
            price=p.price,
        )
        for p in products
        if p.stock_quantity <= LOW_STOCK_THRESHOLD
    ]

    return DashboardStats(
        total_products=db.query(Product).count(),
        total_customers=db.query(Customer).count(),
        total_orders=db.query(Order).count(),
        low_stock_products=low_stock,
    )
