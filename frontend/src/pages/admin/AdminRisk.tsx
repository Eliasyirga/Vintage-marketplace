import { useState, useEffect } from 'react'
import { AdminLayout } from '../../components/admin/AdminLayout'
import * as adminService from '../../services/admin.service'
import type { RiskSignalItem } from '../../types/admin'
import {
  AlertTriangle,
  ShieldAlert,
  UserX,
  Eye,
  RefreshCw,
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { Link } from 'react-router-dom'

export default function AdminRisk() {
  const [signals, setSignals] = useState<RiskSignalItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)

  const loadSignals = () => {
    setIsLoading(true)
    adminService
      .getRiskSignals()
      .then((data) => setSignals(data || []))
      .catch(() => toast.error('Failed to load risk signals'))
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    loadSignals()
  }, [])

  const handleSuspend = async (userId: string) => {
    const reason = window.prompt('Please enter the reason for account suspension:')
    if (!reason || !reason.trim()) return

    setActionLoadingId(userId)
    try {
      await adminService.updateUserStatus(userId, 'SUSPENDED', reason.trim())
      toast.success('User account has been suspended')
      loadSignals()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to suspend user')
    } finally {
      setActionLoadingId(null)
    }
  }

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-black text-red-800 bg-red-100 px-3 py-1 rounded-full border border-red-300 animate-pulse">
            <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
            CRITICAL RISK
          </span>
        )
      case 'HIGH':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-black text-amber-800 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            HIGH RISK
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-stone-700 bg-stone-100 px-2.5 py-0.5 rounded-full border border-stone-200">
            FLAGGED
          </span>
        )
    }
  }

  return (
    <AdminLayout
      title="Risk & Abuse Monitoring"
      subtitle="Proactive fraud prevention, safety flags, and dispute risk intelligence"
    >
      <div className="space-y-6">
        {/* Risk Overview Header */}
        <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-200">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-black text-stone-900">
                Flagged Accounts & Behavioral Anomalies
              </h2>
              <p className="text-xs text-stone-500 font-medium">
                Accounts with multiple buyer disputes, policy violations, or repeated payment rejections
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={loadSignals}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-700 hover:text-stone-900 text-xs font-bold transition-all self-start sm:self-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Scan</span>
          </button>
        </div>

        {/* Signals List */}
        {isLoading ? (
          <div className="p-16 text-center space-y-3 bg-white rounded-3xl border border-stone-200">
            <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-stone-400 font-bold uppercase tracking-wider">
              Scanning Platform Signals...
            </p>
          </div>
        ) : signals.length === 0 ? (
          <div className="p-12 text-center space-y-3 bg-white rounded-3xl border border-stone-200">
            <ShieldAlert className="w-10 h-10 text-emerald-400 mx-auto" />
            <p className="text-sm font-bold text-stone-800">No high-risk accounts detected</p>
            <p className="text-xs text-stone-500">
              All active users, listings, and payment transactions are currently within normal thresholds.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {signals.map((item) => (
              <div
                key={item.userId}
                className="bg-white border border-stone-200 rounded-3xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-red-300 transition-colors"
              >
                <div className="space-y-2 max-w-2xl">
                  <div className="flex items-center gap-3">
                    {getRiskBadge(item.riskLevel)}
                    <span className="font-mono text-xs text-stone-400 font-semibold">
                      ID: {item.userId.slice(0, 8)}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        item.accountStatus === 'SUSPENDED'
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {item.accountStatus}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-stone-900 text-base">{item.userName}</h3>
                    <p className="text-xs text-stone-500 font-mono">
                      {item.userEmail} &bull; {item.userPhone}
                    </p>
                  </div>

                  {/* Flag reasons */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {item.reasons.map((r, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-red-700 bg-red-50 px-2.5 py-0.5 rounded-lg border border-red-100"
                      >
                        <AlertTriangle className="w-3 h-3 text-red-500 shrink-0" />
                        {r}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Direct Moderation Shortcuts */}
                <div className="flex items-center gap-2 self-start md:self-center shrink-0">
                  <Link
                    to={`/admin/users?search=${encodeURIComponent(item.userEmail || item.userName)}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Inspect Dossier</span>
                  </Link>

                  {item.accountStatus !== 'SUSPENDED' && (
                    <button
                      type="button"
                      disabled={actionLoadingId === item.userId}
                      onClick={() => handleSuspend(item.userId)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black transition-colors shadow-xs shadow-red-600/20"
                    >
                      <UserX className="w-3.5 h-3.5" />
                      <span>Suspend User</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
