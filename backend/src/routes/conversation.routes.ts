import { Router } from 'express'
import * as conversationController from '../controllers/conversation.controller'
import { requireAuth } from '../middleware/auth.middleware'
import { messageRateLimiter } from '../middleware/rateLimit.middleware'

const router = Router()

router.use(requireAuth)

// ── Blocking ──────────────────────────────────────────────────────────────────
router.get('/blocked', conversationController.getBlockedUsers)
router.post('/block/:userId', conversationController.blockUser)
router.delete('/block/:userId', conversationController.unblockUser)

// ── Conversation CRUD ─────────────────────────────────────────────────────────
router.get('/', conversationController.getUserConversations)
router.post('/', conversationController.createOrGetConversation)
router.get('/:id', conversationController.getConversationById)

// ── Messages ──────────────────────────────────────────────────────────────────
router.get('/:id/messages', conversationController.getMessages)
router.post('/:id/messages', messageRateLimiter, conversationController.postMessage)
router.post('/:id/messages/:messageId/delete', conversationController.deleteMessage)
router.post('/:id/read', conversationController.markRead)

// ── Reporting ─────────────────────────────────────────────────────────────────
router.post('/:id/report', conversationController.reportConversation)
router.post('/:id/messages/:messageId/report', conversationController.reportMessage)

export default router
