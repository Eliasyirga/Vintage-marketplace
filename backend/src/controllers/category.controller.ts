import type { Request, Response, NextFunction } from 'express'
import * as categoryService from '../services/category.service'

export async function getCategories(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const categories = await categoryService.getActiveCategories()
    res.status(200).json({ success: true, data: { categories } })
  } catch (err) {
    next(err)
  }
}
