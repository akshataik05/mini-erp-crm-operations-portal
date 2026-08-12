# Mini ERP + CRM Operations Portal

Production-style Full Stack Mini ERP & CRM Operations Portal built with Node.js, TypeScript, Express, PostgreSQL, Prisma ORM, JWT Authentication, Zod Validation, and React (Vite + Tailwind CSS).

---

## 🌟 Architecture Overview

```
                          ┌──────────────────────────┐
                          │   React Frontend (Vite)  │
                          └─────────────┬────────────┘
                                        │ Axios REST API Calls
                                        ▼
                          ┌──────────────────────────┐
                          │     Express REST API     │
                          └─────────────┬────────────┘
                                        │
                    ┌───────────────────┴───────────────────┐
                    │                                       │
         JWT Auth & RBAC Middleware                  Zod Validation
                    │                                       │
                    └───────────────────┬───────────────────┘
                                        ▼
                                   Controllers
                                        │
                                        ▼
                                    Services
                                        │ (PostgreSQL Transactions)
                                        ▼
                                   Prisma ORM
                                        │
                                        ▼
                                PostgreSQL Database
```

---

## 🚀 Key Features

- **Module 1 — Authentication & RBAC**:
  - Role-based authorization (`ADMIN`, `SALES`, `WAREHOUSE`, `ACCOUNTS`).
  - Hashed password storage with `bcryptjs`.
  - JWT bearer authentication middleware.
- **Module 2 — Customer CRM**:
  - Customer types (`RETAIL`, `WHOLESALE`, `DISTRIBUTOR`) and statuses (`LEAD`, `ACTIVE`, `INACTIVE`).
  - Search by customer name, mobile, or business name; filtering by status/type; pagination; detailed CRM profile & notes history.
- **Module 3 — Products & Inventory**:
  - Product catalog management with SKU indexing, pricing, warehouse locations, and minimum reorder stock thresholds.
  - Low stock alerts filter (`currentStock <= minimumStock`).
  - Audit trail stock movement tracking (`IN` / `OUT`). Every stock change creates a `StockMovement` entry—`currentStock` is never mutated directly without a logged movement.
  - Non-negative stock constraint enforced at database and service layer.
- **Module 4 — Sales Challan & PostgreSQL Transaction Flow**:
  - Multi-item sales challan generation with pricing and naming snapshots (`productNameSnapshot`, `skuSnapshot`, `unitPriceSnapshot`).
  - Automatic sequential challan number formatting (e.g. `CHAL-2026-0001`).
  - **Transaction-Safe Confirmation**: Interactive PostgreSQL transaction (`prisma.$transaction`) checks stock availability for all line items atomically. If sufficient, decrements `currentStock`, logs `OUT` stock movement records, and updates status to `CONFIRMED`.
  - If stock is insufficient, rolls back all changes and returns `HTTP 400 Bad Request` with `PRODUCT_OUT_OF_STOCK`.
  - Prevents duplicate confirmation or confirmation of cancelled challans.

---

## 🛠 Tech Stack

- **Backend**: Node.js (v22+), TypeScript, Express.js, PostgreSQL, Prisma ORM, JWT, bcryptjs, Zod, Jest, Supertest.
- **Frontend**: React 18, TypeScript, Vite, React Router DOM, Tailwind CSS, Axios, Lucide React Icons.

---

## 🗄 Database Schema (Prisma)

### Key Models & Indexes
- **`users`**: `id`, `name`, `email` (unique), `password`, `role` (`ADMIN`, `SALES`, `WAREHOUSE`, `ACCOUNTS`).
- **`customers`**: `id`, `name`, `mobile`, `email`, `businessName`, `gstNumber`, `customerType`, `address`, `status`, `followUpDate`, `notes`.
  - Indexes: `mobile`, `name`.
- **`products`**: `id`, `name`, `sku` (unique), `category`, `unitPrice`, `currentStock`, `minimumStock`, `warehouseLocation`.
  - Indexes: `sku`, `name`.
- **`stock_movements`**: `id`, `productId`, `quantity`, `movementType` (`IN`/`OUT`), `reason`, `createdBy`.
- **`challans`**: `id`, `challanNumber` (unique), `customerId`, `totalQuantity`, `totalAmount`, `status` (`DRAFT`, `CONFIRMED`, `CANCELLED`), `createdBy`.
  - Indexes: `challanNumber`, `status`.
