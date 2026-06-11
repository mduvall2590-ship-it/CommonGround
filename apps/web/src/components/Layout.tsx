import { NavLink, Outlet } from 'react-router-dom'
import { Home, Vote, DollarSign, Wrench, Lightbulb, Menu, X, LogOut } from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { to: '/', label: 'Dashboard', icon: Home, mobileIcon: '🏠' },
  { to: '/governance', label: 'Governance', icon: Vote, mobileIcon: '🗳️' },
  { to: '/ledger', label: 'Ledger', icon: DollarSign, mobileIcon: '💰' },
]

export default function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-brand-surface flex flex-col">
      {/* Desktop Header */}
      <header className="bg-brand-primary text-white hidden md:block">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <NavLink to="/" className="flex items-center gap-3 shrink-0">
                <svg width="32" height="32" viewBox="0 0 32 32" className="shrink-0">
                  <polygon points="16,2 30,12 30,30 2,30 2,12" fill="white" opacity="0.9"/>
                  <polygon points="16,6 26,14 26,26 6,26 6,14" fill="#0D7C8C" opacity="0.9"/>
                  <rect x="13" y="17" width="6" height="9" fill="white" rx="1"/>
                </svg>
                <span className="text-lg font-bold tracking-wide">CommonGround</span>
              </NavLink>
              <nav className="flex items-center gap-1">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'text-white/70 hover:text-white hover:bg-white/10'
                      }`
                    }
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </NavLink>
                ))}
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-white/60">Sarah · Resident</span>
              <button className="flex items-center gap-2 text-white/70 hover:text-white hover:bg-white/10 px-3 py-2 rounded-md text-sm transition-colors">
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="bg-brand-primary text-white md:hidden">
        <div className="flex items-center justify-between px-4 h-14">
          <NavLink to="/" className="flex items-center gap-2">
            <svg width="28" height="28" viewBox="0 0 32 32" className="shrink-0">
              <polygon points="16,2 30,12 30,30 2,30 2,12" fill="white" opacity="0.9"/>
              <polygon points="16,6 26,14 26,26 6,26 6,14" fill="#0D7C8C" opacity="0.9"/>
              <rect x="13" y="17" width="6" height="9" fill="white" rx="1"/>
            </svg>
            <span className="font-bold tracking-wide">CommonGround</span>
          </NavLink>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-white/80 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="px-4 pb-4 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </NavLink>
            ))}
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-brand-border-light z-50">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-3 py-2 text-xs font-medium transition-colors ${
                  isActive
                    ? 'text-brand-primary'
                    : 'text-[#8B959E] hover:text-brand-primary'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className="text-lg">{item.mobileIcon}</span>
                  <span className="text-[10px]">{item.label}</span>
                  {isActive && <div className="w-1 h-1 rounded-full bg-brand-accent mt-0.5" />}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Bottom padding for mobile tab bar */}
      <div className="md:hidden h-16" />
    </div>
  )
}