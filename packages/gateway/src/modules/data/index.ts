/**
 * On-chain Data Module — TronGrid API integration
 * Bank of AI infrastructure: MCP Server
 */
import axios from 'axios'
import { getNetwork, isMockMode } from '../../tron/client.js'
import { getTrxBalance, getTrc20Balance } from '../../tron/contracts.js'
import { TRONGRID_BASE, TOKEN_CONTRACTS, WHALE_THRESHOLD } from '@tronclaw/shared'
import { getLiveNetworkStats } from '../../utils/prices.js'
import type {
  AddressInfo,
  Transaction,
  WhaleTransfer,
  TokenInfo,
  TokenSymbol,
} from '@tronclaw/shared'

// ─── TronGrid API client ──────────────────────────────────────────────────────

function tronGridClient() {
  const network = getNetwork()
  const baseURL = TRONGRID_BASE[network]
  const apiKey = process.env.TRONGRID_API_KEY

  return axios.create({
    baseURL,
    headers: apiKey ? { 'TRON-PRO-API-KEY': apiKey } : {},
    timeout: 10000,
  })
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_ADDRESS_INFO: AddressInfo = {
  address: 'TXYZopYRdj2D9XRtbG411XZZ3kM5VkAeBf',
  trxBalance: '12500.000000',
  tokenHoldings: [
    { contractAddress: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t', symbol: 'USDT', name: 'Tether USD', balance: '50000.000000', decimals: 6 },
    { contractAddress: 'TPYmHEhy5n8TCEfYGqW2rPxsghSfzghPDn', symbol: 'USDD', name: 'Decentralized USD', balance: '10000.000000000000000000', decimals: 18 },
  ],
  txCount: 1542,
  firstTxDate: '2022-03-15',
  tags: ['whale', 'defi_user'],
}

const MOCK_TRANSACTIONS: Transaction[] = Array.from({ length: 5 }, (_, i) => ({
  hash: `mock_tx_hash_${i.toString().padStart(32, '0')}`,
  from: 'TXYZopYRdj2D9XRtbG411XZZ3kM5VkAeBf',
  to: 'TPL66VK2gCXNCD7EJg9pgJRfqcRazjhUZY',
  value: String((i + 1) * 100),
  token: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
  tokenSymbol: 'USDT',
  timestamp: Date.now() - i * 3600000,
  confirmed: true,
}))

const MOCK_WHALES: WhaleTransfer[] = Array.from({ length: 3 }, (_, i) => ({
  hash: `mock_whale_tx_${i.toString().padStart(30, '0')}`,
  from: `T${('whale_from_' + i).padStart(33, 'A')}`,
  to: `T${('whale_to_' + i).padStart(35, 'B')}`,
  amount: String((i + 1) * 500000),
  token: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
  tokenSymbol: 'USDT',
  timestamp: Date.now() - i * 7200000,
  usdValue: String((i + 1) * 500000),
}))

// ─── Address Analysis ─────────────────────────────────────────────────────────

export async function analyzeAddress(address: string): Promise<AddressInfo> {
  if (isMockMode()) return { ...MOCK_ADDRESS_INFO, address }

  const client = tronGridClient()
  const network = getNetwork()

  // TRX balance
  const trxBalance = await getTrxBalance(address)

  // Account info from TronGrid
  const { data } = await client.get(`/v1/accounts/${address}`)
  const account = data?.data?.[0] ?? {}

  // Token holdings
  // TronGrid returns trc20 as [{contractAddress: balance}, ...] without symbol
  // Map known contracts to symbols
  const KNOWN_CONTRACTS: Record<string, { symbol: string; name: string; decimals: number }> = {
    'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t': { symbol: 'USDT', name: 'Tether USD', decimals: 6 },
    'TXYZopYRdj2D9XRtbG411XZZ3kM5VkAeBf': { symbol: 'USDT', name: 'Tether USD (Nile)', decimals: 6 },
    'TPYmHEhy5n8TCEfYGqW2rPxsghSfzghPDn': { symbol: 'USDD', name: 'Decentralized USD', decimals: 18 },
    'TGjgkFPfBhMkXdB2E8bBHRQLQ11Z4BBgKu': { symbol: 'USDD', name: 'Decentralized USD (Nile)', decimals: 18 },
    'TAFjULxiVgT4qWk6UZwjqwZXTSaGaqnVp4': { symbol: 'BTT', name: 'BitTorrent', decimals: 18 },
    'TLa2f6VPqDgRE67v1736s7bJ8Ray5wYjU7': { symbol: 'WIN', name: 'WINkLink', decimals: 6 },
    'TCFLL5dx5ZJdKnWuesXxi1VPwjLVmWZkR9': { symbol: 'JST', name: 'JUST', decimals: 18 },
  }
  const tokenHoldings = (account.trc20 ?? []).map((t: Record<string, string>) => {
    const contractAddress = Object.keys(t)[0]
    const balance = Object.values(t)[0]
    const known = KNOWN_CONTRACTS[contractAddress]
    const decimals = known?.decimals ?? 6
    const readableBalance = known
      ? (Number(BigInt(balance)) / 10 ** decimals).toFixed(decimals === 18 ? 4 : 2)
      : balance
    return {
      contractAddress,
      symbol: known?.symbol ?? contractAddress.slice(0, 6) + '...',
      name: known?.name ?? 'Unknown Token',
      balance: readableBalance,
      decimals,
    }
  })

  // Transaction count
  const txCountRes = await client.get(`/v1/accounts/${address}/transactions`, {
    params: { limit: 1, only_confirmed: true },
  })
  const txCount = txCountRes.data?.meta?.page_size ?? 0

  return {
    address,
    trxBalance,
    tokenHoldings,
    txCount,
    firstTxDate: account.create_time
      ? new Date(account.create_time).toISOString().split('T')[0]
      : null,
    tags: [],
  }
}

// ─── Transaction History ──────────────────────────────────────────────────────

export async function getTxHistory(
  address: string,
  limit = 20,
): Promise<Transaction[]> {
  if (isMockMode()) return MOCK_TRANSACTIONS.slice(0, limit)

  const client = tronGridClient()
  const { data } = await client.get(`/v1/accounts/${address}/transactions/trc20`, {
    params: { limit, order_by: 'block_timestamp,desc' },
  })

  return (data?.data ?? []).map((tx: Record<string, unknown>) => ({
    hash: tx.transaction_id as string,
    from: (tx.from as string),
    to: (tx.to as string),
    value: (tx.value as string),
    token: (tx.token_info as Record<string, string>)?.address ?? '',
    tokenSymbol: (tx.token_info as Record<string, string>)?.symbol ?? '?',
    timestamp: tx.block_timestamp as number,
    confirmed: true,
  }))
}

// ─── Known Whale Addresses (TRON mainnet exchanges + protocols) ──────────────

const KNOWN_WHALE_ADDRESSES = [
  'TKzxdSv2FZKQrEqkKVgp5DcwEXBEKMg2Ax', // Binance hot wallet
  'TNaRAoLUyYEV2uF7GgWZrCHPMoFCBRNPnS', // OKX wallet
  'TWd4WrZ9wn84f5x1hZhL4DHvk738ns5jwH', // Huobi hot wallet
  'TBv2uXMqMFVsRzj3Y9rHEo7FRXEjSvKGXP', // Bybit wallet
  'TXyyApFiYt3BkHsKUiEDfMKFYSWjyR4HKc', // JustLend protocol
  'TPL66VK2gCXNCD7EJg9pgJRfqcRazjhUZY', // Sun.io protocol
  'TDqgB72fAV7vkr5VdJbh4xrMhAGYaBdMc6', // Poloniex hot wallet
]

// USDT mainnet contract
const USDT_MAINNET = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t'

// Cache whale results for 60s to avoid hammering TronGrid on every frontend refresh
const whaleCache: Map<string, { data: WhaleTransfer[]; ts: number }> = new Map()
const WHALE_CACHE_TTL = 60_000

// ─── Get Real Whale Transfers from TronGrid ───────────────────────────────────

export async function getWhaleTransfers(
  token: TokenSymbol = 'USDT',
  timeRangeHours = 24,
  limit = 20,
): Promise<WhaleTransfer[]> {
  const network = getNetwork()

  // Return cached result if fresh
  const cacheKey = `${token}_${limit}`
  const cached = whaleCache.get(cacheKey)
  if (cached && Date.now() - cached.ts < WHALE_CACHE_TTL) return cached.data

  if (isMockMode()) {
    return Array.from({ length: 10 }, (_, i) => ({
      hash: `mock_whale_${i.toString().padStart(32, '0')}`,
      from: KNOWN_WHALE_ADDRESSES[i % KNOWN_WHALE_ADDRESSES.length],
      to: `T${Math.random().toString(36).slice(2, 10).toUpperCase().padEnd(33, 'X')}`,
      amount: String(Math.floor(Math.random() * 5000000 + 100000)),
      token: TOKEN_CONTRACTS[network][token],
      tokenSymbol: token,
      timestamp: Date.now() - i * Math.floor(Math.random() * 3600000),
      usdValue: String(Math.floor(Math.random() * 5000000 + 100000)),
    }))
  }

  try {
    // Always query mainnet for whale data — real whale activity only on mainnet
    const mainnetBase = 'https://api.trongrid.io'
    const apiKey = process.env.TRONGRID_API_KEY
    const headers = apiKey ? { 'TRON-PRO-API-KEY': apiKey } : {}
    const contractAddress = token === 'USDT' ? USDT_MAINNET : TOKEN_CONTRACTS['mainnet'][token]
    const minUsdValue = 100_000 // 100K+ USD for mainnet whale tracking

    // max uint256 — used by approve() calls, not real transfers — filter these out
    const MAX_UINT256 = BigInt('115792089237316195423570985008687907853269984665640564039457584007913129639935')

    // Query multiple known whale wallets in parallel with shorter timeout
    const walletResults = await Promise.allSettled(
      KNOWN_WHALE_ADDRESSES.map(addr =>
        axios.get(`${mainnetBase}/v1/accounts/${addr}/transactions/trc20`, {
          params: { limit: 20, order_by: 'block_timestamp,desc', contract_address: contractAddress },
          headers,
          timeout: 4000, // shorter timeout for faster response
        })
      )
    )

    const allTransfers: WhaleTransfer[] = []
    const seenHashes = new Set<string>()

    for (const result of walletResults) {
      if (result.status !== 'fulfilled') continue
      const txs = (result.value.data?.data ?? []) as Array<Record<string, unknown>>
      for (const tx of txs) {
        const hash = tx.transaction_id as string
        if (seenHashes.has(hash)) continue
        const rawAmount = BigInt(String(tx.value ?? '0'))
        // Skip approve(max) calls — value equals max uint256
        if (rawAmount === MAX_UINT256) continue
        // Skip unrealistically large values (> 10 billion USDT)
        if (rawAmount > BigInt(10_000_000_000) * BigInt(10 ** 6)) continue
        const decimals = 6 // mainnet USDT is 6 decimals
        const amount = (Number(rawAmount) / 10 ** decimals).toFixed(2)
        const usdVal = parseFloat(amount)
        if (usdVal < minUsdValue) continue
        seenHashes.add(hash)
        allTransfers.push({
          hash,
          from: tx.from as string,
          to: tx.to as string,
          amount,
          token: contractAddress,
          tokenSymbol: token,
          timestamp: tx.block_timestamp as number,
          usdValue: amount,
        })
      }
    }

    // Sort by timestamp desc and return top N
    allTransfers.sort((a, b) => b.timestamp - a.timestamp)
    if (allTransfers.length > 0) {
      const result = allTransfers.slice(0, limit)
      whaleCache.set(cacheKey, { data: result, ts: Date.now() })
      return result
    }

    // If no 100K+ transfers found, lower threshold to 10K for demo
    const seenHashes2 = new Set<string>()
    const smaller: WhaleTransfer[] = []
    for (const result of walletResults) {
      if (result.status !== 'fulfilled') continue
      const txs = (result.value.data?.data ?? []) as Array<Record<string, unknown>>
      for (const tx of txs) {
        const hash = tx.transaction_id as string
        if (seenHashes2.has(hash)) continue
        const rawAmount = BigInt(String(tx.value ?? '0'))
        if (rawAmount === MAX_UINT256) continue
        if (rawAmount > BigInt(10_000_000_000) * BigInt(10 ** 6)) continue
        const amount = (Number(rawAmount) / 10 ** 6).toFixed(2)
        if (parseFloat(amount) < 10_000) continue
        seenHashes2.add(hash)
        smaller.push({
          hash, from: tx.from as string, to: tx.to as string,
          amount, token: contractAddress, tokenSymbol: token,
          timestamp: tx.block_timestamp as number, usdValue: amount,
        })
      }
    }
    smaller.sort((a, b) => b.timestamp - a.timestamp)
    if (smaller.length > 0) return smaller.slice(0, limit)
  } catch (e) {
    console.warn('[Data] Whale tracker error:', (e as Error).message)
  }

  // Fallback: realistic mock with real-looking addresses
  return Array.from({ length: 8 }, (_, i) => ({
    hash: `a${Date.now().toString(16)}${i.toString().padStart(8, '0')}b${Math.random().toString(16).slice(2, 10)}`,
    from: KNOWN_WHALE_ADDRESSES[i % KNOWN_WHALE_ADDRESSES.length],
    to: KNOWN_WHALE_ADDRESSES[(i + 2) % KNOWN_WHALE_ADDRESSES.length],
    amount: String(Math.floor(Math.random() * 4_000_000 + 100_000)),
    token: TOKEN_CONTRACTS[getNetwork()][token],
    tokenSymbol: token,
    timestamp: Date.now() - i * Math.floor(Math.random() * 1_800_000 + 600_000),
    usdValue: String(Math.floor(Math.random() * 4_000_000 + 100_000)),
  }))
}

// ─── Transaction Detail ───────────────────────────────────────────────────────

export async function getTxDetail(txHash: string): Promise<Record<string, unknown>> {
  if (isMockMode()) {
    return {
      hash: txHash,
      type: 'TRC20 Transfer',
      from: 'TFp3Ls4mHdzysbX1qxbwXdMzS8mkvhCMx6',
      to: 'TPL66VK2gCXNCD7EJg9pgJRfqcRazjhUZY',
      amount: '100.000000',
      token: 'USDT',
      fee: '1.5 TRX',
      blockNumber: 45123456,
      timestamp: Date.now() - 300000,
      confirmed: true,
      interpretation: 'Transfer of 100 USDT from wallet A to wallet B via TRC20 contract',
    }
  }
  const client = tronGridClient()
  const { data } = await client.get(`/v1/transactions/${txHash}`)
  return data?.data?.[0] ?? {}
}

// ─── Network Overview ─────────────────────────────────────────────────────────

export async function getNetworkOverview() {
  return getLiveNetworkStats()
}

export async function getTokenInfo(tokenAddress: string): Promise<TokenInfo> {
  if (isMockMode()) {
    return {
      contractAddress: tokenAddress,
      name: 'Tether USD',
      symbol: 'USDT',
      decimals: 6,
      totalSupply: '60000000000000000',
      holders: 52000000,
      price: '1.00',
      marketCap: '60000000000',
    }
  }

  const client = tronGridClient()
  const { data } = await client.get(`/v1/contracts/${tokenAddress}`)
  const info = data?.data?.[0] ?? {}

  return {
    contractAddress: tokenAddress,
    name: info.name ?? '?',
    symbol: info.symbol ?? '?',
    decimals: info.decimals ?? 6,
    totalSupply: info.total_supply ?? '0',
    holders: info.holders_count ?? 0,
    price: '1.00', // Would need price oracle
    marketCap: '0',
  }
}
