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
        (_pos) => {
          setIsLocating(false)
          navigate('/browse?location=Bole')
        },
        (_err) => {
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
    <section className="py-16 lg:py-20 bg-stone-100/60 border-b border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold mb-3 border border-amber-300">
            <Compass className="w-3.5 h-3.5 text-amber-700" />
            <span>Hyper-Local Discovery</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Find Used Products Near You
          </h2>
          <p className="text-sm font-medium text-stone-600 mt-2">
            Discover products available right in your city and sub-city neighborhood to arrange easy local meetups.
          </p>
        </div>

        {/* Location Chips */}
        <div className="flex flex-wrap justify-center gap-2.5 max-w-3xl mx-auto mb-8">
          {locationChips.map((chip) => {
            const isSelected = selectedSubCity === chip.name
            return (
              <button
                key={chip.name}
                type="button"
                onClick={() => handleChipClick(chip.name)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 border ${
                  isSelected
                    ? 'bg-amber-600 text-white border-amber-500 shadow-md shadow-amber-600/20'
                    : 'bg-white text-stone-800 border-stone-200 hover:border-amber-500 hover:text-amber-900 shadow-2xs'
                }`}
              >
                <MapPin className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-amber-600'}`} />
                <span>{chip.name}</span>
                <span className={`text-xs ${isSelected ? 'text-amber-100' : 'text-stone-400'}`}>
                  ({chip.count})
                </span>
              </button>
            )
          })}
        </div>

        {/* View Products Near Me CTA */}
        <div>
          <button
            type="button"
            onClick={handleRequestNearMe}
            disabled={isLocating}
            className="inline-flex items-center gap-2 bg-white hover:bg-stone-50 text-stone-900 border border-stone-300 font-bold px-7 py-3.5 rounded-xl transition-all shadow-xs hover:border-amber-500"
          >
            <Navigation className={`w-4 h-4 text-amber-600 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? 'Locating...' : 'View Products Near Me'}</span>
          </button>
          <p className="text-[11px] text-stone-500 font-medium mt-2">
            * Location permission requested only when you click this button.
          </p>
        </div>
      </div>
    </section>
  )
}
