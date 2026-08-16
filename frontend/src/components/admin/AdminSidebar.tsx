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
} from 'lucide-react'

interface AdminSidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const navItems = [
    { label: 'Overview', to: '/admin', icon: LayoutDashboard, end: true },
    { label: 'Monetization & Revenue', to: '/admin/monetization', icon: DollarSign },
    { label: 'Reports Queue', to: '/admin/reports', icon: Flag },
    { label: 'User Management', to: '/admin/users', icon: Users },
    { label: 'Listing Moderation', to: '/admin/listings', icon: Package },
    { label: 'Verifications', to: '/admin/verifications', icon: ShieldCheck },
    { label: 'Review Moderation', to: '/admin/reviews', icon: MessageSquare },
    { label: 'Audit Logs', to: '/admin/audit-logs', icon: History },
  ]

  return (
    <aside
      className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-stone-900 text-stone-100 flex flex-col justify-between border-r border-stone-800 transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
    >
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center text-stone-950 font-black shadow-md">
              V
            </div>
            <div>
              <span className="text-sm font-black tracking-tight text-white block">Vintage Admin</span>
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                Trust & Moderation
              </span>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-stone-400 hover:text-white"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20'
                      : 'text-stone-400 hover:text-white hover:bg-stone-800/60'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>
      </div>

      <div className="p-6 border-t border-stone-800 space-y-3">
        <NavLink
          to="/browse"
          className="flex items-center gap-2 text-xs font-bold text-stone-400 hover:text-amber-400 transition-colors"
        >
          <Store className="w-4 h-4" />
          <span>Exit to Marketplace</span>
        </NavLink>
      </div>
    </aside>
  )
}
