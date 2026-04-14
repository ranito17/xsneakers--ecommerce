# Database Schema Reference

> Load with @docs/db-schema.md only when working on DB-related tasks.
> DO NOT modify schema without explicit user approval.

## Connection Config
- Host: from `DB_HOST` env var
- Database: from `DB_NAME` env var
- Driver: MySQL2

---

## Tables

> Paste output of `DESCRIBE tablename;` for each table below.
> Keep this updated as schema evolves (only with user approval).

### `users`

| Column | Type | Null | Key | Default | Notes |
|--------|------|------|-----|---------|-------|
| id | INT | NO | PRI | auto_increment | |
| email | VARCHAR(255) | NO | UNI | | |
| password | VARCHAR(255) | NO | | | Hashed |
| role | ENUM | NO | | 'customer' | 'customer' or 'admin' |
| created_at | TIMESTAMP | NO | | CURRENT_TIMESTAMP | |

### `products`

| Column | Type | Null | Key | Default | Notes |
|--------|------|------|-----|---------|-------|
| id | INT | NO | PRI | auto_increment | |
| name | VARCHAR(255) | NO | | | |
| description | TEXT | YES | | | |
| price | DECIMAL(10,2) | NO | | | |
| stock | INT | NO | | 0 | |
| image_url | VARCHAR(500) | YES | | | |
| created_at | TIMESTAMP | NO | | CURRENT_TIMESTAMP | |

### `orders`

| Column | Type | Null | Key | Default | Notes |
|--------|------|------|-----|---------|-------|
| id | INT | NO | PRI | auto_increment | |
| user_id | INT | NO | FK | | References users.id |
| status | VARCHAR(50) | NO | | 'pending' | pending/paid/shipped/cancelled |
| total | DECIMAL(10,2) | NO | | | |
| paypal_order_id | VARCHAR(255) | YES | | | SANDBOX ID |
| created_at | TIMESTAMP | NO | | CURRENT_TIMESTAMP | |

### `order_items`

| Column | Type | Null | Key | Default | Notes |
|--------|------|------|-----|---------|-------|
| id | INT | NO | PRI | auto_increment | |
| order_id | INT | NO | FK | | References orders.id |
| product_id | INT | NO | FK | | References products.id |
| quantity | INT | NO | | | |
| price_at_purchase | DECIMAL(10,2) | NO | | | Snapshot of price |

---

## Relationships

```
users ──< orders ──< order_items >── products
```

---

## Rules
- Never modify a table structure without user approval
- Never run ALTER TABLE, DROP TABLE, or DROP COLUMN during a coding session
- price_at_purchase is a snapshot — do not derive from products.price at query time
