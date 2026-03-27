import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { MessageSquare, LayoutDashboard, Bot, Search, ExternalLink } from 'lucide-react'
import WalletButton, { LangToggle } from './WalletButton.tsx'
import { useLang } from '../stores/lang.ts'

export default function Layout() {
  const location = useLocation()
  const { t } = useLang()

  const NAV = [
    { to: '/chat', icon: MessageSquare, label: t('chat') },
    { to: '/dashboard', icon: LayoutDashboard, label: t('dashboard') },
    { to: '/agents', icon: Bot, label: t('agents') },
    { to: '/explorer', icon: Search, label: t('explorer') },
  ]

  return (
    <div className="flex h-screen bg-bg-0">
      {/* Sidebar */}
      <aside className="w-[68px] lg:w-[200px] flex flex-col border-r border-white/[0.06] bg-bg-1">
        {/* Logo */}
        <NavLink to="/" className="flex items-center gap-3 px-4 h-14 border-b border-white/[0.06]">
          <img src="/logo.svg" alt="TronClaw" className="w-7 h-7" />
          <span className="hidden lg:block font-bold text-sm gradient-text">TronClaw</span>
        </NavLink>

        {/* Nav */}
        <nav className="flex-1 p-2.5 space-y-1">
          {NAV.map(({ to, icon: Icon, label }) => {
            const active = location.pathname === to
            return (
              <NavLink key={to} to={to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200
                  ${active
                    ? 'bg-brand/10 text-brand border border-brand/20'
                    : 'text-text-2 hover:text-text-0 hover:bg-white/[0.03] border border-transparent'
                  }`}>
                <Icon size={17} strokeWidth={active ? 2.2 : 1.8} />
                <span className="hidden lg:block">{label}</span>
              </NavLink>
            )
          })}
        </nav>

        {/* Bottom: network status */}
        <div className="p-3 border-t border-white/[0.06]">
          <div className="hidden lg:flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-[11px] text-text-3">{t('nileTestnet')}</span>
          </div>
          <a href="https://nile.tronscan.org" target="_blank" rel="noopener"
            className="hidden lg:flex items-center gap-1 mt-1.5 text-[10px] text-text-3 hover:text-brand transition-colors">
            {t('tronScan')} <ExternalLink size={9} />
          </a>
        </div>
      </aside>

      {/* Right section */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-14 flex items-center justify-end gap-3 px-5 border-b border-white/[0.06] bg-bg-1/50 backdrop-blur-sm flex-shrink-0">
          <LangToggle />
          <WalletButton />
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-hidden bg-bg-0">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
