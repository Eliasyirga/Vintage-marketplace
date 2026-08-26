# Vintage Marketplace — Complete API Reference

Base Production URL: `https://vintage-marketplace-6.onrender.com/api`  
Base Local URL: `http://localhost:5000/api`

All API responses follow a uniform JSON structure:
```json
{
  "success": true,
  "message": "Optional human-readable status message",
  "data": { ... },
  "errors": [ ... ]
}
```

---

## 1. Authentication & Session Management (`/api/auth`)

| Method | Endpoint | Auth Required | Role | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | No | Any | Initiates registration, hashes password, generates 6-digit OTP |
| `POST` | `/api/auth/verify-registration` | No | Any | Verifies registration OTP and creates permanent user record |
| `POST` | `/api/auth/resend-registration-otp` | No | Any | Issues fresh OTP (with 60s cooldown and max attempt limit) |
| `POST` | `/api/auth/change-registration-method`| No | Any | Switches pending verification between `EMAIL` and `PHONE` |
| `POST` | `/api/auth/login` | No | Any | Authenticates via email/phone + password, returns JWT & HttpOnly cookie |
| `POST` | `/api/auth/refresh` | No | Any | Refreshes access token using `refreshToken` cookie/payload |
| `POST` | `/api/auth/forgot-password` | No | Any | Sends password reset OTP to email or phone |
| `POST` | `/api/auth/reset-password` | No | Any | Validates reset OTP and sets new account password |
| `POST` | `/api/auth/change-password` | Yes | Any | Updates password for authenticated user |
| `GET` | `/api/auth/me` | Yes | Any | Returns authenticated user profile |
| `POST` | `/api/auth/logout` | No | Any | Clears `refreshToken` HttpOnly cookie |

---

## 2. Listings & Marketplace (`/api/listings`)

| Method | Endpoint | Auth Required | Role | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/listings` | No | Any | Search, filter (category, price, city, condition), sort, and paginate listings |
| `GET` | `/api/listings/featured` | No | Any | Returns boosted/promoted active listings |
| `GET` | `/api/listings/feed` | No | Any | Personalized or trending discovery feed |
| `GET` | `/api/listings/limit-status` | Yes | Any | Returns user's active listing count vs free tier limits |
| `GET` | `/api/listings/:id` | No | Any | Fetches single listing details, seller info, and increments view count |
| `GET` | `/api/listings/:id/similar` | No | Any | Returns similar items based on category and attributes |
| `POST` | `/api/listings` | Yes | Any | Creates new listing with multi-image upload support |
| `PUT` | `/api/listings/:id` | Yes | Owner/Admin | Updates listing details, price, images, condition |
| `PATCH` | `/api/listings/:id/status` | Yes | Owner/Admin | Updates listing status (`ACTIVE`, `RESERVED`, `SOLD`, `INACTIVE`) |
| `DELETE`| `/api/listings/:id` | Yes | Owner/Admin | Soft-deletes / deletes listing |
| `GET` | `/api/my-listings` | Yes | Any | Fetches authenticated user's created listings |

---

## 3. Categories (`/api/categories`)

| Method | Endpoint | Auth Required | Role | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/categories` | No | Any | Lists all active categories and sub-categories with item counts |

---

## 4. Orders & Escrow Lifecycle (`/api/orders`)

| Method | Endpoint | Auth Required | Role | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/orders/check-eligibility` | Yes | Buyer | Pre-flight validation (cleans stale reservations, checks seller status) |
| `POST` | `/api/orders` | Yes | Buyer | Creates order with atomic listing reservation (15m window) |
| `GET` | `/api/orders/buyer/my-orders` | Yes | Buyer | Returns buyer's order history with status filters |
| `GET` | `/api/orders/seller/my-orders` | Yes | Seller | Returns seller's received orders with status filters |
| `GET` | `/api/orders/:id` | Yes | Participant/Admin | Fetches full order details, delivery/meeting sub-orders, and timeline |
| `POST` | `/api/orders/:id/confirm` | Yes | Seller | Seller confirms order preparation |
| `POST` | `/api/orders/:id/ready` | Yes | Seller | Seller marks order ready for courier pickup / meet exchange |
| `POST` | `/api/orders/:id/complete` | Yes | Buyer | Buyer confirms receipt; marks listing SOLD and releases funds |
| `POST` | `/api/orders/:id/cancel` | Yes | Participant/Admin | Cancels order and releases listing back to ACTIVE |

---

## 5. Fulfillment Sub-Orders

### Delivery (`/api/delivery`)
| Method | Endpoint | Auth Required | Role | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/delivery/estimate` | No | Any | Calculates dynamic delivery fee based on origin & destination sub-cities |

### Meet in Person (`/api/meetings`)
| Method | Endpoint | Auth Required | Role | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/meetings/suggested-locations` | No | Any | Returns curated safe public meeting landmarks across Addis Ababa |
| `PATCH` | `/api/meetings/:orderId/respond` | Yes | Seller | Seller accepts, declines, or reschedules meeting proposal |
| `PATCH` | `/api/meetings/:orderId/confirm-meet` | Yes | Participant | Confirms successful in-person handover |

---

## 6. Payments & Chapa Gateway (`/api/payments`)

| Method | Endpoint | Auth Required | Role | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/payments/initialize` | Yes | Buyer | Initializes payment via Chapa API and returns checkout URL |
| `GET` | `/api/payments/verify/:reference` | No | Any | Verifies Chapa transaction status and updates payment/order records |
| `POST` | `/api/payments/webhook` | No | Any | Asynchronous Chapa webhook event handler |
| `GET` | `/api/payments/my-payments` | Yes | Any | Returns user's transaction/payment history |

