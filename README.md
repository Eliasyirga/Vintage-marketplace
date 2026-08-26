# Vintage Marketplace

A full-stack, secure, digital commerce platform engineered for buying and selling unique used goods, vintage collectibles, electronics, and fashion across Ethiopia.

---

## Overview

**Vintage Marketplace** bridges the gap in Ethiopia's growing secondary commerce ecosystem by providing a verified, digital marketplace tailored for local trade. It replaces fragmented social media channels with structured listings, real-time messaging, verified seller identities (via Ethiopian Fayda National ID and business licensing), secure digital payments powered by the **Chapa** payment gateway, dynamic localized delivery calculations, and safe in-person meeting coordination.

---

## Features

### Buyer Features
* **Advanced Discovery:** Real-time search with multi-parameter filtering by Category, Price Range, Condition, City, and Addis Ababa Sub-Cities.
* **Instant Checkout:** Seamless Buy Now flow supporting localized Delivery and In-Person meetup options.
* **Favorites & Watchlist:** One-click item bookmarking with live inventory status updates.
* **Recently Viewed:** Personalized browsing history and algorithmic recommendations.
* **Verified Reviews:** 1-5 star ratings and reviews tied strictly to verified completed purchases.

### Seller Features
* **Multi-Image Listing Creation:** Multi-file image uploads with Cloudinary CDN integration and local disk fallback.
* **Storefront Management:** Dedicated public seller storefront with seller bio, verification badges, sales metrics, and active inventory.
* **Listing Monetization:** Premium booster plans to feature listings in prominent marketplace slots.
* **Fulfillment Management:** Complete seller dispatch workflow for courier preparation and in-person meeting confirmations.
* **Seller Analytics:** Detailed dashboard tracking listing impressions, clicks, inquiries, and earnings.

### Communication Features
* **Real-Time Direct Messaging:** Socket.IO-powered chat between buyers and sellers with live typing indicators.
* **Read Receipts & Unread Badges:** Instant message delivery status and real-time navigation counter updates.
* **Safety Moderation:** In-chat user blocking and one-click scam/harassment reporting.

### Payment & Escrow Features
* **Chapa Payment Gateway:** Integrated support for **Telebirr**, **CBE Birr**, **AwashBirr**, **Bank of Abyssinia**, and debit/credit cards.
* **Escrow Protection:** Payment holds ensuring seller funds are released only upon verified delivery or in-person receipt.
* **Direct-to-Seller Option:** Support for cash-on-delivery or direct payments for verified local meetups.

### Security & Trust Features
* **Fayda National ID Integration:** Official Ethiopian Fayda / eSignet OIDC identity verification.
* **Phone & Email OTP Verification:** Cryptographically secure 6-digit OTP verification powered by `bcryptjs`.
* **Rate Limiting Protection:** Comprehensive multi-tier rate limiting on authentication, messaging, and payment routes.
* **Atomic Reservations:** Row-level pessimistic locking (`SELECT ... FOR UPDATE`) preventing checkout collisions on 1-of-1 items.

### Admin Features
* **Administrative Operations Portal:** Metrics overview (GMV, platform fees, user growth, active orders).
* **Listing & User Moderation:** Full administrative power to suspend fraudulent users, moderate listings, and resolve disputes.
* **Verification Auditing:** Review queue for national ID and business license document approvals.
* **Immutable Audit Trail:** Comprehensive admin activity logs for accountability.

---

## Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite 8, Tailwind CSS v4, Lucide Icons, Axios, React Router v7 |
| **Backend** | Node.js 20+, Express 5, TypeScript, Socket.IO, Sequelize ORM (`sequelize-typescript`) |
| **Database** | PostgreSQL (Neon Cloud Engine) |
| **Payments** | Chapa Payment Gateway API (`https://api.chapa.co`) |
| **Identity & OIDC** | Fayda / eSignet OIDC (Ethiopian National ID), Nodemailer SMTP |
| **Media Storage** | Cloudinary Image CDN / Local Disk Storage |
| **Hosting & PaaS** | Vercel (Frontend SPA), Render (Backend Web Service) |

---

## Architecture

```mermaid
flowchart TD
    subgraph Clients["Client Layer"]
        Buyer["Buyer Browser (SPA)"]
        Seller["Seller Browser (SPA)"]
        Admin["Admin Portal"]
    end

    subgraph Edge["Routing & CDN Layer"]
        Vercel["Vercel Edge Network"]
        RenderProxy["Render Reverse Proxy (TLS Termination)"]
    end

    subgraph BackendApp["Backend Application (Express / Node.js)"]
        RateLimit["express-rate-limit Layer"]
        Express["Express REST API"]
        SocketIO["Socket.IO Gateway"]
        AuthLayer["JWT & RBAC Security Layer"]
        Cron["Reservation Cleanup Cron (60s)"]
    end

    subgraph Storage["Data & Cloud Services"]
        NeonDB[("Neon Cloud PostgreSQL")]
        Cloudinary["Cloudinary CDN"]
        Chapa["Chapa Payment Gateway"]
        Fayda["Fayda National ID OIDC"]
    end

    Buyer --> Vercel
    Seller --> Vercel
    Admin --> Vercel

    Buyer --> RenderProxy
    Seller --> RenderProxy
    Admin --> RenderProxy

    RenderProxy --> RateLimit
    RateLimit --> Express
    RenderProxy --> SocketIO

    Express --> AuthLayer
    Express --> NeonDB
    SocketIO --> NeonDB
    Cron --> NeonDB

    Express --> Cloudinary
    Express --> Chapa
    Express --> Fayda
```

