# SparePOS Backend

Production-ready REST API for **SparePOS** — a spare parts POS & inventory system.

**Stack:** Node.js · Express · MongoDB (Mongoose) · JWT · Zod · Helmet · CORS · Morgan · express-rate-limit

---

## 📁 Folder Structure

```
backend/
├── src/
│   ├── config/         # DB connection
│   ├── controllers/    # Route handlers (auth, users, products, sales, reports)
│   ├── middleware/     # auth (JWT + RBAC), validation, error handlers
│   ├── models/         # Mongoose schemas (User, Product, Sale)
│   ├── routes/         # Express routers mounted under /api/*
│   ├── seed/           # Database seeder (demo users + products)
│   ├── services/       # (placeholder for business logic)
│   ├── utils/          # token helper
│   └── server.js       # App entrypoint
├── .env.example
└── package.json
```

---

## 🚀 Installation

```bash
cd backend
cp .env.example .env      # then edit values
npm install
npm run seed              # creates demo users & products
npm run dev               # starts on http://localhost:5000
```

Requires **Node.js 18+** and a running **MongoDB** instance (local or Atlas).

### Environment variables (`.env`)

| Var | Purpose |
|---|---|
| `PORT` | API port (default `5000`) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Long random string |
| `JWT_EXPIRES_IN` | e.g. `7d` |
| `CORS_ORIGIN` | Comma-separated allowed origins (your frontend URL) |

---

## 👥 Demo Accounts (after `npm run seed`)

| Role | Username | Password |
|---|---|---|
| Admin | `admin` | `admin123` |
| Cashier | `cashier` | `cashier123` |
| Manager | `manager` | `manager123` |

---

## 🔐 Auth

All protected endpoints require `Authorization: Bearer <token>` header.

| Method | Endpoint | Roles | Body |
|---|---|---|---|
| POST | `/api/auth/login` | public | `{ username, password }` |
| POST | `/api/auth/register` | admin | `{ username, name, password, role, email? }` |
| GET | `/api/auth/me` | any auth | — |

---

## 📦 Products

| Method | Endpoint | Roles |
|---|---|---|
| GET | `/api/products?search=&category=&lowStock=true&page=1&limit=50` | any auth |
| GET | `/api/products/:id` | any auth |
| POST | `/api/products` | admin, manager |
| PUT | `/api/products/:id` | admin, manager |
| DELETE | `/api/products/:id` | admin |
| POST | `/api/products/:id/adjust-stock` `{ delta, reason? }` | admin, manager |

---

## 🛒 Sales (POS)

| Method | Endpoint | Roles |
|---|---|---|
| POST | `/api/sales` `{ items:[{productId,qty}], discount?, tax?, payment }` | all roles |
| GET | `/api/sales?from=&to=&cashier=&page=&limit=` | any auth |
| GET | `/api/sales/:id` | any auth |

Creating a sale automatically decrements product stock and rejects items with insufficient stock.

---

## 📊 Reports

| Method | Endpoint | Roles |
|---|---|---|
| GET | `/api/reports/dashboard` | admin, manager |

Returns 30-day totals, daily revenue series, top 10 products, low-stock items, and product count.

---

## 👤 Users (admin only)

| Method | Endpoint |
|---|---|
| GET | `/api/users` |
| PUT | `/api/users/:id` |
| DELETE | `/api/users/:id` |

---

## 🛡️ Security

- Passwords hashed with **bcrypt** (10 rounds)
- **JWT** tokens (HS256), 7-day default expiry
- **Helmet** security headers
- **CORS** with configurable origin allow-list
- **Rate limiting** (600 req / 15 min per IP)
- **Zod** validation on every write endpoint
- Role-based access control middleware (`authorize("admin", ...)`)

---

## 🔌 Connecting the React frontend

Set `VITE_API_URL=http://localhost:5000/api` in the frontend's `.env`, then replace
the localStorage-based `StoreProvider` (in `src/lib/store.tsx`) with `fetch` calls
to the endpoints above, attaching `Authorization: Bearer <token>` after login.

---

## 🏥 Health

```
GET /api/health  →  { status: "ok", uptime, ts }
```
