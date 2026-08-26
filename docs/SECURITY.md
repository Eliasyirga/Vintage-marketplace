# Vintage Marketplace — Security Architecture & Threat Model

This document outlines the security controls, authentication safeguards, threat mitigations, and compliance standards implemented across **Vintage Marketplace**.

---

## 1. Security Controls Summary

| Security Domain | Implemented Controls |
| :--- | :--- |
| **Transport Layer Security** | HTTPS enforced at Vercel & Render edge; TLS 1.3 encryption for PostgreSQL connections. |
| **HTTP Security Headers** | `helmet` configured for XSS protection, MIME sniffing prevention, and cross-origin resource isolation. |
| **Cross-Origin Resource Sharing (CORS)** | Strict whitelist and dynamic origin validation for credentialed requests. |
| **Authentication & Tokens** | Short-lived JWT access tokens (`15m`), HttpOnly refresh cookies (`7d`), Bcrypt password hashing (`12` salt rounds). |
| **Brute-Force & DoS Protection** | Multi-tier `express-rate-limit` middleware across global and sensitive auth routes. |
| **Database & SQL Injection** | 100% parameterized queries via Sequelize ORM; row-level pessimistic locking (`FOR UPDATE`) for race condition immunity. |
| **Access Control (RBAC)** | Strict server-side role validation (`USER`, `SELLER`, `ADMIN`) on all protected endpoints. |
| **Financial Security** | Zero frontend secret exposure; authoritative backend price calculations; Chapa API signature verification. |

---

## 2. Rate Limiting Matrix

| Limiter | Target Endpoints | Max Requests | Window | Mitigation Target |
| :--- | :--- | :--- | :--- | :--- |
| `globalLimiter` | All `/api/*` routes | 5,000 | 15 mins | Global DDoS & crawler flooding |
| `loginLimiter` | `POST /api/auth/login` | 15 | 15 mins | Credential stuffing & password brute-force |
| `registerLimiter` | `POST /api/auth/register` | 10 | 15 mins | Bot account generation spam |
| `verifyOtpLimiter` | `/api/auth/verify-*`, `/api/auth/reset-password` | 20 | 15 mins | 6-digit OTP guessing attacks |
| `resendOtpLimiter` | `/api/auth/resend-registration-otp` | 5 | 15 mins | SMS/Email toll fraud & spam |
| `messageRateLimiter`| `POST /api/conversations/:id/messages` | 30 | 1 min | Chat flood abuse & harassment |
| `createListingLimiter`| `POST /api/listings` | 20 | 15 mins | Marketplace spam listings |
| `adTrackingLimiter` | `/api/advertisements/:id/click`, `/impression` | 120 | 1 min | Click fraud & metric manipulation |
| `faydaVerificationLimiter`| `/api/verifications/fayda/*` | 10 | 1 hour | National ID oracle queries |

---

## 3. Threat Mitigations & Vulnerability Classifications

### 3.1. Broken Object-Level Authorization (IDOR) — Mitigated
* **Risk:** A buyer attempting to view another user's private messages or update another seller's listing.
* **Control:** All controller handlers explicitly query the database with `{ where: { id, user_id: req.user.id } }` or verify participant membership before returning resources.

### 3.2. Price & Payment Tampering — Mitigated
* **Risk:** A malicious client submitting `POST /api/orders` with an altered or zero price.
* **Control:** The backend completely ignores client-submitted price fields and calculates item price, platform fee, and delivery fee directly from the database and authoritative sub-city distance matrices.

### 3.3. Reverse Proxy IP Spoofing — Mitigated
* **Risk:** An attacker injecting `X-Forwarded-For: 1.1.1.1` to bypass rate limiters.
* **Control:** Express is explicitly configured with `app.set('trust proxy', 1)`. Only the single, trusted hop appended by Render's proxy is trusted to resolve `req.ip`.

### 3.4. Stale Information Leakage in Production Logs — Mitigated
* **Risk:** Exposing database passwords, JWT secrets, or full stack traces to end-users on 500 errors.
* **Control:** [`error.middleware.ts`](file:///e:/dasktopp/my_proj/vintage-marketplace/backend/src/middleware/error.middleware.ts) intercepts all 5xx errors, sanitizes client responses to `{ success: false, message: "An unexpected error occurred." }`, and securely logs the raw error to internal server stderr for Render observability.
