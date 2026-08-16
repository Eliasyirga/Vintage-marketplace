import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles } from 'lucide-react'
import ProductCard from '../products/ProductCard'
import { featuredProducts } from '../../data/mockProducts'

export default function FeaturedListings() {
  return (
    <section className="py-16 lg:py-20 bg-stone-50 border-b border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-amber-700 uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Handpicked Deals</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              Featured Products
            </h2>
            <p className="text-sm font-medium text-stone-600 mt-1">
              Top quality items verified and available right now in Addis Ababa
            </p>
          </div>

          <Link
            to="/browse"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-amber-700 hover:text-amber-800 transition-colors"
          >
            <span>View All Products</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 4-column responsive grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {featuredProducts.map((product) => (
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
      </div>
    </section>
  )
}