- **`challan_items`**: `id`, `challanId`, `productId`, `productNameSnapshot`, `skuSnapshot`, `unitPriceSnapshot`, `quantity`.

---

## 📡 API Reference & RBAC Matrix

| Endpoint | Method | Required Roles | Description |
| :--- | :--- | :--- | :--- |
| `/api/auth/login` | POST | Public | Authenticates user credentials & returns JWT token |
| `/api/auth/me` | GET | Authenticated | Fetches current user profile |
| `/api/dashboard/stats` | GET | Authenticated | Returns summary metrics for dashboard cards |
| `/api/customers` | GET | All Roles | Lists customers with search, filter, pagination |
| `/api/customers` | POST | ADMIN, SALES | Creates a new customer CRM record |
| `/api/customers/:id` | GET | All Roles | Fetches customer details & notes history |
| `/api/customers/:id` | PUT | ADMIN, SALES | Updates customer details |
| `/api/customers/:id` | DELETE | ADMIN | Deletes customer |
| `/api/products` | GET | All Roles | Lists products with category & low stock filters |
| `/api/products` | POST | ADMIN, WAREHOUSE | Adds new product to catalog |
| `/api/products/:id` | PUT | ADMIN, WAREHOUSE | Updates product SKU/pricing |
| `/api/stock-movements` | GET | All Roles | Lists stock movement audit log |
| `/api/stock-movements` | POST | ADMIN, WAREHOUSE | Manually records IN/OUT stock movement |
| `/api/challans` | GET | All Roles | Lists sales challans |
| `/api/challans` | POST | ADMIN, SALES | Creates DRAFT sales challan |
| `/api/challans/:id/confirm` | POST | ADMIN, SALES, ACCOUNTS | **Executes PostgreSQL Transaction** to confirm & reduce stock |
| `/api/challans/:id/cancel` | POST | ADMIN, SALES | Cancels draft sales challan |
| `/api/users` | GET / POST | ADMIN | Admin user management |

---

## 🔑 Test Credentials (Seeded)

| Role | Email | Password |
| :--- | :--- | :--- |
| **ADMIN** | `admin@minierp.com` | `Admin@123` |
| **SALES** | `sales@minierp.com` | `Sales@123` |
| **WAREHOUSE** | `warehouse@minierp.com` | `Warehouse@123` |
| **ACCOUNTS** | `accounts@minierp.com` | `Accounts@123` |

---

## ⚙️ Local Setup Instructions

### 1. Backend Setup
```bash
cd backend
npm install

# Configure environment variables in backend/.env
# Example: DATABASE_URL="postgresql://postgres:postgres@localhost:5432/minierp?schema=public"

# Run Prisma migrations & seed test database
npx prisma generate
npx prisma db push
npm run prisma:seed

# Start backend server on http://localhost:5000
npm run dev
```

### 2. Frontend Setup
```bash
cd frontend
npm install

# Start Vite dev server on http://localhost:3000
npm run dev
```

### 3. Run Backend Automated Tests
```bash
cd backend
npm test
```

---

## 📄 Postman Collection

Import `postman_collection.json` located in the root workspace folder directly into Postman. It includes pre-configured environment variables (`{{baseUrl}}`, `{{authToken}}`) and endpoints for Auth, Customers, Products, Stock Movements, and Sales Challan confirmation transaction flows.

---

## 🌐 Deployment Instructions (Free Hosting Options)

### Backend Deployment (Render / Railway)
1. Push workspace repository to GitHub.
2. Create a Web Service on Render / Railway pointing to `backend/`.
3. Build Command: `npm install && npm run build`
4. Start Command: `npm start`
5. Set Environment Variables: `DATABASE_URL`, `JWT_SECRET`, `NODE_ENV=production`.

### Frontend Deployment (Vercel / Netlify)
1. Import repository into Vercel or Netlify.
2. Root directory: `frontend/`
3. Build Command: `npm run build`
4. Output directory: `dist`

### Database (Neon / Supabase PostgreSQL)
1. Create a free PostgreSQL database instance on Neon.tech or Supabase.com.
2. Copy the connection string to `DATABASE_URL` in backend `.env`.
3. Run `npx prisma db push` and `npm run prisma:seed`.
