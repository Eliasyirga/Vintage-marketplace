import { Router } from 'express'
import { requireAuth } from '../middleware/auth.middleware'
import * as accountController from '../controllers/account.controller'
import { avatarImageUpload, handleMulterError } from '../middleware/upload.middleware'

const router = Router()

// All account routes require authentication
router.use(requireAuth)

router.get('/overview', accountController.getOverview)
router.patch('/profile', accountController.updateProfile)
router.post(
  '/avatar',
  avatarImageUpload,
  handleMulterError,
  accountController.uploadAvatar,
)
router.delete('/avatar', accountController.removeAvatar)
router.post('/deactivate', accountController.deactivateAccount)
router.delete('/', accountController.deactivateAccount)

export default router
