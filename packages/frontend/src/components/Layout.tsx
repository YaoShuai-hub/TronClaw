import { Outlet, NavLink } from 'react-router-dom'
import { MessageSquare, LayoutDashboard, Bot, Search } from 'lucide-react'

const NAV = [
  { to: '/chat', icon: MessageSquare, label: 'Chat' },
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/agents', icon: Bot, label: 'Agents' },
  { to: '/explorer', icon: Search, label: 'Explorer' },
]

export default function Layout() {
  return (
    <div className="flex h-screen bg-[#070d1a]">
      {/* Sidebar */}
      <aside className="w-16 md:w-56 flex flex-col border-r border-white/5 bg-[#0a1220]">
        {/* Logo */}
        <div className="p-4 border-b border-white/5">
          <NavLink to="/" className="flex items-center gap-2">
            <span className="text-2xl">🦀</span>
            <span className="hidden md:block font-bold text-green-400 text-lg">TronClaw</span>
          </NavLink>
        </div>
        {/* Nav */}
        <nav className="flex-1 p-2 space-y-1">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors
                ${isActive
                  ? 'bg-green-500/10 text-green-400'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <Icon size={18} />
              <span className="hidden md:block">{label}</span>
            </NavLink>
          ))}
        </nav>
        {/* Network badge */}
        <div className="p-4 border-t border-white/5">
          <div className="hidden md:flex items-center gap-2 text-xs text-gray-500">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Nile Testnet
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  )
}
