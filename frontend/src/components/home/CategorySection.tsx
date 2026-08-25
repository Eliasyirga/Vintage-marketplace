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

const categoryColors: Record<string, { icon: string; bg: string; gradient: string; ring: string }> = {
  electronics:    { icon: 'text-blue-600',    bg: 'bg-blue-50',    gradient: 'from-blue-500/10 to-blue-600/5',    ring: 'group-hover:ring-blue-300' },
  furniture:      { icon: 'text-amber-700',   bg: 'bg-amber-50',   gradient: 'from-amber-500/10 to-amber-600/5',  ring: 'group-hover:ring-amber-300' },
  'home-kitchen': { icon: 'text-rose-600',    bg: 'bg-rose-50',    gradient: 'from-rose-500/10 to-rose-600/5',    ring: 'group-hover:ring-rose-300' },
  vehicles:       { icon: 'text-slate-600',   bg: 'bg-slate-50',   gradient: 'from-slate-500/10 to-slate-600/5',  ring: 'group-hover:ring-slate-300' },
  fashion:        { icon: 'text-pink-600',    bg: 'bg-pink-50',    gradient: 'from-pink-500/10 to-pink-600/5',    ring: 'group-hover:ring-pink-300' },
  books:          { icon: 'text-emerald-600', bg: 'bg-emerald-50', gradient: 'from-emerald-500/10 to-emerald-600/5', ring: 'group-hover:ring-emerald-300' },
  sports:         { icon: 'text-orange-600',  bg: 'bg-orange-50',  gradient: 'from-orange-500/10 to-orange-600/5', ring: 'group-hover:ring-orange-300' },
  tools:          { icon: 'text-stone-600',   bg: 'bg-stone-100',  gradient: 'from-stone-500/10 to-stone-600/5',  ring: 'group-hover:ring-stone-300' },
  other:          { icon: 'text-violet-600',  bg: 'bg-violet-50',  gradient: 'from-violet-500/10 to-violet-600/5', ring: 'group-hover:ring-violet-300' },
}

export default function CategorySection() {
  return (
    <section id="categories" className="py-16 lg:py-24 bg-stone-50 relative">
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle, #d6d3d1 1px, transparent 1px)', backgroundSize: '24px 24px' }}
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 gap-6">
          <div className="max-w-xl">
            <p className="text-xs font-bold text-amber-700 uppercase tracking-widest mb-2">Browse by</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
              Explore Categories
            </h2>
            <p className="text-sm font-medium text-stone-500 mt-2">
              9 categories · thousands of listings across Ethiopia
            </p>
          </div>
          <Link
            to="/browse"
            className="inline-flex items-center gap-2 text-sm font-bold text-amber-800 bg-white hover:bg-amber-50 border border-amber-200 hover:border-amber-400 px-5 py-2.5 rounded-xl transition-all shadow-sm hover:shadow-md self-start lg:self-auto"
          >
            <span>View All Listings</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {categories.map((cat) => {
            const IconComponent = iconMap[cat.icon] || Package
            const colors = categoryColors[cat.slug] || categoryColors['other']

            return (
              <Link
                key={cat.id}
                to={`/browse?category=${cat.slug}`}
                className={`group relative flex flex-col items-center text-center overflow-hidden p-3 sm:p-5 bg-white border border-stone-200/90 hover:border-amber-400 rounded-2xl transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1 ring-0 ring-transparent ${colors.ring} hover:ring-2`}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                  aria-hidden="true"
                />

                <div className={`relative w-12 h-12 sm:w-16 sm:h-16 rounded-2xl ${colors.bg} ${colors.icon} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                  <IconComponent className="w-6 h-6 sm:w-8 sm:h-8" />
                </div>

                <h3 className="relative text-xs sm:text-sm font-bold text-stone-900 leading-tight mb-1 truncate max-w-full">
                  {cat.name}
                </h3>
                <p className="relative text-[10px] sm:text-xs font-semibold text-stone-400 group-hover:text-amber-700 transition-colors">
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
