import { useEffect, useState } from 'react'
import { Folder, Loader2 } from 'lucide-react'
import { getCategories } from '../../services/category.service'
import type { SafeCategory } from '../../types/listing'

interface CategorySelectorProps {
  value: string
  onChange: (categoryId: string) => void
  error?: string
}

export function CategorySelector({ value, onChange, error }: CategorySelectorProps) {
  const [categories, setCategories] = useState<SafeCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await getCategories()
        setCategories(data)
      } catch {
        // Fallback error handling
      } finally {
        setIsLoading(false)
      }
    }
    loadCategories()
  }, [])

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-bold text-stone-800 flex items-center gap-2">
        <Folder className="w-4 h-4 text-amber-600" />
        Category <span className="text-amber-600">*</span>
      </label>

      {isLoading ? (
        <div className="flex items-center gap-2 py-3 px-4 rounded-xl bg-stone-50 border border-stone-200 text-stone-500 text-sm">
          <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
          Loading categories...
        </div>
      ) : (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full bg-white text-stone-900 rounded-xl px-4 py-3 text-sm font-medium border focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all ${
            error ? 'border-red-500 bg-red-50/20' : 'border-stone-300 hover:border-stone-400'
          }`}
        >
          <option value="" disabled>
            -- Select Category --
          </option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      )}

      {error && <p className="text-xs text-red-600 font-medium mt-1">{error}</p>}
    </div>
  )
}
