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
  const tokenHoldings = (account.trc20 ?? []).map((t: Record<string, string>) => {
    const contractAddress = Object.keys(t)[0]
    const balance = Object.values(t)[0]
    return { contractAddress, symbol: '?', name: '?', balance, decimals: 6 }
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

// ─── Whale Tracker ────────────────────────────────────────────────────────────

export async function trackWhales(
  token: TokenSymbol = 'USDT',
  minAmount?: string,
  timeRangeHours = 24,
): Promise<WhaleTransfer[]> {
  if (isMockMode()) return MOCK_WHALES

  const client = tronGridClient()
  const network = getNetwork()
  const contractAddress = TOKEN_CONTRACTS[network][token]
  const threshold = minAmount ?? WHALE_THRESHOLD[token]

  const minTs = Date.now() - timeRangeHours * 3600 * 1000

  const { data } = await client.get(`/v1/contracts/${contractAddress}/transactions`, {
    params: {
      limit: 50,
      order_by: 'block_timestamp,desc',
      min_block_timestamp: minTs,
    },
  })

  const decimals = token === 'USDD' ? 18 : 6

  return (data?.data ?? [])
    .filter((tx: Record<string, unknown>) => {
      const raw = BigInt((tx.value ?? '0') as string)
      const threshold_raw = BigInt(threshold) * BigInt(10 ** decimals)
      return raw >= threshold_raw
    })
    .map((tx: Record<string, unknown>) => {
      const raw = BigInt((tx.value ?? '0') as string)
      const amount = (Number(raw) / 10 ** decimals).toFixed(decimals)
      return {
        hash: tx.transaction_id as string,
        from: tx.from as string,
        to: tx.to as string,
        amount,
        token: contractAddress,
        tokenSymbol: token,
        timestamp: tx.block_timestamp as number,
        usdValue: amount, // stablecoins ~ $1
      }
    })
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
