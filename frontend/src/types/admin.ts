export interface DashboardStats {
  totalUsers: number
  newUsersToday: number
  totalListings: number
  activeListings: number
  soldListings: number
  pendingReports: number
  pendingVerifications: number
  totalReviews: number
  newListingsToday: number
}

export interface AdminAuditLogItem {
  id: string
  admin_id: string
  action: string
  target_type: string
  target_id: string
  reason: string | null
  metadata: any
  created_at: string
  admin?: {
    id: string
    full_name: string
  }
}
