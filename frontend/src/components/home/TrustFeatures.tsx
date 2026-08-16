import { CheckCircle2, ShieldCheck, UserCheck, MessageSquare, MapPin, Zap, BadgeCheck } from 'lucide-react'

const TRUST_ITEMS = [
  {
    icon: UserCheck,
    title: 'Verified Users',
    subtitle: 'Email & phone authenticated',
    color: 'text-sky-600',
    bg: 'bg-sky-50 border-sky-200',
  },
  {
    icon: ShieldCheck,
    title: 'Secure Marketplace',
    subtitle: 'Safe meetup guidelines',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50 border-emerald-200',
  },
  {
    icon: MapPin,
    title: 'Local Listings',
    subtitle: 'Find items in your sub-city',
    color: 'text-violet-600',
    bg: 'bg-violet-50 border-violet-200',
  },
  {
    icon: MessageSquare,
    title: 'Direct Chat',
    subtitle: 'Connect with sellers instantly',
    color: 'text-amber-600',
    bg: 'bg-amber-50 border-amber-200',
  },
  {
    icon: Zap,
    title: 'Fast Listings',
    subtitle: 'List your item in 2 minutes',
    color: 'text-orange-600',
    bg: 'bg-orange-50 border-orange-200',
  },
  {
    icon: BadgeCheck,
    title: 'Fayda Verified',
    subtitle: 'National ID layer coming soon',
    color: 'text-stone-400',
    bg: 'bg-stone-50 border-stone-200',
    upcoming: true,
  },
]

export default function TrustFeatures() {
  return (
    <section className="bg-white border-b border-stone-200/80 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Label */}
        <p className="text-center text-xs font-bold text-stone-400 uppercase tracking-widest mb-6">
          Why thousands trust Vintage Marketplace
        </p>

        {/* Cards row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {TRUST_ITEMS.map(({ icon: Icon, title, subtitle, color, bg, upcoming }) => (
            <div
              key={title}
              className={`relative flex flex-col items-center text-center p-4 rounded-2xl border transition-all duration-200 ${bg} ${
                upcoming ? 'opacity-60' : 'hover:shadow-md hover:-translate-y-0.5'
              }`}
            >
              {upcoming && (
                <span className="absolute -top-2 right-2 text-[9px] font-bold bg-amber-400 text-white px-1.5 py-0.5 rounded-full leading-none">
                  SOON
                </span>
              )}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-extrabold text-stone-900 leading-tight">{title}</h4>
              <p className="text-[10px] text-stone-500 font-medium mt-0.5 leading-tight">{subtitle}</p>
            </div>
          ))}
        </div>

        {/* Verification pill bar */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          <span className="text-xs font-semibold text-stone-500 mr-1">Verification layers:</span>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-[11px]">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Email OTP
          </span>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-[11px]">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Phone OTP
          </span>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-stone-100 border border-stone-200 text-stone-500 font-semibold text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" /> Fayda / National ID (Upcoming)
          </span>
        </div>
      </div>
    </section>
  )
}
