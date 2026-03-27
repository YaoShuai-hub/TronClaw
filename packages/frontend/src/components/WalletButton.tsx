import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Wallet, LogOut, ExternalLink, Copy, Check, Globe, Loader2, ChevronDown } from 'lucide-react'
import { useWallet } from '../stores/wallet.ts'
import { useLang } from '../stores/lang.ts'

const TRONSCAN = 'https://nile.tronscan.org/#'

const WALLETS = [
  {
    id: 'tronlink', name: 'TronLink', installUrl: 'https://www.tronlink.org/',
    logo: `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><defs><linearGradient id="a" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#2196F3"/><stop offset="100%" stop-color="#0D47A1"/></linearGradient></defs><circle cx="16" cy="16" r="16" fill="url(#a)"/><path d="M9 7h14l-3 7h3L11 27l2-9H9z" fill="#fff"/></svg>`)}`,
  },
  {
    id: 'tokenpocket', name: 'TokenPocket', installUrl: 'https://www.tokenpocket.pro/',
    logo: `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="#2980FE"/><rect x="6" y="8" width="8" height="16" rx="2" fill="#fff" opacity="0.9"/><rect x="18" y="8" width="8" height="10" rx="2" fill="#fff" opacity="0.9"/><rect x="18" y="21" width="8" height="3" rx="1.5" fill="#fff" opacity="0.6"/></svg>`)}`,
  },
  {
    id: 'okx', name: 'OKX Wallet', installUrl: 'https://www.okx.com/web3',
    logo: `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="#000"/><rect x="6" y="6" width="8" height="8" rx="1.5" fill="#fff"/><rect x="18" y="6" width="8" height="8" rx="1.5" fill="#fff"/><rect x="12" y="12" width="8" height="8" rx="1.5" fill="#fff"/><rect x="6" y="18" width="8" height="8" rx="1.5" fill="#fff"/><rect x="18" y="18" width="8" height="8" rx="1.5" fill="#fff"/></svg>`)}`,
  },
  {
    id: 'bitget', name: 'Bitget Wallet', installUrl: 'https://web3.bitget.com/',
    logo: `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#00C4FF"/><stop offset="100%" stop-color="#0047FF"/></linearGradient></defs><circle cx="16" cy="16" r="16" fill="url(#bg)"/><path d="M10 9h7q3.5 0 3.5 3.5 0 1.5-1.5 2.5 2.5 1 2.5 4 0 4-4 4H10V9zm3 2.5v4h3.5q1.5 0 1.5-2T16.5 11.5H13zm0 6.5v4.5h4q1.5 0 1.5-2.25T17 18H13z" fill="#fff"/></svg>`)}`,
  },
  {
    id: 'imtoken', name: 'imToken', installUrl: 'https://token.im/',
    logo: `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><defs><linearGradient id="im" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#11C4D1"/><stop offset="100%" stop-color="#0062AD"/></linearGradient></defs><circle cx="16" cy="16" r="16" fill="url(#im)"/><circle cx="16" cy="11" r="3.5" fill="#fff"/><path d="M8 26c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round"/></svg>`)}`,
  },
  {
    id: 'trustwallet', name: 'Trust Wallet', installUrl: 'https://trustwallet.com/',
    logo: `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><defs><linearGradient id="tw" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#3375BB"/><stop offset="100%" stop-color="#1A4E8C"/></linearGradient></defs><circle cx="16" cy="16" r="16" fill="url(#tw)"/><path d="M16 6L24 10V19Q24 25 16 28Q8 25 8 19V10Z" fill="#fff" opacity="0.85"/><path d="M12 17l3 3 6-6" stroke="#3375BB" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`)}`,
  },
]

