import { useState } from 'react'
import { createReport } from '../../services/report.service'
import type { ReportTargetType } from '../../types/report'
import { X, Flag, Loader2, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface ReportModalProps {
  isOpen: boolean
  onClose: () => void
  targetType: ReportTargetType
  targetId: string
  targetTitle?: string
}

const REASONS: Record<ReportTargetType, { value: string; label: string; desc: string }[]> = {
  LISTING: [
    { value: 'SCAM', label: 'Potential Scam', desc: 'Seller asking for off-platform payment or deposit' },
    { value: 'FAKE_PRODUCT', label: 'Counterfeit or Fake Product', desc: 'Item is not authentic or misrepresented' },
    { value: 'WRONG_DESCRIPTION', label: 'Inaccurate Description', desc: 'Condition, brand, or details are false' },
    { value: 'PROHIBITED_ITEM', label: 'Prohibited Item', desc: 'Violates marketplace terms and conditions' },
    { value: 'DUPLICATE_LISTING', label: 'Duplicate Listing', desc: 'Multiple identical posts by same seller' },
    { value: 'INAPPROPRIATE_CONTENT', label: 'Inappropriate Content', desc: 'Offensive images, text, or hate speech' },
    { value: 'SUSPICIOUS_SELLER', label: 'Suspicious Seller Activity', desc: 'Unusual behavior or unverified claims' },
    { value: 'OTHER', label: 'Other Reason', desc: 'Other issue not listed above' },
  ],
  USER: [
    { value: 'SCAM', label: 'Scammer', desc: 'Attempting fraudulent transactions' },
    { value: 'HARASSMENT', label: 'Harassment / Abusive Speech', desc: 'Threatening or inappropriate communications' },
    { value: 'FAKE_ACCOUNT', label: 'Impersonation / Fake Account', desc: 'Impersonating another person or business' },
    { value: 'SPAM', label: 'Spamming', desc: 'Excessive unwanted messages or promotions' },
    { value: 'ABUSIVE_BEHAVIOR', label: 'Abusive Marketplace Behavior', desc: 'Unprofessional or predatory conduct' },
    { value: 'OTHER', label: 'Other Reason', desc: 'Other violation not listed above' },
  ],
  REVIEW: [
    { value: 'SPAM', label: 'Spam / Advertising', desc: 'Promotional content or unrelated spam' },
    { value: 'ABUSE', label: 'Abusive or Threatening Language', desc: 'Insults, harassment, or profanity' },
    { value: 'FAKE_REVIEW', label: 'Fake or Manipulated Review', desc: 'Reviewer did not participate in transaction' },
    { value: 'INAPPROPRIATE_CONTENT', label: 'Inappropriate Content', desc: 'Violates community guidelines' },
    { value: 'OTHER', label: 'Other Reason', desc: 'Other issue with this review' },
  ],
  MESSAGE: [
    { value: 'SCAM', label: 'Scam Attempt', desc: 'Phishing or requesting off-platform payments' },
    { value: 'HARASSMENT', label: 'Harassment', desc: 'Unwanted advances or insults' },
    { value: 'SPAM', label: 'Spam', desc: 'Unsolicited links or mass messaging' },
    { value: 'INAPPROPRIATE_CONTENT', label: 'Inappropriate Content', desc: 'Violates trust and safety standards' },
    { value: 'OTHER', label: 'Other Reason', desc: 'Other issue' },
  ],
}

export function ReportModal({
  isOpen,
  onClose,
  targetType,
  targetId,
  targetTitle,
}: ReportModalProps) {
  const options = REASONS[targetType] || []
  const [selectedReason, setSelectedReason] = useState<string>(options[0]?.value || 'SCAM')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await createReport({
        targetType,
        targetId,
        reason: selectedReason,
        description: description.trim() || undefined,
      })
      setIsSubmitted(true)
      toast.success('Report submitted to moderation team.')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit report.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setIsSubmitted(false)
    setDescription('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-6 animate-in zoom-in-95 duration-200 relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-5 right-5 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {isSubmitted ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border-2 border-emerald-200">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-extrabold text-stone-900">Report Submitted</h3>
              <p className="text-xs text-stone-500 max-w-xs mx-auto">
                Thank you for helping keep Vintage Marketplace safe. Our moderation team will investigate and take appropriate action.
              </p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition-colors shadow-sm"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0 border border-red-200">
                <Flag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-stone-900">
                  Report {targetType.charAt(0) + targetType.slice(1).toLowerCase()}
                </h3>
                {targetTitle && (
                  <p className="text-xs text-stone-500 font-medium truncate max-w-xs sm:max-w-sm">
                    {targetTitle}
                  </p>
                )}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Why are you reporting this?
                </label>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {options.map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex items-start gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                        selectedReason === opt.value
                          ? 'border-amber-500 bg-amber-50/50 shadow-2xs'
                          : 'border-stone-200 hover:bg-stone-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="reportReason"
                        value={opt.value}
                        checked={selectedReason === opt.value}
                        onChange={(e) => setSelectedReason(e.target.value)}
                        className="mt-0.5 text-amber-600 focus:ring-amber-500"
                      />
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-stone-900">{opt.label}</p>
                        <p className="text-[11px] text-stone-500 leading-normal">{opt.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700">
                  Additional Details (Optional)
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide any relevant details to help our team review this report faster..."
                  className="w-full bg-stone-50 border border-stone-200 rounded-2xl p-3 text-xs text-stone-900 focus:bg-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 resize-none font-medium"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 py-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-colors shadow-md shadow-red-600/20 flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Flag className="w-4 h-4" />
                      <span>Submit Report</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
