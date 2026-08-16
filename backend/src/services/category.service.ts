import { Category } from '../models'
import type { SafeCategory } from '../types/listing.types'

export async function getActiveCategories(): Promise<SafeCategory[]> {
  const categories = await Category.findAll({
    where: { is_active: true },
    order: [['name', 'ASC']],
  })

  return categories.map((c) => c.toSafeObject())
}

export async function getCategoryById(id: string): Promise<Category | null> {
  return Category.findOne({ where: { id, is_active: true } })
}
