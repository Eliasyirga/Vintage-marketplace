import type { Request, Response, NextFunction } from 'express'
import * as reportService from '../services/report.service'
import type { ReportTargetType } from '../models/Report'

export async function createReport(req: Request, res: Response, next: NextFunction) {
  try {
    const reporterId = req.user!.id
    const { targetType, targetId, reason, description } = req.body

    if (!targetType || !targetId || !reason) {
      res.status(400).json({ success: false, message: 'targetType, targetId, and reason are required.' })
      return
    }

    const report = await reportService.createReport({
      reporterId,
      targetType: targetType as ReportTargetType,
      targetId: String(targetId),
      reason: String(reason),
      description: description ? String(description) : undefined,
    })

    res.status(201).json({
      success: true,
      message: 'Your report has been submitted. Our team will review it.',
      data: { reportId: report.id },
    })
  } catch (err) {
    next(err)
  }
}

export async function getReportReasons(req: Request, res: Response, next: NextFunction) {
  try {
    const targetType = String(req.params.targetType)
    const reasonsMap: Record<string, readonly string[]> = {
      LISTING: reportService.LISTING_REPORT_REASONS,
      USER: reportService.USER_REPORT_REASONS,
      REVIEW: reportService.REVIEW_REPORT_REASONS,
      MESSAGE: reportService.MESSAGE_REPORT_REASONS,
    }
    const reasons = reasonsMap[targetType]
    if (!reasons) {
      res.status(400).json({ success: false, message: 'Invalid target type.' })
      return
    }
    res.json({ success: true, data: { reasons } })
  } catch (err) {
    next(err)
  }
}
