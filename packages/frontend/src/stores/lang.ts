import { create } from 'zustand'

type Lang = 'en' | 'zh'

const TRANSLATIONS = {
  en: {
    connect: 'Connect',
    disconnect: 'Disconnect',
    copyAddress: 'Copy Address',
    copied: 'Copied!',
    viewOnTronScan: 'View on TronScan',
    connectWallet: 'Connect Wallet',
    selectWallet: 'Select a wallet to connect to TronClaw',
    recommended: 'Recommended',
    comingSoon: 'Coming soon',
    noFundsNeeded: 'Interacting with TRON Nile testnet. No real funds required.',
    getFreeTokens: 'Get free testnet tokens',
    installWallet: 'Install',
    chat: 'Chat',
    dashboard: 'Dashboard',
    agents: 'Agents',
    explorer: 'Explorer',
    overview: 'Overview',
    market: 'Market',
    defi: 'DeFi',
    data: 'Data',
    auto: 'Automation',
    nileTestnet: 'Nile Testnet',
    walletNotFound: 'Wallet not installed. Click to install.',
    connectionFailed: 'Connection failed',
    tronScan: 'TronScan',
  },
  zh: {
    connect: '连接钱包',
    disconnect: '断开连接',
    copyAddress: '复制地址',
    copied: '已复制！',
    viewOnTronScan: '在 TronScan 查看',
    connectWallet: '连接钱包',
    selectWallet: '选择钱包连接到 TronClaw',
    recommended: '推荐',
    comingSoon: '即将支持',
    noFundsNeeded: '连接到 TRON Nile 测试网，无需真实资金。',
    getFreeTokens: '获取测试网代币',
    installWallet: '安装',
    chat: '对话',
    dashboard: '仪表盘',
    agents: 'Agent 市场',
    explorer: '链上浏览器',
    overview: '总览',
    market: '服务市场',
    defi: 'DeFi 顾问',
    data: '链上数据',
    auto: '自动化',
    nileTestnet: 'Nile 测试网',
    walletNotFound: '未检测到钱包，点击安装。',
    connectionFailed: '连接失败',
    tronScan: 'TronScan 浏览器',
  },
} as const

type TranslationKey = keyof typeof TRANSLATIONS['en']

interface LangState {
  lang: Lang
  t: (key: TranslationKey) => string
  toggle: () => void
  setLang: (lang: Lang) => void
}

export const useLang = create<LangState>((set, get) => ({
  lang: (localStorage.getItem('tronclaw_lang') as Lang) ?? 'en',
  t: (key) => TRANSLATIONS[get().lang][key],
  toggle: () => {
    const next = get().lang === 'en' ? 'zh' : 'en'
    localStorage.setItem('tronclaw_lang', next)
    set({ lang: next })
  },
  setLang: (lang) => {
    localStorage.setItem('tronclaw_lang', lang)
    set({ lang })
  },
}))
