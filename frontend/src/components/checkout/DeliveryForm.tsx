import React from 'react'
import { MapPin, Phone, User, FileText, Navigation } from 'lucide-react'
import type { DeliveryInput } from '../../types/order'

interface DeliveryFormProps {
  formData: DeliveryInput
  onChange: (field: keyof DeliveryInput, value: string) => void
  errors?: Record<string, string>
}

export const ADDIS_SUB_CITIES = [
  'Bole',
  'Yeka',
  'Kirkos',
  'Arada',
  'Gullele',
  'Lideta',
  'Nifas Silk-Lafto',
  'Kolfe Keranio',
  'Akaki Kaliti',
  'Addis Ketema',
]

export const DeliveryForm: React.FC<DeliveryFormProps> = ({
  formData,
  onChange,
  errors = {},
}) => {
  return (
    <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-7 shadow-xs space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b border-stone-100">
        <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 flex-shrink-0">
          <Navigation className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-extrabold text-stone-900">Delivery Information</h3>
          <p className="text-xs text-stone-500">
            Where would you like your order delivered?
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Recipient Full Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-stone-400" />
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.fullName}
            onChange={(e) => onChange('fullName', e.target.value)}
            placeholder="e.g. Abebe Bikila"
            className={`w-full px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
              errors.fullName
                ? 'border-red-400 bg-red-50/50 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                : 'border-stone-200 bg-stone-50/50 focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20'
            }`}
          />
          {errors.fullName && <p className="text-xs text-red-500 font-medium">{errors.fullName}</p>}
        </div>

        {/* Recipient Phone */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-stone-400" />
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => onChange('phone', e.target.value)}
            placeholder="0911223344"
            className={`w-full px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
              errors.phone
                ? 'border-red-400 bg-red-50/50 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                : 'border-stone-200 bg-stone-50/50 focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20'
            }`}
          />
          {errors.phone && <p className="text-xs text-red-500 font-medium">{errors.phone}</p>}
        </div>

        {/* City */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-stone-400" />
            City <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => onChange('city', e.target.value)}
            placeholder="Addis Ababa"
            className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50/50 text-sm font-medium focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20 transition-all"
          />
        </div>

        {/* Sub-City */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
            Sub-City <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.subCity}
            onChange={(e) => onChange('subCity', e.target.value)}
            className={`w-full px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
              errors.subCity
                ? 'border-red-400 bg-red-50/50 focus:border-red-500'
                : 'border-stone-200 bg-stone-50/50 focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20'
            }`}
          >
            <option value="">Select Sub-City</option>
            {ADDIS_SUB_CITIES.map((sc) => (
              <option key={sc} value={sc}>
                {sc}
              </option>
            ))}
            <option value="Other / Outside Addis">Other / Regional Area</option>
          </select>
          {errors.subCity && <p className="text-xs text-red-500 font-medium">{errors.subCity}</p>}
        </div>
      </div>

      {/* Neighborhood / Landmark */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-stone-700">Neighborhood / Nearby Landmark</label>
        <input
          type="text"
          value={formData.neighborhood || ''}
          onChange={(e) => onChange('neighborhood', e.target.value)}
          placeholder="e.g. Near Edna Mall, Behind Medhanialem Church"
          className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50/50 text-sm font-medium focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20 transition-all"
        />
      </div>

      {/* Specific Delivery Address */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
          Address / Specific Delivery Location <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.deliveryLocation}
          onChange={(e) => onChange('deliveryLocation', e.target.value)}
          placeholder="e.g. House No. 405, Bole Bulbula, 3rd Floor"
          className={`w-full px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
            errors.deliveryLocation
              ? 'border-red-400 bg-red-50/50 focus:border-red-500 focus:ring-2 focus:ring-red-200'
              : 'border-stone-200 bg-stone-50/50 focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20'
          }`}
        />
        {errors.deliveryLocation && (
          <p className="text-xs text-red-500 font-medium">{errors.deliveryLocation}</p>
        )}
      </div>

      {/* Optional Delivery Notes */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-stone-400" />
          Optional Delivery Notes
        </label>
        <textarea
          rows={2}
          value={formData.deliveryNotes || ''}
          onChange={(e) => onChange('deliveryNotes', e.target.value)}
          placeholder="e.g. Please call before arrival, deliver after 2:00 PM..."
          className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50/50 text-sm font-medium focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20 transition-all resize-none"
        />
      </div>
    </div>
  )
}
