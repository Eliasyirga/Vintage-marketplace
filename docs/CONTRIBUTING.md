# Contributing to Vintage Marketplace

Thank you for contributing to the **Vintage Marketplace** codebase! This guide covers our local development workflow, coding standards, and contribution guidelines.

---

## 1. Prerequisites

* **Node.js:** v20.x or higher
* **npm:** v10.x or higher
* **PostgreSQL:** Local PostgreSQL instance or a free cloud database on [Neon](https://neon.tech).

---

## 2. Local Setup & Installation

### 2.1. Clone the Repository
```bash
git clone https://github.com/Eliasyirga/Vintage-marketplace.git
cd Vintage-marketplace
```

### 2.2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your local PostgreSQL database URL and random JWT secrets
npm run dev
```

### 2.3. Frontend Setup
```bash
cd ../frontend
npm install
cp .env.example .env
# Edit .env to set VITE_API_URL=http://localhost:5000/api
npm run dev
```

---

## 3. Code Quality & Verification

Before submitting a pull request, run all verification scripts:

```bash
# Type check backend
cd backend
npx tsc --noEmit

# Build & Lint frontend
cd ../frontend
npm run build
npm run lint
```

---

## 4. Branching & Commits

* **Main Branch:** `main` (production-ready branch deployed to Render and Vercel).
* **Feature Branches:** Use descriptive names like `feature/chapa-escrow-update` or `fix/trust-proxy-validation`.
* **Commit Messages:** Follow standard conventional commits format (e.g. `feat: add meet in person fulfillment`, `fix: enforce 16 character limit on Chapa title`).
