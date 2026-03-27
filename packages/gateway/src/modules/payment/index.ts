/**
 * Payment Module — x402 Protocol + TRC20 transfers
 * Bank of AI infrastructure: x402 Payment Protocol + Skills Modules
 */
import { v4 as uuidv4 } from 'uuid'
import { getNetwork, isMockMode } from '../../tron/client.js'
import { getWalletAddress } from '../../tron/wallet.js'
import { getTrxBalance, getTrc20Balance, transferTrc20 } from '../../tron/contracts.js'
import { getDb } from '../../db/index.js'
import { broadcast } from '../../ws/index.js'
import type {
  BalanceResult,
  PaymentResult,
  PaymentRequest,
  TokenSymbol,
} from '@tronclaw/shared'

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_BALANCES: Record<TokenSymbol, string> = {
  TRX: '1250.500000',
  USDT: '500.000000',
  USDD: '200.000000000000000000',
}

// ─── Balance ──────────────────────────────────────────────────────────────────

export async function checkBalance(
  address: string,
  token: TokenSymbol = 'USDT',
): Promise<BalanceResult> {
  const network = getNetwork()

  if (isMockMode()) {
    return {
      address,
      token,
      balance: MOCK_BALANCES[token],
      usdValue: token === 'TRX'
        ? (parseFloat(MOCK_BALANCES.TRX) * 0.12).toFixed(2)
        : MOCK_BALANCES[token],
      network,
    }
  }

  let balance: string
  if (token === 'TRX') {
    balance = await getTrxBalance(address)
  } else {
    balance = await getTrc20Balance(address, token)
  }

  // Simple USD estimate (TRX ~ $0.12, stablecoins ~ $1)
  const usdValue = token === 'TRX'
    ? (parseFloat(balance) * 0.12).toFixed(2)
    : balance

  return { address, token, balance, usdValue, network }
}

// ─── Send Payment (x402) ──────────────────────────────────────────────────────

export async function sendPayment(
  to: string,
  amount: string,
  token: TokenSymbol,
  memo?: string,
): Promise<PaymentResult> {
  const { address: from } = getWalletAddress()
  const timestamp = Date.now()

  if (isMockMode()) {
    const mockTx: PaymentResult = {
      txHash: `mock_tx_${uuidv4().replace(/-/g, '').slice(0, 32)}`,
      from,
      to,
      amount,
      token,
      status: 'confirmed',
      timestamp,
    }
    // Log to DB
    logTransaction(mockTx)
    // Broadcast WebSocket event
    broadcast('transaction', mockTx)
    broadcast('payment_confirmed', mockTx)
    return mockTx
  }

  try {
    const txHash = await transferTrc20(to, amount, token)

    const result: PaymentResult = {
      txHash,
      from,
      to,
      amount,
      token,
      status: 'pending',
      timestamp,
    }

    logTransaction(result)
    broadcast('transaction', result)

    return result
  } catch (error) {
    throw new Error(`Payment failed: ${(error as Error).message}`)
  }
}

// ─── Create Payment Request (x402) ───────────────────────────────────────────

export async function createPaymentRequest(
  amount: string,
  token: TokenSymbol,
  description: string,
): Promise<PaymentRequest> {
  const { address: recipientAddress } = getWalletAddress()
  const payId = uuidv4()
  const now = Date.now()
  const expiresAt = now + 30 * 60 * 1000 // 30 minutes

  const paymentRequest: PaymentRequest = {
    payId,
    amount,
    token,
    description,
    paymentUrl: `${process.env.GATEWAY_URL ?? 'http://localhost:3000'}/pay/${payId}`,
    recipientAddress,
    expiresAt,
    status: 'pending',
  }

  // Persist to DB
  const db = getDb()
  db.prepare(`
    INSERT INTO payment_requests (pay_id, amount, token, description, recipient_address, status, created_at, expires_at)
    VALUES (?, ?, ?, ?, ?, 'pending', ?, ?)
  `).run(payId, amount, token, description, recipientAddress, now, expiresAt)

  return paymentRequest
}

// ─── Payment Status ───────────────────────────────────────────────────────────

export async function getPaymentStatus(payId: string): Promise<PaymentRequest | null> {
  const db = getDb()
  const row = db.prepare('SELECT * FROM payment_requests WHERE pay_id = ?').get(payId) as
    | Record<string, unknown>
    | undefined

  if (!row) return null

  return {
    payId: row.pay_id as string,
    amount: row.amount as string,
    token: row.token as TokenSymbol,
    description: row.description as string,
    paymentUrl: `${process.env.GATEWAY_URL ?? 'http://localhost:3000'}/pay/${payId}`,
    recipientAddress: row.recipient_address as string,
    expiresAt: row.expires_at as number,
    status: row.status as PaymentRequest['status'],
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function logTransaction(tx: PaymentResult) {
  try {
    const db = getDb()
    db.prepare(`
      INSERT INTO tx_log (tx_hash, type, from_address, to_address, amount, token, status, timestamp)
      VALUES (?, 'payment', ?, ?, ?, ?, ?, ?)
    `).run(tx.txHash, tx.from, tx.to, tx.amount, tx.token, tx.status, tx.timestamp)
  } catch (e) {
    console.error('[DB] Failed to log transaction:', e)
  }
}
