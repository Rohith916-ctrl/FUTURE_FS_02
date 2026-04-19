# Mini CRM

A simple but fully functional mini CRM for managing leads from website contact forms.

## Features

- JWT admin authentication with bcrypt password hashing
- Protected admin dashboard
- Lead CRUD with notes and status updates
- Search, filtering, sorting, and pagination
- Glassmorphism-style responsive UI with loading states and toasts

## Tech Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MySQL + Sequelize
- Auth: JWT

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a local MySQL database named `mini_crm` (or update `.env`).

3. Update `.env` with your MySQL credentials.

4. Start both client and server:

   ```bash
   npm run dev
   ```

5. Open the client at `http://localhost:5173`.

## Default Admin

If the database is empty, the server seeds an admin from `.env`:

- Email: `admin@mini-crm.local`
- Password: `Admin@12345`

## API Endpoints

- `POST /api/auth/login`
- `GET /api/leads`
- `GET /api/leads/:id`
- `POST /api/leads`
- `PUT /api/leads/:id`
- `DELETE /api/leads/:id`

## Notes

- Public contact forms can send leads directly to `POST /api/leads`.
- The dashboard uses protected routes and a bearer token stored in local storage.
- The server auto-creates tables on startup with Sequelize `sync()`.
