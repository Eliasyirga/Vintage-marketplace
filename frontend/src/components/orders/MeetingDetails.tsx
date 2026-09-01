import React, { useState } from 'react'
import { MapPin, Calendar, Clock, CheckCircle2, MessageSquare, Edit3, ShieldAlert, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import * as meetingService from '../../services/meeting.service'
import type { SafeMeetingOrder, ProposeMeetingInput } from '../../types/order'

interface MeetingDetailsProps {
  meeting: SafeMeetingOrder
  isBuyer: boolean
  isSeller: boolean
  listingId: string
  onMeetingUpdated: (updatedMeeting: SafeMeetingOrder) => void
}

export const MeetingDetails: React.FC<MeetingDetailsProps> = ({
  meeting,
  isBuyer,
  isSeller,
  listingId: _listingId,
  onMeetingUpdated,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const [proposal, setProposal] = useState<ProposeMeetingInput>({
    meetingLocation: meeting.meetingLocation,
    meetingDate: meeting.meetingDate,
    meetingTime: meeting.meetingTime,
    sellerNote: meeting.sellerNote || '',
  })

  const isConfirmed = meeting.buyerConfirmed && meeting.sellerConfirmed

  const handleConfirmMeeting = async () => {
    try {
      setLoading(true)
      const updated = await meetingService.confirmMeeting(meeting.id)
      onMeetingUpdated(updated)
      toast.success('Meeting confirmed!')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to confirm meeting.')
    } finally {
      setLoading(false)
    }
  }

  const handleProposeChanges = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      const updated = await meetingService.proposeMeetingChanges(meeting.id, proposal)
      onMeetingUpdated(updated)
      setIsModalOpen(false)
      toast.success('Meeting proposal sent.')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to propose changes.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-7 shadow-xs space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-stone-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 flex-shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-stone-900">In-Person Meeting Details</h3>
            <p className="text-xs text-stone-500">
              Meet seller & inspect product before completing purchase
            </p>
          </div>
        </div>

        {isConfirmed ? (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Confirmed by Both Parties
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-50 text-amber-800 border border-amber-200">
            Confirmation Pending
          </span>
        )}
      </div>

      {/* Meeting Card Info */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-medium">
        <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1 sm:col-span-3">
          <p className="text-[11px] font-extrabold text-stone-400 uppercase tracking-wider">
            Meeting Location
          </p>
          <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
            <MapPin className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>{meeting.meetingLocation}</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1">
          <p className="text-[11px] font-extrabold text-stone-400 uppercase tracking-wider">
            Meeting Date
          </p>
          <div className="flex items-center gap-2 text-stone-800 font-bold">
            <Calendar className="w-3.5 h-3.5 text-stone-400" />
            <span>{meeting.meetingDate}</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1">
          <p className="text-[11px] font-extrabold text-stone-400 uppercase tracking-wider">
            Meeting Time
          </p>
          <div className="flex items-center gap-2 text-stone-800 font-bold">
            <Clock className="w-3.5 h-3.5 text-stone-400" />
            <span>{meeting.meetingTime}</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1">
          <p className="text-[11px] font-extrabold text-stone-400 uppercase tracking-wider">
            Negotiation Status
          </p>
          <div className="flex items-center gap-2 text-stone-800 font-semibold">
            <span>
              {meeting.buyerConfirmed ? 'Buyer Confirmed' : 'Buyer Pending'} •{' '}
              {meeting.sellerConfirmed ? 'Seller Confirmed' : 'Seller Pending'}
            </span>
          </div>
        </div>
      </div>

      {meeting.buyerNote && (
        <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-700">
          <span className="font-bold">Buyer Note:</span> {meeting.buyerNote}
        </div>
      )}

      {meeting.sellerNote && (
        <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900">
          <span className="font-bold">Seller Proposal Note:</span> {meeting.sellerNote}
        </div>
      )}

      {/* Safety Notice */}
      <div className="flex items-center gap-2 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-medium">
        <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0" />
        <span>Meet in a public area with plenty of people around. Check the product before confirming payment.</span>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-stone-100">
        {!isConfirmed && (
          <>
            {isSeller && !meeting.sellerConfirmed && (
              <button
                type="button"
                disabled={loading}
                onClick={handleConfirmMeeting}
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Accept Meeting Proposal</span>
              </button>
            )}

            {isBuyer && !meeting.buyerConfirmed && (
              <button
                type="button"
                disabled={loading}
                onClick={handleConfirmMeeting}
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Accept Meeting Proposal</span>
              </button>
            )}

            {isSeller && (
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs flex items-center gap-1.5 transition-all"
              >
                <Edit3 className="w-4 h-4 text-stone-500" />
                <span>Propose Different Time / Spot</span>
              </button>
            )}
          </>
        )}

        <Link
          to="/messages"
          className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs flex items-center gap-1.5 transition-all ml-auto"
        >
          <MessageSquare className="w-4 h-4 text-stone-500" />
          <span>Message in Chat</span>
        </Link>
      </div>

      {/* Counter-Proposal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 border border-stone-200 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-extrabold text-stone-900 text-base">Propose Meeting Adjustment</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleProposeChanges} className="space-y-4 text-xs font-medium">
              <div className="space-y-1">
                <label className="font-bold text-stone-700">Meeting Location</label>
                <input
                  type="text"
                  value={proposal.meetingLocation || ''}
                  onChange={(e) => setProposal((p) => ({ ...p, meetingLocation: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-stone-700">Date</label>
                  <input
                    type="date"
                    value={proposal.meetingDate || ''}
                    onChange={(e) => setProposal((p) => ({ ...p, meetingDate: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-stone-700">Time</label>
                  <input
                    type="time"
                    value={proposal.meetingTime || ''}
                    onChange={(e) => setProposal((p) => ({ ...p, meetingTime: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-700">Note for Buyer</label>
                <textarea
                  rows={2}
                  value={proposal.sellerNote || ''}
                  onChange={(e) => setProposal((p) => ({ ...p, sellerNote: e.target.value }))}
                  placeholder="e.g. Can we meet near the cafe entrance instead?"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-xs resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold"
                >
                  Send Proposal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
