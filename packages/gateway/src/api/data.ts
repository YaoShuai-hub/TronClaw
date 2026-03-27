import { Router, type RequestHandler } from 'express'
import { z } from 'zod'
import { analyzeAddress, getTxHistory, trackWhales, getTokenInfo } from '../modules/data/index.js'
import { isValidAddress } from '../tron/wallet.js'
import { ok, err } from '@tronclaw/shared'
import type { TokenSymbol } from '@tronclaw/shared'

export const dataRouter: Router = Router()

// ─── GET /api/v1/data/address/:address ───────────────────────────────────────
const addressHandler: RequestHandler = async (req, res) => {
  try {
    const { address } = req.params
    if (!isValidAddress(address)) {
      res.status(400).json(err('Invalid TRON address'))
      return
    }
    const result = await analyzeAddress(address)
    res.json(ok(result))
  } catch (e) {
    res.status(500).json(err((e as Error).message))
  }
}

// ─── GET /api/v1/data/transactions/:address?limit=20 ─────────────────────────
const txHandler: RequestHandler = async (req, res) => {
  try {
    const { address } = req.params
    const limit = parseInt((req.query.limit as string) ?? '20', 10)
    if (!isValidAddress(address)) {
      res.status(400).json(err('Invalid TRON address'))
      return
    }
    const result = await getTxHistory(address, Math.min(limit, 100))
    res.json(ok(result))
  } catch (e) {
    res.status(500).json(err((e as Error).message))
  }
}

// ─── GET /api/v1/data/whales?token=USDT&minAmount=100000&hours=24 ─────────────
const whalesHandler: RequestHandler = async (req, res) => {
  try {
    const schema = z.object({
      token: z.enum(['TRX', 'USDT', 'USDD']).optional().default('USDT'),
      minAmount: z.string().optional(),
      hours: z.string().optional().default('24'),
    })
    const { token, minAmount, hours } = schema.parse(req.query)
    const result = await trackWhales(token as TokenSymbol, minAmount, parseInt(hours, 10))
    res.json(ok(result))
  } catch (e) {
    res.status(500).json(err((e as Error).message))
  }
}

// ─── GET /api/v1/data/token/:address ─────────────────────────────────────────
const tokenHandler: RequestHandler = async (req, res) => {
  try {
    const { address } = req.params
    if (!isValidAddress(address)) {
      res.status(400).json(err('Invalid contract address'))
      return
    }
    const result = await getTokenInfo(address)
    res.json(ok(result))
  } catch (e) {
    res.status(500).json(err((e as Error).message))
  }
}

dataRouter.get('/address/:address', addressHandler)
dataRouter.get('/transactions/:address', txHandler)
dataRouter.get('/whales', whalesHandler)
dataRouter.get('/token/:address', tokenHandler)
