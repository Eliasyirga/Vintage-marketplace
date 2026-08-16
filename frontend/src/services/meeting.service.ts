import api from './api'
import type {
  SafeMeetingOrder,
  ProposeMeetingInput,
  InspectionChecklistInput,
} from '../types/order'

export async function getSuggestedLocations(): Promise<string[]> {
  const response = await api.get('/meetings/suggested-locations')
  return response.data.data
}

export async function proposeMeetingChanges(
  meetingId: string,
  proposal: ProposeMeetingInput,
): Promise<SafeMeetingOrder> {
  const response = await api.patch(`/meetings/${meetingId}/propose`, proposal)
  return response.data.data
}

export async function confirmMeeting(meetingId: string): Promise<SafeMeetingOrder> {
  const response = await api.post(`/meetings/${meetingId}/confirm`)
  return response.data.data
}

export async function completeInspection(
  meetingId: string,
  checklist: InspectionChecklistInput,
): Promise<SafeMeetingOrder> {
  const response = await api.post(`/meetings/${meetingId}/inspection`, checklist)
  return response.data.data
}
