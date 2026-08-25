import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { RoleRoute } from './components/auth/RoleRoute'
import { AppLoader } from './components/common/AppLoader'

// Layouts
import { AccountLayout } from './layouts/AccountLayout'

// Auth pages
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import VerifyRegistration from './pages/auth/VerifyRegistration'

// Marketplace pages
import HomePage from './pages/marketplace/HomePage'
import MarketplacePage from './pages/marketplace/MarketplacePage'
import ListingDetailsPage from './pages/marketplace/ListingDetailsPage'
import CategoriesPage from './pages/CategoriesPage'
import HowItWorksPage from './pages/HowItWorksPage'

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
import SellerDashboardPage from './pages/seller/SellerDashboardPage'

// Account pages
import AccountOverviewPage from './pages/account/AccountOverviewPage'
import ProfilePage from './pages/account/ProfilePage'
import FavoritesPage from './pages/account/FavoritesPage'
import MessagesPage from './pages/account/MessagesPage'
import SecuritySettingsPage from './pages/account/SecuritySettingsPage'
import VerificationCenterPage from './pages/account/VerificationCenterPage'
import FaydaCallbackPage from './pages/account/FaydaCallbackPage'
import AccountSettingsPage from './pages/account/AccountSettingsPage'
import SellerOnboardingPage from './pages/account/SellerOnboardingPage'

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

        <AppLoader>
          <Routes>
            {/* ── Public routes ──────────────────────────────────────────── */}
          <Route path="/" element={<HomePage />} />
          <Route path="/marketplace" element={<MarketplacePage />} />
          <Route path="/browse" element={<MarketplacePage />} />
          <Route path="/listings/:id" element={<ListingDetailsPage />} />
          <Route path="/seller/:sellerId" element={<SellerProfilePage />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/advertise" element={<AdvertisePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-registration" element={<VerifyRegistration />} />

          {/* ── Standalone Selling & Listing creation ─────────────────── */}
          <Route path="/sell" element={<ProtectedRoute><SellPage /></ProtectedRoute>} />
          <Route path="/listings/:id/edit" element={<ProtectedRoute><EditListingPage /></ProtectedRoute>} />

          {/* ── Unified /account layout & sections ────────────────────── */}
          <Route
            path="/account"
            element={
              <ProtectedRoute>
                <AccountLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AccountOverviewPage />} />
            <Route path="overview" element={<AccountOverviewPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="security" element={<SecuritySettingsPage />} />
            <Route path="verification" element={<VerificationCenterPage />} />
            <Route path="fayda/callback" element={<FaydaCallbackPage />} />
            <Route path="orders" element={<BuyerOrdersPage />} />
            <Route path="sales" element={<SellerOrdersPage />} />
            <Route path="favorites" element={<FavoritesPage />} />
            <Route path="payments" element={<PaymentHistoryPage />} />
            <Route path="seller" element={<SellerOnboardingPage />} />
            <Route path="listings" element={<MyListingsPage />} />
            <Route path="analytics" element={<SellerAnalyticsPage />} />
            <Route path="settings" element={<AccountSettingsPage />} />
            <Route path="business" element={<ProfilePage />} />
          </Route>

          {/* ── Messages: standalone full-viewport workspace ─────────── */}
          <Route
            path="/messages"
            element={<ProtectedRoute><MessagesPage /></ProtectedRoute>}
          />

          {/* ── Seller Dashboard & Management ─────────────────────────── */}
          <Route
            path="/seller"
            element={
              <ProtectedRoute>
                <AccountLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<SellerDashboardPage />} />
            <Route path="dashboard" element={<SellerDashboardPage />} />
            <Route path="orders" element={<SellerOrdersPage />} />
            <Route path="analytics" element={<SellerAnalyticsPage />} />
          </Route>
          <Route path="/seller/monetization" element={<ProtectedRoute><SellerMonetizationPage /></ProtectedRoute>} />
          <Route path="/seller/growth" element={<ProtectedRoute><SellerMonetizationPage /></ProtectedRoute>} />
          <Route path="/seller/profile/edit" element={<ProtectedRoute><SellerProfileEditPage /></ProtectedRoute>} />

          {/* ── Advertising ───────────────────────────────────────────── */}
          <Route path="/advertise/create" element={<ProtectedRoute><CreateAdvertisementPage /></ProtectedRoute>} />
          <Route path="/advertise/my-ads" element={<ProtectedRoute><MyAdvertisementsPage /></ProtectedRoute>} />
          <Route path="/advertise/my" element={<ProtectedRoute><MyAdvertisementsPage /></ProtectedRoute>} />

          {/* ── Backward Compatibility Redirects ──────────────────────── */}
          <Route path="/dashboard" element={<Navigate to="/account/overview" replace />} />
          <Route path="/profile" element={<Navigate to="/account/profile" replace />} />
          <Route path="/profile/edit" element={<Navigate to="/seller/profile/edit" replace />} />
          <Route path="/favorites" element={<Navigate to="/account/favorites" replace />} />
          {/* /messages goes directly to the standalone workspace route above */}
          <Route path="/account/messages" element={<Navigate to="/messages" replace />} />
          <Route path="/orders" element={<Navigate to="/account/orders" replace />} />
          <Route path="/my-listings" element={<Navigate to="/account/listings" replace />} />

          {/* ── Checkout & Orders routes ────────────────────────────── */}
          <Route path="/checkout/:listingId" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
          <Route path="/orders/:orderId" element={<ProtectedRoute><OrderDetailsPage /></ProtectedRoute>} />
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
          <Route
            path="/403"
            element={
              <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full p-8 bg-white rounded-3xl border border-stone-200 text-center space-y-4 shadow-sm">
                  <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mx-auto text-xl font-black">
                    403
                  </div>
                  <h1 className="text-xl font-bold text-stone-900">Access Denied</h1>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    You do not have administrative privileges to view this page or resource.
                  </p>
                  <a
                    href="/marketplace"
                    className="inline-block px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-xs transition-all"
                  >
                    Return to Marketplace
                  </a>
                </div>
              </div>
            }
          />
            <Route path="*" element={<Navigate to="/marketplace" replace />} />
          </Routes>
        </AppLoader>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App

