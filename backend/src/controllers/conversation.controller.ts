import type { Request, Response, NextFunction } from 'express'
import * as conversationService from '../services/conversation.service'

export async function createOrGetConversation(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { listingId, sellerId, message } = req.body

    if (!listingId || !sellerId) {
      res.status(400).json({
        success: false,
        message: 'Listing ID and Seller ID are required.',
      })
      return
    }

    const { conversation, isNew } = await conversationService.getOrCreateConversation(
      req.user!.id,
      listingId,
      sellerId,
      message,
    )

    res.status(isNew ? 201 : 200).json({
      success: true,
      message: isNew ? 'Conversation started' : 'Existing conversation loaded',
      data: {
        conversationId: conversation.id,
        conversation,
        isNew,
      },
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
    res.status(200).json({
      success: true,
      data: conversations,
    })
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
    const conversationId = req.params.id as string
    const conversation = await conversationService.getConversationDetails(
      conversationId,
      req.user!.id,
    )

    res.status(200).json({
      success: true,
      data: { conversation },
    })
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
    const conversationId = req.params.id as string
    const { content } = req.body

    if (!content || !content.trim()) {
      res.status(400).json({ success: false, message: 'Message cannot be empty.' })
      return
    }

    const message = await conversationService.sendMessage(
      conversationId,
      req.user!.id,
      content,
    )

    res.status(201).json({
      success: true,
      message: 'Message sent',
      data: { message },
    })
  } catch (err) {
    next(err)
  }
}
