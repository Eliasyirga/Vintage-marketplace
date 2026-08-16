import { useState } from 'react'
import { AdminSidebar } from './AdminSidebar'
import { useAuthContext } from '../../context/AuthContext'
import { Menu } from 'lucide-react'

interface AdminLayoutProps {
  children: React.ReactNode
  title: string
  subtitle?: string
}

export function AdminLayout({ children, title, subtitle }: AdminLayoutProps) {
  const { user } = useAuthContext()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-stone-100 flex text-stone-900 selection:bg-amber-500 selection:text-white">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-stone-900/60 backdrop-blur-xs lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="bg-white border-b border-stone-200 px-4 sm:px-8 py-4 flex items-center justify-between gap-4 sticky top-0 z-20 shadow-2xs">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-stone-600 hover:bg-stone-100"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-stone-900 tracking-tight truncate">
                {title}
              </h1>
              {subtitle && <p className="text-xs text-stone-500 font-medium truncate">{subtitle}</p>}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 px-3 py-1.5 rounded-2xl">
              <div className="w-7 h-7 rounded-xl bg-amber-600 text-white font-bold text-xs flex items-center justify-center">
                {user?.fullName?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div className="hidden sm:block text-left">
                <span className="text-xs font-bold text-stone-900 block leading-tight">
                  {user?.fullName}
                </span>
                <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">
                  Admin
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  )
}
