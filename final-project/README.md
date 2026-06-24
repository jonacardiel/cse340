# Driven Auto - CSE 340 Final Project

Server-rendered used car dealership web application built with Node.js, Express, EJS, and PostgreSQL.

## Project Description
Driven Auto is a used car dealership platform that supports public inventory browsing, account-based customer interactions, and role-based operational management.

The application demonstrates:
- Multi-table relational PostgreSQL schema
- Session-based authentication and role authorization
- MVC architecture with server-side rendering
- Multi-stage service workflow tracking
- Dynamic admin content management

## Technology Stack
- Node.js + Express
- EJS templates (server-side rendering)
- PostgreSQL (`pg`)
- Session authentication (`express-session`, `connect-pg-simple`)
- Validation (`express-validator`)
- Password hashing (`bcrypt`)
- ESM modules (no CommonJS)

## Core Features Implemented
### Public Pages
- Home
- About
- Inventory list
- Category filtered inventory
- Vehicle detail pages
- Contact form

### Authentication and Roles
- Registration for customer accounts
- Login/logout with session persistence
- Role-based access:
  - Owner
  - Employee
  - Customer

### Customer Features
- Create, edit, and delete own vehicle reviews
- Submit service requests tied to vehicles
- View service request history and status timeline

### Employee / Owner Features
- Manage service queue and status updates
- Add status notes to service requests
- Review and update contact messages (`Received`, `Replied`, `Closed`)

### Owner-Only Features
- Category CRUD
- Vehicle create/delete and full-field editing

### Employee + Owner Vehicle Management
- Inventory management surface
- Employee-safe edit workflow for price/description/availability

## Database Schema (ERD)
Add your pgAdmin ERD screenshot here and commit it:
- Recommended path: `docs/erd.png`

After adding the image, embed it below:

```md
![Driven Auto ERD](docs/erd.png)
```

## User Roles
- Owner: Full content control, category and vehicle management, operational oversight.
- Employee: Service and contact operations, limited vehicle maintenance updates.
- Customer: Personal account access, review submissions, and service request tracking.

## Test Account Credentials
Use the following test account emails:
- Owner: `owner@drivenauto.test`
- Employee: `employee@drivenauto.test`
- Customer: `customer@drivenauto.test`

Password note:
- Password is intentionally not listed here per assignment requirements.

## Setup and Run Locally
1. Install dependencies:

```bash
npm install
```

2. Create `.env` using `.env.example`:

```env
PORT=3000
NODE_ENV=development
SESSION_SECRET=replace-me
DB_URL=postgres://username:password@localhost:5432/final_project
BYUI_CA_CERT_PATH=
```

3. Start in development mode:

```bash
npm run dev
```

4. Optional syntax validation:

```bash
npm run check
```

## Deployment (Render)
See full deployment instructions in:
- `DEPLOYMENT.md`

## Submission URLs
Update these before submission:
- GitHub repository URL: `REPLACE_WITH_GITHUB_URL`
- Live Render URL: `REPLACE_WITH_RENDER_URL`

## Known Limitations
- Mobile nav currently uses a simple responsive layout and does not include a hamburger toggle menu.
- Contact management supports status updates but does not yet include threaded internal responses.
- Review moderation tooling is basic and can be expanded with explicit owner/employee moderation actions.
- Automated tests are not yet implemented; current verification uses runtime/syntax checks and manual route validation.
