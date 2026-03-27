/**
 * Automation Module — conditional on-chain task execution
 * Bank of AI infrastructure: MCP Server + Skills Modules
 */
import { v4 as uuidv4 } from 'uuid'
import { isMockMode } from '../../tron/client.js'
import { getDb } from '../../db/index.js'
import { broadcast } from '../../ws/index.js'
import { sendPayment } from '../payment/index.js'
import type { AutomationTask, AutomationAction, TokenSymbol } from '@tronclaw/shared'

// ─── Create generic automation task ──────────────────────────────────────────

export async function createAutomationTask(
  type: AutomationTask['type'],
  conditions: Record<string, unknown>,
  actions: AutomationAction[],
): Promise<AutomationTask> {
  const taskId = uuidv4()
  const now = Date.now()

  const task: AutomationTask = {
    taskId,
    type,
    status: 'active',
    conditions,
    actions,
    createdAt: now,
    triggerCount: 0,
  }

  const db = getDb()
  db.prepare(`
    INSERT INTO automation_tasks (task_id, type, status, conditions, actions, created_at, trigger_count)
    VALUES (?, ?, 'active', ?, ?, ?, 0)
  `).run(taskId, type, JSON.stringify(conditions), JSON.stringify(actions), now)

  return task
}

// ─── Auto Trade ───────────────────────────────────────────────────────────────

export async function createAutoTrade(
  tokenPair: string,
  triggerPrice: string,
  action: 'buy' | 'sell',
  amount: string,
): Promise<AutomationTask> {
  const [baseToken, quoteToken] = tokenPair.split('/')

  return createAutomationTask(
    'auto_swap',
    { tokenPair, triggerPrice, action, priceDirection: action === 'buy' ? 'below' : 'above' },
    [{
      type: 'swap',
      params: {
        fromToken: action === 'buy' ? quoteToken : baseToken,
        toToken: action === 'buy' ? baseToken : quoteToken,
        amount,
      },
    }],
  )
}

// ─── Batch Transfer ───────────────────────────────────────────────────────────

export async function batchTransfer(
  transfers: Array<{ to: string; amount: string; token: string }>,
): Promise<{ txHashes: string[]; totalCost: string }> {
  const txHashes: string[] = []

  for (const t of transfers) {
    try {
      const result = await sendPayment(t.to, t.amount, t.token as TokenSymbol)
      txHashes.push(result.txHash)
    } catch (e) {
      txHashes.push(`error: ${(e as Error).message}`)
    }
  }

  return {
    txHashes,
    totalCost: '~20 TRX energy', // estimate
  }
}

// ─── List Tasks ───────────────────────────────────────────────────────────────

export function listTasks(status?: string): AutomationTask[] {
  const db = getDb()
  const rows = status
    ? db.prepare('SELECT * FROM automation_tasks WHERE status = ?').all(status)
    : db.prepare('SELECT * FROM automation_tasks').all()

  return (rows as Record<string, unknown>[]).map(row => ({
    taskId: row.task_id as string,
    type: row.type as AutomationTask['type'],
    status: row.status as AutomationTask['status'],
    conditions: JSON.parse(row.conditions as string),
    actions: JSON.parse(row.actions as string),
    createdAt: row.created_at as number,
    triggeredAt: row.triggered_at as number | undefined,
    triggerCount: row.trigger_count as number,
  }))
}

// ─── Cancel Task ──────────────────────────────────────────────────────────────

export function cancelTask(taskId: string): boolean {
  const db = getDb()
  const result = db.prepare(
    "UPDATE automation_tasks SET status = 'cancelled' WHERE task_id = ? AND status = 'active'"
  ).run(taskId)
  return result.changes > 0
}

// ─── Price Monitor (simple polling loop) ─────────────────────────────────────

let monitorInterval: ReturnType<typeof setInterval> | null = null

export function startPriceMonitor() {
  if (monitorInterval) return

  monitorInterval = setInterval(async () => {
    const tasks = listTasks('active')
    for (const task of tasks) {
      if (task.type === 'auto_swap') {
        await checkAutoTradeCondition(task)
      }
    }
  }, 30_000) // check every 30 seconds
}

async function checkAutoTradeCondition(task: AutomationTask) {
  if (isMockMode()) return // skip polling in mock mode

  try {
    // TODO: fetch current price from SunSwap/TronGrid
    // Compare with task.conditions.triggerPrice
    // If triggered, execute actions and update DB
  } catch (e) {
    console.error('[Automation] Error checking task', task.taskId, e)
  }
}
