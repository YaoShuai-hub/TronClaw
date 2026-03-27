import { useState } from 'react'
import { Wallet, ChevronDown, LogOut, ExternalLink, Copy, Check, Globe } from 'lucide-react'
import { useWallet } from '../stores/wallet.ts'
import WalletModal from './WalletModal.tsx'

const TRONSCAN = 'https://nile.tronscan.org/#'

export default function WalletButton() {
  const { address, connected, walletName, disconnect } = useWallet()
  const [showModal, setShowModal] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [copied, setCopied] = useState(false)

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (!connected) {
    return (
      <>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/[0.08] bg-bg-3 hover:border-brand/30 hover:bg-bg-4 transition-all text-sm text-text-1">
          <Wallet size={15} className="text-text-2" />
          <span className="hidden sm:inline">Connect</span>
        </button>
        <WalletModal open={showModal} onClose={() => setShowModal(false)} />
      </>
    )
  }

  return (
    <div className="relative">
      <button onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-bg-3 border border-accent/20 hover:border-accent/40 transition-all text-xs">
        <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
        <span className="font-mono text-text-1">{address!.slice(0, 4)}...{address!.slice(-4)}</span>
        <ChevronDown size={12} className="text-text-3" />
      </button>

      {showMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
          <div className="absolute right-0 top-full mt-2 w-56 glass-card p-2 z-50 animate-fade-in">
            <div className="px-3 py-2 mb-1">
              <div className="text-[10px] text-text-3 mb-0.5">{walletName}</div>
              <div className="font-mono text-xs text-text-1 truncate">{address}</div>
            </div>
            <div className="h-px bg-white/[0.04] mx-2 my-1" />
            <button onClick={copyAddress}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-text-2 hover:bg-bg-4 hover:text-text-0 transition-colors">
              {copied ? <Check size={13} className="text-accent" /> : <Copy size={13} />}
              {copied ? 'Copied!' : 'Copy Address'}
            </button>
            <a href={`${TRONSCAN}/address/${address}`} target="_blank" rel="noopener"
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-text-2 hover:bg-bg-4 hover:text-text-0 transition-colors">
              <ExternalLink size={13} /> View on TronScan
            </a>
            <div className="h-px bg-white/[0.04] mx-2 my-1" />
            <button onClick={() => { disconnect(); setShowMenu(false) }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-red-400 hover:bg-red-400/10 transition-colors">
              <LogOut size={13} /> Disconnect
            </button>
          </div>
        </>
      )}
    </div>
  )
}

// Language toggle button
export function LangToggle() {
  const [lang, setLang] = useState<'en' | 'zh'>('en')
  return (
    <button
      onClick={() => setLang(l => l === 'en' ? 'zh' : 'en')}
      className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/[0.06] bg-bg-3 hover:border-white/[0.12] transition-all text-xs text-text-2 hover:text-text-0"
    >
      <Globe size={13} />
      <span>{lang === 'en' ? 'EN' : '中'}</span>
    </button>
  )
}