---

## 7. Real-Time Conversations & Messages (`/api/conversations`)

| Method | Endpoint | Auth Required | Role | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/conversations` | Yes | Any | Fetches user's conversation threads with last message & unread badge |
| `POST` | `/api/conversations` | Yes | Any | Starts or retrieves existing conversation regarding a listing |
| `GET` | `/api/conversations/unread-count` | Yes | Any | Returns total unread messages count for navbar badges |
| `GET` | `/api/conversations/:id` | Yes | Participant | Fetches message history for a conversation |
| `POST` | `/api/conversations/:id/messages` | Yes | Participant | Sends new message and broadcasts via Socket.IO |
| `PATCH` | `/api/conversations/:id/read` | Yes | Participant | Marks all messages in conversation as read |
| `POST` | `/api/conversations/:id/block` | Yes | Participant | Blocks user from further messaging |
| `POST` | `/api/conversations/:id/unblock` | Yes | Participant | Unblocks previously blocked user |

---

## 8. Buyer Features

### Favorites (`/api/favorites`)
| Method | Endpoint | Auth Required | Role | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/favorites` | Yes | Any | Returns user's bookmarked listings |
| `POST` | `/api/favorites/:listingId` | Yes | Any | Adds listing to favorites |
| `DELETE`| `/api/favorites/:listingId` | Yes | Any | Removes listing from favorites |
| `GET` | `/api/favorites/check/:listingId` | Yes | Any | Checks if listing is favorited by current user |

### Recently Viewed (`/api/recently-viewed`)
| Method | Endpoint | Auth Required | Role | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/recently-viewed` | Yes | Any | Returns history of recently browsed items |
| `POST` | `/api/recently-viewed/:listingId`| Yes | Any | Records item view event |

---

## 9. Seller Profile & Monetization

### Seller Profile (`/api/sellers`)
| Method | Endpoint | Auth Required | Role | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/sellers/:id` | No | Any | Fetches public seller storefront, stats, reviews, and active listings |
| `GET` | `/api/seller/profile` | Yes | Seller | Returns authenticated seller's profile settings |
| `PATCH` | `/api/seller/profile` | Yes | Seller | Updates seller bio, business name, phone, social links |
| `GET` | `/api/seller/analytics/overview`| Yes | Seller | Returns sales overview, views, conversion rate, and revenue |

### Monetization & Plans (`/api/monetization`)
| Method | Endpoint | Auth Required | Role | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/monetization/plans` | No | Any | Lists available listing booster, verified seller, and business plans |
| `GET` | `/api/monetization/my-subscriptions` | Yes | Any | Returns active user subscriptions and entitlements |

### Advertisements (`/api/advertisements`)
| Method | Endpoint | Auth Required | Role | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/advertisements/active` | No | Any | Fetches banner/sidebar ads for marketplace placement |
| `POST` | `/api/advertisements` | Yes | Any | Submits ad campaign with image, headline, destination URL, and slot |
| `POST` | `/api/advertisements/:id/impression` | No | Any | Records ad impression event (rate-limited) |
| `POST` | `/api/advertisements/:id/click` | No | Any | Records ad click event and returns redirect URL |

---

## 10. Trust & Safety

### Verifications (`/api/verifications`)
| Method | Endpoint | Auth Required | Role | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/verifications/phone/start` | Yes | Any | Sends OTP for phone number verification |
| `POST` | `/api/verifications/phone/confirm` | Yes | Any | Verifies phone OTP and awards verified phone badge |
| `POST` | `/api/verifications/business` | Yes | Any | Submits trade license / TIN certificate for business verification |
| `GET` | `/api/verifications/fayda/login` | Yes | Any | Initiates Ethiopian Fayda National ID OIDC verification flow |
| `GET` | `/api/verifications/fayda/callback`| No | Any | Handles Fayda OAuth2 callback and claims verification |

### Reviews (`/api/reviews`)
| Method | Endpoint | Auth Required | Role | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/reviews` | Yes | Verified Buyer | Submits 1-5 star review and feedback for completed order |
| `GET` | `/api/reviews/seller/:sellerId` | No | Any | Returns verified reviews for a seller |

### Reports (`/api/reports`)
| Method | Endpoint | Auth Required | Role | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/reports` | Yes | Any | Reports suspicious listing, user, or fraudulent chat message |

---

## 11. Administration (`/api/admin`)
*All `/api/admin` routes strictly require `role === 'ADMIN'`.*

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/admin/metrics` | Returns total platform GMV, user count, active listings, order volume |
| `GET` | `/api/admin/users` | Lists users with search, role, and status filters |
| `PATCH` | `/api/admin/users/:id/status` | Updates user status (`ACTIVE`, `SUSPENDED`, `DEACTIVATED`) |
| `GET` | `/api/admin/listings` | Lists all marketplace listings with moderation status |
| `PATCH` | `/api/admin/listings/:id/status`| Moderates listing (`ACTIVE`, `REJECTED`, `SUSPENDED`) |
| `GET` | `/api/admin/verifications` | Lists pending national ID and business verification submissions |
| `PATCH` | `/api/admin/verifications/:id` | Approves or rejects seller verification |
| `GET` | `/api/admin/reports` | Lists submitted moderation reports with priority filters |
| `PATCH` | `/api/admin/reports/:id` | Resolves, dismisses, or takes action on moderation report |
| `GET` | `/api/admin/audit-logs` | Fetches immutable admin audit trail |

---

## 12. Health & System (`/api/health`)

| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | No | Returns system uptime, timestamp, and API operational status |
| `GET` | `/` | No | Root endpoint greeting and service discovery |
