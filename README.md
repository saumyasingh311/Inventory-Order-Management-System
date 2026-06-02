Inventory & Order Management System
Production-ready full-stack application for managing products, customers, and orders with inventory tracking.

Tech Stack
Layer	Technology
Backend	Python, FastAPI, SQLAlchemy, Pydantic
Database	PostgreSQL 16
Frontend	React, Vite, Material UI, Axios, React Hook Form
DevOps	Docker, Docker Compose
Project Structure
inventory-system/
├── backend/          # FastAPI REST API
├── frontend/         # React SPA
├── docker-compose.yml
└── README.md
Quick Start (Docker)
Clone the repository and open a terminal in the project root.

Copy environment files (optional for Docker Compose — defaults are built in):

cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
Start all services:

docker compose up --build
Open the application:

Service	URL
Frontend	http://localhost:3000
Backend	http://localhost:8000
API Docs	http://localhost:8000/docs
Local Development (without Docker)
Backend
cd backend
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS/Linux
source .venv/bin/activate

pip install -r requirements.txt
Ensure PostgreSQL is running and set DATABASE_URL in backend/.env:

DATABASE_URL=postgresql://postgres:password@localhost:5432/inventory
uvicorn app.main:app --reload --port 8000
Frontend
cd frontend
npm install
cp .env.example .env
npm run dev
Frontend runs at http://localhost:3000 with API at http://localhost:8000.

API Endpoints
Products
Method	Endpoint	Description
POST	/products	Create product
GET	/products	List products
GET	/products/{id}	Get product
PUT	/products/{id}	Update product
DELETE	/products/{id}	Delete product
Customers
Method	Endpoint	Description
POST	/customers	Create customer
GET	/customers	List customers
GET	/customers/{id}	Get customer
DELETE	/customers/{id}	Delete customer
Orders
Method	Endpoint	Description
POST	/orders	Create order
GET	/orders	List orders
GET	/orders/{id}	Get order
DELETE	/orders/{id}	Delete order
Dashboard
Method	Endpoint	Description
GET	/dashboard/stats	Dashboard metrics
Business Rules
SKU uniqueness — duplicate SKU returns 400 SKU already exists
Email uniqueness — duplicate email returns 400 Email already exists
Stock validation — order quantity exceeding stock returns 400 Insufficient inventory
Auto total — order total = sum of quantity × product.price at order time
Inventory reduction — stock is decremented when an order is placed
Public Deployment
Recommended hosting:

Component	Platform	Notes
Database	Neon	Create a PostgreSQL database and copy the connection string
Backend	Render	Web Service, Python, start command below
Frontend	Vercel	Import frontend/, set env var
Backend on Render
Create a Web Service connected to this repo (backend as root directory).
Build command: pip install -r requirements.txt
Start command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
Environment variables:
DATABASE_URL — Neon connection string (use postgresql:// format)
CORS_ORIGINS — your Vercel URL, e.g. https://your-app.vercel.app
Frontend on Vercel
Import the repository with Root Directory = frontend.
Set environment variable:
VITE_API_URL = your Render backend URL (e.g. https://your-api.onrender.com)
Deploy. Vercel runs npm run build automatically.
Docker image deployment
The included Dockerfile files support container registries (Render Docker, Railway, etc.). Pass VITE_API_URL as a build arg for the frontend image.

Environment Variables
Backend (backend/.env)
DATABASE_URL=postgresql://postgres:password@db:5432/inventory
CORS_ORIGINS=http://localhost:3000
Frontend (frontend/.env)
VITE_API_URL=http://localhost:8000
License
MIT
