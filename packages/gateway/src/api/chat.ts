import { Router, type RequestHandler } from 'express'
import { z } from 'zod'
import { ok, err } from '@tronclaw/shared'
import { checkBalance, sendPayment, createPaymentRequest, getPaymentStatus } from '../modules/payment/index.js'
import { analyzeAddress, getTxHistory, trackWhales, getTokenInfo } from '../modules/data/index.js'
import { getDefiYields, swapTokens, optimizeYield } from '../modules/defi/index.js'
import { createAutoTrade, batchTransfer } from '../modules/automation/index.js'
import type { TokenSymbol } from '@tronclaw/shared'

export const chatRouter: Router = Router()

// ─── Tool executor ────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function executeTool(name: string, input: Record<string, any>): Promise<unknown> {
  switch (name) {
    case 'tron_check_balance': return checkBalance(input.address, (input.token ?? 'USDT') as TokenSymbol)
    case 'tron_send_payment': return sendPayment(input.to, input.amount, input.token as TokenSymbol, input.memo)
    case 'tron_create_payment_request': return createPaymentRequest(input.amount, input.token as TokenSymbol, input.description)
    case 'tron_payment_status': return getPaymentStatus(input.payId)
    case 'tron_whale_tracker': return trackWhales((input.token ?? 'USDT') as TokenSymbol, undefined, input.hours ?? 24)
    case 'tron_defi_yields': return getDefiYields(input.protocol ?? 'all')
    case 'tron_yield_optimize': return optimizeYield(input.portfolio, input.riskPreference ?? 'medium')
    case 'tron_analyze_address': return analyzeAddress(input.address)
    case 'tron_tx_history': return getTxHistory(input.address, input.limit ?? 20)
    case 'tron_token_info': return getTokenInfo(input.tokenAddress)
    case 'tron_auto_trade': return createAutoTrade(input.tokenPair, input.triggerPrice, input.action, input.amount)
    case 'tron_batch_transfer': return batchTransfer(input.transfers)
    default: return { error: `Unknown tool: ${name}` }
  }
}

// ─── Tool definitions ─────────────────────────────────────────────────────────

const TOOL_DEFS = [
  { name: 'tron_check_balance', description: 'Check TRX, USDT, or USDD balance for a TRON address', parameters: { type: 'OBJECT', properties: { address: { type: 'STRING', description: 'TRON wallet address' }, token: { type: 'STRING', description: 'TRX, USDT, or USDD' } }, required: ['address'] } },
  { name: 'tron_send_payment', description: 'Send USDT or USDD payment to a TRON address', parameters: { type: 'OBJECT', properties: { to: { type: 'STRING' }, amount: { type: 'STRING' }, token: { type: 'STRING', description: 'USDT or USDD' }, memo: { type: 'STRING' } }, required: ['to', 'amount', 'token'] } },
  { name: 'tron_create_payment_request', description: 'Create an x402 payment request URL', parameters: { type: 'OBJECT', properties: { amount: { type: 'STRING' }, token: { type: 'STRING' }, description: { type: 'STRING' } }, required: ['amount', 'token', 'description'] } },
  { name: 'tron_whale_tracker', description: 'Track large USDT/USDD transfers on TRON', parameters: { type: 'OBJECT', properties: { token: { type: 'STRING' }, hours: { type: 'NUMBER' } } } },
  { name: 'tron_defi_yields', description: 'Query current DeFi yield rates on TRON (SunSwap, JustLend)', parameters: { type: 'OBJECT', properties: { protocol: { type: 'STRING', description: 'sunswap, justlend, or all' } } } },
  { name: 'tron_yield_optimize', description: 'Get AI-powered yield optimization strategy for portfolio', parameters: { type: 'OBJECT', properties: { portfolio: { type: 'ARRAY', items: { type: 'OBJECT', properties: { token: { type: 'STRING' }, amount: { type: 'STRING' } } } }, riskPreference: { type: 'STRING', description: 'low, medium, or high' } }, required: ['portfolio'] } },
  { name: 'tron_analyze_address', description: 'Analyze a TRON address: balances, holdings, tx history', parameters: { type: 'OBJECT', properties: { address: { type: 'STRING' } }, required: ['address'] } },
  { name: 'tron_auto_trade', description: 'Set up automated trading triggered by price conditions', parameters: { type: 'OBJECT', properties: { tokenPair: { type: 'STRING', description: 'e.g. TRX/USDT' }, triggerPrice: { type: 'STRING' }, action: { type: 'STRING', description: 'buy or sell' }, amount: { type: 'STRING' } }, required: ['tokenPair', 'triggerPrice', 'action', 'amount'] } },
]

// ─── Gemini provider ──────────────────────────────────────────────────────────

