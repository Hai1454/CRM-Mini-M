# CRM Mini Backend API

Base URL: `http://localhost:4000/api`

Authentication uses JWT Bearer token:

`Authorization: Bearer <token>`

## Auth

- `POST /auth/login` - login by email or username and password.
- `GET /auth/profile` - current logged-in user.
- `GET /auth/me` - frontend-compatible alias for current user.
- `POST /auth/logout` - stateless logout response.

## Customers

- `GET /customers?q=&status=` - list/search/filter customers.
- `GET /customers/:id` - customer detail.
- `POST /customers` - create customer.
- `PUT /customers/:id` - update customer.
- `DELETE /customers/:id` - admin only.

## Customer History

- `GET /customer-history` - list/search care history.
- `GET /customer-history/:id` - care history detail.
- `GET /customer-history/customer/:customerId` - history for one customer.
- `POST /customer-history` - create care note.
- `PUT /customer-history/:id` - update care note.
- `DELETE /customer-history/:id` - admin only.

`/care-history` is also available as a frontend-compatible alias.

## Orders

- `GET /orders?q=` - list/search orders.
- `GET /orders/:id` - order detail with `details`.
- `POST /orders` - create order and order detail.
- `PUT /orders/:id` - update order and order detail.
- `DELETE /orders/:id` - admin only.

## Products

- `GET /products?q=` - list/search products.
- `GET /products/:id` - product detail.
- `POST /products` - admin only.
- `PUT /products/:id` - admin only.
- `DELETE /products/:id` - admin only.

## Users

- `GET /users` - admin only, list staff accounts.
- `GET /users/:id` - admin only, staff detail.
- `POST /users` - admin only, create staff/admin account.
- `PUT /users/:id` - admin only, update account and customer permissions.
- `PATCH /users/:id/password` - admin only, change password.
- `DELETE /users/:id` - admin only.

## Dashboard / Reports

- `GET /dashboard` - frontend summary.
- `GET /dashboard/summary` - total customers, orders, products, care notes, revenue.
- `GET /dashboard/revenue` - total revenue and revenue by month.
- `GET /dashboard/customers` - customer count by status.
- `GET /dashboard/orders` - order count by status and recent orders.

## Security Checklist

- Passwords are hashed with bcrypt.
- JWT is required for protected APIs.
- Admin-only APIs check role before action.
- Staff can only access assigned customer data.
- Zod validates request bodies.
- Password fields are never returned in API responses.
- Database connection and JWT secret are stored in `.env`.
