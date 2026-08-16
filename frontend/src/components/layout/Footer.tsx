import { Link } from 'react-router-dom'
import { Sparkles, MapPin, Mail, Phone } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-stone-900 border-t border-stone-800 text-stone-300 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                Vintage <span className="text-amber-500 font-medium">Marketplace</span>
              </span>
            </Link>
            <p className="text-stone-400 text-sm leading-relaxed max-w-sm font-medium">
              Making Bonda digital. Ethiopia's trusted marketplace for buying and selling quality pre-loved products directly within your neighborhood.
            </p>
            <div className="pt-2 flex flex-col space-y-1.5 text-xs text-stone-400 font-medium">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-amber-500" />
                <span>Addis Ababa, Ethiopia</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-amber-500" />
                <span>support@vintagemarketplace.et</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-amber-500" />
                <span>+251 911 000 000</span>
              </div>
            </div>
          </div>

          {/* Col 1: Marketplace */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Marketplace
            </h4>
            <ul className="space-y-2.5 font-medium">
              <li>
                <Link to="/browse" className="hover:text-amber-400 transition-colors">
                  Browse Products
                </Link>
              </li>
              <li>
                <a href="#categories" className="hover:text-amber-400 transition-colors">
                  Explore Categories
                </a>
              </li>
              <li>
                <Link to="/sell" className="hover:text-amber-400 transition-colors">
                  Sell an Item
                </Link>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-amber-400 transition-colors">
                  How It Works
                </a>
              </li>
            </ul>
          </div>

          {/* Col 2: Support */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Support
            </h4>
            <ul className="space-y-2.5 font-medium">
              <li>
                <a href="#safety" className="hover:text-amber-400 transition-colors">
                  Safety & Trust
                </a>
              </li>
              <li>
                <span className="text-stone-500 cursor-not-allowed">Help Center</span>
              </li>
              <li>
                <span className="text-stone-500 cursor-not-allowed">Contact Us</span>
              </li>
              <li>
                <span className="text-stone-500 cursor-not-allowed">Community Guidelines</span>
              </li>
            </ul>
          </div>

          {/* Col 3: Company */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Company
            </h4>
            <ul className="space-y-2.5 font-medium">
              <li>
                <span className="text-stone-500 cursor-not-allowed">About Vintage</span>
              </li>
              <li>
                <span className="text-stone-500 cursor-not-allowed">Careers</span>
              </li>
              <li>
                <span className="text-stone-500 cursor-not-allowed">Terms of Service</span>
              </li>
              <li>
                <span className="text-stone-500 cursor-not-allowed">Privacy Policy</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-stone-400">
          <p>© 2026 Vintage Marketplace. All rights reserved. Making Bonda digital in Ethiopia.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-white transition-colors cursor-pointer">Terms</span>
            <span className="hover:text-white transition-colors cursor-pointer">Privacy</span>
            <span className="hover:text-white transition-colors cursor-pointer">Security</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
