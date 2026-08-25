import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Navigation, Compass } from 'lucide-react'

const locationChips = [
  { name: 'Addis Ababa', count: '4,200+' },
  { name: 'Bole', count: '1,150+' },
  { name: 'Lideta', count: '420+' },
  { name: 'Yeka', count: '680+' },
  { name: 'Kirkos', count: '540+' },
  { name: 'Arada', count: '390+' },
  { name: 'Kazanchis', count: '610+' },
  { name: 'CMC', count: '480+' },
]

export default function LocationSection() {
  const navigate = useNavigate()
  const [selectedSubCity, setSelectedSubCity] = useState('Addis Ababa')
  const [isLocating, setIsLocating] = useState(false)

  const handleChipClick = (loc: string) => {
    setSelectedSubCity(loc)
    navigate(`/browse?location=${encodeURIComponent(loc)}`)
  }

  const handleRequestNearMe = () => {
    setIsLocating(true)
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        () => {
          setIsLocating(false)
          navigate('/browse?location=Bole')
        },
        () => {
          setIsLocating(false)
          navigate(`/browse?location=${encodeURIComponent(selectedSubCity)}`)
        },
        { timeout: 5000 },
      )
    } else {
      setIsLocating(false)
      navigate(`/browse?location=${encodeURIComponent(selectedSubCity)}`)
    }
  }

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-b from-stone-100 to-stone-50 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-amber-200/20 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: copy + chips */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold mb-4 border border-amber-300">
              <Compass className="w-3.5 h-3.5 text-amber-700" />
              <span>Hyper-Local Discovery</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
              Find Used Products Near You
            </h2>
            <p className="text-sm font-medium text-stone-600 mt-3 max-w-md mx-auto lg:mx-0">
              Discover products available right in your city and sub-city neighborhood to arrange easy local meetups.
            </p>

            <div className="flex flex-wrap justify-center lg:justify-start gap-2.5 mt-8">
              {locationChips.map((chip) => {
                const isSelected = selectedSubCity === chip.name
                return (
                  <button
                    key={chip.name}
                    type="button"
                    onClick={() => handleChipClick(chip.name)}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 border ${
                      isSelected
                        ? 'bg-amber-600 text-white border-amber-500 shadow-lg shadow-amber-600/25 scale-105'
                        : 'bg-white text-stone-800 border-stone-200 hover:border-amber-400 hover:text-amber-900 shadow-sm hover:shadow-md'
                    }`}
                  >
                    <MapPin className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-100' : 'text-amber-600'}`} />
                    <span>{chip.name}</span>
                    <span className={`text-xs ${isSelected ? 'text-amber-100' : 'text-stone-400'}`}>
                      {chip.count}
                    </span>
                  </button>
                )
              })}
            </div>

            <div className="mt-8">
              <button
                type="button"
                onClick={handleRequestNearMe}
                disabled={isLocating}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold px-7 py-3.5 rounded-xl transition-all shadow-lg shadow-amber-200 disabled:opacity-70"
              >
                <Navigation className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
                <span>{isLocating ? 'Locating...' : 'View Products Near Me'}</span>
              </button>
              <p className="text-[11px] text-stone-500 font-medium mt-2">
                Location permission requested only when you click this button.
              </p>
            </div>
          </div>

          {/* Right: stylized map visual */}
          <div className="relative hidden lg:block" aria-hidden="true">
            <div className="relative w-full aspect-square max-w-md mx-auto">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-amber-100 via-white to-orange-50 border border-amber-200/60 shadow-xl overflow-hidden">
                <div
                  className="absolute inset-0 opacity-40"
                  style={{ backgroundImage: 'radial-gradient(circle, #d6d3d1 1px, transparent 1px)', backgroundSize: '20px 20px' }}
                />

                {/* Decorative route lines */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 400">
                  <path d="M80 200 Q200 80 320 200" stroke="#f59e0b" strokeWidth="2" fill="none" strokeDasharray="6 4" opacity="0.4" />
                  <path d="M100 280 Q200 180 300 120" stroke="#fb923c" strokeWidth="2" fill="none" strokeDasharray="6 4" opacity="0.3" />
                </svg>

                {/* Map pins */}
                {[
                  { x: '30%', y: '35%', label: 'Bole', size: 'lg' },
                  { x: '55%', y: '28%', label: 'Yeka', size: 'sm' },
                  { x: '42%', y: '52%', label: 'Kirkos', size: 'sm' },
                  { x: '68%', y: '45%', label: 'CMC', size: 'sm' },
                  { x: '25%', y: '58%', label: 'Lideta', size: 'sm' },
                ].map((pin) => (
                  <div
                    key={pin.label}
                    className="absolute -translate-x-1/2 -translate-y-1/2"
                    style={{ left: pin.x, top: pin.y }}
                  >
                    <div className={`${pin.size === 'lg' ? 'w-4 h-4' : 'w-3 h-3'} rounded-full bg-amber-500 border-2 border-white shadow-md animate-pulse`} />
                    <span className="absolute top-full left-1/2 -translate-x-1/2 mt-1 text-[10px] font-bold text-stone-600 whitespace-nowrap bg-white/90 px-1.5 py-0.5 rounded-md border border-stone-200">
                      {pin.label}
                    </span>
                  </div>
                ))}

                {/* Center badge */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="w-20 h-20 rounded-full bg-white border-4 border-amber-400 shadow-xl flex items-center justify-center">
                    <MapPin className="w-8 h-8 text-amber-600" />
                  </div>
                  <p className="text-center text-xs font-bold text-stone-700 mt-3 bg-white/90 px-3 py-1 rounded-full border border-stone-200">
                    Addis Ababa
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
