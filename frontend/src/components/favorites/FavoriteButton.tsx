import React, { useState } from 'react'
import { Heart, Loader2 } from 'lucide-react'
import { useAuthContext } from '../../context/AuthContext'
import { addFavorite, removeFavorite } from '../../services/favorite.service'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

interface FavoriteButtonProps {
  listingId: string
  initialIsFavorite?: boolean
  listingTitle?: string
  size?: 'sm' | 'md' | 'lg'
  onToggle?: (isFav: boolean) => void
  className?: string
  showText?: boolean
}

export function FavoriteButton({
  listingId,
  initialIsFavorite = false,
  listingTitle = 'this item',
  size = 'md',
  onToggle,
  className = '',
  showText = false,
}: FavoriteButtonProps) {
  const { isAuthenticated } = useAuthContext()
  const navigate = useNavigate()

  const [isFavorite, setIsFavorite] = useState<boolean>(initialIsFavorite)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false)

  // Sync state if initial prop changes
  React.useEffect(() => {
    setIsFavorite(initialIsFavorite)
  }, [initialIsFavorite])

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isAuthenticated) {
      setShowAuthModal(true)
      return
    }

    if (isLoading) return

    const previousState = isFavorite
    const nextState = !previousState

    // Optimistic UI update
    setIsFavorite(nextState)
    if (onToggle) onToggle(nextState)

    setIsLoading(true)

    try {
      if (nextState) {
        await addFavorite(listingId)
        toast.success('Saved to Favorites', {
          id: `fav-${listingId}`,
        })
      } else {
        await removeFavorite(listingId)
        toast.success('Removed from Favorites', {
          id: `fav-${listingId}`,
        })
      }
    } catch {
      // Revert on error
      setIsFavorite(previousState)
      if (onToggle) onToggle(previousState)
      toast.error('Unable to update favorites. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }

  const buttonSizeClasses = {
    sm: 'p-1.5 rounded-full',
    md: 'p-2.5 rounded-2xl',
    lg: 'p-3.5 rounded-2xl',
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={isLoading}
        aria-label={
          isFavorite
            ? `Remove ${listingTitle} from favorites`
            : `Add ${listingTitle} to favorites`
        }
        className={`inline-flex items-center justify-center gap-2 transition-all duration-200 transform active:scale-90 ${
          showText
            ? 'px-4 py-2.5 rounded-xl font-bold text-sm shadow-sm'
            : buttonSizeClasses[size]
        } ${
          isFavorite
            ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 shadow-sm'
            : 'bg-white/90 backdrop-blur-md text-stone-600 hover:text-stone-900 hover:bg-white border border-stone-200/90 shadow-sm'
        } ${className}`}
      >
        {isLoading ? (
          <Loader2 className={`${iconSizeClasses[size]} animate-spin text-amber-600`} />
        ) : (
          <Heart
            className={`${iconSizeClasses[size]} transition-transform duration-200 ${
              isFavorite ? 'fill-red-500 text-red-500 scale-110' : 'text-stone-600 group-hover:scale-110'
            }`}
          />
        )}
        {showText && (
          <span className="font-semibold text-xs">
            {isFavorite ? 'Saved' : 'Save Item'}
          </span>
        )}
      </button>

      {/* Guest Login Required Modal */}
      {showAuthModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setShowAuthModal(false)}
        >
          <div
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full border border-stone-200 shadow-2xl space-y-5 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 text-red-500 flex items-center justify-center mx-auto shadow-inner">
              <Heart className="w-7 h-7 fill-red-500" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-extrabold text-stone-900">
                Save to Favorites
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed font-medium">
                Sign in to save items to your wishlist and access them anytime on any device.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowAuthModal(false)
                  navigate('/login')
                }}
                className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all shadow-md shadow-amber-600/20"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAuthModal(false)
                  navigate('/register')
                }}
                className="w-full py-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition-colors border border-stone-200"
              >
                Create an Account
              </button>
              <button
                type="button"
                onClick={() => setShowAuthModal(false)}
                className="w-full py-2 text-stone-400 hover:text-stone-600 text-xs font-medium transition-colors"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
