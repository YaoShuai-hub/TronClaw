import { Router, type RequestHandler } from 'express'
import { z } from 'zod'
import { analyzeAddress, getTxHistory, getWhaleTransfers, getTokenInfo, getTxDetail, getNetworkOverview } from '../modules/data/index.js'
import { isValidAddress } from '../tron/wallet.js'
import { ok, err } from '@tronclaw/shared'
import type { TokenSymbol } from '@tronclaw/shared'

export const dataRouter: Router = Router()

const addressHandler: RequestHandler = async (req, res) => {
  try {
    const { address } = req.params
    if (!isValidAddress(address)) { res.status(400).json(err('Invalid TRON address')); return }
    res.json(ok(await analyzeAddress(address)))
  } catch (e) { res.status(500).json(err((e as Error).message)) }
}

const txHandler: RequestHandler = async (req, res) => {
  try {
    const { address } = req.params
    const limit = parseInt((req.query.limit as string) ?? '20', 10)
    if (!isValidAddress(address)) { res.status(400).json(err('Invalid TRON address')); return }
    res.json(ok(await getTxHistory(address, Math.min(limit, 100))))
  } catch (e) { res.status(500).json(err((e as Error).message)) }
}

const whalesHandler: RequestHandler = async (req, res) => {
  try {
    const schema = z.object({ token: z.enum(['TRX', 'USDT', 'USDD']).optional().default('USDT'), minAmount: z.string().optional(), hours: z.string().optional().default('24') })
    const { token, minAmount, hours } = schema.parse(req.query)
    res.json(ok(await getWhaleTransfers(token as TokenSymbol, parseInt(hours, 10))))
  } catch (e) { res.status(500).json(err((e as Error).message)) }
}

const tokenHandler: RequestHandler = async (req, res) => {
  try {
    const { address } = req.params
    res.json(ok(await getTokenInfo(address)))
  } catch (e) { res.status(500).json(err((e as Error).message)) }
}

const txDetailHandler: RequestHandler = async (req, res) => {
  try {
    const { hash } = req.params
    res.json(ok(await getTxDetail(hash)))
  } catch (e) { res.status(500).json(err((e as Error).message)) }
}

const overviewHandler: RequestHandler = async (_req, res) => {
  try { res.json(ok(await getNetworkOverview())) }
  catch (e) { res.status(500).json(err((e as Error).message)) }
}

dataRouter.get('/overview', overviewHandler)
dataRouter.get('/address/:address', addressHandler)
dataRouter.get('/transactions/:address', txHandler)
dataRouter.get('/whales', whalesHandler)
dataRouter.get('/token/:address', tokenHandler)
dataRouter.get('/tx/:hash', txDetailHandler)
