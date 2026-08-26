# Vintage Marketplace — Deployment & Infrastructure Guide

This guide covers the deployment configuration, environment variables, reverse proxy routing, and cloud hosting architecture for **Vintage Marketplace**.

---

## 1. Production Topology

```mermaid
flowchart LR
    subgraph FrontendHosting["Frontend Host (Vercel)"]
        SPA["Vite / React 19 SPA"]
    end

    subgraph BackendHosting["Backend Host (Render PaaS)"]
        Proxy["Render Reverse Proxy (TLS)"]
        NodeServer["Node.js / Express Service (PORT 5000)"]
    end

    subgraph CloudServices["Database & Media Services"]
        NeonDB[("Neon Cloud PostgreSQL")]
        CloudinaryCDN["Cloudinary Media CDN"]
    end

    SPA -->|HTTPS / API Requests| Proxy
    Proxy -->|Local Forward (Hop 1)| NodeServer
    NodeServer -->|Encrypted SSL Pool| NeonDB
    NodeServer -->|Image Uploads / Delivery| CloudinaryCDN
```

---

## 2. Backend Deployment (Render Web Service)

### 2.1. Build & Runtime Specifications
* **Environment:** Node.js (v20+)
* **Root Directory:** `backend`
* **Build Command:** `npm install && npm run build`
* **Start Command:** `npm start` (executes `node dist/server.js`)
* **Health Check Path:** `/api/health`

### 2.2. Reverse Proxy Configuration
Render operates a single reverse proxy hop in front of containerized web services. To prevent rate-limiter validation crashes (`ERR_ERL_UNEXPECTED_X_FORWARDED_FOR`) and IP spoofing:

```typescript
// Registered in src/app.ts immediately following express()
app.set('trust proxy', 1)
```

---

## 3. Frontend Deployment (Vercel)

### 3.1. Build & Runtime Specifications
* **Framework Preset:** Vite
* **Root Directory:** `frontend`
* **Build Command:** `npm run build`
* **Output Directory:** `dist`
* **SPA Routing:** Configured via `vercel.json` rewrite rules to route all paths to `/index.html`.

---

## 4. Environment Variables Inventory

### 4.1. Backend Variables (Render Dashboard → Environment)

| Variable | Required | Description | Example / Placeholder |
| :--- | :---: | :--- | :--- |
| `NODE_ENV` | Yes | Runtime environment mode | `production` |
| `PORT` | Yes | Service listening port (injected by Render) | `5000` |
| `CLIENT_URL` | Yes | Public URL of the frontend SPA | `https://vintage-marketplace-tau.vercel.app` |
| `DATABASE_URL` | Yes | Neon PostgreSQL connection string | `postgresql://user:pass@ep-xyz.neon.tech/neondb?sslmode=require` |
| `DATABASE_SSL` | Yes | Enables TLS for PostgreSQL connection | `true` |
| `JWT_SECRET` | Yes | Secret for signing 15m access tokens | `YOUR_64_CHAR_RANDOM_SECRET_KEY` |
| `REFRESH_TOKEN_SECRET` | Yes | Secret for signing 7d refresh tokens | `YOUR_64_CHAR_RANDOM_REFRESH_SECRET_KEY` |
| `CHAPA_SECRET_KEY` | Yes | Secret API Key for Chapa Payment Gateway | `CHASECK_TEST-xxxxxxxxxxxxxxxxxxxx` |
| `CHAPA_PUBLIC_KEY` | Yes | Public Key for Chapa Hosted Checkout | `CHAPUBK_TEST-xxxxxxxxxxxxxxxxxxxx` |
| `CHAPA_BASE_URL` | Optional | Chapa API base URL (defaults to production API) | `https://api.chapa.co` |
| `CHAPA_MODE` | Optional | Payment mode (`test` or `live`) | `test` |
| `CLOUDINARY_CLOUD_NAME` | Optional | Cloudinary account cloud name | `your_cloud_name` |
| `CLOUDINARY_API_KEY` | Optional | Cloudinary account API key | `your_api_key` |
| `CLOUDINARY_API_SECRET` | Optional | Cloudinary account API secret | `your_api_secret` |
| `SMTP_HOST` | Optional | SMTP Host for Email OTP delivery | `smtp.gmail.com` |
| `SMTP_PORT` | Optional | SMTP Port (`587` for STARTTLS, `465` for TLS) | `587` |
| `SMTP_USER` | Optional | Authenticated SMTP username / email | `your_email@gmail.com` |
| `SMTP_PASSWORD` | Optional | Authenticated SMTP password / App Password | `your_app_password` |
| `EMAIL_FROM` | Optional | Display name and email for outgoing emails | `"Vintage Marketplace" <noreply@vintagemarket.et>` |
| `FAYDA_SANDBOX_MODE` | Optional | Enables simulated Ethiopian Fayda ID verification | `true` |

### 4.2. Frontend Variables (Vercel Dashboard → Environment Variables)

| Variable | Required | Description | Example / Placeholder |
| :--- | :---: | :--- | :--- |
| `VITE_API_URL` | Yes | Base URL pointing to the Render API | `https://vintage-marketplace-6.onrender.com/api` |
