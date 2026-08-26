# Vintage Marketplace — System Architecture

This document details the architectural design, component interactions, data flows, and infrastructure topology of the **Vintage Marketplace** platform.

---

## 1. High-Level Architecture Overview

Vintage Marketplace is designed as a distributed, decoupled client-server architecture tailored for secure, high-performance commerce in Ethiopia.

```mermaid
flowchart TD
    subgraph Clients["Client Layer"]
        BuyerBrowser["Buyer (Web App)"]
        SellerBrowser["Seller (Web App)"]
        AdminBrowser["Admin (Portal)"]
    end

    subgraph CDN_Edge["CDN & Edge Routing"]
        VercelCDN["Vercel Edge Network (Frontend SPA)"]
        RenderProxy["Render Reverse Proxy (TLS Termination & Hop 1)"]
    end

    subgraph AppServer["Backend Application Layer (Node.js / Express)"]
        ExpressApp["Express API Server"]
        SocketServer["Socket.IO Real-Time Gateway"]
        AuthMiddleware["JWT & RBAC Security Layer"]
        RateLimiter["express-rate-limit Layer"]
        CronCleaner["Periodic Reservation & Cleanup Cron"]
    end

    subgraph Persistence["Persistence & Storage Layer"]
        NeonDB[("Neon PostgreSQL (Database Engine)")]
        CloudinaryCDN["Cloudinary Media CDN (Image Storage)"]
        LocalUploads["Local Disk Uploads (Fallback Storage)"]
    end

    subgraph ExternalServices["External Services & Integrations"]
        ChapaAPI["Chapa Payment Gateway (Telebirr / CBE / Cards)"]
        FaydaOIDC["Fayda / eSignet OIDC (Ethiopian National ID)"]
        SMTPServer["SMTP Provider (Email OTP & Notifications)"]
        TwilioSMS["Twilio SMS Gateway (Phone OTP)"]
    end

    BuyerBrowser --> VercelCDN
    SellerBrowser --> VercelCDN
    AdminBrowser --> VercelCDN

    BuyerBrowser --> RenderProxy
    SellerBrowser --> RenderProxy
    AdminBrowser --> RenderProxy

    RenderProxy --> RateLimiter
    RateLimiter --> ExpressApp
    RenderProxy --> SocketServer

    ExpressApp --> AuthMiddleware
    ExpressApp --> NeonDB
    SocketServer --> NeonDB
    CronCleaner --> NeonDB

    ExpressApp --> CloudinaryCDN
    ExpressApp --> LocalUploads
    ExpressApp --> ChapaAPI
    ExpressApp --> FaydaOIDC
    ExpressApp --> SMTPServer
    ExpressApp --> TwilioSMS
```

---

## 2. Component Layers

### 2.1. Frontend Architecture (React 19 + Vite + TypeScript)
* **Framework:** React 19 SPA bundled with Vite 8.
* **Routing:** React Router v7 with protected route wrappers (`RequireAuth`, `RequireAdmin`).
* **State Management:**
  * Context API (`AuthContext`, `SocketContext`) for global session and real-time connectivity.
  * Local component state for forms, filters, and UI modals.
* **Styling & UI:** Tailwind CSS v4 with curated design tokens, Lucide icons, and responsive layouts.
* **Networking:** Axios with request/response interceptors for automatic JWT renewal via refresh token cookies.

### 2.2. Backend Architecture (Node.js 20+ / Express 5 / TypeScript)
* **API Paradigm:** RESTful API with structured `{ success: boolean, message?: string, data?: any, errors?: any }` response envelopes.
* **Entry Points:**
  * `src/server.ts`: Database bootstrapping, background worker initialization, HTTP server creation, and Socket.IO attachment.
  * `src/app.ts`: Express routing pipeline, security middleware (`helmet`, `cors`), `trust proxy 1` configuration, request parsers, and global error handlers.
* **Data Access Layer:** Sequelize ORM with TypeScript models, transaction management (`sequelize.transaction`), row-level locking (`SELECT ... FOR UPDATE`), and PostgreSQL operators.
* **Observability:** Centralized error handler with production stack trace sanitization and server-side log output for Render monitoring.

---

## 3. Core Request Lifecycles

