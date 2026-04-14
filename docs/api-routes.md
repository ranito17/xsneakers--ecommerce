# API Routes Reference

> Load with @docs/api-routes.md only when working on backend or API integration.

## Convention
- All routes prefixed with `/api`
- Auth routes require Bearer token in Authorization header
- Errors returned as `{ error: "message" }` with appropriate HTTP status

---

## Auth Routes (`/api/auth`)

| Method | Path | Description | Auth Required |
|--------|------|-------------|---------------|
| POST | /api/auth/register | Create new user account | No |
| POST | /api/auth/login | Login, returns JWT | No |
| POST | /api/auth/logout | Invalidate session | Yes |

---

## Product Routes (`/api/products`)

| Method | Path | Description | Auth Required |
|--------|------|-------------|---------------|
| GET | /api/products | List all products | No |
| GET | /api/products/:id | Single product | No |
| POST | /api/products | Create product | Admin |
| PUT | /api/products/:id | Update product | Admin |
| DELETE | /api/products/:id | Delete product | Admin |

---

## Order Routes (`/api/orders`)

| Method | Path | Description | Auth Required |
|--------|------|-------------|---------------|
| GET | /api/orders | User's orders | Yes |
| POST | /api/orders | Create order | Yes |
| GET | /api/orders/:id | Single order | Yes |
| POST | /api/orders/:id/capture | Capture PayPal payment | Yes |

---

## Cart Routes (`/api/cart`)

> Fill in — or note if cart is client-side only

---

## Admin Routes (`/api/admin`)

> Fill in

---

## Notes

- Add new routes here as they are created
- Never change an existing route URL without updating this doc and discussing with user
- All DB queries live in `/server/models` — routes call controllers which call models
