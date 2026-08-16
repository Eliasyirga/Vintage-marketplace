import api from './api'
import type { CreateReportInput, ReportTargetType } from '../types/report'

export async function createReport(data: CreateReportInput): Promise<{ reportId: string }> {
  const response = await api.post('/reports', data)
  return response.data.data
}

export async function getReportReasons(targetType: ReportTargetType): Promise<string[]> {
  const response = await api.get(`/reports/reasons/${targetType}`)
  return response.data.data.reasons
}
