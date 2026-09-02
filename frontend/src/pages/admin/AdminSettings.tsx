import { useState, useEffect } from 'react'
import { AdminLayout } from '../../components/admin/AdminLayout'
import * as adminService from '../../services/admin.service'
import type { SystemSettings } from '../../types/admin'
import {
  Settings,
  CreditCard,
  ShieldCheck,
  Package,
  Layers,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminSettings() {
  const [settings, setSettings] = useState<SystemSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const loadSettings = async (manual = false) => {
    if (manual) setIsRefreshing(true)
    else setIsLoading(true)

    try {
      const data = await adminService.getSystemSettings()
      setSettings(data)
    } catch {
      toast.error('Failed to load system settings')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    loadSettings()
  }, [])

  return (
    <AdminLayout
      title="Platform Operations & Settings"
      subtitle="Gateway configuration, Fayda OIDC identity rules, and platform quota enforcement"
    >
      <div className="space-y-6 max-w-5xl">
        {/* Header toolbar */}
        <div className="bg-white border border-stone-200 rounded-3xl p-5 shadow-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black text-stone-900">System Infrastructure Settings</h2>
              <p className="text-xs text-stone-500 font-medium">
                Live environment configs and integration connectivity parameters
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => loadSettings(true)}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-700 hover:text-stone-900 text-xs font-bold transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-500' : ''}`} />
            <span>Refresh Diagnostics</span>
          </button>
        </div>

        {isLoading ? (
          <div className="p-16 text-center space-y-3 bg-white rounded-3xl border border-stone-200">
            <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-stone-400 font-bold uppercase tracking-wider">
              Reading Configuration State...
            </p>
          </div>
        ) : !settings ? (
          <div className="p-12 text-center text-xs text-stone-400">Unable to load settings.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Chapa Payment Gateway Card */}
            <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <CreditCard className="w-5 h-5 text-purple-600" />
                  <h3 className="font-black text-stone-900 text-sm">Chapa Payment Gateway</h3>
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Connected
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between py-1.5 border-b border-stone-100">
                  <span className="text-stone-500 font-medium">Gateway Provider:</span>
                  <span className="font-bold text-stone-900 font-mono">{settings.gateway.provider}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-stone-100">
                  <span className="text-stone-500 font-medium">Settlement Currency:</span>
                  <span className="font-bold text-stone-900">{settings.gateway.currency}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-stone-100">
                  <span className="text-stone-500 font-medium">Environment Mode:</span>
                  <span className="font-bold uppercase text-purple-700 font-mono bg-purple-50 px-2 py-0.5 rounded">
                    {settings.gateway.mode}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-stone-100">
                  <span className="text-stone-500 font-medium">Webhook Verification:</span>
                  <span className="font-bold text-emerald-600">HMAC-SHA256 Signature Active</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-stone-500 font-medium">Total Lifetime Transactions:</span>
                  <span className="font-black text-stone-900 font-mono">{settings.gateway.totalPaymentsProcessed}</span>
                </div>
              </div>

              <div className="p-3.5 bg-stone-50 rounded-2xl text-[11px] text-stone-500 font-medium leading-relaxed border border-stone-100">
                Security note: Gateway secret keys and webhooks credentials are encrypted in backend runtime environment only and never exposed to client bundles.
              </div>
            </div>

            {/* 2. Fayda OIDC Identity Card */}
            <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-blue-600" />
                  <h3 className="font-black text-stone-900 text-sm">Fayda National ID (OIDC)</h3>
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  {settings.faydaOidc.status}
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between py-1.5 border-b border-stone-100">
                  <span className="text-stone-500 font-medium">Identity Standard:</span>
                  <span className="font-bold text-stone-900 font-mono">{settings.faydaOidc.provider}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-stone-100">
                  <span className="text-stone-500 font-medium">OIDC Authorization Endpoint:</span>
                  <a
                    href={settings.faydaOidc.endpoint}
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-blue-600 truncate max-w-[200px] flex items-center gap-1 hover:underline"
                  >
                    <span>{settings.faydaOidc.endpoint}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                </div>
                <div className="flex justify-between py-1.5 border-b border-stone-100">
                  <span className="text-stone-500 font-medium">Sandbox Mode:</span>
                  <span className="font-bold font-mono text-stone-900">
                    {settings.faydaOidc.sandboxMode ? 'Enabled (Simulated IDP)' : 'Production eSignet'}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-stone-100">
                  <span className="text-stone-500 font-medium">Privacy Protection:</span>
                  <span className="font-bold text-emerald-600">SHA-256 One-Way Subject Hash</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-stone-500 font-medium">Biometric Face Recognition:</span>
                  <span className="font-bold text-stone-500">Disabled (Compliant Policy)</span>
                </div>
              </div>

              <div className="p-3.5 bg-blue-50/50 rounded-2xl text-[11px] text-blue-900 font-medium leading-relaxed border border-blue-100">
                Fayda sub claims are hashed prior to storage to guarantee zero storage of raw national identity numbers.
              </div>
            </div>

            {/* 3. Marketplace Limits & Quotas */}
            <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5">
                <Package className="w-5 h-5 text-amber-600" />
                <h3 className="font-black text-stone-900 text-sm">Listing Quotas & Caps</h3>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between py-1.5 border-b border-stone-100">
                  <span className="text-stone-500 font-medium">Basic Account Listing Limit:</span>
                  <span className="font-black text-stone-900 font-mono">
                    {settings.marketplaceLimits.basicUserListingCap} items
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-stone-100">
                  <span className="text-stone-500 font-medium">Business Store Listing Limit:</span>
                  <span className="font-black text-purple-700 font-mono">
                    {settings.marketplaceLimits.businessStoreListingCap} items
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-stone-100">
                  <span className="text-stone-500 font-medium">Max Image Upload Size:</span>
                  <span className="font-bold text-stone-900 font-mono">
                    {settings.marketplaceLimits.imageUploadLimitMB} MB
                  </span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-stone-500 font-medium">Marketplace Commission:</span>
                  <span className="font-bold text-stone-900">
                    {settings.marketplaceLimits.platformCommissionRate}
                  </span>
                </div>
              </div>
            </div>

            {/* 4. Database Platform Health */}
            <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5">
                <Layers className="w-5 h-5 text-emerald-600" />
                <h3 className="font-black text-stone-900 text-sm">Database & Platform Health</h3>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-stone-50 rounded-2xl border border-stone-100">
                  <span className="text-[10px] uppercase font-bold text-stone-400 block">Total Users</span>
                  <p className="text-lg font-black text-stone-900 mt-0.5 font-mono">
                    {settings.platformStats.totalUsers}
                  </p>
                </div>
                <div className="p-3 bg-stone-50 rounded-2xl border border-stone-100">
                  <span className="text-[10px] uppercase font-bold text-stone-400 block">All Listings</span>
                  <p className="text-lg font-black text-stone-900 mt-0.5 font-mono">
                    {settings.platformStats.totalListings}
                  </p>
                </div>
                <div className="p-3 bg-stone-50 rounded-2xl border border-stone-100">
                  <span className="text-[10px] uppercase font-bold text-stone-400 block">All Orders</span>
                  <p className="text-lg font-black text-stone-900 mt-0.5 font-mono">
                    {settings.platformStats.totalOrders}
                  </p>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-2xl text-xs text-emerald-800 font-semibold flex items-center gap-2 border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>PostgreSQL database connected and query indexing optimized.</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
