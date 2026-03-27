import { Router, type RequestHandler } from 'express'
import { z } from 'zod'
import { createAutomationTask, createAutoTrade, batchTransfer, listTasks, cancelTask } from '../modules/automation/index.js'
import { ok, err } from '@tronclaw/shared'
import type { AutomationAction } from '@tronclaw/shared'

export const automationRouter: Router = Router()

const createHandler: RequestHandler = async (req, res) => {
  try {
    const schema = z.object({
      type: z.enum(['price_alert', 'auto_swap', 'scheduled_transfer', 'whale_alert']),
      conditions: z.record(z.unknown()),
      actions: z.array(z.object({ type: z.string(), params: z.record(z.unknown()) })),
    })
    const { type, conditions, actions } = schema.parse(req.body)
    const result = await createAutomationTask(type, conditions, actions as AutomationAction[])
    res.json(ok(result))
  } catch (e) {
    res.status(500).json(err((e as Error).message))
  }
}

const tradeHandler: RequestHandler = async (req, res) => {
  try {
    const schema = z.object({
      tokenPair: z.string(),
      triggerPrice: z.string(),
      action: z.enum(['buy', 'sell']),
      amount: z.string(),
    })
    const { tokenPair, triggerPrice, action, amount } = schema.parse(req.body)
    const result = await createAutoTrade(tokenPair, triggerPrice, action, amount)
    res.json(ok(result))
  } catch (e) {
    res.status(500).json(err((e as Error).message))
  }
}

const batchHandler: RequestHandler = async (req, res) => {
  try {
    const schema = z.object({
      transfers: z.array(z.object({
        to: z.string(), amount: z.string(),
        token: z.enum(['USDT', 'USDD', 'TRX']),
      })),
    })
    const { transfers } = schema.parse(req.body)
    const result = await batchTransfer(transfers)
    res.json(ok(result))
  } catch (e) {
    res.status(500).json(err((e as Error).message))
  }
}

const listHandler: RequestHandler = (req, res) => {
  try {
    const { status } = req.query as { status?: string }
    const result = listTasks(status)
    res.json(ok(result))
  } catch (e) {
    res.status(500).json(err((e as Error).message))
  }
}

const deleteHandler: RequestHandler = (req, res) => {
  try {
    const { taskId } = req.params
    const cancelled = cancelTask(taskId)
    if (!cancelled) {
      res.status(404).json(err('Task not found or already completed'))
      return
    }
    res.json(ok({ taskId, status: 'cancelled' }))
  } catch (e) {
    res.status(500).json(err((e as Error).message))
  }
}

automationRouter.post('/create', createHandler)
automationRouter.post('/trade', tradeHandler)
automationRouter.post('/batch-transfer', batchHandler)
automationRouter.get('/tasks', listHandler)
automationRouter.delete('/tasks/:taskId', deleteHandler)
