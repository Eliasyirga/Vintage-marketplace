import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, MapPin, Clock, ShieldCheck, Eye } from 'lucide-react'
import type { ProductCondition } from '../../types/product'

export interface ProductCardProps {
  id: string
  title: string
  price: number
  image: string
  condition: ProductCondition
  location: string
  subCity?: string
  createdAt: string
  isFavorite?: boolean
  isVerifiedSeller?: boolean
  onFavoriteToggle?: (id: string, newFavoriteState: boolean) => void
}

function getConditionStyle(condition: ProductCondition) {
  switch (condition) {
    case 'Brand New':    return { pill: 'bg-emerald-500 text-white', dot: 'bg-emerald-400' }
    case 'Like New':     return { pill: 'bg-teal-500 text-white',    dot: 'bg-teal-400' }
    case 'Lightly Used': return { pill: 'bg-amber-500 text-white',   dot: 'bg-amber-400' }
    case 'Well Used':    return { pill: 'bg-stone-500 text-white',   dot: 'bg-stone-400' }
    case 'Refurbished':  return { pill: 'bg-indigo-500 text-white',  dot: 'bg-indigo-400' }
    default:             return { pill: 'bg-stone-400 text-white',   dot: 'bg-stone-300' }
  }
}

export default function ProductCard({
  id, title, price, image, condition, location, subCity, createdAt,
  isFavorite: initialFavorite = false, isVerifiedSeller = false, onFavoriteToggle,
}: ProductCardProps) {
  const [fav, setFav] = useState(initialFavorite)
  const style = getConditionStyle(condition)
  const displayLocation = subCity ? `${subCity}, ${location}` : location

  const handleFavClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const next = !fav
    setFav(next)
    onFavoriteToggle?.(id, next)
  }

  return (
    <Link
      to={`/browse?product=${id}`}
      className="group relative flex flex-col bg-white border border-stone-200 hover:border-amber-400 rounded-2xl overflow-hidden transition-all duration-300 shadow-xs hover:shadow-xl hover:shadow-amber-500/10 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-100">
        <img
          src={image}
          alt={title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Dark bottom scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/50 via-transparent to-transparent" />

        {/* Condition badge */}
        <span className={`absolute top-2.5 left-2.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold shadow-sm ${style.pill}`}>
          <span className={`w-1.5 h-1.5 rounded-full bg-white/50`} />
          {condition}
        </span>

        {/* Favourite button */}
        <button
          type="button"
          onClick={handleFavClick}
          aria-label={fav ? 'Remove from favorites' : 'Save to favorites'}
          className={`absolute top-2.5 right-2.5 p-1.5 rounded-full backdrop-blur-sm border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500 ${
            fav
              ? 'bg-red-500 border-red-500 text-white'
              : 'bg-white/90 border-white/60 text-stone-500 hover:bg-white hover:text-red-500'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${fav ? 'fill-current' : ''}`} />
        </button>

        {/* Verified seller badge */}
        {isVerifiedSeller && (
          <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 bg-white/95 backdrop-blur-sm px-2 py-0.5 rounded-md border border-amber-300 shadow-sm">
            <ShieldCheck className="w-3 h-3 text-amber-600" />
            <span className="text-[10px] font-bold text-amber-800">Verified</span>
          </div>
        )}

        {/* Hover quick-view overlay */}
        <div className="absolute inset-0 bg-stone-900/0 group-hover:bg-stone-900/10 transition-colors duration-300 flex items-center justify-center">
          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/95 backdrop-blur-sm text-stone-800 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-lg">
            <Eye className="w-3.5 h-3.5" /> Quick View
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="flex flex-col flex-1 p-3.5">
        <h3 className="text-sm font-bold text-stone-900 group-hover:text-amber-700 transition-colors line-clamp-2 leading-snug mb-2">
          {title}
        </h3>

        {/* Price */}
        <div className="mt-auto">
          <div className="flex items-baseline gap-1">
            <span className="text-[11px] font-bold text-amber-600">ETB</span>
            <span className="text-xl font-black text-stone-900 tracking-tight leading-none">
              {price.toLocaleString()}
            </span>
          </div>

          {/* Footer */}
          <div className="mt-2.5 pt-2.5 border-t border-stone-100 flex items-center justify-between">
            <div className="flex items-center gap-1 text-[11px] text-stone-500 font-medium min-w-0">
              <MapPin className="w-3 h-3 text-amber-500 flex-shrink-0" />
              <span className="truncate">{displayLocation}</span>
            </div>
            <div className="flex items-center gap-0.5 text-[11px] text-stone-400 flex-shrink-0 ml-1">
              <Clock className="w-3 h-3" />
              <span>{createdAt}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
