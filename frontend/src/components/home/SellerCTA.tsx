import { Link } from 'react-router-dom'
import { PlusCircle, Image, DollarSign, MapPin, MessageSquare, ArrowRight } from 'lucide-react'

export default function SellerCTA() {
  const features = [
    { text: 'Easy 2-minute listing flow', icon: PlusCircle },
    { text: 'Multiple high-res photo uploads', icon: Image },
    { text: 'Set clear pricing in ETB', icon: DollarSign },
    { text: 'Specify sub-city location', icon: MapPin },
    { text: 'Direct buyer communication', icon: MessageSquare },
  ]

  return (
    <section className="py-16 lg:py-20 bg-stone-50 border-b border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-amber-500/10 via-amber-100/50 to-orange-50/50 border border-amber-300/80 rounded-3xl p-8 lg:p-12 shadow-xl relative overflow-hidden">
          {/* Ambient lighting effect */}
          <div className="absolute right-0 top-0 -mt-12 -mr-12 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold">
                <span>Start Selling Today</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight leading-tight">
                Have something you don't use anymore?{' '}
                <span className="text-amber-700">Turn it into something valuable.</span>
              </h2>

              <p className="text-base font-medium text-stone-700 max-w-xl leading-relaxed">
                Clear out your space and earn cash. List your unused electronics, furniture, or fashion items on Vintage Marketplace in minutes.
              </p>

              {/* Features List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {features.map((feat) => {
                  const Icon = feat.icon
                  return (
                    <div key={feat.text} className="flex items-center gap-2.5 text-xs font-semibold text-stone-800">
                      <div className="w-5 h-5 rounded-md bg-amber-200 text-amber-900 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-3.5 h-3.5 text-amber-800" />
                      </div>
                      <span>{feat.text}</span>
                    </div>
                  )
                })}
              </div>

              {/* Button */}
              <div className="pt-4">
                <Link
                  to="/sell"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-extrabold px-7 py-3.5 rounded-xl transition-all shadow-lg shadow-amber-600/20 hover:shadow-amber-600/30"
                >
                  <PlusCircle className="w-5 h-5" />
                  <span>Sell Your Item</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Visual Callout Card */}
            <div className="lg:col-span-5">
              <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-lg space-y-4">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <span className="text-xs font-bold text-stone-500">Quick Seller Preview</span>
                  <span className="text-[11px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300 font-bold">
                    Instant Listing
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="h-32 bg-stone-100 rounded-xl overflow-hidden relative border border-stone-200">
                    <img
                      src="https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=600&q=80"
                      alt="Sample Listing"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-md text-xs font-black text-amber-700 shadow-xs">
                      ETB 14,500
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-stone-900 truncate">Sony Noise Cancelling Headphones</p>
                    <p className="text-[11px] text-stone-500 font-medium">Bole, Addis Ababa • 0 views yet</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
