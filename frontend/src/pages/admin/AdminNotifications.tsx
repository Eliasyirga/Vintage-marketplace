import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { AdminLayout } from '../../components/admin/AdminLayout'
import * as adminService from '../../services/admin.service'
import type { AdminNotificationItem } from '../../types/admin'
import {
  Bell,
  Flag,
  ShieldCheck,
  Megaphone,
  CreditCard,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState<AdminNotificationItem[]>([])
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL')
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const loadNotifications = async (manual = false) => {
    if (manual) setIsRefreshing(true)
    else setIsLoading(true)

    try {
      const data = await adminService.getAdminNotifications()
      setNotifications(data || [])
    } catch {
      toast.error('Failed to load system notifications')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    loadNotifications()
  }, [])

  const filtered = notifications.filter((n) => {
    if (categoryFilter === 'ALL') return true
    return n.category === categoryFilter
  })

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'REPORT':
        return <Flag className="w-4 h-4 text-red-600" />
      case 'VERIFICATION':
        return <ShieldCheck className="w-4 h-4 text-blue-600" />
      case 'ADVERTISEMENT':
        return <Megaphone className="w-4 h-4 text-amber-600" />
      case 'PAYMENT':
        return <CreditCard className="w-4 h-4 text-purple-600" />
      default:
        return <Bell className="w-4 h-4 text-stone-600" />
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return (
          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-red-600 text-white animate-pulse">
            Critical
          </span>
        )
      case 'HIGH':
        return (
          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">
            High
          </span>
        )
      case 'MEDIUM':
        return (
          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
            Medium
          </span>
        )
      default:
        return (
          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
            Info
          </span>
        )
    }
  }

  return (
    <AdminLayout
      title="System Alerts & Notifications"
      subtitle="Actionable queue alerts for safety reports, pending verifications, and payment exceptions"
    >
      <div className="space-y-6">
        {/* Header & Filter Bar */}
        <div className="bg-white border border-stone-200 rounded-3xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            {[
              { id: 'ALL', label: 'All Alerts' },
              { id: 'REPORT', label: 'Reports' },
              { id: 'VERIFICATION', label: 'ID Verifications' },
              { id: 'ADVERTISEMENT', label: 'Advertisements' },
              { id: 'PAYMENT', label: 'Payments' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategoryFilter(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  categoryFilter === cat.id
                    ? 'bg-stone-900 text-white shadow-xs font-black'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => loadNotifications(true)}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-700 hover:text-stone-900 text-xs font-bold transition-all self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-500' : ''}`} />
            <span>Sync Alerts</span>
          </button>
        </div>

        {/* Notifications List */}
        {isLoading ? (
          <div className="p-16 text-center space-y-3 bg-white rounded-3xl border border-stone-200">
            <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-stone-400 font-bold uppercase tracking-wider">
              Gathering Platform Alerts...
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center space-y-3 bg-white rounded-3xl border border-stone-200 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-stone-900">All queues are clear!</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              No outstanding safety flags, payment failures, or verification requests need immediate attention.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-amber-300 transition-colors"
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center shrink-0 mt-0.5">
                    {getCategoryIcon(item.category)}
                  </div>
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-black text-stone-900 text-sm">{item.title}</span>
                      {getPriorityBadge(item.priority)}
                    </div>
                    <p className="text-xs text-stone-600 font-medium leading-relaxed">
                      {item.message}
                    </p>
                    <span className="text-[10px] text-stone-400 font-mono block">
                      {new Date(item.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                <Link
                  to={item.link}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-amber-500 hover:text-stone-950 text-stone-800 text-xs font-bold transition-all shrink-0 self-start sm:self-auto group shadow-2xs"
                >
                  <span>Resolve in Queue</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
