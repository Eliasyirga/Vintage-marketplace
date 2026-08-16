import api from './api'
import type { SafeCategory } from '../types/listing'

export interface CategoriesResponse {
  success: boolean
  data: {
    categories: SafeCategory[]
  }
}

export async function getCategories(): Promise<SafeCategory[]> {
  const response = await api.get<CategoriesResponse>('/categories')
  return response.data.data.categories
}
