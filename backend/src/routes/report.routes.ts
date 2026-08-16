import { Router } from 'express'
import { requireAuth } from '../middleware/auth.middleware'
import * as reportController from '../controllers/report.controller'

const router = Router()

// POST /api/reports — authenticated users file a report
router.post('/', requireAuth, reportController.createReport)

// GET /api/reports/reasons/:targetType — get valid reasons for a target type
router.get('/reasons/:targetType', requireAuth, reportController.getReportReasons)

export default router
