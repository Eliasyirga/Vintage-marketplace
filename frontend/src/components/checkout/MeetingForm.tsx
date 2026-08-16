import React from 'react'
import { MapPin, Calendar, Clock, ShieldAlert, FileText, CheckCircle2 } from 'lucide-react'
import type { MeetingInput } from '../../types/order'

interface MeetingFormProps {
  formData: MeetingInput
  onChange: (field: keyof MeetingInput, value: string) => void
  errors?: Record<string, string>
  suggestedLocations?: string[]
}

const DEFAULT_LOCATIONS = [
  '📍 Bole Medhanialem Mall / Edna Mall area',
  '📍 Kazanchis UNECA / Intercontinental Square',
  '📍 Megenagna Century Mall / Zefmesh Grand Mall',
  '📍 Piazza Commercial Bank / Cinema Empire',
  '📍 Mexico Square / Federal Police Headquarters',
  '📍 Sarbet Adams Pavilion / Vatican Embassy Square',
]

export const MeetingForm: React.FC<MeetingFormProps> = ({
  formData,
  onChange,
  errors = {},
  suggestedLocations = DEFAULT_LOCATIONS,
}) => {
  // Get today's ISO date string (YYYY-MM-DD) for min date constraint
  const todayString = new Date().toISOString().split('T')[0]

  return (
    <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-7 shadow-xs space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b border-stone-100">
        <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 flex-shrink-0">
          <MapPin className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-extrabold text-stone-900">Meet in Person</h3>
          <p className="text-xs text-stone-500">
            Propose a convenient, public location to meet the seller.
          </p>
        </div>
      </div>

      {/* Safety Notice Box */}
      <div className="rounded-2xl bg-amber-50/80 border border-amber-200 p-4 space-y-2">
        <div className="flex items-center gap-2 text-amber-900 font-extrabold text-xs">
          <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>Safety Guidance for In-Person Transactions</span>
        </div>
        <ul className="text-[11px] text-amber-800 space-y-1 pl-6 list-disc font-medium">
          <li>Always meet in a well-lit, public location (malls, busy plazas, coffee shops).</li>
          <li>Inspect the item thoroughly to confirm it matches photos and condition.</li>
          <li>Never share your home address or private financial credentials.</li>
        </ul>
      </div>

      {/* Suggested Public Locations */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-stone-700">Quick Select Suggested Public Spot</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {suggestedLocations.slice(0, 6).map((loc) => {
            const isSelected = formData.meetingLocation === loc
            return (
              <button
                key={loc}
                type="button"
                onClick={() => onChange('meetingLocation', loc)}
                className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all flex items-center justify-between ${
                  isSelected
                    ? 'border-amber-600 bg-amber-50 text-amber-900 shadow-2xs'
                    : 'border-stone-200 bg-stone-50 hover:bg-white text-stone-700'
                }`}
              >
                <span className="truncate mr-2">{loc}</span>
                {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />}
              </button>
            )
          })}
        </div>
      </div>

      {/* Custom Meeting Location Input */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-stone-400" />
          Meeting Location / Landmark <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.meetingLocation}
          onChange={(e) => onChange('meetingLocation', e.target.value)}
          placeholder="e.g. Tomoca Coffee Kazanchis or Century Mall 2nd floor"
          className={`w-full px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
            errors.meetingLocation
              ? 'border-red-400 bg-red-50/50 focus:border-red-500 focus:ring-2 focus:ring-red-200'
              : 'border-stone-200 bg-stone-50/50 focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20'
          }`}
        />
        {errors.meetingLocation && (
          <p className="text-xs text-red-500 font-medium">{errors.meetingLocation}</p>
        )}
      </div>

      {/* Date & Time Pickers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-stone-400" />
            Meeting Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            min={todayString}
            value={formData.meetingDate}
            onChange={(e) => onChange('meetingDate', e.target.value)}
            className={`w-full px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
              errors.meetingDate
                ? 'border-red-400 bg-red-50/50 focus:border-red-500'
                : 'border-stone-200 bg-stone-50/50 focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20'
            }`}
          />
          {errors.meetingDate && (
            <p className="text-xs text-red-500 font-medium">{errors.meetingDate}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-stone-400" />
            Meeting Time <span className="text-red-500">*</span>
          </label>
          <input
            type="time"
            value={formData.meetingTime}
            onChange={(e) => onChange('meetingTime', e.target.value)}
            className={`w-full px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
              errors.meetingTime
                ? 'border-red-400 bg-red-50/50 focus:border-red-500'
                : 'border-stone-200 bg-stone-50/50 focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20'
            }`}
          />
          {errors.meetingTime && (
            <p className="text-xs text-red-500 font-medium">{errors.meetingTime}</p>
          )}
        </div>
      </div>

      {/* Optional Note for Seller */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-stone-400" />
          Note for Seller (Optional)
        </label>
        <textarea
          rows={2}
          value={formData.buyerNote || ''}
          onChange={(e) => onChange('buyerNote', e.target.value)}
          placeholder="e.g. I will be wearing a black jacket, see you near the main entrance..."
          className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50/50 text-sm font-medium focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20 transition-all resize-none"
        />
      </div>
    </div>
  )
}
