import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AdminLayout } from '../../components/admin/AdminLayout'
import { getDashboardStats, getAdminReports, getAdminAuditLogs } from '../../services/admin.service'
import type { DashboardStats, AdminAuditLogItem } from '../../types/admin'
import type { ReportItem } from '../../types/report'
import {
  Users,
  Package,
  Flag,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  History as HistoryIcon,
  Loader2,
} from 'lucide-react'

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentReports, setRecentReports] = useState<ReportItem[]>([])
  const [recentLogs, setRecentLogs] = useState<AdminAuditLogItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [statsData, reportsData, logsData] = await Promise.all([
          getDashboardStats(),
          getAdminReports({ limit: 5 }),
          getAdminAuditLogs({ limit: 5 }),
        ])
        setStats(statsData)
        setRecentReports(reportsData.reports)
        setRecentLogs(logsData.logs)
      } catch (err) {
        console.error('Failed to load admin stats:', err)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  if (isLoading) {
    return (
      <AdminLayout title="Dashboard Overview" subtitle="System metrics & trust indicators">
        <div className="flex items-center justify-center py-28">
          <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Dashboard Overview" subtitle="Platform metrics & moderation activity">
      {/* 4 Top Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-stone-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Users</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4.5 h-4.5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-stone-900">{stats?.totalUsers ?? 0}</p>
          <p className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +{stats?.newUsersToday ?? 0} joined today
          </p>
        </div>

        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-stone-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-bold uppercase tracking-wider">Active Listings</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Package className="w-4.5 h-4.5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-stone-900">{stats?.activeListings ?? 0}</p>
          <p className="text-[11px] font-semibold text-stone-400">
            {stats?.soldListings ?? 0} sold · +{stats?.newListingsToday ?? 0} today
          </p>
        </div>

        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-stone-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Reports</span>
            <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <Flag className="w-4.5 h-4.5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-stone-900">{stats?.pendingReports ?? 0}</p>
          <Link
            to="/admin/reports"
            className="text-[11px] font-bold text-red-600 hover:text-red-700 flex items-center gap-1"
          >
            Review Reports <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-stone-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-bold uppercase tracking-wider">Verifications</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <ShieldCheck className="w-4.5 h-4.5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-stone-900">
            {stats?.pendingVerifications ?? 0}
          </p>
          <Link
            to="/admin/verifications"
            className="text-[11px] font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1"
          >
            Review Queue <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* 2-Column Split: Recent Reports & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Reports Queue */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-stone-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flag className="w-5 h-5 text-red-600" />
              <h3 className="text-sm font-extrabold text-stone-900">Recent Reports</h3>
            </div>
            <Link
              to="/admin/reports"
              className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentReports.length === 0 ? (
            <div className="text-center py-10 text-xs text-stone-400 font-medium">
              No reports in queue. Marketplace looks clean!
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {recentReports.map((report) => (
                <div key={report.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          report.priority === 'CRITICAL'
                            ? 'bg-red-600 text-white'
                            : report.priority === 'HIGH'
                            ? 'bg-red-100 text-red-700'
                            : report.priority === 'MEDIUM'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-stone-100 text-stone-700'
                        }`}
                      >
                        {report.priority}
                      </span>
                      <span className="text-xs font-bold text-stone-900 truncate">
                        {report.targetType}: {report.reason.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-500 truncate">
                      Reported by {report.reporter?.full_name || 'Buyer'} ·{' '}
                      {new Date(report.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Link
                    to={`/admin/reports`}
                    className="px-3 py-1 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs whitespace-nowrap transition-colors"
                  >
                    Inspect
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Admin Audit Logs */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-stone-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HistoryIcon className="w-5 h-5 text-amber-600" />
              <h3 className="text-sm font-extrabold text-stone-900">Audit Activity</h3>
            </div>
            <Link
              to="/admin/audit-logs"
              className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
            >
              Logs <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentLogs.length === 0 ? (
            <div className="text-center py-10 text-xs text-stone-400 font-medium">
              No recent audit activity.
            </div>
          ) : (
            <div className="space-y-3">
              {recentLogs.map((log) => (
                <div key={log.id} className="p-3 rounded-2xl bg-stone-50 border border-stone-100 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-stone-900">{log.action}</span>
                    <span className="text-[10px] text-stone-400 font-medium whitespace-nowrap">
                      {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500">
                    By <span className="font-semibold text-stone-700">{log.admin?.full_name || 'Admin'}</span> on{' '}
                    <span className="font-semibold">{log.target_type}</span>
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
