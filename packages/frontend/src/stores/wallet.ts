import { create } from 'zustand'

interface WalletState {
  address: string | null
  connected: boolean
  walletName: string | null
  connecting: boolean
  connect: (walletType?: string) => Promise<void>
  disconnect: () => void
  setAddress: (addr: string | null) => void
}

export const useWallet = create<WalletState>((set, get) => ({
  address: null,
  connected: false,
  walletName: null,
  connecting: false,

  connect: async (walletType = 'tronlink') => {
    set({ connecting: true })
    try {
      // Check if TronLink (or compatible) is injected
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const win = window as any
      const tronWeb = win.tronWeb
      const tronLink = win.tronLink

      if (walletType === 'tronlink') {
        if (!tronLink && !tronWeb) {
          window.open('https://www.tronlink.org/', '_blank')
          throw new Error('TronLink not installed. Please install the extension.')
        }

        // Request account access
        if (tronLink?.request) {
          await (tronLink.request as (args: { method: string }) => Promise<unknown>)({ method: 'tron_requestAccounts' })
        }

        // Wait a moment for TronWeb injection
        await new Promise(r => setTimeout(r, 500))

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const tw = (window as any).tronWeb
        if (tw?.defaultAddress) {
          const addr = (tw.defaultAddress as Record<string, string>).base58
          if (addr) {
            set({ address: addr, connected: true, walletName: 'TronLink', connecting: false })
            localStorage.setItem('tronclaw_wallet', addr)
            localStorage.setItem('tronclaw_wallet_type', 'tronlink')
            return
          }
        }
        throw new Error('Failed to connect TronLink')
      }

      // For other wallets, show "coming soon" for now
      throw new Error(`${walletType} support coming soon`)
    } catch (e) {
      set({ connecting: false })
      throw e
    }
  },

  disconnect: () => {
    set({ address: null, connected: false, walletName: null })
    localStorage.removeItem('tronclaw_wallet')
    localStorage.removeItem('tronclaw_wallet_type')
  },

  setAddress: (addr) => {
    set({ address: addr, connected: !!addr })
  },
}))

// Auto-reconnect on page load
export function initWallet() {
  const savedAddr = localStorage.getItem('tronclaw_wallet')
  const savedType = localStorage.getItem('tronclaw_wallet_type')
  if (savedAddr && savedType) {
    // Try to reconnect silently
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tw = (window as any).tronWeb
    if (tw?.defaultAddress) {
      const addr = (tw.defaultAddress as Record<string, string>).base58
      if (addr) {
        useWallet.getState().setAddress(addr)
        useWallet.setState({ walletName: savedType === 'tronlink' ? 'TronLink' : savedType, connected: true })
      }
    }
  }
}
