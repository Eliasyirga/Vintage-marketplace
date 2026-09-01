import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Megaphone,
  Plus,
  Play,
  Pause,
  XCircle,
  Clock,
  Eye,
  MousePointerClick,
  AlertCircle,
  Calendar,
  Sparkles,
  TrendingUp,
  RefreshCw,
  Layers,
  ArrowUpRight,
  CheckCircle2,
} from 'lucide-react'
import { Navbar } from '../../components/layout/Navbar'
import { Footer } from '../../components/layout/Footer'
import type { Advertisement, AdStatus } from '../../types/monetization'
import * as adService from '../../services/advertisement.service'
import { buildCloudinaryUrl } from '../../utils/advertisementUtils'
import { toast } from 'react-hot-toast'

export default function MyAdvertisementsPage() {
  const [ads, setAds] = useState<Advertisement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'ACTIVE' | 'PENDING' | 'PAUSED'>('ALL')

  const loadMyAds = (isManualRefresh = false) => {
    if (isManualRefresh) setIsRefreshing(true)
    else setIsLoading(true)

    adService
      .getMyAdvertisements()
      .then((data) => setAds(data))
      .catch(() => toast.error('Failed to load campaigns'))
      .finally(() => {
        setIsLoading(false)
        setIsRefreshing(false)
      })
  }

  useEffect(() => {
    loadMyAds()
  }, [])

  // Aggregate metrics
  const totalImpressions = ads.reduce((sum, a) => sum + (a.impressionCount || 0), 0)
  const totalClicks = ads.reduce((sum, a) => sum + (a.clickCount || 0), 0)
  const avgCtr =
    totalImpressions > 0 ? Number(((totalClicks / totalImpressions) * 100).toFixed(2)) : 0
  const activeAdsCount = ads.filter((a) => a.status === 'ACTIVE').length
  const inReviewCount = ads.filter((a) => ['PENDING_REVIEW', 'PAYMENT_VERIFIED'].includes(a.status)).length

  // Filtered ads
  const filteredAds = useMemo(() => {
    if (selectedFilter === 'ACTIVE') return ads.filter((a) => a.status === 'ACTIVE')
    if (selectedFilter === 'PENDING') return ads.filter((a) => ['PENDING_REVIEW', 'PENDING_PAYMENT', 'PAYMENT_VERIFIED'].includes(a.status))
    if (selectedFilter === 'PAUSED') return ads.filter((a) => a.status === 'PAUSED')
    return ads
  }, [ads, selectedFilter])

  const handlePause = async (id: string) => {
    setActionLoadingId(id)
    try {
      await adService.pauseAdvertisement(id)
      toast.success('Advertisement paused')
      loadMyAds()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to pause ad')
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleResume = async (id: string) => {
    setActionLoadingId(id)
    try {
      await adService.resumeAdvertisement(id)
      toast.success('Advertisement resumed and live')
      loadMyAds()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to resume ad')
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleCancel = async (id: string) => {
    if (!window.confirm('Are you sure you want to cancel this campaign?')) return
    setActionLoadingId(id)
    try {
      await adService.cancelAdvertisement(id)
      toast.success('Advertisement cancelled')
      loadMyAds()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to cancel ad')
    } finally {
      setActionLoadingId(null)
    }
  }

  const getStatusBadge = (status: AdStatus) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50/90 border border-emerald-200/80 px-3 py-1 rounded-full shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            Active & Live
          </span>
        )
      case 'PENDING_REVIEW':
        return (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            In Review
          </span>
        )
      case 'PAYMENT_VERIFIED':
        return (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-3 py-1 rounded-full shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
            Payment Verified
          </span>
        )
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Approved
          </span>
        )
      case 'PENDING_PAYMENT':
        return (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            Awaiting Payment
          </span>
        )
      case 'PAUSED':
        return (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-stone-600 bg-stone-100 border border-stone-200 px-3 py-1 rounded-full">
            <Pause className="w-3 h-3 text-stone-500" />
            Paused
          </span>
        )
      case 'EXPIRED':
        return (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-stone-500 bg-stone-100 border border-stone-200 px-3 py-1 rounded-full">
            Expired
          </span>
        )
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-red-700 bg-red-50 border border-red-200 px-3 py-1 rounded-full">
            <AlertCircle className="w-3.5 h-3.5 text-red-600" />
            Action Required
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-stone-600 bg-stone-100 px-2.5 py-0.5 rounded-full">
            {status}
          </span>
        )
    }
  }

  const getPlacementLabel = (placement: string) => {
    switch (placement) {
      case 'MARKETPLACE_BANNER':
        return 'Homepage Banner Slot'
      case 'MARKETPLACE_FEATURED':
        return 'Featured In-Feed Slot'
      case 'MARKETPLACE_SIDEBAR':
        return 'Sidebar Sticky Slot'
      default:
        return placement
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-stone-50/50 text-stone-900 selection:bg-amber-500 selection:text-white">
      <Navbar />

      <main className="flex-1 py-8 sm:py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-8">
        {/* ── Hero Banner / Dashboard Header ─────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-stone-950 via-stone-900 to-amber-950 text-white p-6 sm:p-10 shadow-2xl border border-stone-800">
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Advertiser Portal</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                Campaign Management Hub
              </h1>
              <p className="text-xs sm:text-sm text-stone-300 font-normal leading-relaxed">
                Monitor live traffic, real-time impressions, and verified click-through performance across Vintage Marketplace.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0 flex-wrap">
              <Link
                to="/advertise"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-stone-950 font-black text-xs sm:text-sm transition-all shadow-lg shadow-amber-500/25 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Plus className="w-4 h-4" />
                <span>Create Campaign</span>
              </Link>
              <button
                type="button"
                onClick={() => loadMyAds(true)}
                disabled={isRefreshing}
                className="p-3.5 rounded-2xl bg-white/10 hover:bg-white/20 active:bg-white/5 border border-white/10 text-white transition-all"
                title="Refresh Metrics"
                aria-label="Refresh campaigns"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* ── Pro KPI Metrics Grid ────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white border border-stone-200/80 rounded-3xl p-5 sm:p-6 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Active Campaigns
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Megaphone className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
                {activeAdsCount}
              </p>
              <p className="text-xs text-stone-500 font-medium mt-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                Live in marketplace
              </p>
            </div>
          </div>

          <div className="bg-white border border-stone-200/80 rounded-3xl p-5 sm:p-6 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Total Impressions
              </span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Eye className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
                {totalImpressions.toLocaleString()}
              </p>
              <p className="text-xs text-stone-500 font-medium mt-1">
                Verified viewport views
              </p>
            </div>
          </div>

          <div className="bg-white border border-stone-200/80 rounded-3xl p-5 sm:p-6 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Direct Clicks
              </span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <MousePointerClick className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
                {totalClicks.toLocaleString()}
              </p>
              <p className="text-xs text-stone-500 font-medium mt-1">
                Customer landing visits
              </p>
            </div>
          </div>

          <div className="bg-white border border-stone-200/80 rounded-3xl p-5 sm:p-6 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Average CTR
              </span>
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
                {avgCtr}%
              </p>
              <p className="text-xs text-stone-500 font-medium mt-1">
                Conversion efficiency
              </p>
            </div>
          </div>
        </div>

        {/* ── Campaigns Section ───────────────────────────────────────────────── */}
        <div className="bg-white border border-stone-200/90 rounded-3xl overflow-hidden shadow-sm">
          {/* Header & Tabs */}
          <div className="p-5 sm:p-6 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-stone-100 flex items-center justify-center text-stone-700">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-stone-900">
                  Your Campaigns ({ads.length})
                </h2>
                <p className="text-xs text-stone-500 font-medium">
                  Manage active placements, creative assets, and targets
                </p>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 bg-stone-100/80 p-1 rounded-2xl self-start sm:self-auto">
              {(['ALL', 'ACTIVE', 'PENDING', 'PAUSED'] as const).map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setSelectedFilter(filter)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedFilter === filter
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  {filter === 'ALL' ? `All (${ads.length})` : filter === 'ACTIVE' ? `Active (${activeAdsCount})` : filter === 'PENDING' ? `Pending (${inReviewCount})` : 'Paused'}
                </button>
              ))}
            </div>
          </div>

          {/* Body Content */}
          {isLoading ? (
            <div className="p-16 text-center space-y-3">
              <div className="w-10 h-10 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-stone-400 font-semibold uppercase tracking-wider">
                Loading Campaign Performance...
              </p>
            </div>
          ) : filteredAds.length === 0 ? (
            <div className="p-12 sm:p-16 text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-sm">
                <Megaphone className="w-8 h-8" />
              </div>
              <div className="space-y-1 max-w-sm mx-auto">
                <h3 className="text-base font-black text-stone-900">No campaigns in this view</h3>
                <p className="text-xs text-stone-500 leading-relaxed font-medium">
                  {selectedFilter === 'ALL'
                    ? 'You have not launched an advertisement campaign yet. Select a placement to get featured on Vintage Marketplace.'
                    : `There are currently no campaigns matching the "${selectedFilter.toLowerCase()}" filter.`}
                </p>
              </div>
              <Link
                to="/advertise"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs transition-transform hover:scale-105 shadow-md"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create New Campaign</span>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {filteredAds.map((ad) => {
                const ctr =
                  ad.impressionCount > 0
                    ? ((ad.clickCount / ad.impressionCount) * 100).toFixed(2)
                    : '0.00'

                return (
                  <div
                    key={ad.id}
                    className="p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:bg-stone-50/70 transition-colors"
                  >
                    {/* Creative & Campaign Info */}
                    <div className="flex items-start gap-4 sm:gap-5 min-w-0 flex-1">
                      {ad.image ? (
                        <div className="w-24 h-20 sm:w-32 sm:h-24 rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 shrink-0 relative group shadow-2xs">
                          <img
                            src={buildCloudinaryUrl(ad, 300)}
                            alt={ad.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      ) : (
                        <div className="w-24 h-20 sm:w-32 sm:h-24 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0">
                          <Megaphone className="w-8 h-8" />
                        </div>
                      )}

                      <div className="space-y-2 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          {getStatusBadge(ad.status)}
                          <span className="text-[10px] font-black uppercase tracking-wider bg-stone-100 text-stone-700 px-2.5 py-0.5 rounded-full border border-stone-200">
                            {getPlacementLabel(ad.placement)}
                          </span>
                        </div>

                        <h3 className="font-extrabold text-stone-900 text-base sm:text-lg line-clamp-1">
                          {ad.title}
                        </h3>

                        {ad.description && (
                          <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed max-w-xl font-medium">
                            {ad.description}
                          </p>
                        )}

                        <div className="flex items-center gap-4 text-xs text-stone-500 flex-wrap pt-1">
                          <a
                            href={ad.targetUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 font-mono text-amber-700 hover:text-amber-800 bg-amber-50/60 px-2.5 py-1 rounded-lg border border-amber-200/50 truncate max-w-xs transition-colors"
                          >
                            <span className="truncate">{ad.targetUrl}</span>
                            <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
                          </a>

                          {ad.startAt && ad.endAt && (
                            <span className="inline-flex items-center gap-1 font-medium text-stone-500 bg-stone-100 px-2.5 py-1 rounded-lg">
                              <Calendar className="w-3.5 h-3.5 text-stone-400" />
                              <span>
                                {new Date(ad.startAt).toLocaleDateString()} –{' '}
                                {new Date(ad.endAt).toLocaleDateString()}
                              </span>
                            </span>
                          )}
                        </div>

                        {ad.rejectionReason && (
                          <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2.5 mt-2">
                            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                            <div>
                              <span className="font-bold">Review Note: </span>
                              <span>{ad.rejectionReason}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Stats & Controls */}
                    <div className="flex items-center justify-between lg:justify-end gap-6 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-stone-100">
                      {/* Live Counter Badges */}
                      <div className="flex items-center gap-5 sm:gap-6 text-center bg-stone-50/80 px-4 py-2 rounded-2xl border border-stone-200/60">
                        <div>
                          <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">
                            Views
                          </span>
                          <span className="text-sm sm:text-base font-black text-stone-900">
                            {ad.impressionCount.toLocaleString()}
                          </span>
                        </div>

                        <div className="h-6 w-px bg-stone-200" />

                        <div>
                          <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">
                            Clicks
                          </span>
                          <span className="text-sm sm:text-base font-black text-amber-600">
                            {ad.clickCount.toLocaleString()}
                          </span>
                        </div>

                        <div className="h-6 w-px bg-stone-200" />

                        <div>
                          <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">
                            CTR
                          </span>
                          <span className="text-sm sm:text-base font-black text-purple-600">{ctr}%</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        {ad.status === 'ACTIVE' && (
                          <button
                            type="button"
                            disabled={actionLoadingId === ad.id}
                            onClick={() => handlePause(ad.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs transition-colors"
                            title="Pause Advertisement"
                          >
                            <Pause className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Pause</span>
                          </button>
                        )}

                        {ad.status === 'PAUSED' && (
                          <button
                            type="button"
                            disabled={actionLoadingId === ad.id}
                            onClick={() => handleResume(ad.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs transition-colors"
                            title="Resume Advertisement"
                          >
                            <Play className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Resume</span>
                          </button>
                        )}

                        {ad.status === 'PENDING_PAYMENT' && ad.payment?.reference && (
                          <Link
                            to={`/checkout/mock?ref=${ad.payment.reference}`}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs shadow-xs"
                          >
                            <span>Pay & Activate</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </Link>
                        )}

                        {(ad.status === 'DRAFT' || ad.status === 'PENDING_PAYMENT') && (
                          <button
                            type="button"
                            disabled={actionLoadingId === ad.id}
                            onClick={() => handleCancel(ad.id)}
                            className="p-2 rounded-xl text-red-600 hover:bg-red-50 transition-colors"
                            title="Cancel Campaign"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
