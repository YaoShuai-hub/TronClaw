import express from 'express'
import cors from 'cors'
import { createServer as createHttpServer } from 'http'
import { initDb } from './db/index.js'
import { paymentRouter } from './api/payment.js'
import { dataRouter } from './api/data.js'
import { defiRouter } from './api/defi.js'
import { automationRouter } from './api/automation.js'
import { identityRouter } from './api/identity.js'
import { chatRouter } from './api/chat.js'
import { setupWebSocket } from './ws/index.js'
import type { ApiResponse } from '@tronclaw/shared'

export function createServer() {
  const app = express()

  // ─── Middleware ───────────────────────────────────────────────────────────
  app.use(cors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
    credentials: true,
  }))
  app.use(express.json())

  // ─── Health check ─────────────────────────────────────────────────────────
  app.get('/health', (_req, res) => {
    const response: ApiResponse<{ status: string; network: string; mock: boolean }> = {
      success: true,
      data: {
        status: 'ok',
        network: process.env.TRON_NETWORK ?? 'nile',
        mock: process.env.MOCK_TRON === 'true',
      },
      error: null,
    }
    res.json(response)
  })

  // ─── API Routes ───────────────────────────────────────────────────────────
  app.use('/api/v1/payment', paymentRouter)
  app.use('/api/v1/data', dataRouter)
  app.use('/api/v1/defi', defiRouter)
  app.use('/api/v1/automation', automationRouter)
  app.use('/api/v1/identity', identityRouter)
  app.use('/api/v1/chat', chatRouter)

  // ─── Error handler ────────────────────────────────────────────────────────
  app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('[Gateway Error]', err)
    const response: ApiResponse = { success: false, data: null, error: err.message }
    res.status(500).json(response)
  })

  // ─── HTTP server + WebSocket ──────────────────────────────────────────────
  const httpServer = createHttpServer(app)
  setupWebSocket(httpServer)

  // ─── Init DB ──────────────────────────────────────────────────────────────
  initDb()

  return httpServer
}