### 3.1. Reverse Proxy & Rate Limiting Pipeline
```mermaid
sequenceDiagram
    autonumber
    actor Client as User / Browser
    participant RP as Render Reverse Proxy
    participant E as Express (app.ts)
    participant RL as Rate Limiter Middleware
    participant Route as Controller / Service
    participant DB as Neon PostgreSQL

    Client->>RP: HTTPS Request (e.g. POST /api/auth/login)
    Note over RP: Terminates SSL & sets X-Forwarded-For: <Client_IP>
    RP->>E: Forward Request
    Note over E: app.set('trust proxy', 1) resolves req.ip = Client_IP
    E->>RL: globalLimiter & loginLimiter
    RL->>RL: Evaluate request count against windowMs
    alt Rate Limit Exceeded
        RL-->>Client: 429 Too Many Requests
    else Rate Limit OK
        RL->>Route: Pass to Auth Controller
        Route->>DB: Query User & verify password
        DB-->>Route: User record
        Route-->>Client: 200 OK + JWT Access Token + Set-Cookie Refresh Token
    end
```

---

### 3.2. Atomic Order & Reservation State Machine
All 1-of-1 vintage listings are protected against race conditions using row-level locking and temporal reservations:

```mermaid
stateDiagram-v2
    [*] --> ACTIVE: Listing Published
    ACTIVE --> RESERVED: Buyer Initiates Checkout (15m Lock)
    RESERVED --> ACTIVE: Reservation Expired / Cancelled
    RESERVED --> PENDING_PAYMENT: Order Created (Delivery / Chapa)
    RESERVED --> MEETING_REQUESTED: Order Created (Meet in Person)
    
    PENDING_PAYMENT --> PAYMENT_CONFIRMED: Chapa Webhook / Verify Success
    PENDING_PAYMENT --> CANCELLED: Payment Failed / Timed Out
    
    MEETING_REQUESTED --> MEETING_ACCEPTED: Seller Confirms Time/Location
    MEETING_REQUESTED --> CANCELLED: Seller/Buyer Declines
    
    PAYMENT_CONFIRMED --> PREPARING_DISPATCH: Seller Confirmed
    PREPARING_DISPATCH --> IN_TRANSIT: Courier Dispatched
    IN_TRANSIT --> DELIVERED: Buyer Confirms Delivery
    
    MEETING_ACCEPTED --> COMPLETED: In-Person Exchange & Paid
    DELIVERED --> COMPLETED: Escrow Funds Released to Seller
    
    COMPLETED --> SOLD: Final Listing State
    SOLD --> [*]
```

---

## 4. Real-Time Socket.IO Infrastructure

The platform integrates Socket.IO for instant messaging, read receipt tracking, and contextual notifications.

* **Authentication:** Handshake queries and headers carry JWT access tokens, validated by `socket.use()` middleware.
* **Room Isolation:**
  * **User Room:** `user:{userId}` — used for notifications, order status changes, and global unread counters.
  * **Conversation Room:** `conversation:{conversationId}` — used for live message broadcasting, typing indicators, and real-time read receipts.
* **Persistence:** Messages are saved to PostgreSQL inside database transactions before broadcasting to connected room sockets.

---

## 5. Security & Trust Layer

```mermaid
flowchart TD
    subgraph Identification["Trust & Identity"]
        PhoneOTP["Phone OTP Verification"]
        EmailOTP["Email OTP Verification"]
        FaydaID["Ethiopian Fayda (National ID) OIDC"]
        TradeLicense["Business License Verification"]
    end

    subgraph Moderation["Trust & Safety Monitoring"]
        Badges["Verified Seller Badges"]
        Reviews["Verified Purchase Reviews"]
        Reports["User/Listing Reporting Pipeline"]
        AdminModeration["Admin Moderation & Suspension"]
    end

    subgraph FinancialEscrow["Transactional Escrow"]
        ChapaGateway["Chapa Payment Processing"]
        EscrowHold["Platform Escrow Hold"]
        DisputeResolution["Admin Dispute & Refund Pipeline"]
        PayoutRelease["Seller Payout Release"]
    end

    Identification --> Badges
    Badges --> Moderation
    Moderation --> FinancialEscrow
```
