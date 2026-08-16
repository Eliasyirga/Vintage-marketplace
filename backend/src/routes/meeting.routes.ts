import { Router } from 'express'
import { requireAuth } from '../middleware/auth.middleware'
import { validate } from '../middleware/validate.middleware'
import * as meetingController from '../controllers/meeting.controller'
import {
  proposeMeetingSchema,
  inspectionChecklistSchema,
} from '../validators/order.validator'

const router = Router()

// Public suggested locations
router.get('/suggested-locations', meetingController.getSuggestedLocations)

// Authenticated meeting negotiation & inspection
router.patch(
  '/:id/propose',
  requireAuth,
  validate(proposeMeetingSchema),
  meetingController.proposeMeetingChanges,
)

router.post('/:id/confirm', requireAuth, meetingController.confirmMeeting)

router.post(
  '/:id/inspection',
  requireAuth,
  validate(inspectionChecklistSchema),
  meetingController.completeInspection,
)

export default router