---

## Project Structure

```text
vintage-marketplace/
├── frontend/                     # React + Vite TypeScript SPA
│   ├── src/
│   │   ├── components/           # Reusable UI components (Listings, Checkout, Chat, Admin)
│   │   ├── context/              # Global state (AuthContext, SocketContext)
│   │   ├── hooks/                # Custom React hooks (useAuth, useSocket, useDebounce)
│   │   ├── layouts/              # Navbar, Footer, and Workspace shell layouts
│   │   ├── pages/                # Route pages (Browse, ListingDetail, Checkout, Orders, Admin)
│   │   ├── services/             # Axios API client modules
│   │   └── types/                # TypeScript interface definitions
│   └── package.json
│
├── backend/                      # Node.js + Express + TypeScript REST API
│   ├── src/
│   │   ├── config/               # Environment validation (env.ts), Database setup
│   │   ├── controllers/          # Express route controllers
│   │   ├── middleware/           # Auth (requireAuth), Validate, RateLimiter, ErrorHandler
│   │   ├── models/               # 33 Sequelize ORM models & associations
│   │   ├── routes/               # Modular Express API route definitions
│   │   ├── schemas/              # Zod input validation schemas
│   │   ├── services/             # Core business logic (Order, Payment, Auth, Upload, Email)
│   │   ├── socket/               # Real-time Socket.IO event handlers and rooms
│   │   ├── app.ts                # Express application configuration & proxy trust
│   │   └── server.ts             # HTTP server entry point & cron runners
│   └── package.json
│
├── docs/                         # Exhaustive Technical Documentation
│   ├── ARCHITECTURE.md           # System architecture, topology, and state machines
│   ├── API.md                    # Complete endpoint-by-endpoint API reference
│   ├── DATABASE.md               # PostgreSQL schema, models, indexes, and ERD
│   ├── AUTHENTICATION.md         # JWT, Refresh Tokens, OTP, and Fayda OIDC
│   ├── PAYMENTS.md               # Chapa Ethiopian Payment Gateway integration guide
│   ├── DEPLOYMENT.md             # Render & Vercel deployment checklists
│   ├── SECURITY.md               # Threat model, rate limiting, and RBAC matrix
│   └── CONTRIBUTING.md           # Development workflow and coding guidelines
│
└── README.md                     # Project overview and entry documentation
```

---

## Local Development & Setup

### Prerequisites
* **Node.js:** v20.x or higher
* **npm:** v10.x or higher
* **PostgreSQL:** Local PostgreSQL or a free [Neon](https://neon.tech) database

### 1. Clone the Repository
```bash
git clone https://github.com/Eliasyirga/Vintage-marketplace.git
cd Vintage-marketplace
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
```
Configure your `.env` variables:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
DATABASE_URL=postgresql://user:password@localhost:5432/vintage_marketplace
DATABASE_SSL=false
JWT_SECRET=your_jwt_secret_min_64_characters
REFRESH_TOKEN_SECRET=your_refresh_token_secret_min_64_characters
CHAPA_SECRET_KEY=CHASECK_TEST-your_chapa_secret_key
CHAPA_PUBLIC_KEY=CHAPUBK_TEST-your_chapa_public_key
```
Start the backend development server:
```bash
npm run dev
```

### 3. Frontend Setup
In a separate terminal:
```bash
cd ../frontend
npm install
cp .env.example .env
```
Configure `.env`:
```env
VITE_API_URL=http://localhost:5000/api
```
Start the frontend development server:
```bash
npm run dev
```

---

## Technical Documentation Index

* 📐 **[System Architecture](docs/ARCHITECTURE.md)**
* 🔌 **[Complete API Reference](docs/API.md)**
* 🗄️ **[Database Schema & Models](docs/DATABASE.md)**
* 🔐 **[Authentication & Identity](docs/AUTHENTICATION.md)**
* 💳 **[Chapa Payment Integration](docs/PAYMENTS.md)**
* 🚀 **[Deployment Guide](docs/DEPLOYMENT.md)**
* 🛡️ **[Security Architecture](docs/SECURITY.md)**
* 🤝 **[Contributing Guidelines](docs/CONTRIBUTING.md)**

---

## Demo & Deployment Links

* **Live Frontend:** `https://vintage-marketplace-tau.vercel.app`
* **Live Backend API:** `https://vintage-marketplace-6.onrender.com/api`
* **GitHub Repository:** `https://github.com/Eliasyirga/Vintage-marketplace`

---

## License

This project is currently proprietary and maintained for Vintage Marketplace Ethiopia. All rights reserved.
