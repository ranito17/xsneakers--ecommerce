# Architecture Reference

> Load this file with @docs/architecture.md only when needed. Do not include in every session.

## System Overview

```
[Browser]
    ↓ HTTP/HTTPS
[React Frontend — /client]
    ↓ REST API calls
[Node.js Backend — /server]
    ↓ MySQL queries
[MySQL Database]
    
[Node.js Backend]
    ↓ PayPal SDK (SANDBOX)
[PayPal API]
```

## Frontend Structure (React)

```
/client
  /src
    /components      — Reusable UI components
    /pages           — Page-level components (routed)
    /context         — React context providers (auth, cart, etc.)
    /hooks           — Custom hooks
    /utils           — Helper functions
    /api             — API call wrappers
```

## Backend Structure (Node.js)

```
/server
  /routes            — Express route definitions
  /controllers       — Business logic handlers
  /models            — MySQL query functions
  /middleware        — Auth, error handling, etc.
  /config            — DB connection, PayPal config
```

## Key Data Flows

### Checkout Flow
1. User adds items → cart state (React context)
2. User initiates checkout → POST /api/orders
3. Backend creates order in DB → returns PayPal order ID
4. Frontend renders PayPal button (SANDBOX)
5. User approves → POST /api/orders/:id/capture
6. Backend captures payment → updates order status in DB

### Auth Flow
> Fill in once confirmed

### Product Flow
> Fill in once confirmed

## Environment Variables

| Variable | Used In | Notes |
|----------|---------|-------|
| DB_HOST | server/config | MySQL connection |
| DB_USER | server/config | MySQL connection |
| DB_PASS | server/config | MySQL connection |
| DB_NAME | server/config | MySQL connection |
| PAYPAL_CLIENT_ID | server/config | SANDBOX only |
| PAYPAL_SECRET | server/config | SANDBOX only |

## Database Tables (high-level)

> Fill in with actual tables — run `SHOW TABLES;` and paste here

| Table | Purpose |
|-------|---------|
| users | Customer accounts |
| products | Product catalog |
| orders | Order records |
| order_items | Line items per order |

## Known Constraints

- PayPal must stay in SANDBOX — never switch to live keys
- Do not modify DB schema without explicit user approval
- All backend routes must maintain their existing URL structure
