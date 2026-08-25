import { ShieldCheck, Star, AlertTriangle, CheckCircle, MessageSquare, MapPin } from 'lucide-react'

export default function SafetySection() {
  const safetyPoints = [
    {
      title: 'Verified Accounts',
      description: 'Users must verify either email or phone via OTP before creating an account.',
      icon: ShieldCheck,
    },
    {
      title: 'Seller Ratings & Reviews',
      description: 'Community feedback allows buyers to deal with top-rated local sellers.',
      icon: Star,
    },
    {
      title: 'Report Suspicious Listings',
      description: 'Moderation tools enable users to flag inappropriate or fraudulent items immediately.',
      icon: AlertTriangle,
    },
    {
      title: 'Clear Product Condition',
      description: 'Standardized condition labels (Brand New, Like New, Lightly Used) ensure transparency.',
      icon: CheckCircle,
    },
    {
      title: 'Direct Communication',
      description: 'In-app messaging allows buyers and sellers to discuss details before meeting.',
      icon: MessageSquare,
    },
    {
      title: 'Neighborhood Location Info',
      description: 'Listings specify exact sub-cities (e.g. Bole, Lideta, Yeka) for safe public meetups.',
      icon: MapPin,
    },
  ]

  return (
    <section id="safety" className="py-16 lg:py-20 bg-white border-b border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold mb-3 border border-amber-300">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
            <span>Community Trust & Protection</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Built Around Trust
          </h2>
          <p className="text-sm font-medium text-stone-600 mt-2">
            Safety is built into every layer of Vintage Marketplace. Here is how we foster a reliable local community.
          </p>
        </div>

        {/* Safety Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {safetyPoints.map((point) => {
            const Icon = point.icon
            return (
              <div
                key={point.title}
                className="p-4 sm:p-6 bg-stone-50 border border-stone-200/90 rounded-2xl sm:rounded-3xl transition-all duration-300 hover:border-amber-500/60 hover:shadow-md"
              >
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-amber-100 border border-amber-200 text-amber-700 flex items-center justify-center mb-3 sm:mb-4 font-bold">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-stone-900 mb-1.5">{point.title}</h3>
                <p className="text-xs text-stone-600 font-medium leading-relaxed">{point.description}</p>
              </div>
            )
          })}
        </div>

        {/* Future Identity Layer Note */}
        <div className="mt-10 p-4 rounded-2xl bg-stone-50 border border-stone-200/90 max-w-3xl mx-auto text-center text-xs text-stone-600 font-medium leading-relaxed shadow-2xs">
          <span className="font-bold text-amber-800">Future Trust Architecture:</span>{' '}
          We are architecting future identity verification layers (such as National ID / Fayda verification) to provide even greater confidence as the marketplace evolves.
        </div>
      </div>
    </section>
  )
}
