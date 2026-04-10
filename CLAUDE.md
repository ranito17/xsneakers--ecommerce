# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Full-stack sneaker e-commerce platform with a React frontend and Node.js/Express backend, connected to a MySQL database. The system supports customer shopping (products, cart, orders, PayPal payments) and an admin panel (dashboard, analytics, user/product/order management, activity logs).

## Commands

### Backend (`/backend`)
```bash
npm run dev      # Start with nodemon (auto-restart on changes)
npm start        # Start with node (production)
```

### Frontend (`/frontend`)
```bash
npm start        # Dev server on http://localhost:3000
npm run build    # Production build
npm test         # Run tests (React Testing Library / Jest)
npm test -- --testPathPattern=<filename>  # Run a single test file
```

### Database
The schema is in `tables.sql` — import it into MariaDB/MySQL to set up the database.

## Environment Setup

Backend requires a `.env` file in `/backend/`. Key variables:
```
PORT=3001
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=
JWT_SECRET=
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
SESSION_SECRET=
FROM_EMAIL=
FROM_NAME=
ADMIN_EMAIL=
FRONTEND_URL=http://localhost:3000
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
PAYPAL_MODE=sandbox
```

Frontend reads `REACT_APP_API_URL` (defaults to `http://localhost:3001`).

## Architecture

### Backend (`/backend/src/`)

Follows a **Routes → Controllers → Models** pattern. Each domain has its own route, controller, and model file.

- `server.js` — entry point, starts Express on configured port
- `src/app.js` — Express app setup: CORS, Helmet, rate limiting, static file serving, route mounting
- `src/config/config.js` — centralizes all env vars; export is environment-specific (`development` or `production`)
- `src/config/database.js` — MySQL connection pool singleton; use `dbSingleton.getPool()` for queries, `dbSingleton.getDedicatedConnection()` for transactions (must call `.release()`)
- `src/models/` — raw SQL via `mysql2/promise`; no ORM abstraction despite Sequelize being installed
- `src/middleware/auth.js` — JWT authentication via HTTP-only cookie (`req.cookies.token`); sets `req.user` with `{ id, email, role, name }`
- `src/middleware/adminAuth.js` — role check (`req.user.role !== 'admin'`); always applied after `auth.js`
- `src/services/` — `emailService.js` (Nodemailer), `paypalService.js`, `pdfService.js`, `image.js`

**API route prefixes** (all under `/api/`):
- `/api/userRoutes`, `/api/productRoutes`, `/api/categoryRoutes`, `/api/cartRoutes`
- `/api/orderRoutes`, `/api/settingsRoutes`, `/api/contact`, `/api/supplier`
- `/api/messages`, `/api/upload`, `/api/activityRoutes`, `/api/analytics`, `/api/payments`

Static uploads served at `/uploads/` with `Cross-Origin-Resource-Policy: cross-origin` to allow the frontend on `:3000` to load images from the backend on `:3001`.

### Frontend (`/frontend/src/`)

React 18 SPA using React Router v6. All pages are lazy-loaded via `React.lazy`.

**Context providers** (nested in `App.jsx`):
- `AuthProvider` — user session state; calls `authApi.checkAuth()` on mount; exposes `{ user, isAuthenticated, login, logout }`
- `SettingsProvider` — global store settings (name, logo, etc.)
- `AdminStoreViewProvider` — detects when an admin navigates to customer-facing routes; blocks cart mutations in that mode
- `CartProvider` — cart state with dual strategy: localStorage for guests, server sync via `cartApi` for authenticated users; merges guest cart on login
- `ToastProvider` — global toast notifications

**Route structure** in `App.jsx`:
- `/` — `PagesLayout` (navbar + footer) wrapping all customer pages
- `/login`, `/signup`, `/forgot-password`, `/reset-password` — `AuthPage` with no layout
- `/admin/*` — `AdminLayout` wrapping all admin pages (protected)

**Services layer** (`/frontend/src/services/`): Each domain has its own `*Api.js` file. All use a shared Axios instance (`api.js`) configured with `withCredentials: true` (cookie-based auth), base URL from `REACT_APP_API_URL`, and a 10-second timeout. Re-export everything through `services/index.js`.

**Key hooks** in `/frontend/src/hooks/`: `useAuthentication` (wraps `AuthContext`), plus domain-specific hooks.

### Database

MySQL/MariaDB. Key tables: `users`, `products`, `categories`, `orders`, `carts`, `messages`, `activities`, `analytics`. Product sizes are stored as a JSON string in the `sizes` column and parsed in the model layer. Product images stored as comma-separated filenames, normalized to full URLs in `src/utils/image.js`.

## Key Patterns

- **Authentication flow**: Login sets an HTTP-only cookie on the backend; frontend reads auth state by calling `GET /api/userRoutes/check-auth` (via `authApi.checkAuth()`), not from localStorage.
- **Admin vs customer**: The `isAdminViewingStore` flag (from `AdminStoreViewContext`) prevents admins browsing the store from modifying the cart. Check this context before allowing cart mutations.
- **Image handling**: Upload endpoint saves to `backend/src/uploads/products/` or `backend/src/uploads/category/`. Stored filenames are converted to full URLs by `normalizeImageUrls()` in the model before sending to the frontend.
- **Transactions**: Use `dbSingleton.getDedicatedConnection()` for multi-step DB operations; always call `.release()` in a `finally` block.
