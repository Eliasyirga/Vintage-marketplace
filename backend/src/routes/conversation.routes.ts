import { Router } from 'express'
import * as conversationController from '../controllers/conversation.controller'
import { requireAuth } from '../middleware/auth.middleware'

const router = Router()

router.use(requireAuth)

router.get('/', conversationController.getUserConversations)
router.post('/', conversationController.createOrGetConversation)
router.get('/:id', conversationController.getConversationById)
router.post('/:id/messages', conversationController.postMessage)

export default router
