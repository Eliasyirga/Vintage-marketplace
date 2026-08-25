import { useState, useEffect } from 'react'
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
  Percent,
  ExternalLink,
  AlertCircle,
  Calendar,
} from 'lucide-react'
import Navbar from '../../components/layout/Navbar'
import Footer from '../../components/layout/Footer'
import type { Advertisement, AdStatus } from '../../types/monetization'
import * as adService from '../../services/advertisement.service'
import { buildCloudinaryUrl } from '../../utils/advertisementUtils'
import { toast } from 'react-hot-toast'

export default function MyAdvertisementsPage() {
  const [ads, setAds] = useState<Advertisement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)

  const loadMyAds = () => {
    setIsLoading(true)
    adService
      .getMyAdvertisements()
      .then((data) => setAds(data))
      .catch(() => toast.error('Failed to load campaigns'))
      .finally(() => setIsLoading(false))
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
      toast.success('Advertisement resumed and active')
      loadMyAds()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to resume ad')
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleCancel = async (id: string) => {
    if (!window.confirm('Are you sure you want to cancel this advertisement campaign?')) return
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
          <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Active
          </span>
        )
      case 'PENDING_REVIEW':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full">
            <Clock className="w-3 h-3" />
            In Review
          </span>
        )
      case 'PAYMENT_VERIFIED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-0.5 rounded-full">
            Payment Verified
          </span>
        )
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full">
            Approved
          </span>
        )
      case 'PENDING_PAYMENT':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-full">
            Awaiting Payment
          </span>
        )
      case 'PAUSED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider bg-stone-100 text-stone-700 border border-stone-200 px-2.5 py-0.5 rounded-full">
            Paused
          </span>
        )
      case 'EXPIRED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider bg-stone-100 text-stone-500 border border-stone-200 px-2.5 py-0.5 rounded-full">
            Expired
          </span>
        )
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider bg-red-50 text-red-700 border border-red-200 px-2.5 py-0.5 rounded-full">
            Rejected
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider bg-stone-100 text-stone-500 px-2.5 py-0.5 rounded-full">
            {status}
          </span>
        )
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 selection:bg-amber-500 selection:text-white">
      <Navbar />

      <main className="flex-1 py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Header toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-amber-600">
              Advertiser Portal
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight mt-0.5">
              My Advertisement Campaigns
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 font-medium">
              Monitor impressions, clicks, and live status of your marketplace sponsored slots.
            </p>
          </div>

          <Link
            to="/advertise"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs sm:text-sm transition-transform hover:scale-105 active:scale-95 shadow-md self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Campaign</span>
          </Link>
        </div>

        {/* ── KPI Metrics Cards ─────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <div className="bg-white border border-stone-200 rounded-3xl p-5 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-stone-400">
              <span className="text-xs font-bold uppercase tracking-wider">Active Ads</span>
              <Megaphone className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-stone-900">{activeAdsCount}</p>
            <p className="text-[11px] text-stone-500 font-semibold">Live in marketplace</p>
          </div>

          <div className="bg-white border border-stone-200 rounded-3xl p-5 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-stone-400">
              <span className="text-xs font-bold uppercase tracking-wider">Impressions</span>
              <Eye className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-stone-900">
              {totalImpressions.toLocaleString()}
            </p>
            <p className="text-[11px] text-stone-500 font-semibold">Verified viewport views</p>
          </div>

          <div className="bg-white border border-stone-200 rounded-3xl p-5 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-stone-400">
              <span className="text-xs font-bold uppercase tracking-wider">Clicks</span>
              <MousePointerClick className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-stone-900">
              {totalClicks.toLocaleString()}
            </p>
            <p className="text-[11px] text-stone-500 font-semibold">Direct landing visits</p>
          </div>

          <div className="bg-white border border-stone-200 rounded-3xl p-5 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-stone-400">
              <span className="text-xs font-bold uppercase tracking-wider">Average CTR</span>
              <Percent className="w-4 h-4 text-indigo-600" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-stone-900">{avgCtr}%</p>
            <p className="text-[11px] text-stone-500 font-semibold">Click-through rate</p>
          </div>
        </div>

        {/* ── Campaigns Table / List ────────────────────────────────────── */}
        <div className="bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-stone-100 flex items-center justify-between">
            <h3 className="text-base font-black text-stone-900">All Campaigns ({ads.length})</h3>
            <button
              onClick={loadMyAds}
              className="text-xs font-bold text-amber-600 hover:underline"
            >
              Refresh
            </button>
          </div>

          {isLoading ? (
            <div className="p-12 text-center text-stone-400 text-sm animate-pulse">
              Loading your campaign statistics...
            </div>
          ) : ads.length === 0 ? (
            <div className="p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
                <Megaphone className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-black text-stone-900">No campaigns found</h4>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  You haven’t launched an advertisement yet. Promote your business across Bonda to reach active buyers today.
                </p>
              </div>
              <Link
                to="/advertise"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-sm"
              >
                <span>Browse Placements</span>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {ads.map((ad) => {
                const ctr =
                  ad.impressionCount > 0
                    ? ((ad.clickCount / ad.impressionCount) * 100).toFixed(2)
                    : '0.00'

                return (
                  <div
                    key={ad.id}
                    className="p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-5 hover:bg-stone-50/60 transition-colors"
                  >
                    {/* Creative & Details */}
                    <div className="flex items-start gap-4 min-w-0 flex-1">
                      {ad.image && (
                        <img
                          src={buildCloudinaryUrl(ad, 200)}
                          alt={ad.title}
                          className="w-20 h-16 sm:w-24 sm:h-20 rounded-2xl object-cover bg-stone-100 border border-stone-200 shrink-0"
                        />
                      )}

                      <div className="space-y-1.5 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          {getStatusBadge(ad.status)}
                          <span className="text-[10px] font-black uppercase tracking-wider bg-stone-100 text-stone-700 px-2 py-0.5 rounded-md">
                            {ad.placement}
                          </span>
                        </div>

                        <h4 className="font-extrabold text-stone-900 text-sm sm:text-base line-clamp-1">
                          {ad.title}
                        </h4>

                        <div className="flex items-center gap-4 text-xs text-stone-500 flex-wrap">
                          <a
                            href={ad.targetUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 font-mono text-amber-700 hover:underline truncate max-w-xs"
                          >
                            <span>{ad.targetUrl}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>

                          {ad.startAt && ad.endAt && (
                            <span className="inline-flex items-center gap-1 font-medium text-stone-500">
                              <Calendar className="w-3.5 h-3.5" />
                              {new Date(ad.startAt).toLocaleDateString()} –{' '}
                              {new Date(ad.endAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>

                        {ad.rejectionReason && (
                          <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                            <div>
                              <span className="font-bold">Rejection Reason: </span>
                              <span>{ad.rejectionReason}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Stats & Actions */}
                    <div className="flex items-center justify-between lg:justify-end gap-6 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-stone-100">
                      {/* Metric columns */}
                      <div className="flex items-center gap-6 text-center">
                        <div>
                          <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">
                            Views
                          </span>
                          <span className="text-sm font-black text-stone-900">
                            {ad.impressionCount.toLocaleString()}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">
                            Clicks
                          </span>
                          <span className="text-sm font-black text-amber-600">
                            {ad.clickCount.toLocaleString()}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">
                            CTR
                          </span>
                          <span className="text-sm font-black text-indigo-600">{ctr}%</span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2">
                        {ad.status === 'ACTIVE' && (
                          <button
                            type="button"
                            disabled={actionLoadingId === ad.id}
                            onClick={() => handlePause(ad.id)}
                            className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs transition-colors"
                            title="Pause Advertisement"
                          >
                            <Pause className="w-4 h-4" />
                          </button>
                        )}

                        {ad.status === 'PAUSED' && (
                          <button
                            type="button"
                            disabled={actionLoadingId === ad.id}
                            onClick={() => handleResume(ad.id)}
                            className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs transition-colors"
                            title="Resume Advertisement"
                          >
                            <Play className="w-4 h-4" />
                          </button>
                        )}

                        {ad.status === 'PENDING_PAYMENT' && ad.payment?.reference && (
                          <Link
                            to={`/checkout/mock?ref=${ad.payment.reference}`}
                            className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-2xs"
                          >
                            Pay Now
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
