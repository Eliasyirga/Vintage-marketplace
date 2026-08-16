import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { RoleRoute } from './components/auth/RoleRoute'

// Auth pages
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import VerifyRegistration from './pages/auth/VerifyRegistration'

// Marketplace pages
import HomePage from './pages/marketplace/HomePage'
import MarketplacePage from './pages/marketplace/MarketplacePage'
import ListingDetailsPage from './pages/marketplace/ListingDetailsPage'

// Checkout & Order Management pages
import CheckoutPage from './pages/checkout/CheckoutPage'
import OrderDetailsPage from './pages/orders/OrderDetailsPage'
import BuyerOrdersPage from './pages/orders/BuyerOrdersPage'
import SellerOrdersPage from './pages/orders/SellerOrdersPage'

// Monetization & Growth pages
import Pricing from './pages/Pricing'
import SellerMonetizationPage from './pages/seller/SellerMonetizationPage'
import SellerAnalyticsPage from './pages/seller/SellerAnalyticsPage'
import PaymentHistoryPage from './pages/account/PaymentHistoryPage'
import MockCheckoutPage from './pages/payments/MockCheckoutPage'
import AdvertisePage from './pages/advertise/AdvertisePage'
import CreateAdvertisementPage from './pages/advertise/CreateAdvertisementPage'
import MyAdvertisementsPage from './pages/advertise/MyAdvertisementsPage'

// Seller pages
import SellerProfilePage from './pages/seller/SellerProfilePage'
import SellerProfileEditPage from './pages/seller/SellerProfileEditPage'

// Account pages
import ProfilePage from './pages/account/ProfilePage'
import FavoritesPage from './pages/account/FavoritesPage'
import MessagesPage from './pages/account/MessagesPage'

// Selling pages
import SellPage from './pages/selling/SellPage'
import EditListingPage from './pages/selling/EditListingPage'
import MyListingsPage from './pages/selling/MyListingsPage'

// Admin pages
import AdminPage from './pages/admin/AdminPage'
import AdminMonetization from './pages/admin/AdminMonetization'
import AdminReports from './pages/admin/AdminReports'
import AdminUsers from './pages/admin/AdminUsers'
import AdminListings from './pages/admin/AdminListings'
import AdminVerifications from './pages/admin/AdminVerifications'
import AdminReviews from './pages/admin/AdminReviews'
import AdminAuditLogs from './pages/admin/AdminAuditLogs'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1c1917',
              color: '#e7e5e4',
              border: '1px solid #44403c',
              borderRadius: '12px',
              fontSize: '14px',
            },
            success: {
              iconTheme: { primary: '#d97706', secondary: '#fff' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#fff' },
            },
          }}
        />

        <Routes>
          {/* ── Public routes ──────────────────────────────────────────── */}
          <Route path="/" element={<HomePage />} />
          <Route path="/marketplace" element={<MarketplacePage />} />
          <Route path="/browse" element={<MarketplacePage />} />
          <Route path="/listings/:id" element={<ListingDetailsPage />} />
          <Route path="/seller/:sellerId" element={<SellerProfilePage />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/advertise" element={<AdvertisePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-registration" element={<VerifyRegistration />} />

          {/* ── Protected routes (require auth) ──────────────────────── */}
          <Route path="/advertise/create" element={<ProtectedRoute><CreateAdvertisementPage /></ProtectedRoute>} />
          <Route path="/advertise/my-ads" element={<ProtectedRoute><MyAdvertisementsPage /></ProtectedRoute>} />
          <Route path="/advertise/my" element={<ProtectedRoute><MyAdvertisementsPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/seller/profile/edit" element={<ProtectedRoute><SellerProfileEditPage /></ProtectedRoute>} />
          <Route path="/profile/edit" element={<ProtectedRoute><SellerProfileEditPage /></ProtectedRoute>} />
          <Route path="/favorites" element={<ProtectedRoute><FavoritesPage /></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
          <Route path="/sell" element={<ProtectedRoute><SellPage /></ProtectedRoute>} />
          <Route path="/listings/:id/edit" element={<ProtectedRoute><EditListingPage /></ProtectedRoute>} />
          <Route path="/my-listings" element={<ProtectedRoute><MyListingsPage /></ProtectedRoute>} />

          {/* ── Checkout & Orders routes ────────────────────────────── */}
          <Route path="/checkout/:listingId" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
          <Route path="/orders/:orderId" element={<ProtectedRoute><OrderDetailsPage /></ProtectedRoute>} />
          <Route path="/account/orders" element={<ProtectedRoute><BuyerOrdersPage /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><BuyerOrdersPage /></ProtectedRoute>} />
          <Route path="/seller/orders" element={<ProtectedRoute><SellerOrdersPage /></ProtectedRoute>} />

          {/* ── Monetization & Growth routes ─────────────────────────── */}
          <Route path="/seller/monetization" element={<ProtectedRoute><SellerMonetizationPage /></ProtectedRoute>} />
          <Route path="/seller/growth" element={<ProtectedRoute><SellerMonetizationPage /></ProtectedRoute>} />
          <Route path="/seller/analytics" element={<ProtectedRoute><SellerAnalyticsPage /></ProtectedRoute>} />
          <Route path="/account/payments" element={<ProtectedRoute><PaymentHistoryPage /></ProtectedRoute>} />
          <Route path="/checkout/mock" element={<ProtectedRoute><MockCheckoutPage /></ProtectedRoute>} />

          {/* ── Admin routes (require ADMIN role) ────────────────────── */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <RoleRoute roles={['ADMIN']}>
                  <AdminPage />
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/monetization"
            element={
              <ProtectedRoute>
                <RoleRoute roles={['ADMIN']}>
                  <AdminMonetization />
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute>
                <RoleRoute roles={['ADMIN']}>
                  <AdminReports />
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute>
                <RoleRoute roles={['ADMIN']}>
                  <AdminUsers />
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/listings"
            element={
              <ProtectedRoute>
                <RoleRoute roles={['ADMIN']}>
                  <AdminListings />
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/verifications"
            element={
              <ProtectedRoute>
                <RoleRoute roles={['ADMIN']}>
                  <AdminVerifications />
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reviews"
            element={
              <ProtectedRoute>
                <RoleRoute roles={['ADMIN']}>
                  <AdminReviews />
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/audit-logs"
            element={
              <ProtectedRoute>
                <RoleRoute roles={['ADMIN']}>
                  <AdminAuditLogs />
                </RoleRoute>
              </ProtectedRoute>
            }
          />

          {/* ── Fallbacks ─────────────────────────────────────────────── */}
          <Route path="/403" element={
            <div className="min-h-screen bg-stone-950 flex items-center justify-center text-center px-4">
              <div>
                <p className="text-6xl font-bold text-amber-500 mb-4">403</p>
                <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
                <p className="text-stone-400">You don't have permission to view this page.</p>
              </div>
            </div>
          } />
          <Route path="*" element={<Navigate to="/marketplace" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
