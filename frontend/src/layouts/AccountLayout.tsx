import { useState } from 'react'
import { Outlet, Link } from 'react-router-dom'
import { Navbar } from '../components/layout/Navbar'
import { Footer } from '../components/layout/Footer'
import { AccountSidebar } from '../components/account/AccountSidebar'
import { Menu, X, PlusCircle } from 'lucide-react'

export function AccountLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)


  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Mobile Header Bar with toggle */}
        <div className="lg:hidden flex items-center justify-between p-3 mb-4 bg-white rounded-2xl border border-stone-200 shadow-sm">
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-stone-700 bg-stone-100 rounded-xl hover:bg-stone-200"
          >
            {mobileSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            <span>Account Menu</span>
          </button>

          <div className="flex items-center gap-2">
            <Link
              to="/sell"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-xl shadow-sm"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Sell Item</span>
            </Link>
          </div>
        </div>

        {/* Mobile Sidebar Modal/Drawer */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-40 lg:hidden flex">
            <div
              className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white z-50 shadow-2xl overflow-y-auto">
              <div className="p-4 border-b border-stone-100 flex items-center justify-between">
                <h3 className="font-bold text-stone-900 text-base">Account Center</h3>
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-1.5 text-stone-500 hover:text-stone-700 rounded-lg hover:bg-stone-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <AccountSidebar onCloseMobile={() => setMobileSidebarOpen(false)} />
            </div>
          </div>
        )}

        {/* Desktop 2-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Desktop Sidebar (3 cols) */}
          <div className="hidden lg:block lg:col-span-3 sticky top-24 bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
            <AccountSidebar />
          </div>

          {/* Main Outlet Content (9 cols) */}
          <div className="lg:col-span-9 min-w-0">
            <Outlet />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
