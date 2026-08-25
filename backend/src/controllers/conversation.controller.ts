import type { Request, Response, NextFunction } from 'express'
import * as conversationService from '../services/conversation.service'
import * as userBlockService from '../services/userBlock.service'
import Report from '../models/Report'

// ── Conversation Management ────────────────────────────────────────────────────

export async function createOrGetConversation(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { listingId, sellerId, message } = req.body

    if (!listingId || !sellerId) {
      res.status(400).json({ success: false, message: 'listingId and sellerId are required.' })
      return
    }

    const { conversation, isNew, conversationId } =
      await conversationService.getOrCreateConversation(
        req.user!.id,
        listingId,
        sellerId,
        message,
      )

    res.status(isNew ? 201 : 200).json({
      success: true,
      message: isNew ? 'Conversation started' : 'Existing conversation loaded',
      data: { conversationId, isNew },
    })
  } catch (err) {
    next(err)
  }
}

export async function getUserConversations(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const conversations = await conversationService.getUserConversations(req.user!.id)
    res.status(200).json({ success: true, data: conversations })
  } catch (err) {
    next(err)
  }
}

export async function getConversationById(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const conversation = await conversationService.getConversationDetails(
      req.params.id as string,
      req.user!.id,
    )
    res.status(200).json({ success: true, data: { conversation } })
  } catch (err) {
    next(err)
  }
}

// ── Messages ───────────────────────────────────────────────────────────────────

export async function getMessages(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { cursor, limit } = req.query
    const result = await conversationService.getConversationMessages(
      req.params.id as string,
      req.user!.id,
      cursor as string | undefined,
      limit ? parseInt(limit as string, 10) : 30,
    )
    res.status(200).json({ success: true, data: result })
  } catch (err) {
    next(err)
  }
}

export async function postMessage(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { content } = req.body
    if (!content || !content.trim()) {
      res.status(400).json({ success: false, message: 'Message cannot be empty.' })
      return
    }

    const message = await conversationService.sendMessage(
      req.params.id as string,
      req.user!.id,
      content,
    )

    res.status(201).json({ success: true, message: 'Message sent', data: { message } })
  } catch (err) {
    next(err)
  }
}

export async function markRead(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await conversationService.markConversationRead(req.params.id as string, req.user!.id)
    res.status(200).json({ success: true, message: 'Conversation marked as read.' })
  } catch (err) {
    next(err)
  }
}

export async function deleteMessage(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await conversationService.softDeleteMessage(req.params.messageId as string, req.user!.id)
    res.status(200).json({ success: true, message: 'Message deleted.' })
  } catch (err) {
    next(err)
  }
}

// ── Reporting ──────────────────────────────────────────────────────────────────

export async function reportMessage(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { reason, description } = req.body
    if (!reason) {
      res.status(400).json({ success: false, message: 'Report reason is required.' })
      return
    }

    await Report.create({
      reporter_id: req.user!.id,
      target_type: 'MESSAGE',
      target_id: req.params.messageId as string,
      reason,
      description: description ?? null,
    })

    res.status(201).json({ success: true, message: 'Message reported. Thank you.' })
  } catch (err) {
    next(err)
  }
}

export async function reportConversation(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { reason, description } = req.body
    if (!reason) {
      res.status(400).json({ success: false, message: 'Report reason is required.' })
      return
    }

    await Report.create({
      reporter_id: req.user!.id,
      target_type: 'CONVERSATION',
      target_id: req.params.id as string,
      reason,
      description: description ?? null,
    })

    res.status(201).json({ success: true, message: 'Conversation reported. Thank you.' })
  } catch (err) {
    next(err)
  }
}

// ── User Blocking ──────────────────────────────────────────────────────────────

export async function blockUser(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { isNew } = await userBlockService.blockUser(req.user!.id, req.params.userId as string)
    res
      .status(isNew ? 201 : 200)
      .json({ success: true, message: isNew ? 'User blocked.' : 'User is already blocked.' })
  } catch (err) {
    next(err)
  }
}

export async function unblockUser(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await userBlockService.unblockUser(req.user!.id, req.params.userId as string)
    res.status(200).json({ success: true, message: 'User unblocked.' })
  } catch (err) {
    next(err)
  }
}

export async function getBlockedUsers(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const blockedIds = await userBlockService.getBlockedUserIds(req.user!.id)
    res.status(200).json({ success: true, data: { blockedIds } })
  } catch (err) {
    next(err)
  }
}
