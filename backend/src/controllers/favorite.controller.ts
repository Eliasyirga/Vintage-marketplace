import type { Request, Response, NextFunction } from 'express'
import * as favoriteService from '../services/favorite.service'

export async function addFavorite(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const listingId = req.params.listingId as string
    if (!listingId) {
      res.status(400).json({ success: false, message: 'Listing ID is required.' })
      return
    }

    await favoriteService.addFavorite(req.user!.id, listingId)
    res.status(200).json({
      success: true,
      message: 'Added to favorites',
      isFavorite: true,
    })
  } catch (err) {
    next(err)
  }
}

export async function removeFavorite(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const listingId = req.params.listingId as string
    if (!listingId) {
      res.status(400).json({ success: false, message: 'Listing ID is required.' })
      return
    }

    await favoriteService.removeFavorite(req.user!.id, listingId)
    res.status(200).json({
      success: true,
      message: 'Removed from favorites',
      isFavorite: false,
    })
  } catch (err) {
    next(err)
  }
}

export async function checkFavoriteStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const listingId = req.params.listingId as string
    const isFavorite = await favoriteService.isListingFavorited(req.user?.id, listingId)
    res.status(200).json({
      success: true,
      isFavorite,
    })
  } catch (err) {
    next(err)
  }
}

export async function getBatchStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const listingIds = (req.body.listingIds as string[]) || []
    const statusMap = await favoriteService.getBatchFavoriteStatus(req.user?.id, listingIds)
    res.status(200).json({
      success: true,
      data: statusMap,
    })
  } catch (err) {
    next(err)
  }
}

export async function getUserFavorites(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = parseInt(req.query.page as string, 10) || 1
    const limit = parseInt(req.query.limit as string, 10) || 20

    const result = await favoriteService.getUserFavorites(req.user!.id, { page, limit })
    res.status(200).json({
      success: true,
      data: result.favorites,
      pagination: result.pagination,
    })
  } catch (err) {
    next(err)
  }
}
