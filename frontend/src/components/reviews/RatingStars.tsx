import { Star } from 'lucide-react'

interface RatingStarsProps {
  rating: number
  maxRating?: number
  size?: 'sm' | 'md' | 'lg'
  interactive?: boolean
  onChange?: (rating: number) => void
}

export function RatingStars({
  rating,
  maxRating = 5,
  size = 'md',
  interactive = false,
  onChange,
}: RatingStarsProps) {
  const sizeClasses = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-6 h-6',
  }

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: maxRating }, (_, i) => {
        const starNumber = i + 1
        const isFilled = starNumber <= Math.round(rating)

        if (interactive) {
          return (
            <button
              key={i}
              type="button"
              onClick={() => onChange?.(starNumber)}
              className="p-0.5 text-amber-400 hover:scale-125 transition-transform focus:outline-none"
              aria-label={`Rate ${starNumber} stars out of ${maxRating}`}
            >
              <Star
                className={`${sizeClasses[size]} ${
                  isFilled ? 'fill-amber-400 text-amber-400' : 'text-stone-300 fill-none'
                }`}
              />
            </button>
          )
        }

        return (
          <Star
            key={i}
            className={`${sizeClasses[size]} ${
              isFilled ? 'fill-amber-400 text-amber-400' : 'text-stone-300 fill-none'
            }`}
          />
        )
      })}
    </div>
  )
}
