import type { Request, Response } from 'express'
import * as meetingService from '../services/meeting.service'

/**
 * Get curated safe public meeting locations
 * GET /api/meetings/suggested-locations
 */
export async function getSuggestedLocations(_req: Request, res: Response): Promise<void> {
  res.status(200).json({
    success: true,
    data: meetingService.SUGGESTED_PUBLIC_LOCATIONS,
  })
}

/**
 * Seller proposes meeting adjustment
 * PATCH /api/meetings/:id/propose
 */
export async function proposeMeetingChanges(req: Request, res: Response): Promise<void> {
  const sellerId = req.user!.id
  const id = req.params.id as string
  const proposal = req.body

  const meeting = await meetingService.proposeMeetingChanges(id, sellerId, proposal)

  res.status(200).json({
    success: true,
    message: 'Meeting adjustment proposed.',
    data: meeting,
  })
}

/**
 * Confirm meeting agreement
 * POST /api/meetings/:id/confirm
 */
export async function confirmMeeting(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id
  const id = req.params.id as string

  const meeting = await meetingService.confirmMeeting(id, userId)

  res.status(200).json({
    success: true,
    message: 'Meeting confirmed successfully.',
    data: meeting,
  })
}

/**
 * Buyer submits product inspection checklist
 * POST /api/meetings/:id/inspection
 */
export async function completeInspection(req: Request, res: Response): Promise<void> {
  const buyerId = req.user!.id
  const id = req.params.id as string
  const checklist = req.body

  const meeting = await meetingService.completeInspection(id, buyerId, checklist)

  res.status(200).json({
    success: true,
    message: 'Product inspection recorded successfully.',
    data: meeting,
  })
}
