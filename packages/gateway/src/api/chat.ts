import { Router, type RequestHandler } from 'express'
import { z } from 'zod'
import { ok, err } from '@tronclaw/shared'
import { checkBalance, sendPayment, createPaymentRequest, getPaymentStatus } from '../modules/payment/index.js'
import { analyzeAddress, getTxHistory, getWhaleTransfers, getTokenInfo, getTxDetail, getNetworkOverview } from '../modules/data/index.js'
import { getDefiYields, swapTokens, optimizeYield, getDefiOverview } from '../modules/defi/index.js'
import { createAutoTrade, batchTransfer, getAutoStats, createScheduledTransfer, createWhaleFollow } from '../modules/automation/index.js'
import { getServices, invokeService as invokeSvc, getMarketStats } from '../modules/market/index.js'
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
    case 'tron_whale_tracker': return getWhaleTransfers((input.token ?? 'USDT') as TokenSymbol, undefined, input.hours ?? 24)
    case 'tron_defi_yields': return getDefiYields(input.protocol ?? 'all')
    case 'tron_yield_optimize': return optimizeYield(input.portfolio, input.riskPreference ?? 'medium')
    case 'tron_analyze_address': return analyzeAddress(input.address)
    case 'tron_tx_history': return getTxHistory(input.address, input.limit ?? 20)
    case 'tron_token_info': return getTokenInfo(input.tokenAddress)
    case 'tron_auto_trade': return createAutoTrade(input.tokenPair, input.triggerPrice, input.action, input.amount)
    case 'tron_batch_transfer': return batchTransfer(input.transfers)
    case 'tron_schedule_transfer': return createScheduledTransfer(input.to, input.amount, input.token, input.schedule ?? 'daily')
    case 'tron_whale_follow': return createWhaleFollow(input.minAmount ?? '100000', input.token ?? 'USDT', input.followAction ?? 'alert')
    case 'tron_auto_stats': return getAutoStats()
    case 'tron_market_services': return getServices(input.category)
    case 'tron_market_invoke': return invokeSvc(input.serviceId, input.callerAddress ?? '', input.userInput)
    case 'tron_market_stats': return getMarketStats()
    case 'tron_defi_overview': return getDefiOverview()
    case 'tron_network_overview': return getNetworkOverview()
    case 'tron_tx_detail': return getTxDetail(input.hash)
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
  { name: 'tron_market_services', description: 'List AI Agent services in SealPay marketplace', parameters: { type: 'OBJECT', properties: { category: { type: 'STRING', description: 'Content, Trading, Security, Data, DeFi, or all' } } } },
  { name: 'tron_market_invoke', description: 'Invoke an AI Agent service and pay via x402', parameters: { type: 'OBJECT', properties: { serviceId: { type: 'STRING' }, callerAddress: { type: 'STRING' }, userInput: { type: 'STRING' } }, required: ['serviceId'] } },
  { name: 'tron_market_stats', description: 'Get SealPay marketplace statistics', parameters: { type: 'OBJECT', properties: {} } },
  { name: 'tron_defi_overview', description: 'Get TRON DeFi ecosystem overview: TVL, avg APY, protocols', parameters: { type: 'OBJECT', properties: {} } },
  { name: 'tron_network_overview', description: 'Get TRON network stats: TRX price, market cap, TPS, block height', parameters: { type: 'OBJECT', properties: {} } },
  { name: 'tron_tx_detail', description: 'Get detailed breakdown of a specific TRON transaction', parameters: { type: 'OBJECT', properties: { hash: { type: 'STRING', description: 'Transaction hash' } }, required: ['hash'] } },
  { name: 'tron_schedule_transfer', description: 'Create a scheduled recurring transfer', parameters: { type: 'OBJECT', properties: { to: { type: 'STRING' }, amount: { type: 'STRING' }, token: { type: 'STRING' }, schedule: { type: 'STRING', description: 'daily, weekly, or monthly' } }, required: ['to', 'amount', 'token'] } },
  { name: 'tron_auto_stats', description: 'Get AutoHarvest automation task statistics', parameters: { type: 'OBJECT', properties: {} } },
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
    model: 'gemini-3.1-flash-lite-preview',
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
      ? await runGemini(message, history, walletAddress).catch((e: Error) => {
          // Fallback if region blocked or quota exceeded
          console.warn('[Chat] Gemini error, falling back to demo mode:', e.message)
          return { response: `[Gemini 暂不可用: ${e.message.slice(0, 80)}]\n\n请直接使用 demo-agent.mjs 或配置代理。TronClaw 工具调用功能正常。`, toolCalls: [] }
        })
      : provider === 'anthropic' && hasAnthropic
        ? await runAnthropic(message, history, walletAddress)
        : { response: '[Demo Mode] No LLM provider configured.', toolCalls: [] }

    res.json(ok(result))
  } catch (e) {
    res.status(500).json(err((e as Error).message))
  }
}

chatRouter.post('/message', messageHandler)
