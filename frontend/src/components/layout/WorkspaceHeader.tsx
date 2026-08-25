import { Link } from 'react-router-dom'
import { ArrowLeft, Sparkles } from 'lucide-react'
import { useAuthContext } from '../../context/AuthContext'

interface WorkspaceHeaderProps {
  title?: string
  subtitle?: string
  backUrl?: string
  backLabel?: string
  actions?: React.ReactNode
}

export function WorkspaceHeader({
  title,
  subtitle,
  backUrl = '/marketplace',
  backLabel = 'Back to Marketplace',
  actions,
}: WorkspaceHeaderProps) {
  const { user } = useAuthContext()

  return (
    <header className="h-14 bg-white border-b border-stone-200 px-4 sm:px-6 flex items-center justify-between flex-shrink-0 z-30">
      {/* Left: Brand & Return link */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        <Link
          to={backUrl}
          className="flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 px-2.5 py-1.5 rounded-xl transition-colors shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">{backLabel}</span>
        </Link>

        <div className="h-4 w-px bg-stone-200 hidden sm:block shrink-0" />

        <Link to="/marketplace" className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-amber-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="font-extrabold text-sm text-stone-900 tracking-tight hidden md:inline">
            Vintage Marketplace
          </span>
        </Link>

        {title && (
          <>
            <span className="text-stone-300 hidden md:inline">/</span>
            <div className="min-w-0">
              <h1 className="text-xs sm:text-sm font-bold text-stone-900 truncate">{title}</h1>
              {subtitle && (
                <p className="text-[10px] text-stone-400 truncate hidden lg:block">{subtitle}</p>
              )}
            </div>
          </>
        )}
      </div>

      {/* Right: Actions and User Status */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {actions}

        {user && (
          <Link
            to="/account/profile"
            className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-800 transition-colors"
          >
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.fullName}
                className="w-6 h-6 rounded-full object-cover"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold flex items-center justify-center">
                {user.fullName.charAt(0)}
              </div>
            )}
            <span className="text-xs font-semibold hidden sm:inline max-w-[120px] truncate">
              {user.fullName}
            </span>
          </Link>
        )}
      </div>
    </header>
  )
}
