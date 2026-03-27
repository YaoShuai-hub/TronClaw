import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ExternalLink, Loader2 } from 'lucide-react'
import { useWallet } from '../stores/wallet.ts'

interface WalletOption {
  id: string
  name: string
  icon: string  // emoji or URL placeholder
  color: string
  available: boolean
}

const WALLETS: WalletOption[] = [
  { id: 'tronlink', name: 'TronLink', icon: '🔵', color: '#2196F3', available: true },
  { id: 'tokenpocket', name: 'TokenPocket', icon: '🟠', color: '#F97316', available: false },
  { id: 'okx', name: 'OKX Wallet', icon: '⚪', color: '#A1A1AA', available: false },
  { id: 'bitget', name: 'BitGet Wallet', icon: '🔷', color: '#3B82F6', available: false },
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
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-text-0">Connect Wallet</h2>
              <button onClick={onClose} className="text-text-3 hover:text-text-0 transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Wallet list */}
            <div className="space-y-2 mb-4">
              {WALLETS.map(wallet => (
                <button
                  key={wallet.id}
                  onClick={() => handleConnect(wallet)}
                  disabled={!wallet.available || connecting}
                  className={`w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all duration-200
                    ${wallet.available
                      ? 'border-white/[0.06] bg-bg-3 hover:border-brand/30 hover:bg-bg-4 cursor-pointer'
                      : 'border-white/[0.04] bg-bg-2 opacity-40 cursor-not-allowed'
                    }`}
                >
                  <span className="text-xl w-8 text-center">{wallet.icon}</span>
                  <span className="font-medium text-sm text-text-0">{wallet.name}</span>
                  {connectingId === wallet.id && (
                    <Loader2 size={14} className="ml-auto text-brand animate-spin" />
                  )}
                  {!wallet.available && (
                    <span className="ml-auto text-[10px] text-text-3">Coming soon</span>
                  )}
                  {wallet.available && connectingId !== wallet.id && (
                    <span className="ml-auto text-[10px] text-brand opacity-0 group-hover:opacity-100">Connect</span>
                  )}
                </button>
              ))}
            </div>

            {/* Error */}
            {error && (
              <div className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2 mb-3">
                {error}
              </div>
            )}

            {/* Footer */}
            <div className="text-center">
              <p className="text-[10px] text-text-3">
                By connecting, you agree to interact with TRON Nile testnet.
              </p>
              <a href="https://nileex.io/join/getJoinPage" target="_blank" rel="noopener"
                className="text-[10px] text-brand/70 hover:text-brand transition-colors inline-flex items-center gap-1 mt-1">
                Get testnet tokens <ExternalLink size={8} />
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