export default function WalletButton() {
  const { address, connected, walletName, disconnect, connect, connecting } = useWallet()
  const { t } = useLang()
  const [showDropdown, setShowDropdown] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')
  const [connectingId, setConnectingId] = useState('')
  const dropRef = useRef<HTMLDivElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node) &&
          btnRef.current && !btnRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
        setError('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleConnect = async (walletId: string, installUrl: string) => {
    setError('')
    setConnectingId(walletId)
    try {
      await connect(walletId)
      setShowDropdown(false)
    } catch (e) {
      const msg = e instanceof Error ? e.message : t('connectionFailed')
      if (msg.toLowerCase().includes('not installed')) {
        window.open(installUrl, '_blank')
        setError(`${t('installWallet')} ${WALLETS.find(w => w.id === walletId)?.name}`)
      } else {
        setError(msg)
      }
    } finally {
      setConnectingId('')
    }
  }

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="relative">
      {/* Main button */}
      {connected ? (
        <button ref={btnRef} onClick={() => setShowDropdown(v => !v)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-bg-3 border border-accent/20 hover:border-accent/40 transition-all text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span className="font-mono text-text-1">{address!.slice(0, 4)}...{address!.slice(-4)}</span>
          <motion.span animate={{ rotate: showDropdown ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown size={11} className="text-text-3" />
          </motion.span>
        </button>
      ) : (
        <button ref={btnRef} onClick={() => { setShowDropdown(v => !v); setError('') }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/[0.08] bg-bg-3 hover:border-brand/40 hover:bg-bg-4 transition-all text-sm text-text-1 font-medium">
          <Wallet size={15} className="text-text-2" />
          <span>{t('connect')}</span>
          <motion.span animate={{ rotate: showDropdown ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown size={11} className="text-text-3" />
          </motion.span>
        </button>
      )}

      {/* Dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            ref={dropRef}
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-52 glass-card p-2 z-50"
          >
            {connected ? (
              // Connected: address actions
              <>
                <div className="px-3 py-2 mb-1 border-b border-white/[0.04]">
                  <div className="text-[10px] text-text-3">{walletName}</div>
                  <div className="font-mono text-[11px] text-text-1 truncate mt-0.5">{address}</div>
                </div>
                <button onClick={copyAddress}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-text-2 hover:bg-bg-4 hover:text-text-0 transition-colors">
                  {copied ? <Check size={12} className="text-accent" /> : <Copy size={12} />}
                  {copied ? t('copied') : t('copyAddress')}
                </button>
                <a href={`${TRONSCAN}/address/${address}`} target="_blank" rel="noopener"
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-text-2 hover:bg-bg-4 hover:text-text-0 transition-colors">
                  <ExternalLink size={12} /> {t('viewOnTronScan')}
                </a>
                <div className="h-px bg-white/[0.04] mx-1 my-1" />
                <button onClick={() => { disconnect(); setShowDropdown(false) }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-red-400 hover:bg-red-400/10 transition-colors">
                  <LogOut size={12} /> {t('disconnect')}
                </button>
              </>
            ) : (
              // Not connected: wallet list
              <>
                <div className="px-3 py-2 border-b border-white/[0.04] mb-1">
                  <p className="text-[11px] font-semibold text-text-0">{t('connectWallet')}</p>
                </div>
                {WALLETS.map(w => (
                  <button key={w.id} onClick={() => handleConnect(w.id, w.installUrl)}
                    disabled={!!connecting}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-bg-4 transition-colors text-xs text-text-1 disabled:opacity-60">
                    <img src={w.logo} alt={w.name} className="w-6 h-6 rounded-lg flex-shrink-0" />
                    <span className="font-medium flex-1 text-left">{w.name}</span>
                    {connectingId === w.id && <Loader2 size={12} className="text-brand animate-spin" />}
                  </button>
                ))}
                {error && (
                  <div className="mt-1.5 mx-1 text-[10px] text-red-400 bg-red-400/10 rounded-lg px-2 py-1.5">
                    {error}
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function LangToggle() {
  const { lang, toggle } = useLang()
  return (
    <button onClick={toggle}
      className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/[0.06] bg-bg-3 hover:border-white/[0.15] transition-all text-xs text-text-2 hover:text-text-0 font-medium">
      <Globe size={13} />
      <span>{lang === 'en' ? 'EN' : '中文'}</span>
    </button>
  )
}
