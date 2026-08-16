export type ReportTargetType = 'LISTING' | 'USER' | 'REVIEW' | 'MESSAGE'
export type ReportStatus = 'PENDING' | 'UNDER_REVIEW' | 'RESOLVED' | 'DISMISSED'
export type ReportPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export interface CreateReportInput {
  targetType: ReportTargetType
  targetId: string
  reason: string
  description?: string
}

export interface ReportItem {
  id: string
  reporterId: string
  targetType: ReportTargetType
  targetId: string
  reason: string
  description: string | null
  status: ReportStatus
  priority: ReportPriority
  adminNote: string | null
  resolvedBy: string | null
  resolvedAt: string | null
  createdAt: string
  updatedAt: string
  reporter?: {
    id: string
    full_name: string
    email: string | null
    phone: string | null
  }
}
