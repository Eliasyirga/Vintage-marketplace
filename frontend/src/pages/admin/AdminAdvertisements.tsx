import { useState, useEffect } from 'react'
import { AdminLayout } from '../../components/admin/AdminLayout'
import * as adService from '../../services/advertisement.service'
import type { Advertisement, AdStatus } from '../../types/monetization'
import { buildCloudinaryUrl } from '../../utils/advertisementUtils'
import {
  Megaphone,
  XCircle,
  Play,
  Pause,
  Clock,
  ExternalLink,
} from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function AdminAdvertisements() {
  const [ads, setAds] = useState<Advertisement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)

  const loadAds = () => {
    setIsLoading(true)
    adService
      .getAllAdsAdmin(statusFilter || undefined)
      .then((data) => setAds(data || []))
      .catch(() => toast.error('Failed to load advertisements'))
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    loadAds()
  }, [statusFilter])

  const handleApprove = async (id: string) => {
    setActionLoadingId(id)
    try {
      await adService.approveAdAdmin(id)
      toast.success('Advertisement approved and activated')
      loadAds()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to approve ad')
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleReject = async (id: string) => {
    const reason = window.prompt('Please enter the rejection reason for this advertisement:')
    if (!reason || !reason.trim()) return

    setActionLoadingId(id)
    try {
      await adService.rejectAdAdmin(id, reason.trim())
      toast.success('Advertisement rejected')
      loadAds()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to reject ad')
    } finally {
      setActionLoadingId(null)
    }
  }

  const handlePause = async (id: string) => {
    setActionLoadingId(id)
    try {
      await adService.pauseAdvertisement(id)
      toast.success('Advertisement paused')
      loadAds()
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
      loadAds()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to resume ad')
    } finally {
      setActionLoadingId(null)
    }
  }

  const getStatusBadge = (status: AdStatus) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Active
          </span>
        )
      case 'PENDING_REVIEW':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" /> In Review
          </span>
        )
      case 'PENDING_PAYMENT':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
            Awaiting Payment
          </span>
        )
      case 'PAUSED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-stone-600 bg-stone-100 px-2.5 py-0.5 rounded-full">
            <Pause className="w-3 h-3" /> Paused
          </span>
        )
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-700 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200">
            <XCircle className="w-3 h-3 text-red-600" /> Rejected
          </span>
        )
      case 'EXPIRED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-stone-400 bg-stone-100 px-2.5 py-0.5 rounded-full">
            Expired
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

  return (
    <AdminLayout
      title="Advertisement Campaigns"
      subtitle="Moderation of sponsored slots, paid banners, and creative compliance"
    >
      <div className="space-y-6">
        {/* Filter Toolbar */}
        <div className="bg-white border border-stone-200 rounded-3xl p-4 sm:p-5 shadow-xs flex items-center justify-between gap-4">
          <h2 className="text-sm font-black text-stone-900">
            Active & Pending Campaigns ({ads.length})
          </h2>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-bold text-stone-700 focus:outline-none"
          >
            <option value="">All Campaign Statuses</option>
            <option value="ACTIVE">Active & Live</option>
            <option value="PENDING_REVIEW">Pending Review</option>
            <option value="PENDING_PAYMENT">Awaiting Payment</option>
            <option value="PAUSED">Paused</option>
            <option value="EXPIRED">Expired</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        {/* Ad Grid */}
        {isLoading ? (
          <div className="p-16 text-center space-y-3 bg-white rounded-3xl border border-stone-200">
            <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-stone-400 font-bold uppercase tracking-wider">
              Loading Advertisements...
            </p>
          </div>
        ) : ads.length === 0 ? (
          <div className="p-12 text-center space-y-3 bg-white rounded-3xl border border-stone-200">
            <Megaphone className="w-10 h-10 text-stone-300 mx-auto" />
            <p className="text-sm font-bold text-stone-800">No advertisements found</p>
            <p className="text-xs text-stone-500">There are no campaigns matching the selected status.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ads.map((ad) => {
              const ctr =
                ad.impressionCount > 0
                  ? ((ad.clickCount / ad.impressionCount) * 100).toFixed(2)
                  : '0.00'

              return (
                <div
                  key={ad.id}
                  className="bg-white border border-stone-200 rounded-3xl p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-amber-300 transition-colors"
                >
                  <div className="space-y-3">
                    {/* Creative image */}
                    {ad.image && (
                      <div className="w-full aspect-[16/8] rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 relative">
                        <img
                          src={buildCloudinaryUrl(ad, 600)}
                          alt={ad.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2.5 left-2.5">
                          {getStatusBadge(ad.status)}
                        </div>
                      </div>
                    )}

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs text-stone-500">
                        <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md uppercase tracking-wider text-[10px]">
                          {ad.placement}
                        </span>
                        <span>
                          Advertiser: <strong className="text-stone-800">{ad.advertiser?.fullName || 'Sponsor'}</strong>
                        </span>
                      </div>

                      <h3 className="font-extrabold text-stone-900 text-base line-clamp-1">
                        {ad.title}
                      </h3>

                      {ad.description && (
                        <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed font-medium">
                          {ad.description}
                        </p>
                      )}

                      <a
                        href={ad.targetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-mono text-amber-700 hover:underline pt-1 truncate max-w-full"
                      >
                        <span className="truncate">{ad.targetUrl}</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    </div>
                  </div>

                  {/* Performance stats & action controls */}
                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 text-xs">
                      <div>
                        <span className="text-[10px] text-stone-400 block font-bold">Views</span>
                        <span className="font-black text-stone-800">{ad.impressionCount || 0}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-stone-400 block font-bold">Clicks</span>
                        <span className="font-black text-amber-600">{ad.clickCount || 0}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-stone-400 block font-bold">CTR</span>
                        <span className="font-black text-purple-600">{ctr}%</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {ad.status === 'PENDING_REVIEW' && (
                        <>
                          <button
                            type="button"
                            disabled={actionLoadingId === ad.id}
                            onClick={() => handleApprove(ad.id)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            disabled={actionLoadingId === ad.id}
                            onClick={() => handleReject(ad.id)}
                            className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs"
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {ad.status === 'ACTIVE' && (
                        <button
                          type="button"
                          disabled={actionLoadingId === ad.id}
                          onClick={() => handlePause(ad.id)}
                          className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs"
                          title="Pause Ad"
                        >
                          <Pause className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {ad.status === 'PAUSED' && (
                        <button
                          type="button"
                          disabled={actionLoadingId === ad.id}
                          onClick={() => handleResume(ad.id)}
                          className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs"
                          title="Resume Ad"
                        >
                          <Play className="w-3.5 h-3.5" />
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
    </AdminLayout>
  )
}
