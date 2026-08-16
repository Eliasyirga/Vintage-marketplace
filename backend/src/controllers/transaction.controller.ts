import type { Request, Response, NextFunction } from 'express'
import * as transactionService from '../services/transaction.service'

export async function createTransaction(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const buyerId = req.user!.id
    const { listingId, deliveryOption } = req.body

    if (!listingId) {
      res.status(400).json({ success: false, message: 'listingId is required.' })
      return
    }

    const { transaction, deliveryOrder } = await transactionService.createTransaction(buyerId, {
      listingId,
      deliveryOption,
    })

    res.status(201).json({
      success: true,
      data: {
        transaction: transaction.toSafeObject(),
        deliveryOrder: deliveryOrder ? deliveryOrder.toSafeObject() : null,
      },
    })
  } catch (err) {
    next(err)
  }
}

export async function getBuyerTransactions(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const buyerId = req.user!.id
    const transactions = await transactionService.getBuyerTransactions(buyerId)
    res.json({
      success: true,
      data: transactions.map((t) => t.toSafeObject()),
    })
  } catch (err) {
    next(err)
  }
}

export async function getSellerTransactions(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const sellerId = req.user!.id
    const transactions = await transactionService.getSellerTransactions(sellerId)
    res.json({
      success: true,
      data: transactions.map((t) => t.toSafeObject()),
    })
  } catch (err) {
    next(err)
  }
}
