import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { getMyListings, updateListingStatus, deleteListing } from '../../services/listing.service'
import { ListingLimitBanner } from '../../components/listings/ListingLimitBanner'
import type { Listing, ListingStatus } from '../../types/listing'
import { ListingCard } from '../../components/listings/ListingCard'
import { PromoteListingModal } from '../../components/monetization/PromoteListingModal'
import { Plus, Package, Loader2, RefreshCw, Rocket, BarChart3 } from 'lucide-react'
import toast from 'react-hot-toast'

type FilterTab = 'ALL' | ListingStatus

const TABS: Array<{ id: FilterTab; label: string }> = [
  { id: 'ALL', label: 'All Items' },
  { id: 'ACTIVE', label: 'Active' },
  { id: 'DRAFT', label: 'Drafts' },
  { id: 'SOLD', label: 'Sold' },
  { id: 'ARCHIVED', label: 'Archived' },
]

export default function MyListingsPage() {
  const [activeTab, setActiveTab] = useState<FilterTab>('ALL')
  const [listings, setListings] = useState<Listing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [promoteTarget, setPromoteTarget] = useState<Listing | null>(null)

  const fetchListings = useCallback(async () => {
    setIsLoading(true)
    try {
      const statusFilter = activeTab === 'ALL' ? undefined : activeTab
      const response = await getMyListings({ status: statusFilter, limit: 50 })
      setListings(response.listings)
    } catch {
      toast.error('Failed to load your listings.')
    } finally {
      setIsLoading(false)
    }
  }, [activeTab])

  useEffect(() => {
    fetchListings()
  }, [fetchListings])

  const handleMarkAsSold = async (id: string) => {
    if (!window.confirm('Mark this item as sold?')) return
    try {
      await updateListingStatus(id, 'SOLD')
      toast.success('Listing marked as Sold!')
      fetchListings()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update status.')
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete/archive this listing?')) return
    try {
      await deleteListing(id)
      toast.success('Listing archived.')
      fetchListings()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete listing.')
    }
  }

  return (
    <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
          <div>
            <h1 className="text-3xl font-extrabold text-stone-900 flex items-center gap-3">
              <Package className="w-8 h-8 text-amber-600" />
              Seller Dashboard
            </h1>
            <p className="text-sm font-medium text-stone-600 mt-1">
              Manage your active listings, drafts, promotions, and sales performance.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/seller/monetization"
              className="px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100 font-bold text-sm transition flex items-center gap-1.5 shadow-sm"
            >
              <Rocket className="w-4 h-4 text-amber-600" />
              <span>Growth Hub</span>
            </Link>

            <Link
              to="/seller/analytics"
              className="px-4 py-2.5 rounded-xl bg-white border border-stone-200 text-stone-700 hover:bg-stone-100 font-bold text-sm transition flex items-center gap-1.5 shadow-sm"
            >
              <BarChart3 className="w-4 h-4 text-stone-600" />
              <span>Analytics</span>
            </Link>

            <Link
              to="/sell"
              className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm shadow-md shadow-amber-600/20 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Sell an Item</span>
            </Link>
          </div>
        </div>

        {/* Listing Limit Banner */}
        <ListingLimitBanner />

        {/* Filter Tabs */}
        <div className="flex items-center justify-between overflow-x-auto pb-2 border-b border-stone-200 gap-2">
          <div className="flex items-center gap-2 min-w-max">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                    isActive
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'bg-white text-stone-600 hover:text-stone-900 hover:bg-stone-100 border border-stone-200'
                  }`}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>

          <button
            onClick={fetchListings}
            className="p-2 rounded-xl bg-white border border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors shadow-sm"
            title="Refresh listings"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Listings Grid / Empty State */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
            <p className="text-sm font-semibold text-stone-600">Loading your listings...</p>
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-20 px-4 max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-600 shadow-sm">
              <Package className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-stone-900">
                {activeTab === 'ALL'
                  ? "You haven't listed anything yet"
                  : `No ${activeTab.toLowerCase()} listings found`}
              </h3>
              <p className="text-xs text-stone-500 font-medium">
                Turn your used items into cash by creating your first listing on Vintage Marketplace.
              </p>
            </div>
            <Link
              to="/sell"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm shadow-md transition-colors"
            >
              <Plus className="w-4 h-4" />
              Sell an Item Now
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-6">
            {listings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                isOwner={true}
                onMarkAsSold={handleMarkAsSold}
                onDelete={handleDelete}
                onPromote={(l) => setPromoteTarget(l)}
              />
            ))}
          </div>
        )}

      <PromoteListingModal
        isOpen={Boolean(promoteTarget)}
        onClose={() => setPromoteTarget(null)}
        listing={promoteTarget}
      />
    </div>
  )
}

