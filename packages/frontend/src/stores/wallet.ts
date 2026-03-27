import { create } from 'zustand'

interface WalletState {
  address: string | null
  connected: boolean
  walletName: string | null
  connecting: boolean
  connect: (walletType: string) => Promise<void>
  disconnect: () => void
  setAddress: (addr: string | null, name?: string) => void
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getWin = () => window as any

export const useWallet = create<WalletState>((set) => ({
  address: null,
  connected: false,
  walletName: null,
  connecting: false,

  connect: async (walletType: string) => {
    set({ connecting: true })
    try {
      const win = getWin()

      switch (walletType) {

        case 'tronlink': {
          if (!win.tronLink && !win.tronWeb) {
            window.open('https://www.tronlink.org/', '_blank')
            throw new Error('TronLink not installed. Please install and try again.')
          }
          if (win.tronLink?.request) {
            await win.tronLink.request({ method: 'tron_requestAccounts' })
          }
          await new Promise(r => setTimeout(r, 600))
          const addr = win.tronWeb?.defaultAddress?.base58
          if (!addr) throw new Error('Could not get address from TronLink')
          set({ address: addr, connected: true, walletName: 'TronLink', connecting: false })
          localStorage.setItem('tronclaw_wallet', addr)
          localStorage.setItem('tronclaw_wallet_type', 'TronLink')
          return
        }

        case 'tokenpocket': {
          // TokenPocket also injects window.tronWeb / window.tronLink on TRON
          if (!win.tronWeb && !win.tronLink) {
            window.open('https://www.tokenpocket.pro/', '_blank')
            throw new Error('TokenPocket not installed.')
          }
          if (win.tronLink?.request) {
            await win.tronLink.request({ method: 'tron_requestAccounts' })
          }
          await new Promise(r => setTimeout(r, 600))
          const addr = win.tronWeb?.defaultAddress?.base58
          if (!addr) throw new Error('Could not get address from TokenPocket')
          set({ address: addr, connected: true, walletName: 'TokenPocket', connecting: false })
          localStorage.setItem('tronclaw_wallet', addr)
          localStorage.setItem('tronclaw_wallet_type', 'TokenPocket')
          return
        }

        case 'okx': {
          // OKX wallet injects window.okxwallet or window.tronLink
          const okx = win.okxwallet?.tronLink ?? win.tronLink
          if (!okx) {
            window.open('https://www.okx.com/web3', '_blank')
            throw new Error('OKX Wallet not installed.')
          }
          if (okx.request) {
            await okx.request({ method: 'tron_requestAccounts' })
          }
          await new Promise(r => setTimeout(r, 600))
          const addr = okx.tronWeb?.defaultAddress?.base58 ?? win.tronWeb?.defaultAddress?.base58
          if (!addr) throw new Error('Could not get address from OKX Wallet')
          set({ address: addr, connected: true, walletName: 'OKX Wallet', connecting: false })
          localStorage.setItem('tronclaw_wallet', addr)
          localStorage.setItem('tronclaw_wallet_type', 'OKX Wallet')
          return
        }

        case 'bitget': {
          // BitGet Wallet injects window.bitkeep / window.tronLink
          const bitget = win.bitkeep?.tronWeb ?? win.tronLink
          if (!bitget) {
            window.open('https://web3.bitget.com/', '_blank')
            throw new Error('BitGet Wallet not installed.')
          }
          if (win.tronLink?.request) {
            await win.tronLink.request({ method: 'tron_requestAccounts' })
          }
          await new Promise(r => setTimeout(r, 600))
          const addr = win.tronWeb?.defaultAddress?.base58
          if (!addr) throw new Error('Could not get address from BitGet Wallet')
          set({ address: addr, connected: true, walletName: 'BitGet Wallet', connecting: false })
          localStorage.setItem('tronclaw_wallet', addr)
          localStorage.setItem('tronclaw_wallet_type', 'BitGet Wallet')
          return
        }

        case 'imtoken': {
          if (!win.tronWeb && !win.tronLink) {
            window.open('https://token.im/', '_blank')
            throw new Error('imToken not installed.')
          }
          await new Promise(r => setTimeout(r, 400))
          const addr = win.tronWeb?.defaultAddress?.base58
          if (!addr) throw new Error('Could not get address from imToken')
          set({ address: addr, connected: true, walletName: 'imToken', connecting: false })
          localStorage.setItem('tronclaw_wallet', addr)
          localStorage.setItem('tronclaw_wallet_type', 'imToken')
          return
        }

        case 'trustwallet': {
          const tw = win.trustwallet ?? win.tronLink
          if (!tw) {
            window.open('https://trustwallet.com/', '_blank')
            throw new Error('Trust Wallet not installed.')
          }
          if (tw.request) await tw.request({ method: 'tron_requestAccounts' })
          await new Promise(r => setTimeout(r, 600))
          const addr = win.tronWeb?.defaultAddress?.base58
          if (!addr) throw new Error('Could not get address from Trust Wallet')
          set({ address: addr, connected: true, walletName: 'Trust Wallet', connecting: false })
          localStorage.setItem('tronclaw_wallet', addr)
          localStorage.setItem('tronclaw_wallet_type', 'Trust Wallet')
          return
        }

        default:
          throw new Error(`Wallet ${walletType} not supported yet`)
      }
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

  setAddress: (addr, name) => {
    set({ address: addr, connected: !!addr, walletName: name ?? null })
  },
}))

export function initWallet() {
  const savedAddr = localStorage.getItem('tronclaw_wallet')
  const savedName = localStorage.getItem('tronclaw_wallet_type')
  if (savedAddr && savedName) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const addr = (window as any).tronWeb?.defaultAddress?.base58
    if (addr) {
      useWallet.getState().setAddress(addr, savedName)
    }
  }
}
