import { useState, useEffect } from 'react'
import {
  CheckCircle2,
  XCircle,
  Plus,
  Edit2,
  Loader2,
  RefreshCw,
  ExternalLink,
} from 'lucide-react'
import toast from 'react-hot-toast'
import * as monetizationService from '../../services/monetization.service'
import * as adService from '../../services/advertisement.service'
import * as paymentService from '../../services/payment.service'
import type { Plan, Advertisement, AdminMonetizationStats } from '../../types/monetization'
import { buildCloudinaryUrl } from '../../utils/advertisementUtils'
import { AdminLayout } from '../../components/admin/AdminLayout'

export default function AdminMonetization() {
  const [stats, setStats] = useState<AdminMonetizationStats | null>(null)
  const [plans, setPlans] = useState<Plan[]>([])
  const [ads, setAds] = useState<Advertisement[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'PLANS' | 'ADS' | 'REFUND'>('OVERVIEW')

  // Edit Plan modal state
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null)
  const [planForm, setPlanForm] = useState<{ price: number; durationDays: number; isActive: boolean }>({
    price: 0,
    durationDays: 7,
    isActive: true,
  })

  // Create Plan state
  const [isCreatingPlan, setIsCreatingPlan] = useState(false)
  const [newPlan, setNewPlan] = useState<{
    name: string
    type: string
    price: number
    durationDays: number
    billingCycle: string
    features: string
  }>({
    name: '',
    type: 'BOOST',
    price: 100,
    durationDays: 7,
    billingCycle: 'ONE_TIME',
    features: 'Feature 1, Feature 2',
  })

  // Refund state
  const [refundPaymentId, setRefundPaymentId] = useState('')
  const [refundReason, setRefundReason] = useState('')
  const [isRefunding, setIsRefunding] = useState(false)

  const loadData = async () => {
    setLoading(true)
    try {
      const [statsData, plansData, adsData] = await Promise.all([
        monetizationService.getAdminMonetizationStats(),
        monetizationService.getAdminPlans(),
        adService.getAllAdsAdmin(),
      ])
      setStats(statsData)
      setPlans(plansData)
      setAds(adsData)
    } catch {
      toast.error('Failed to load admin monetization data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleUpdatePlan = async () => {
    if (!editingPlan) return
    try {
      const updated = await monetizationService.updateAdminPlan(editingPlan.id, {
        price: planForm.price,
        durationDays: planForm.durationDays,
        isActive: planForm.isActive,
      })
      toast.success(`Plan "${updated.name}" updated!`)
      setEditingPlan(null)
      loadData()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update plan.')
    }
  }

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await monetizationService.createAdminPlan({
        name: newPlan.name,
        type: newPlan.type as any,
        price: Number(newPlan.price),
        durationDays: Number(newPlan.durationDays),
        billingCycle: newPlan.billingCycle as any,
        features: newPlan.features.split(',').map((s) => s.trim()).filter(Boolean),
        isActive: true,
      })
      toast.success('New monetization plan created!')
      setIsCreatingPlan(false)
      loadData()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to create plan.')
    }
  }

  const handleApproveAd = async (id: string) => {
    try {
      await adService.approveAdAdmin(id)
      toast.success('Advertisement approved & activated!')
      loadData()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to approve ad.')
    }
  }

  const handleRejectAd = async (id: string) => {
    const reason = prompt('Please enter rejection reason:', 'Creative did not meet safety guidelines.')
    if (!reason) return
    try {
      await adService.rejectAdAdmin(id, reason)
      toast.success('Advertisement rejected.')
      loadData()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to reject ad.')
    }
  }

  const handlePauseAd = async (id: string) => {
    try {
      await adService.pauseAdvertisement(id)
      toast.success('Advertisement paused.')
      loadData()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to pause ad.')
    }
  }

  const handleResumeAd = async (id: string) => {
    try {
      await adService.resumeAdvertisement(id)
      toast.success('Advertisement resumed and active.')
      loadData()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to resume ad.')
    }
  }

  const handleProcessRefund = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!refundPaymentId || !refundReason) {
      toast.error('Payment ID and reason are required.')
      return
    }
    try {
      setIsRefunding(true)
      await paymentService.refundPaymentAdmin(refundPaymentId, refundReason)
      toast.success('Payment refunded and audit logged successfully!')
      setRefundPaymentId('')
      setRefundReason('')
      loadData()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to issue refund.')
    } finally {
      setIsRefunding(false)
    }
  }

  return (
    <AdminLayout title="Monetization & Revenue">
      <div className="p-6 sm:p-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-black text-white">Monetization & Revenue Center</h1>
              <span className="text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded-full font-bold uppercase">
                Admin Console
              </span>
            </div>
            <p className="text-stone-400 text-sm mt-1">
              Real-time platform revenue tracking, dynamic pricing plans, and ad moderation.
            </p>
          </div>

          <button
            onClick={loadData}
            className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-200 text-xs font-semibold rounded-xl transition self-start sm:self-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Data</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-stone-800">
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            className={`pb-3 px-4 font-bold text-sm border-b-2 transition ${
              activeTab === 'OVERVIEW'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-stone-400 hover:text-white'
            }`}
          >
            Revenue Overview
          </button>
          <button
            onClick={() => setActiveTab('PLANS')}
            className={`pb-3 px-4 font-bold text-sm border-b-2 transition ${
              activeTab === 'PLANS'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-stone-400 hover:text-white'
            }`}
          >
            Pricing & Plans ({plans.length})
          </button>
          <button
            onClick={() => setActiveTab('ADS')}
            className={`pb-3 px-4 font-bold text-sm border-b-2 transition ${
              activeTab === 'ADS'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-stone-400 hover:text-white'
            }`}
          >
            Advertisements ({ads.length})
          </button>
          <button
            onClick={() => setActiveTab('REFUND')}
            className={`pb-3 px-4 font-bold text-sm border-b-2 transition ${
              activeTab === 'REFUND'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-stone-400 hover:text-white'
            }`}
          >
            Refund Operations
          </button>
        </div>

        {loading ? (
          <div className="py-24 flex justify-center items-center">
            <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
          </div>
        ) : (
          <>
            {/* ── TAB 1: OVERVIEW ─────────────────────────────────────────── */}
            {activeTab === 'OVERVIEW' && stats && (
              <div className="space-y-8">
                {/* Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800">
                    <span className="text-xs text-stone-400 font-medium">Total Platform Revenue</span>
                    <p className="text-3xl font-extrabold text-amber-400 mt-2">
                      {stats.totalRevenue.toLocaleString()} <span className="text-sm font-normal text-stone-400">ETB</span>
                    </p>
                    <p className="text-xs text-emerald-400 mt-1 font-semibold">
                      {stats.successfulPaymentsCount} verified transactions
                    </p>
                  </div>

                  <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800">
                    <span className="text-xs text-stone-400 font-medium">Today's Revenue</span>
                    <p className="text-3xl font-extrabold text-white mt-2">
                      {stats.todayRevenue.toLocaleString()} <span className="text-sm font-normal text-stone-400">ETB</span>
                    </p>
                    <p className="text-xs text-stone-400 mt-1">24h billing volume</p>
                  </div>

                  <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800">
                    <span className="text-xs text-stone-400 font-medium">This Month's Revenue</span>
                    <p className="text-3xl font-extrabold text-white mt-2">
                      {stats.monthlyRevenue.toLocaleString()} <span className="text-sm font-normal text-stone-400">ETB</span>
                    </p>
                    <p className="text-xs text-stone-400 mt-1">MTD revenue</p>
                  </div>

                  <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800">
                    <span className="text-xs text-stone-400 font-medium">Active Subscriptions</span>
                    <p className="text-3xl font-extrabold text-white mt-2">
                      {stats.activeSubscriptionsCount}
                    </p>
                    <p className="text-xs text-stone-400 mt-1">
                      {stats.activeBoostsCount} boosts • {stats.activeFeaturedCount} featured
                    </p>
                  </div>
                </div>

                {/* Revenue Source Breakdown */}
                <div className="p-6 rounded-3xl bg-stone-900 border border-stone-800 space-y-4">
                  <h3 className="text-lg font-bold text-white">Revenue by Monetization Source</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Object.entries(stats.revenueByPurpose).map(([purpose, amt]) => (
                      <div
                        key={purpose}
                        className="p-4 rounded-xl bg-stone-950 border border-stone-800/80"
                      >
                        <span className="text-xs text-stone-400 uppercase font-mono block">
                          {purpose.replace(/_/g, ' ')}
                        </span>
                        <p className="text-xl font-bold text-white mt-1">
                          {amt.toLocaleString()} <span className="text-xs text-amber-500">ETB</span>
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB 2: PRICING & PLANS ──────────────────────────────────── */}
            {activeTab === 'PLANS' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white">Database-Backed Pricing Plans</h3>
                    <p className="text-xs text-stone-400">
                      Changes here take effect immediately across checkouts without code redeployment.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsCreatingPlan(true)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-semibold text-xs rounded-xl transition"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create New Plan</span>
                  </button>
                </div>

                <div className="bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden">
                  <table className="w-full text-left text-sm text-stone-300">
                    <thead className="bg-stone-950 text-xs uppercase tracking-wider text-stone-400 border-b border-stone-800">
                      <tr>
                        <th className="px-6 py-4">Plan Name</th>
                        <th className="px-6 py-4">Type</th>
                        <th className="px-6 py-4">Price (ETB)</th>
                        <th className="px-6 py-4">Duration</th>
                        <th className="px-6 py-4">Cycle</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-800/60">
                      {plans.map((p) => (
                        <tr key={p.id} className="hover:bg-stone-850/50 transition">
                          <td className="px-6 py-4 font-bold text-white">{p.name}</td>
                          <td className="px-6 py-4 font-mono text-xs text-amber-400">{p.type}</td>
                          <td className="px-6 py-4 font-bold text-white">{p.price.toLocaleString()} ETB</td>
                          <td className="px-6 py-4 text-stone-400">{p.durationDays} Days</td>
                          <td className="px-6 py-4 text-xs capitalize">{p.billingCycle.toLowerCase()}</td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                p.isActive
                                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                  : 'bg-stone-800 text-stone-500'
                              }`}
                            >
                              {p.isActive ? 'Active' : 'Disabled'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => {
                                setEditingPlan(p)
                                setPlanForm({
                                  price: p.price,
                                  durationDays: p.durationDays,
                                  isActive: p.isActive,
                                })
                              }}
                              className="inline-flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 font-semibold"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── TAB 3: ADVERTISEMENTS ────────────────────────────────────── */}
            {activeTab === 'ADS' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white">Advertisement Moderation & Slot Control</h3>
                  <p className="text-xs text-stone-400">
                    Monitor the 3 exclusive marketplace advertising slots and approve or pause campaigns.
                  </p>
                </div>

                {/* 3 Placements Status Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(['MARKETPLACE_BANNER', 'MARKETPLACE_FEATURED', 'MARKETPLACE_SIDEBAR'] as const).map((placementName) => {
                    const activeAdInSlot = ads.find(
                      (a) => a.placement === placementName && a.status === 'ACTIVE',
                    )

                    return (
                      <div
                        key={placementName}
                        className="p-5 rounded-2xl bg-stone-900 border border-stone-800 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-bold text-stone-300">
                            {placementName}
                          </span>
                          <span
                            className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                              activeAdInSlot
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : 'bg-stone-800 text-stone-400'
                            }`}
                          >
                            {activeAdInSlot ? '🟢 Occupied (1/1)' : '⚪ Available (0/1)'}
                          </span>
                        </div>

                        {activeAdInSlot ? (
                          <div className="space-y-1 pt-1">
                            <p className="text-sm font-bold text-white truncate">{activeAdInSlot.title}</p>
                            <p className="text-xs text-stone-400">
                              {activeAdInSlot.impressionCount.toLocaleString()} views • {activeAdInSlot.clickCount} clicks
                            </p>
                          </div>
                        ) : (
                          <p className="text-xs text-stone-500 pt-1 italic">
                            No active advertisement running. CTA displayed to buyers.
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Ads List */}
                <div className="grid grid-cols-1 gap-4">
                  {ads.length === 0 ? (
                    <div className="py-12 text-center text-stone-500 text-sm">No advertisements submitted.</div>
                  ) : (
                    ads.map((ad) => {
                      const ctr =
                        ad.impressionCount > 0
                          ? ((ad.clickCount / ad.impressionCount) * 100).toFixed(2)
                          : '0.00'

                      return (
                        <div
                          key={ad.id}
                          className="p-5 rounded-2xl bg-stone-900 border border-stone-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
                        >
                          <div className="flex items-start gap-4">
                            {ad.image && (
                              <img
                                src={buildCloudinaryUrl(ad, 200)}
                                alt={ad.title}
                                className="w-24 h-16 object-cover rounded-lg border border-stone-800 shrink-0"
                              />
                            )}
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-white text-base">{ad.title}</span>
                                <span className="text-[10px] bg-stone-800 text-stone-400 px-2 py-0.5 rounded font-mono">
                                  {ad.placement}
                                </span>
                                <span
                                  className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                                    ad.status === 'ACTIVE'
                                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                      : ad.status === 'PENDING_REVIEW'
                                      ? 'bg-amber-950 text-amber-400 border border-amber-800'
                                      : ad.status === 'PAUSED'
                                      ? 'bg-stone-800 text-stone-300'
                                      : 'bg-rose-950 text-rose-400 border border-rose-800'
                                  }`}
                                >
                                  {ad.status}
                                </span>
                              </div>
                              <p className="text-xs text-stone-400 line-clamp-1">{ad.description || 'No description'}</p>
                              <div className="flex items-center gap-4 text-xs text-stone-500 flex-wrap">
                                <a
                                  href={ad.targetUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 text-amber-500 hover:underline font-mono"
                                >
                                  <span>{ad.targetUrl}</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                                <span>• {ad.impressionCount.toLocaleString()} views • {ad.clickCount} clicks ({ctr}% CTR)</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                            {(ad.status === 'PENDING_REVIEW' || ad.status === 'PAYMENT_VERIFIED') && (
                              <>
                                <button
                                  onClick={() => handleApproveAd(ad.id)}
                                  className="flex items-center gap-1 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl transition"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                  <span>Approve</span>
                                </button>
                                <button
                                  onClick={() => handleRejectAd(ad.id)}
                                  className="flex items-center gap-1 px-3.5 py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-600/40 font-semibold text-xs rounded-xl transition"
                                >
                                  <XCircle className="w-4 h-4" />
                                  <span>Reject</span>
                                </button>
                              </>
                            )}

                            {ad.status === 'ACTIVE' && (
                              <button
                                onClick={() => handlePauseAd(ad.id)}
                                className="px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-xs rounded-xl transition"
                              >
                                Pause
                              </button>
                            )}

                            {ad.status === 'PAUSED' && (
                              <button
                                onClick={() => handleResumeAd(ad.id)}
                                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl transition"
                              >
                                Resume
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            )}

            {/* ── TAB 4: REFUND OPERATIONS ───────────────────────────────── */}
            {activeTab === 'REFUND' && (
              <div className="max-w-xl bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white">Manual Refund & Revocation</h3>
                  <p className="text-xs text-stone-400 mt-1">
                    Issuing a refund will contact the provider refund endpoint, mark the payment as
                    REFUNDED, revoke entitlements, and record an immutable Admin Audit Log entry.
                  </p>
                </div>

                <form onSubmit={handleProcessRefund} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1">
                      Payment ID (UUID)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
                      value={refundPaymentId}
                      onChange={(e) => setRefundPaymentId(e.target.value)}
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 text-sm text-white font-mono placeholder:text-stone-600 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1">
                      Reason for Refund
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="e.g. Seller requested cancellation within 24h grace period."
                      value={refundReason}
                      onChange={(e) => setRefundReason(e.target.value)}
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-stone-600 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isRefunding}
                    className="w-full py-3 bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white font-semibold text-sm rounded-xl transition shadow-lg shadow-rose-950/40 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isRefunding ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Process Refund</span>}
                  </button>
                </form>
              </div>
            )}
          </>
        )}

        {/* Edit Plan Modal */}
        {editingPlan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-md bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-4 shadow-2xl">
              <h3 className="text-lg font-bold text-white">Edit Plan: {editingPlan.name}</h3>

              <div className="space-y-3 text-sm">
                <div>
                  <label className="block text-xs text-stone-400 mb-1">Price (ETB)</label>
                  <input
                    type="number"
                    value={planForm.price}
                    onChange={(e) => setPlanForm({ ...planForm, price: Number(e.target.value) })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs text-stone-400 mb-1">Duration (Days)</label>
                  <input
                    type="number"
                    value={planForm.durationDays}
                    onChange={(e) =>
                      setPlanForm({ ...planForm, durationDays: Number(e.target.value) })
                    }
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={planForm.isActive}
                    onChange={(e) => setPlanForm({ ...planForm, isActive: e.target.checked })}
                    className="rounded text-amber-500"
                  />
                  <label htmlFor="isActive" className="text-xs text-stone-300">
                    Plan is Active and available for purchase
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-stone-800">
                <button
                  onClick={() => setEditingPlan(null)}
                  className="px-4 py-2 text-xs text-stone-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdatePlan}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs rounded-xl"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create Plan Modal */}
        {isCreatingPlan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-lg bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-4 shadow-2xl">
              <h3 className="text-lg font-bold text-white">Create New Monetization Plan</h3>

              <form onSubmit={handleCreatePlan} className="space-y-3 text-sm">
                <div>
                  <label className="block text-xs text-stone-400 mb-1">Plan Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Boost 14 Days"
                    value={newPlan.name}
                    onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-stone-400 mb-1">Plan Type</label>
                    <select
                      value={newPlan.type}
                      onChange={(e) => setNewPlan({ ...newPlan, type: e.target.value })}
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white text-xs"
                    >
                      <option value="BOOST">BOOST</option>
                      <option value="FEATURED">FEATURED</option>
                      <option value="PREMIUM">PREMIUM</option>
                      <option value="BUSINESS">BUSINESS</option>
                      <option value="VERIFICATION">VERIFICATION</option>
                      <option value="ADVERTISEMENT">ADVERTISEMENT</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-stone-400 mb-1">Billing Cycle</label>
                    <select
                      value={newPlan.billingCycle}
                      onChange={(e) => setNewPlan({ ...newPlan, billingCycle: e.target.value })}
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white text-xs"
                    >
                      <option value="ONE_TIME">ONE_TIME</option>
                      <option value="MONTHLY">MONTHLY</option>
                      <option value="YEARLY">YEARLY</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-stone-400 mb-1">Price (ETB)</label>
                    <input
                      type="number"
                      required
                      value={newPlan.price}
                      onChange={(e) => setNewPlan({ ...newPlan, price: Number(e.target.value) })}
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-stone-400 mb-1">Duration (Days)</label>
                    <input
                      type="number"
                      required
                      value={newPlan.durationDays}
                      onChange={(e) => setNewPlan({ ...newPlan, durationDays: Number(e.target.value) })}
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-stone-400 mb-1">Features (comma-separated)</label>
                  <input
                    type="text"
                    value={newPlan.features}
                    onChange={(e) => setNewPlan({ ...newPlan, features: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white text-xs"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-stone-800">
                  <button
                    type="button"
                    onClick={() => setIsCreatingPlan(false)}
                    className="px-4 py-2 text-xs text-stone-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs rounded-xl"
                  >
                    Create Plan
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
