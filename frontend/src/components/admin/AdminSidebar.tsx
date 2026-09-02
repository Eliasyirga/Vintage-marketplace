import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Package,
  Flag,
  ShieldCheck,
  MessageSquare,
  History,
  Store,
  ChevronLeft,
  DollarSign,
  TrendingUp,
  ShoppingCart,
  CreditCard,
  Building2,
  Megaphone,
  AlertTriangle,
  ChevronRight,
  Bell,
  Settings,
} from 'lucide-react'

interface AdminSidebarProps {
  isOpen?: boolean
  onClose?: () => void
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

export function AdminSidebar({
  isOpen,
  onClose,
  isCollapsed = false,
  onToggleCollapse,
}: AdminSidebarProps) {
  const navigationSections = [
    {
      title: 'CORE PLATFORM',
      items: [
        { label: 'Overview', to: '/admin', icon: LayoutDashboard, end: true },
        { label: 'Analytics', to: '/admin/analytics', icon: TrendingUp },
        { label: 'Alerts & Queue', to: '/admin/notifications', icon: Bell },
      ],
    },
    {
      title: 'MARKETPLACE OPERATIONS',
      items: [
        { label: 'Users & Dossiers', to: '/admin/users', icon: Users },
        { label: 'Catalog & Listings', to: '/admin/listings', icon: Package },
        { label: 'Orders & Purchases', to: '/admin/orders', icon: ShoppingCart },
        { label: 'Business Stores', to: '/admin/businesses', icon: Building2 },
      ],
    },
    {
      title: 'FINANCIAL & REVENUE',
      items: [
        { label: 'Chapa Payments', to: '/admin/payments', icon: CreditCard },
        { label: 'Ad Campaigns', to: '/admin/advertisements', icon: Megaphone },
        { label: 'Plans & Boosts', to: '/admin/monetization', icon: DollarSign },
      ],
    },
    {
      title: 'TRUST, SAFETY & RISK',
      items: [
        { label: 'Reports Queue', to: '/admin/reports', icon: Flag },
        { label: 'ID Verifications', to: '/admin/verifications', icon: ShieldCheck },
        { label: 'Risk & Abuse Radar', to: '/admin/risk', icon: AlertTriangle },
        { label: 'User Reviews', to: '/admin/reviews', icon: MessageSquare },
        { label: 'Audit Trail', to: '/admin/audit-logs', icon: History },
      ],
    },
    {
      title: 'GOVERNANCE & SETTINGS',
      items: [
        { label: 'Platform Settings', to: '/admin/settings', icon: Settings },
      ],
    },
  ]

  return (
    <aside
      className={`fixed lg:static inset-y-0 left-0 z-40 bg-[#0c0e12] text-stone-200 flex flex-col justify-between border-r border-stone-800/80 transition-all duration-300 shadow-2xl backdrop-blur-xl ${
        isCollapsed ? 'w-20' : 'w-64'
      } ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
    >
      {/* Brand Header */}
      <div className="p-4 sm:p-5 flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative group shrink-0">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center text-stone-950 font-black shadow-lg shadow-amber-500/25 ring-1 ring-amber-300/30">
                V
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-[#0c0e12] rounded-full" />
            </div>

            {!isCollapsed && (
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-black tracking-tight text-white block truncate">
                    Vintage
                  </span>
                  <span className="text-[9px] font-black uppercase tracking-widest bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded-md border border-amber-500/30">
                    PRO
                  </span>
                </div>
                <span className="text-[10px] font-bold text-stone-400 tracking-wider uppercase block truncate">
                  Admin Command
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="lg:hidden p-1.5 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800/80"
                aria-label="Close navigation"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            {onToggleCollapse && (
              <button
                type="button"
                onClick={onToggleCollapse}
                className="hidden lg:flex p-1.5 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800/80 transition-colors"
                title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                aria-label="Toggle sidebar collapse"
              >
                {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>

        {/* Navigation Section List */}
        <div className="space-y-6 overflow-y-auto max-h-[calc(100vh-190px)] pr-1 pt-2 custom-scrollbar">
          {navigationSections.map((section) => (
            <div key={section.title} className="space-y-1">
              {!isCollapsed && (
                <span className="text-[10px] font-black uppercase tracking-widest text-stone-400 px-3 block mb-1.5">
                  {section.title}
                </span>
              )}
              {section.items.map((item) => {
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={onClose}
                    title={isCollapsed ? item.label : undefined}
                    className={({ isActive }) =>
                      `group relative flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 shadow-lg shadow-amber-500/20 font-black'
                          : 'text-stone-300 hover:text-white hover:bg-stone-900/90'
                      } ${isCollapsed ? 'justify-center' : ''}`
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </NavLink>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Sidebar Footer */}
      <div className="p-3.5 border-t border-stone-800/80 space-y-2 bg-[#08090c]/80 backdrop-blur-md">
        <NavLink
          to="/browse"
          className={`flex items-center gap-2.5 text-xs font-bold text-stone-300 hover:text-amber-400 transition-all p-2 rounded-xl hover:bg-stone-900/90 ${
            isCollapsed ? 'justify-center' : ''
          }`}
          title="Exit to Marketplace"
        >
          <Store className="w-4 h-4 shrink-0 text-amber-400" />
          {!isCollapsed && (
            <div className="flex items-center justify-between w-full">
              <span>Marketplace</span>
              <span className="text-[10px] text-stone-400 font-mono">Live &rarr;</span>
            </div>
          )}
        </NavLink>
      </div>
    </aside>
  )
}
