import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  User,
  ShieldCheck,
  BadgeCheck,
  ShoppingBag,
  Heart,
  MessageSquare,
  CreditCard,
  Store,
  Tag,
  TrendingUp,
  BarChart3,
  Briefcase,
  Megaphone,
  Settings,
  LogOut,
  Sparkles,
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

interface NavItem {
  to: string
  label: string
  icon: typeof LayoutDashboard
  badge?: string | number
  highlight?: boolean
}

export function AccountSidebar({ onCloseMobile }: { onCloseMobile?: () => void }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const buyerNav: NavItem[] = [
    { to: '/account/overview', label: 'Overview', icon: LayoutDashboard },
    { to: '/account/profile', label: 'Profile & Info', icon: User },
    { to: '/account/security', label: 'Security & Password', icon: ShieldCheck },
    { to: '/account/verification', label: 'Identity Verification', icon: BadgeCheck },
    { to: '/account/orders', label: 'My Orders', icon: ShoppingBag },
    { to: '/account/favorites', label: 'Favorites', icon: Heart },
    { to: '/account/messages', label: 'Messages', icon: MessageSquare },
    { to: '/account/payments', label: 'Payments', icon: CreditCard },
  ]

  const sellerNav: NavItem[] = [
    { to: '/seller/dashboard', label: 'Seller Hub', icon: Store, highlight: true },
    { to: '/account/listings', label: 'My Listings', icon: Tag },
    { to: '/seller/orders', label: 'Sales & Orders', icon: TrendingUp },
    { to: '/seller/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/seller/monetization', label: 'Boosts & Plans', icon: Sparkles },
    { to: '/account/business', label: 'Business Profile', icon: Briefcase },
    { to: '/advertise/my-ads', label: 'Advertisements', icon: Megaphone },
  ]

  const settingsNav: NavItem[] = [
    { to: '/account/settings', label: 'Settings & Privacy', icon: Settings },
  ]

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const renderNavGroup = (title: string, items: NavItem[]) => (
    <div className="mb-6">
      <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-stone-600">
        {title}
      </p>
      <nav className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/20 font-semibold'
                    : item.highlight
                    ? 'text-amber-700 bg-amber-50/80 hover:bg-amber-100/70'
                    : 'text-stone-700 hover:text-stone-900 hover:bg-stone-100'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-stone-200 text-stone-700">
                  {item.badge}
                </span>
              )}
            </NavLink>
          )
        })}
      </nav>
    </div>
  )

  return (
    <aside className="w-full h-full flex flex-col justify-between p-4 bg-white border-r border-stone-200">
      <div className="space-y-6">
        {/* User Mini Profile Header */}
        <div className="p-3 bg-stone-50 rounded-2xl border border-stone-100 flex items-center gap-3">
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.fullName}
              className="w-11 h-11 rounded-full object-cover border border-stone-200"
            />
          ) : (
            <div className="w-11 h-11 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center text-base shadow-sm">
              {user?.fullName?.charAt(0).toUpperCase() || 'U'}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-bold text-stone-900 truncate">{user?.fullName}</h4>
            <p className="text-xs text-stone-500 truncate">{user?.email || user?.phone}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800">
                {user?.role === 'ADMIN' ? 'ADMIN' : 'MEMBER'}
              </span>
              {user?.isFaydaVerified && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                  VERIFIED
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Sections */}
        <div>
          {renderNavGroup('Account & Buying', buyerNav)}
          {renderNavGroup('Selling & Business', sellerNav)}
          {renderNavGroup('Preferences', settingsNav)}
        </div>
      </div>

      {/* Logout Action */}
      <div className="pt-4 mt-6 border-t border-stone-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  )
}
