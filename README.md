# 🏛️ BPSC Registration & Profile Management (RPM)

A full-stack **Registration and Profile Management** system for the **Bangladesh Public Service Commission (BPSC)**. The platform provides a unified, lifelong applicant profile, streamlined exam application workflows, payment integration, multi-language support (English & Bangla), and administrative dashboards.

---

## 📑 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
  - [1. Clone the Repository](#1-clone-the-repository)
  - [2. Development Setup (Recommended)](#2-development-setup-recommended)
  - [3. Production Setup (Docker)](#3-production-setup-docker)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Project Structure](#project-structure)
- [Available Scripts](#available-scripts)
- [Database](#database)
- [Internationalization (i18n)](#internationalization-i18n)
- [License](#license)

---

## Overview

The RPM module introduces a centralized, lifelong applicant profile system to replace the existing per-exam registration workflow. Key capabilities include:

- **One-time Registration** – Candidates register once and maintain a permanent profile across all BPSC examinations (BCS Cadre, Non-Cadre, Senior Scale, Departmental).
- **Online Application** – Apply directly from the profile for published circulars with integrated payment.
- **Dashboards** – Applicant and admin dashboards for tracking applications, notifications, and deadlines.
- **Notifications** – In-app and email-based notification system.
- **Multi-language** – Full English and Bangla (বাংলা) support via i18next.

---

## Architecture

```
┌───────────────────┐       ┌───────────────────┐       ┌──────────────────┐
│                   │       │                   │       │                  │
│   React Frontend  │◄─────►│  Express Backend  │◄─────►│   PostgreSQL 16  │
│   (Vite + TS)     │  API  │  (Node.js + TS)   │  SQL  │   (Alpine)       │
│   Port: 5173      │       │  Port: 5000        │       │   Port: 5432     │
│                   │       │                   │       │                  │
└───────────────────┘       └───────────────────┘       └──────────────────┘
```

---

## Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| **Node.js 22** | Runtime |
| **Express 4** | HTTP framework |
| **TypeScript** | Type safety |
| **PostgreSQL 16** | Relational database |
| **pg** | PostgreSQL client |
| **Zod** | Request validation |
| **JWT** | Authentication (access + refresh tokens) |
| **bcryptjs** | Password hashing |
| **Nodemailer** | Email / OTP delivery |
| **Multer** | File uploads |
| **Helmet + CORS** | Security |

### Frontend
| Technology | Purpose |
|---|---|
| **React 19** | UI framework |
| **Vite 7** | Build tool & dev server |
| **TypeScript** | Type safety |
| **Tailwind CSS 4** | Utility-first styling |
| **shadcn/ui (Radix)** | Accessible UI components |
| **React Router 7** | Client-side routing |
| **TanStack Query 5** | Server state management |
| **React Hook Form + Zod** | Form handling & validation |
| **i18next** | Internationalization (EN / BN) |
| **Lucide React** | Icons |
| **Axios** | HTTP client |

### DevOps
| Technology | Purpose |
|---|---|
| **Docker & Docker Compose** | Containerization |
| **Nginx** | Production frontend server & reverse proxy |
| **pgAdmin 4** | Database management GUI (dev) |

---

## Prerequisites

Make sure you have the following installed:

- **Node.js** ≥ 22.x – [Download](https://nodejs.org/)
- **npm** ≥ 10.x (ships with Node.js)
- **Docker** & **Docker Compose** – [Download](https://www.docker.com/products/docker-desktop/) *(for database / production)*
- **Git** – [Download](https://git-scm.com/)

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/bpsc-rpm.git
cd bpsc-rpm
```

### 2. Development Setup (Recommended)

Development mode runs the **database in Docker** while the backend and frontend run locally with hot-reload.

#### Step 1 — Start the Database

```bash
docker compose -f docker-compose.dev.yml up -d
```

This starts:
- **PostgreSQL 16** on `localhost:5432`
- **pgAdmin 4** on `http://localhost:5050` (optional — login: `admin@bpsc.gov.bd` / `admin`)

The database is automatically initialized with the schema and seed data from `database/migrations/`.

#### Step 2 — Setup & Run the Backend

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Configure environment (edit values as needed)
cp .env .env.local   # optional: create a local override

# Start the dev server (hot-reload via tsx)
npm run dev
```

The backend API will be available at **`http://localhost:5000`**.

> **Health check:** `curl http://localhost:5000/api/health`

#### Step 3 — Setup & Run the Frontend

```bash
# Navigate to frontend (from project root)
cd frontend

# Install dependencies
npm install

# Start the dev server (Vite)
npm run dev
```

The frontend will be available at **`http://localhost:5173`**.

---

### 3. Production Setup (Docker)

The production compose file builds and runs all three services (database, backend, frontend) in Docker containers.

```bash
# Set required secrets (or use a .env file at root)
export JWT_ACCESS_SECRET="your-secure-access-secret"
export JWT_REFRESH_SECRET="your-secure-refresh-secret"
export SMTP_USER="your-email@gmail.com"
export SMTP_PASS="your-app-password"

# Build and start all services
docker compose up -d --build
```

| Service | URL |
|---|---|
| Frontend (Nginx) | `http://localhost` (port 80) |
| Backend API | `http://localhost:5000` |
| PostgreSQL | `localhost:5432` |

To stop all services:

```bash
docker compose down
```

To stop and **remove all data volumes**:

```bash
docker compose down -v
```

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Default | Description |
|---|---|---|
| `DB_HOST` | `localhost` | PostgreSQL host |
| `DB_PORT` | `5432` | PostgreSQL port |
| `DB_NAME` | `bpsc_rpm` | Database name |
| `DB_USER` | `bpsc_admin` | Database user |
| `DB_PASSWORD` | `bpsc_secure_password_2026` | Database password |
| `DB_POOL_MIN` | `2` | Minimum connection pool size |
| `DB_POOL_MAX` | `10` | Maximum connection pool size |
| `JWT_ACCESS_SECRET` | *(change in production)* | Secret for access tokens |
| `JWT_REFRESH_SECRET` | *(change in production)* | Secret for refresh tokens |
| `JWT_ACCESS_EXPIRY` | `15m` | Access token expiration |
| `JWT_REFRESH_EXPIRY` | `7d` | Refresh token expiration |
| `PORT` | `5000` | Server port |
| `NODE_ENV` | `development` | Environment mode |
| `FRONTEND_URL` | `http://localhost:5173` | CORS allowed origin |
| `SMTP_HOST` | `smtp.gmail.com` | SMTP mail server |
| `SMTP_PORT` | `587` | SMTP port |
| `SMTP_USER` | *(your email)* | SMTP username |
| `SMTP_PASS` | *(your app password)* | SMTP password |
| `SMTP_FROM` | `BPSC <noreply@bpsc.gov.bd>` | Sender address |
| `OTP_EXPIRY_MINUTES` | `5` | OTP validity duration |
| `OTP_MAX_ATTEMPTS` | `5` | Max OTP verification attempts |
| `MAX_FILE_SIZE` | `5242880` (5 MB) | Max upload file size in bytes |
| `UPLOAD_DIR` | `./uploads` | Upload directory path |

### Frontend (`frontend/.env`)

| Variable | Default | Description |
|---|---|---|
| `VITE_API_URL` | `http://localhost:5000/api` | Backend API base URL |

---

## API Endpoints

All API routes are prefixed with `/api`.

| Route Prefix | Description |
|---|---|
| `/api/health` | Health check |
| `/api/auth` | Authentication (register, login, OTP, tokens) |
| `/api/profile` | User profile management (CRUD, photo upload) |
| `/api/circulars` | Exam circulars listing |
| `/api/applications` | Exam application submission & tracking |
| `/api/payments` | Payment processing & verification |
| `/api/notifications` | In-app notification management |
| `/api/lookups` | Lookup data (districts, divisions, education boards, etc.) |

---

## Project Structure

```
bpsc-rpm/
├── backend/                    # Express.js API server
│   ├── src/
│   │   ├── controllers/        # Route handler logic
│   │   ├── db/                 # Database connection & migration utilities
│   │   ├── middleware/         # Auth, error handling, file upload middleware
│   │   ├── routes/             # Express route definitions
│   │   ├── schemas/            # Zod validation schemas
│   │   ├── utils/              # Helpers (email, OTP, tokens)
│   │   └── index.ts            # Application entry point
│   ├── .env                    # Environment variables
│   ├── Dockerfile              # Production Docker image
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                   # React SPA (Vite)
│   ├── src/
│   │   ├── components/         # Reusable UI components (shadcn/ui based)
│   │   ├── config/             # App configuration
│   │   ├── contexts/           # React context providers
│   │   ├── hooks/              # Custom React hooks
│   │   ├── i18n/               # Internationalization (en.json, bn.json)
│   │   ├── lib/                # Utility libraries
│   │   ├── pages/              # Page components (route views)
│   │   ├── styles/             # Global CSS / Tailwind
│   │   ├── utils/              # Helper functions
│   │   ├── App.tsx             # Root component with routing
│   │   └── main.tsx            # Application entry point
│   ├── .env                    # Environment variables
│   ├── Dockerfile              # Production Docker image (Nginx)
│   ├── nginx.conf              # Nginx configuration
│   ├── vite.config.ts          # Vite configuration
│   ├── tailwind.config.js
│   └── package.json
│
├── database/
│   └── migrations/
│       ├── 001_initial_schema.sql   # Database schema
│       └── 002_seed_data.sql        # Seed / reference data
│
├── docker-compose.yml          # Production (all services)
├── docker-compose.dev.yml      # Development (database only)
├── .gitignore
└── README.md
```

---

## Available Scripts

### Backend (`cd backend`)

| Command | Description |
|---|---|
| `npm run dev` | Start dev server with hot-reload (tsx watch) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run the compiled production server |
| `npm run migrate` | Run database migrations |

### Frontend (`cd frontend`)

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server (port 5173) |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

---

## Database

- **Engine:** PostgreSQL 16 (Alpine)
- **Schema:** Defined in `database/migrations/001_initial_schema.sql`
- **Seed Data:** Reference/lookup data in `database/migrations/002_seed_data.sql`

When using Docker Compose, the migration files are automatically executed on first startup via the `docker-entrypoint-initdb.d` volume mount.

### pgAdmin (Development)

Available at `http://localhost:5050` when using the dev compose file.

| Field | Value |
|---|---|
| Email | `admin@bpsc.gov.bd` |
| Password | `admin` |

To connect to the database from pgAdmin, add a new server with:

| Field | Value |
|---|---|
| Host | `db` (or `host.docker.internal` from host) |
| Port | `5432` |
| Database | `bpsc_rpm` |
| Username | `bpsc_admin` |
| Password | `bpsc_secure_password_2026` |

---

## Internationalization (i18n)

The frontend supports **English** and **Bangla (বাংলা)** via `i18next` and `react-i18next`.

- Locale files: `frontend/src/i18n/locales/en.json` and `bn.json`
- Language can be switched at runtime from the UI

---

## License

This project is developed for the **Bangladesh Public Service Commission (BPSC)** as part of the *BPSC 7RP* initiative in collaboration with the **Department of CSE, BUET**.
