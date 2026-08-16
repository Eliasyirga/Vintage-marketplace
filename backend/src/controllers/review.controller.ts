import type { Request, Response, NextFunction } from 'express'
import * as reviewService from '../services/review.service'

export async function createReview(req: Request, res: Response, next: NextFunction) {
  try {
    const reviewerId = req.user!.id
    const { sellerId, listingId, rating, comment } = req.body

    if (!sellerId || !listingId || !rating || !comment?.trim()) {
      res.status(400).json({ success: false, message: 'sellerId, listingId, rating, and comment are required.' })
      return
    }

    const review = await reviewService.createReview({
      reviewerId,
      sellerId: String(sellerId),
      listingId: String(listingId),
      rating: Number(rating),
      comment: String(comment),
    })

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully.',
      data: { review: review.toSafeObject() },
    })
  } catch (err) {
    next(err)
  }
}

export async function getSellerReviews(req: Request, res: Response, next: NextFunction) {
  try {
    const sellerId = String(req.params.sellerId)
    const page = parseInt(String(req.query.page ?? '1')) || 1
    const limit = parseInt(String(req.query.limit ?? '10')) || 10

    const [result, summary] = await Promise.all([
      reviewService.getSellerReviews(sellerId, { page, limit }),
      reviewService.getSellerRatingSummary(sellerId),
    ])

    res.json({
      success: true,
      data: { ...result, summary },
    })
  } catch (err) {
    next(err)
  }
}

export async function getSellerRatingSummary(req: Request, res: Response, next: NextFunction) {
  try {
    const sellerId = String(req.params.sellerId)
    const summary = await reviewService.getSellerRatingSummary(sellerId)
    res.json({ success: true, data: { summary } })
  } catch (err) {
    next(err)
  }
}

export async function checkUserReviewedListing(req: Request, res: Response, next: NextFunction) {
  try {
    const reviewerId = req.user!.id
    const listingId = String(req.params.listingId)
    const hasReviewed = await reviewService.hasUserReviewedListing(reviewerId, listingId)
    res.json({ success: true, data: { hasReviewed } })
  } catch (err) {
    next(err)
  }
}
