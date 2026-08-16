import { Link } from 'react-router-dom'
import { Clock, ArrowRight } from 'lucide-react'
import ProductCard from '../products/ProductCard'
import { recentProducts } from '../../data/mockProducts'

export default function RecentListings() {
  return (
    <section className="py-16 lg:py-20 bg-stone-100/60 border-b border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-amber-700 uppercase tracking-wider mb-2">
              <Clock className="w-3.5 h-3.5" />
              <span>Fresh Market Arrivals</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              Recently Added
            </h2>
            <p className="text-sm font-medium text-stone-600 mt-1">
              Explore the latest listings posted by sellers across Addis Ababa
            </p>
          </div>

          <Link
            to="/browse"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-amber-700 hover:text-amber-800 transition-colors"
          >
            <span>View All Listings</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 8 Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {recentProducts.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              title={product.title}
              price={product.price}
              image={product.image}
              condition={product.condition}
              location={product.location}
              subCity={product.subCity}
              createdAt={product.createdAt}
              isFavorite={product.isFavorite}
              isVerifiedSeller={product.isVerifiedSeller}
            />
          ))}
        </div>

        {/* Bottom Load More CTA */}
        <div className="mt-12 text-center">
          <Link
            to="/browse"
            className="inline-flex items-center gap-2 bg-white hover:bg-stone-50 text-stone-900 border border-stone-300 font-bold px-8 py-3.5 rounded-xl transition-all shadow-xs hover:border-amber-500"
          >
            <span>Explore All Marketplace Listings</span>
            <ArrowRight className="w-4 h-4 text-amber-600" />
          </Link>
        </div>
      </div>
    </section>
  )
}
