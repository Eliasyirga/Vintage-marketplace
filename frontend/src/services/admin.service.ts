import api from './api'
import type { DashboardStats, AdminAuditLogItem } from '../types/admin'
import type { ReportItem, ReportStatus, ReportPriority } from '../types/report'
import type { UserVerificationItem } from '../types/verification'

export async function getDashboardStats(): Promise<DashboardStats> {
  const response = await api.get('/admin/dashboard/stats')
  return response.data.data.stats
}

export async function getAdminReports(params?: {
  status?: ReportStatus
  priority?: ReportPriority
  targetType?: string
  page?: number
  limit?: number
}): Promise<{ reports: ReportItem[]; pagination: any }> {
  const response = await api.get('/admin/reports', { params })
  return response.data.data
}

export async function updateAdminReport(
  reportId: string,
  data: { status?: ReportStatus; priority?: ReportPriority; adminNote?: string },
): Promise<ReportItem> {
  const response = await api.patch(`/admin/reports/${reportId}`, data)
  return response.data.data.report
}

export async function getAdminUsers(params?: {
  page?: number
  limit?: number
  search?: string
  status?: string
  role?: string
}): Promise<{ users: any[]; pagination: any }> {
  const response = await api.get('/admin/users', { params })
  return response.data.data
}

export async function updateUserStatus(
  userId: string,
  status: 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED',
  reason?: string,
): Promise<{ userId: string; status: string }> {
  const response = await api.patch(`/admin/users/${userId}/status`, { status, reason })
  return response.data.data
}

export async function getAdminListings(params?: {
  page?: number
  limit?: number
  search?: string
  status?: string
}): Promise<{ listings: any[]; pagination: any }> {
  const response = await api.get('/admin/listings', { params })
  return response.data.data
}

export async function updateListingStatus(
  listingId: string,
  status: 'ACTIVE' | 'REMOVED' | 'ARCHIVED' | 'SOLD',
  reason?: string,
): Promise<{ listingId: string; status: string }> {
  const response = await api.patch(`/admin/listings/${listingId}/status`, { status, reason })
  return response.data.data
}

export async function getAdminVerifications(params?: {
  page?: number
  limit?: number
  status?: string
}): Promise<{ verifications: UserVerificationItem[]; pagination: any }> {
  const response = await api.get('/admin/verifications', { params })
  return response.data.data
}

export async function approveVerification(id: string): Promise<UserVerificationItem> {
  const response = await api.patch(`/admin/verifications/${id}/approve`)
  return response.data.data.verification
}

export async function rejectVerification(id: string, reason: string): Promise<UserVerificationItem> {
  const response = await api.patch(`/admin/verifications/${id}/reject`, { reason })
  return response.data.data.verification
}

export async function getAdminReviews(params?: {
  page?: number
  limit?: number
  sellerId?: string
}): Promise<{ reviews: any[]; pagination: any }> {
  const response = await api.get('/admin/reviews', { params })
  return response.data.data
}

export async function getAdminAuditLogs(params?: {
  page?: number
  limit?: number
  adminId?: string
}): Promise<{ logs: AdminAuditLogItem[]; pagination: any }> {
  const response = await api.get('/admin/audit-logs', { params })
  return response.data.data
}
