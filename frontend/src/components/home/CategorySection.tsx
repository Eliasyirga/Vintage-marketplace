import { Link } from 'react-router-dom'
import {
  Smartphone, Armchair, Home, Car, Shirt,
  BookOpen, Dumbbell, Wrench, Package, ArrowRight,
  type LucideIcon,
} from 'lucide-react'
import { categories } from '../../data/categories'

const iconMap: Record<string, LucideIcon> = {
  Smartphone, Armchair, Home, Car, Shirt, BookOpen, Dumbbell, Wrench, Package,
}

// Distinct accent colours per category
const categoryColors: Record<string, { icon: string; bg: string; ring: string }> = {
  electronics:    { icon: 'text-blue-600',    bg: 'bg-blue-50',    ring: 'group-hover:ring-blue-300' },
  furniture:      { icon: 'text-amber-700',   bg: 'bg-amber-50',   ring: 'group-hover:ring-amber-300' },
  'home-kitchen': { icon: 'text-rose-600',    bg: 'bg-rose-50',    ring: 'group-hover:ring-rose-300' },
  vehicles:       { icon: 'text-slate-600',   bg: 'bg-slate-50',   ring: 'group-hover:ring-slate-300' },
  fashion:        { icon: 'text-pink-600',    bg: 'bg-pink-50',    ring: 'group-hover:ring-pink-300' },
  books:          { icon: 'text-emerald-600', bg: 'bg-emerald-50', ring: 'group-hover:ring-emerald-300' },
  sports:         { icon: 'text-orange-600',  bg: 'bg-orange-50',  ring: 'group-hover:ring-orange-300' },
  tools:          { icon: 'text-stone-600',   bg: 'bg-stone-100',  ring: 'group-hover:ring-stone-300' },
  other:          { icon: 'text-violet-600',  bg: 'bg-violet-50',  ring: 'group-hover:ring-violet-300' },
}

export default function CategorySection() {
  return (
    <section id="categories" className="py-16 lg:py-20 bg-stone-50/80 border-b border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <p className="text-xs font-bold text-amber-700 uppercase tracking-widest mb-1">Browse by</p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              Explore Categories
            </h2>
            <p className="text-sm font-medium text-stone-500 mt-1">
              9 categories · thousands of listings across Ethiopia
            </p>
          </div>
          <Link
            to="/browse"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-4 py-2 rounded-xl transition-all"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {categories.map((cat) => {
            const IconComponent = iconMap[cat.icon] || Package
            const colors = categoryColors[cat.slug] || categoryColors['other']
            return (
              <Link
                key={cat.id}
                to={`/browse?category=${cat.slug}`}
                className={`group flex flex-col items-center text-center p-5 bg-white border border-stone-200 hover:border-amber-400 rounded-2xl transition-all duration-200 shadow-xs hover:shadow-lg hover:-translate-y-0.5 ring-0 ring-transparent ${colors.ring} hover:ring-2`}
              >
                <div className={`w-14 h-14 rounded-2xl ${colors.bg} ${colors.icon} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200`}>
                  <IconComponent className="w-7 h-7" />
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-stone-900 leading-tight mb-1">{cat.name}</h3>
                <p className="text-[11px] font-semibold text-stone-400">
                  {cat.count.toLocaleString()} listings
                </p>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
