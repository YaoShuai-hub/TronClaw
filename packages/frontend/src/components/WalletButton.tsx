import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Wallet, LogOut, ExternalLink, Copy, Check, Globe } from 'lucide-react'
import { useWallet } from '../stores/wallet.ts'
import { useLang } from '../stores/lang.ts'
import WalletModal from './WalletModal.tsx'

const TRONSCAN = 'https://nile.tronscan.org/#'

export default function WalletButton() {
  const { address, connected, walletName, disconnect } = useWallet()
  const { t } = useLang()
  const [showModal, setShowModal] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [copied, setCopied] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)

  // Close menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node) &&
          btnRef.current && !btnRef.current.contains(e.target as Node)) {
        setShowMenu(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

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
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/[0.08] bg-bg-3 hover:border-brand/40 hover:bg-bg-4 transition-all text-sm text-text-1 font-medium"
        >
          <Wallet size={15} className="text-text-2" />
          <span>{t('connect')}</span>
        </button>
        <WalletModal open={showModal} onClose={() => setShowModal(false)} />
      </>
    )
  }

  return (
    <div className="relative">
      <button
        ref={btnRef}
        onClick={() => setShowMenu(v => !v)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-bg-3 border border-accent/20 hover:border-accent/40 transition-all text-xs font-medium"
      >
        <span className="w-2 h-2 rounded-full bg-accent animate-pulse flex-shrink-0" />
        <span className="font-mono text-text-1">{address!.slice(0, 4)}...{address!.slice(-4)}</span>
        <motion.div animate={{ rotate: showMenu ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
        </motion.div>
      </button>

      <AnimatePresence>
        {showMenu && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-56 glass-card p-2 z-50"
          >
            <div className="px-3 py-2.5 mb-1 border-b border-white/[0.04]">
              <div className="text-[10px] text-text-3 mb-0.5">{walletName}</div>
              <div className="font-mono text-xs text-text-1 truncate">{address}</div>
            </div>
            <button onClick={copyAddress}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-text-2 hover:bg-bg-4 hover:text-text-0 transition-colors">
              {copied ? <Check size={13} className="text-accent" /> : <Copy size={13} />}
              {copied ? t('copied') : t('copyAddress')}
            </button>
            <a href={`${TRONSCAN}/address/${address}`} target="_blank" rel="noopener"
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-text-2 hover:bg-bg-4 hover:text-text-0 transition-colors">
              <ExternalLink size={13} /> {t('viewOnTronScan')}
            </a>
            <div className="h-px bg-white/[0.04] mx-1 my-1" />
            <button onClick={() => { disconnect(); setShowMenu(false) }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-red-400 hover:bg-red-400/10 transition-colors">
              <LogOut size={13} /> {t('disconnect')}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function LangToggle() {
  const { lang, toggle } = useLang()
  return (
    <button
      onClick={toggle}
      className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/[0.06] bg-bg-3 hover:border-white/[0.15] transition-all text-xs text-text-2 hover:text-text-0 font-medium"
    >
      <Globe size={13} />
      <span>{lang === 'en' ? 'EN' : '中文'}</span>
    </button>
  )
}
