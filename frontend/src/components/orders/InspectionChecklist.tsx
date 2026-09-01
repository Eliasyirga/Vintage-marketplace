import React, { useState } from 'react'
import { CheckSquare, Square, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import * as meetingService from '../../services/meeting.service'
import type { InspectionChecklistInput } from '../../types/order'

interface InspectionChecklistProps {
  meetingId: string
  isCompleted: boolean
  onInspectionVerified: () => void
  onReportIssue: () => void
}

export const InspectionChecklist: React.FC<InspectionChecklistProps> = ({
  meetingId,
  isCompleted,
  onInspectionVerified,
  onReportIssue,
}) => {
  const [loading, setLoading] = useState(false)
  const [checklist, setChecklist] = useState<InspectionChecklistInput>({
    productReceived: false,
    conditionMatchesListing: false,
    accessoriesIncluded: false,
    productWorksAsExpected: false,
    notes: '',
  })

  const toggleCheck = (field: keyof Omit<InspectionChecklistInput, 'notes'>) => {
    if (isCompleted) return
    setChecklist((prev) => ({ ...prev, [field]: !prev[field] }))
  }

  const allChecked =
    checklist.productReceived &&
    checklist.conditionMatchesListing &&
    checklist.accessoriesIncluded &&
    checklist.productWorksAsExpected

  const handleSubmitInspection = async () => {
    if (!allChecked) {
      toast.error('Please verify all 4 checklist criteria to confirm purchase.')
      return
    }

    try {
      setLoading(true)
      await meetingService.completeInspection(meetingId, checklist)
      toast.success('Inspection complete! You can now finalize your purchase.')
      onInspectionVerified()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Inspection recording failed.')
    } finally {
      setLoading(false)
    }
  }

  if (isCompleted) {
    return (
      <div className="bg-emerald-50/70 border border-emerald-200 rounded-3xl p-6 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-sm">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <span>Product Inspection Verified</span>
        </div>
        <p className="text-xs text-emerald-800 leading-relaxed font-medium">
          The in-person physical inspection has been successfully completed and confirmed by the buyer.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-7 shadow-xs space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b border-stone-100">
        <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 flex-shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-extrabold text-stone-900">Product Inspection</h3>
          <p className="text-xs text-stone-500">
            Verify the physical item before concluding the purchase
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {/* Check item 1 */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => toggleCheck('productReceived')}
          onKeyDown={(e) => e.key === 'Enter' && toggleCheck('productReceived')}
          className="flex items-center gap-3 p-3.5 rounded-2xl bg-stone-50 hover:bg-stone-100/70 border border-stone-200/80 cursor-pointer transition-colors"
        >
          {checklist.productReceived ? (
            <CheckSquare className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          ) : (
            <Square className="w-5 h-5 text-stone-400 flex-shrink-0" />
          )}
          <span className="text-xs font-bold text-stone-800">
            Product physically received and handed over
          </span>
        </div>

        {/* Check item 2 */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => toggleCheck('conditionMatchesListing')}
          onKeyDown={(e) => e.key === 'Enter' && toggleCheck('conditionMatchesListing')}
          className="flex items-center gap-3 p-3.5 rounded-2xl bg-stone-50 hover:bg-stone-100/70 border border-stone-200/80 cursor-pointer transition-colors"
        >
          {checklist.conditionMatchesListing ? (
            <CheckSquare className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          ) : (
            <Square className="w-5 h-5 text-stone-400 flex-shrink-0" />
          )}
          <span className="text-xs font-bold text-stone-800">
            Condition and quality match listing photos & description
          </span>
        </div>

        {/* Check item 3 */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => toggleCheck('accessoriesIncluded')}
          onKeyDown={(e) => e.key === 'Enter' && toggleCheck('accessoriesIncluded')}
          className="flex items-center gap-3 p-3.5 rounded-2xl bg-stone-50 hover:bg-stone-100/70 border border-stone-200/80 cursor-pointer transition-colors"
        >
          {checklist.accessoriesIncluded ? (
            <CheckSquare className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          ) : (
            <Square className="w-5 h-5 text-stone-400 flex-shrink-0" />
          )}
          <span className="text-xs font-bold text-stone-800">
            All stated accessories / packaging are included
          </span>
        </div>

        {/* Check item 4 */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => toggleCheck('productWorksAsExpected')}
          onKeyDown={(e) => e.key === 'Enter' && toggleCheck('productWorksAsExpected')}
          className="flex items-center gap-3 p-3.5 rounded-2xl bg-stone-50 hover:bg-stone-100/70 border border-stone-200/80 cursor-pointer transition-colors"
        >
          {checklist.productWorksAsExpected ? (
            <CheckSquare className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          ) : (
            <Square className="w-5 h-5 text-stone-400 flex-shrink-0" />
          )}
          <span className="text-xs font-bold text-stone-800">
            Product powers on / works as expected
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-100">
        <button
          type="button"
          onClick={onReportIssue}
          className="text-xs font-bold text-stone-500 hover:text-red-600 flex items-center gap-1.5 transition-colors"
        >
          <AlertCircle className="w-4 h-4" />
          <span>Report an Issue</span>
        </button>

        <button
          type="button"
          disabled={!allChecked || loading}
          onClick={handleSubmitInspection}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-xs transition-all ${
            allChecked && !loading
              ? 'bg-amber-600 hover:bg-amber-500 text-white'
              : 'bg-stone-200 text-stone-400 cursor-not-allowed'
          }`}
        >
          {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          <span>Verify & Confirm Inspection</span>
        </button>
      </div>
    </div>
  )
}
