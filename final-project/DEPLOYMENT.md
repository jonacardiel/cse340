# Render Deployment Guide

This document covers deploying Driven Auto to Render with a PostgreSQL database.

## 1. Create PostgreSQL Database on Render
1. In Render dashboard, create a new PostgreSQL instance.
2. Save the Internal/External database URL.
3. Confirm database is reachable.

## 2. Create Web Service
1. Create a new Web Service from your GitHub repository.
2. Root directory: `final-project`
3. Build command:

```bash
npm install
```

4. Start command:

```bash
npm start
```

## 3. Environment Variables
Set these in Render service settings:
- `NODE_ENV=production`
- `PORT=10000` (Render typically injects this automatically)
- `SESSION_SECRET=<strong-random-secret>`
- `DB_URL=<render-postgres-connection-string>`
- `BYUI_CA_CERT_PATH=` (leave blank unless your hosting environment requires a custom CA file)

## 4. Database Initialization
The application calls `setupDatabase()` at startup. On first boot this creates tables and seed data if missing.

Seeded role accounts:
- `owner@drivenauto.test`
- `employee@drivenauto.test`
- `customer@drivenauto.test`

## 5. Post-Deploy Verification Checklist
- Home page loads
- Inventory list and detail pages load
- Login works with seeded accounts
- Customer can submit review and service request
- Employee/owner can update service request status
- Owner can access category and vehicle admin routes

## 6. Troubleshooting
### App boots but no data
- Verify `DB_URL` is valid.
- Check Render logs for connection errors.

### Session/login issues
- Ensure `SESSION_SECRET` is set.
- Confirm DB session table exists (`session`).

### 500 errors in production
- Check Render logs for SQL or route errors.
- Validate all required environment variables are present.
