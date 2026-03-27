import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ExternalLink, Loader2 } from 'lucide-react'
import { useWallet } from '../stores/wallet.ts'

interface WalletOption {
  id: string
  name: string
  logo: string  // inline SVG data URI
  available: boolean
}

// Recognizable wallet icons as inline SVGs
const WALLETS: WalletOption[] = [
  {
    id: 'tronlink',
    name: 'TronLink',
    available: true,
    // TronLink: blue circle with white "T" bolt
    logo: `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><defs><linearGradient id="tl" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#2196F3"/><stop offset="100%" stop-color="#1565C0"/></linearGradient></defs><circle cx="20" cy="20" r="19" fill="url(#tl)"/><path d="M13 10 L28 10 L21 20 L26 20 L15 32 L18 22 L13 22Z" fill="#fff"/></svg>`)}`,
  },
  {
    id: 'tokenpocket',
    name: 'TokenPocket',
    available: false,
    // TokenPocket: blue rounded square with "TP"
    logo: `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" rx="10" fill="#2979FF"/><text x="20" y="26" text-anchor="middle" font-family="Arial,sans-serif" font-size="14" font-weight="bold" fill="#fff">TP</text></svg>`)}`,
  },
  {
    id: 'okx',
    name: 'OKX Wallet',
    available: false,
    // OKX: black circle with white grid squares
    logo: `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><circle cx="20" cy="20" r="19" fill="#000"/><rect x="10" y="10" width="8" height="8" rx="1" fill="#fff"/><rect x="22" y="10" width="8" height="8" rx="1" fill="#fff"/><rect x="10" y="22" width="8" height="8" rx="1" fill="#fff"/><rect x="22" y="22" width="8" height="8" rx="1" fill="#fff"/><rect x="16" y="16" width="8" height="8" rx="1" fill="#000" stroke="#fff" stroke-width="1"/></svg>`)}`,
  },
  {
    id: 'bitget',
    name: 'BitGet Wallet',
    available: false,
    // BitGet: blue gradient circle with "B" mark
    logo: `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#00D1FF"/><stop offset="100%" stop-color="#0052FF"/></linearGradient></defs><circle cx="20" cy="20" r="19" fill="url(#bg)"/><path d="M14 12 L22 12 Q28 12 28 18 Q28 21 25 22 Q29 23 29 27 Q29 32 23 32 L14 32 L14 24 L22 24 Q25 24 25 27 Q25 29 22 29 L18 29 L18 15 L22 15 Q24 15 24 18 Q24 20 22 20 L18 20 L18 12Z" fill="#fff" fill-rule="evenodd"/></svg>`)}`,
  },
  {
    id: 'walletconnect',
    name: 'WalletConnect',
    available: false,
    // WalletConnect: blue with bridge icon
    logo: `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><circle cx="20" cy="20" r="19" fill="#3B99FC"/><path d="M11 17 Q20 10 29 17" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M14 21 Q20 16 26 21" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/><circle cx="20" cy="25" r="2" fill="#fff"/></svg>`)}`,
  },
]

interface Props {
  open: boolean
  onClose: () => void
}

export default function WalletModal({ open, onClose }: Props) {
  const { connect, connecting } = useWallet()
  const [error, setError] = useState('')
  const [connectingId, setConnectingId] = useState('')

  const handleConnect = async (wallet: WalletOption) => {
    if (!wallet.available) return
    setError('')
    setConnectingId(wallet.id)
    try {
      await connect(wallet.id)
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Connection failed')
    } finally {
      setConnectingId('')
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-sm mx-4 glass-card p-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-text-0">Connect Wallet</h2>
              <button onClick={onClose} className="w-8 h-8 rounded-lg bg-bg-4 flex items-center justify-center text-text-3 hover:text-text-0 transition-colors">
                <X size={16} />
              </button>
            </div>
            <p className="text-xs text-text-3 mb-5">Select a wallet to connect to TronClaw</p>

            {/* Wallet list */}
            <div className="space-y-2 mb-4">
              {WALLETS.map(wallet => (
                <button
                  key={wallet.id}
                  onClick={() => handleConnect(wallet)}
                  disabled={!wallet.available || connecting}
                  className={`w-full flex items-center gap-3.5 p-3.5 rounded-xl border transition-all duration-200
                    ${wallet.available
                      ? 'border-white/[0.06] bg-bg-3 hover:border-brand/30 hover:bg-bg-4 cursor-pointer'
                      : 'border-white/[0.04] bg-bg-2/50 opacity-50 cursor-not-allowed'
                    }`}
                >
                  <img src={wallet.logo} alt={wallet.name} className="w-9 h-9 rounded-xl" />
                  <div className="flex-1 text-left">
                    <div className="font-medium text-sm text-text-0">{wallet.name}</div>
                    {!wallet.available && <div className="text-[10px] text-text-3">Coming soon</div>}
                    {wallet.available && wallet.id === 'tronlink' && <div className="text-[10px] text-accent">Recommended</div>}
                  </div>
                  {connectingId === wallet.id && (
                    <Loader2 size={16} className="text-brand animate-spin" />
                  )}
                  {wallet.available && connectingId !== wallet.id && (
                    <div className="w-2 h-2 rounded-full bg-accent/40" />
                  )}
                </button>
              ))}
            </div>

            {/* Error */}
            {error && (
              <div className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-3 py-2.5 mb-3">
                {error}
              </div>
            )}

            {/* Footer */}
            <div className="pt-3 border-t border-white/[0.04] text-center space-y-1.5">
              <p className="text-[10px] text-text-3">
                Interacting with TRON Nile testnet. No real funds required.
              </p>
              <a href="https://nileex.io/join/getJoinPage" target="_blank" rel="noopener"
                className="text-[10px] text-brand/70 hover:text-brand transition-colors inline-flex items-center gap-1">
                Get free testnet tokens <ExternalLink size={8} />
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
