import os
import time

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import customers, dashboard, orders, products
from app.database.session import Base, engine

app = FastAPI(
    title="Inventory & Order Management API",
    description="REST API for products, customers, and orders",
    version="1.0.0",
)

cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in cors_origins],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(products.router)
app.include_router(customers.router)
app.include_router(orders.router)
app.include_router(dashboard.router)


def init_db(max_retries: int = 30, delay: float = 2.0):
    for attempt in range(max_retries):
        try:
            Base.metadata.create_all(bind=engine)
            return
        except Exception:
            if attempt == max_retries - 1:
                raise
            time.sleep(delay)


@app.on_event("startup")
def on_startup():
    init_db()


@app.get("/health")
def health():
    return {"status": "ok"}