async function runGemini(
  message: string,
  history: Array<{ role: string; content: string }>,
  walletAddress: string,
): Promise<{ response: string; toolCalls: unknown[] }> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { GoogleGenerativeAI } = await import('@google/generative-ai') as any
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction: `You are TronClaw AI Agent with full TRON blockchain capabilities.
${walletAddress ? `User wallet: ${walletAddress}` : ''}
Network: ${process.env.TRON_NETWORK ?? 'nile'} | Mock: ${process.env.MOCK_TRON === 'true' ? 'ON' : 'OFF'}
Use tools to answer TRON questions. Explain results clearly in the user's language.`,
    tools: [{ functionDeclarations: TOOL_DEFS }],
  })

  const chatHistory = history.map(h => ({
    role: h.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: h.content }],
  }))

  const chat = model.startChat({ history: chatHistory })
  const toolCallLog: unknown[] = []
  let result = await chat.sendMessage(message)

  // Agentic tool use loop
  while (true) {
    const candidate = result.response.candidates?.[0]
    const parts: unknown[] = candidate?.content?.parts ?? []
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fnCalls = parts.filter((p: any) => p.functionCall)
    if (fnCalls.length === 0) break

    const toolResponses = []
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const part of fnCalls as any[]) {
      const fn = part.functionCall as { name: string; args: Record<string, unknown> }
      const toolResult = await executeTool(fn.name, fn.args)
      toolCallLog.push({ tool: fn.name, input: fn.args, result: toolResult })
      toolResponses.push({ functionResponse: { name: fn.name, response: { result: toolResult } } })
    }
    result = await chat.sendMessage(toolResponses)
  }

  return { response: result.response.text(), toolCalls: toolCallLog }
}

// ─── Anthropic provider ───────────────────────────────────────────────────────

async function runAnthropic(
  message: string,
  history: Array<{ role: string; content: string }>,
  walletAddress: string,
): Promise<{ response: string; toolCalls: unknown[] }> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Anthropic = ((await import('@anthropic-ai/sdk')) as any).default
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const system = `You are TronClaw AI Agent with full TRON blockchain capabilities.
${walletAddress ? `User wallet: ${walletAddress}` : ''}
Network: ${process.env.TRON_NETWORK ?? 'nile'} | Mock: ${process.env.MOCK_TRON === 'true' ? 'ON' : 'OFF'}`

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const messages: any[] = [
    ...history.map(h => ({ role: h.role, content: h.content })),
    { role: 'user', content: message },
  ]

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anthropicTools = TOOL_DEFS.map(t => ({ name: t.name, description: t.description, input_schema: { type: 'object', properties: (t.parameters as any).properties, required: (t.parameters as any).required ?? [] } }))

  const toolCallLog: unknown[] = []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let response: any = await client.messages.create({ model: 'claude-3-5-sonnet-20241022', max_tokens: 1024, system, tools: anthropicTools, messages })

  while (response.stop_reason === 'tool_use') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const toolUseBlocks = response.content.filter((b: any) => b.type === 'tool_use')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const toolResults = []
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const tu of toolUseBlocks as any[]) {
      const toolResult = await executeTool(tu.name, tu.input)
      toolCallLog.push({ tool: tu.name, input: tu.input, result: toolResult })
      toolResults.push({ type: 'tool_result', tool_use_id: tu.id, content: JSON.stringify(toolResult) })
    }
    messages.push({ role: 'assistant', content: response.content })
    messages.push({ role: 'user', content: toolResults })
    response = await client.messages.create({ model: 'claude-3-5-sonnet-20241022', max_tokens: 1024, system, tools: anthropicTools, messages })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const text = response.content.filter((b: any) => b.type === 'text').map((b: any) => b.text).join('\n')
  return { response: text, toolCalls: toolCallLog }
}

// ─── POST /api/v1/chat/message ────────────────────────────────────────────────

const messageHandler: RequestHandler = async (req, res) => {
  try {
    const schema = z.object({
      message: z.string().min(1).max(2000),
      walletAddress: z.string().optional().default(''),
      history: z.array(z.object({ role: z.enum(['user', 'assistant']), content: z.string() })).optional().default([]),
    })
    const { message, walletAddress, history } = schema.parse(req.body)

    const provider = process.env.LLM_PROVIDER ?? 'gemini'
    const hasGemini = !!process.env.GEMINI_API_KEY
    const hasAnthropic = !!process.env.ANTHROPIC_API_KEY

    if ((provider === 'gemini' && !hasGemini) || (provider === 'anthropic' && !hasAnthropic)) {
      res.json(ok({ response: `[Demo Mode] 收到："${message}"。请配置 GEMINI_API_KEY 启用真实 AI 对话。`, toolCalls: [] }))
      return
    }

    const result = provider === 'gemini' && hasGemini
      ? await runGemini(message, history, walletAddress)
      : provider === 'anthropic' && hasAnthropic
        ? await runAnthropic(message, history, walletAddress)
        : { response: '[Demo Mode] No LLM provider configured.', toolCalls: [] }

    res.json(ok(result))
  } catch (e) {
    res.status(500).json(err((e as Error).message))
  }
}

chatRouter.post('/message', messageHandler)
