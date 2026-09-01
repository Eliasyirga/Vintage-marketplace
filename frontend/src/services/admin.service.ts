import api from './api'
import type {
  DashboardStats,
  TimeseriesDataPoint,
  AccountTierBreakdown,
  RiskSignalItem,
  AdminUserItem,
  UserDetailsDossier,
  AdminListingItem,
  AdminOrderItem,
  AdminPaymentItem,
  AdminBusinessItem,
  AdminAuditLogItem,
} from '../types/admin'
import type { ReportItem, ReportStatus, ReportPriority } from '../types/report'
import type { UserVerificationItem } from '../types/verification'

// ── Dashboard & Analytics ──────────────────────────────────────────────────────

export async function getDashboardStats(): Promise<DashboardStats> {
  const response = await api.get('/admin/dashboard/stats')
  return response.data.data.stats
}

export async function getTimeseriesAnalytics(days = 30): Promise<{
  timeseries: TimeseriesDataPoint[]
  tiers: AccountTierBreakdown
}> {
  const response = await api.get('/admin/analytics/timeseries', { params: { days } })
  return response.data.data
}

export async function getRiskSignals(): Promise<RiskSignalItem[]> {
  const response = await api.get('/admin/analytics/risk')
  return response.data.data.signals
}

// ── Reports ────────────────────────────────────────────────────────────────────

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

// ── Users ──────────────────────────────────────────────────────────────────────

export async function getAdminUsers(params?: {
  page?: number
  limit?: number
  search?: string
  status?: string
  role?: string
  verification?: string
  tier?: string
}): Promise<{ users: AdminUserItem[]; pagination: any }> {
  const response = await api.get('/admin/users', { params })
  return response.data.data
}

export async function getUserDetails(userId: string): Promise<UserDetailsDossier> {
  const response = await api.get(`/admin/users/${userId}/details`)
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

// ── Listings ─────────────────────────────────────────────────────────────────

export async function getAdminListings(params?: {
  page?: number
  limit?: number
  search?: string
  status?: string
  categoryId?: string
}): Promise<{ listings: AdminListingItem[]; pagination: any }> {
  const response = await api.get('/admin/listings', { params })
  return response.data.data
}

export async function updateListingStatus(
  listingId: string,
  status: string,
  reason?: string,
  adminNote?: string,
): Promise<{ listingId: string; status: string }> {
  const response = await api.patch(`/admin/listings/${listingId}/status`, { status, reason, adminNote })
  return response.data.data
}

// ── Orders ───────────────────────────────────────────────────────────────────

export async function getAdminOrders(params?: {
  page?: number
  limit?: number
  search?: string
  status?: string
  paymentStatus?: string
}): Promise<{ orders: AdminOrderItem[]; pagination: any }> {
  const response = await api.get('/admin/orders', { params })
  return response.data.data
}

export async function getAdminOrderById(orderId: string): Promise<{ order: AdminOrderItem & { events: any[] } }> {
  const response = await api.get(`/admin/orders/${orderId}`)
  return response.data.data
}

// ── Payments (Chapa Gateway) ─────────────────────────────────────────────────

export async function getAdminPayments(params?: {
  page?: number
  limit?: number
  search?: string
  purpose?: string
  status?: string
}): Promise<{
  payments: AdminPaymentItem[]
  summary: { totalVolume: number; successfulCount: number; failedCount: number; pendingCount: number }
  pagination: any
}> {
  const response = await api.get('/admin/payments', { params })
  return response.data.data
}

// ── Businesses ────────────────────────────────────────────────────────────────

export async function getAdminBusinesses(params?: {
  page?: number
  limit?: number
  search?: string
  status?: string
}): Promise<{ businesses: AdminBusinessItem[]; pagination: any }> {
  const response = await api.get('/admin/businesses', { params })
  return response.data.data
}

export async function updateBusinessStatus(
  businessId: string,
  status: 'PENDING' | 'VERIFIED' | 'REJECTED',
  reason?: string,
): Promise<{ business: AdminBusinessItem }> {
  const response = await api.patch(`/admin/businesses/${businessId}/status`, { status, reason })
  return response.data.data
}

// ── Verifications ─────────────────────────────────────────────────────────────

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

// ── Reviews ───────────────────────────────────────────────────────────────────

export async function getAdminReviews(params?: {
  page?: number
  limit?: number
  sellerId?: string
}): Promise<{ reviews: any[]; pagination: any }> {
  const response = await api.get('/admin/reviews', { params })
  return response.data.data
}

// ── Audit Logs ────────────────────────────────────────────────────────────────

export async function getAdminAuditLogs(params?: {
  page?: number
  limit?: number
  adminId?: string
}): Promise<{ logs: AdminAuditLogItem[]; pagination: any }> {
  const response = await api.get('/admin/audit-logs', { params })
  return response.data.data
}
