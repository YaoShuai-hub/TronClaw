import { Router, type RequestHandler } from 'express'
import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'
import { ok, err } from '@tronclaw/shared'
import { checkBalance, sendPayment, createPaymentRequest, getPaymentStatus } from '../modules/payment/index.js'
import { analyzeAddress, getTxHistory, trackWhales, getTokenInfo } from '../modules/data/index.js'
import { getDefiYields, swapTokens, optimizeYield } from '../modules/defi/index.js'
import { createAutoTrade, batchTransfer, listTasks } from '../modules/automation/index.js'
import { registerAgentIdentity, getAgentReputation } from '../modules/identity/index.js'
import type { TokenSymbol } from '@tronclaw/shared'

export const chatRouter: Router = Router()

// Tool definitions for Claude
const TRON_TOOLS: Anthropic.Tool[] = [
  {
    name: 'tron_check_balance',
    description: 'Check TRX, USDT, or USDD balance for a TRON address',
    input_schema: {
      type: 'object',
      properties: {
        address: { type: 'string', description: 'TRON wallet address' },
        token: { type: 'string', enum: ['TRX', 'USDT', 'USDD'], description: 'Token to check' },
      },
      required: ['address'],
    },
  },
  {
    name: 'tron_send_payment',
    description: 'Send USDT or USDD payment to a TRON address',
    input_schema: {
      type: 'object',
      properties: {
        to: { type: 'string', description: 'Recipient address' },
        amount: { type: 'string', description: 'Amount to send' },
        token: { type: 'string', enum: ['USDT', 'USDD'] },
        memo: { type: 'string', description: 'Optional memo' },
      },
      required: ['to', 'amount', 'token'],
    },
  },
  {
    name: 'tron_create_payment_request',
    description: 'Create an x402 payment request for collecting fees',
    input_schema: {
      type: 'object',
      properties: {
        amount: { type: 'string' },
        token: { type: 'string', enum: ['USDT', 'USDD'] },
        description: { type: 'string' },
      },
      required: ['amount', 'token', 'description'],
    },
  },
  {
    name: 'tron_whale_tracker',
    description: 'Track large USDT/USDD transfers on TRON',
    input_schema: {
      type: 'object',
      properties: {
        token: { type: 'string', enum: ['TRX', 'USDT', 'USDD'] },
        hours: { type: 'number', description: 'Time range in hours' },
      },
    },
  },
  {
    name: 'tron_defi_yields',
    description: 'Query current DeFi yield rates on TRON (SunSwap, JustLend)',
    input_schema: {
      type: 'object',
      properties: {
        protocol: { type: 'string', enum: ['sunswap', 'justlend', 'all'] },
      },
    },
  },
  {
    name: 'tron_yield_optimize',
    description: 'Get AI-powered yield optimization strategy for portfolio',
    input_schema: {
      type: 'object',
      properties: {
        portfolio: {
          type: 'array',
          items: { type: 'object', properties: { token: { type: 'string' }, amount: { type: 'string' } } },
        },
        riskPreference: { type: 'string', enum: ['low', 'medium', 'high'] },
      },
      required: ['portfolio'],
    },
  },
  {
    name: 'tron_analyze_address',
    description: 'Analyze a TRON address: balances, holdings, transaction history',
    input_schema: {
      type: 'object',
      properties: {
        address: { type: 'string' },
      },
      required: ['address'],
    },
  },
  {
    name: 'tron_auto_trade',
    description: 'Set up automated trading triggered by price conditions',
    input_schema: {
      type: 'object',
      properties: {
        tokenPair: { type: 'string', description: 'e.g. TRX/USDT' },
        triggerPrice: { type: 'string' },
        action: { type: 'string', enum: ['buy', 'sell'] },
        amount: { type: 'string' },
      },
      required: ['tokenPair', 'triggerPrice', 'action', 'amount'],
    },
  },
]

// Execute a tool call
async function executeTool(name: string, input: Record<string, unknown>): Promise<unknown> {
  switch (name) {
    case 'tron_check_balance':
      return checkBalance(input.address as string, (input.token ?? 'USDT') as TokenSymbol)
    case 'tron_send_payment':
      return sendPayment(input.to as string, input.amount as string, input.token as TokenSymbol, input.memo as string | undefined)
    case 'tron_create_payment_request':
      return createPaymentRequest(input.amount as string, input.token as TokenSymbol, input.description as string)
    case 'tron_payment_status':
      return getPaymentStatus(input.payId as string)
    case 'tron_whale_tracker':
      return trackWhales((input.token ?? 'USDT') as TokenSymbol, undefined, (input.hours ?? 24) as number)
    case 'tron_defi_yields':
      return getDefiYields((input.protocol ?? 'all') as 'sunswap' | 'justlend' | 'all')
    case 'tron_yield_optimize':
      return optimizeYield(
        input.portfolio as Array<{ token: string; amount: string }>,
        (input.riskPreference ?? 'medium') as 'low' | 'medium' | 'high',
      )
    case 'tron_analyze_address':
      return analyzeAddress(input.address as string)
    case 'tron_auto_trade':
      return createAutoTrade(
        input.tokenPair as string,
        input.triggerPrice as string,
        input.action as 'buy' | 'sell',
        input.amount as string,
      )
    default:
      return { error: `Unknown tool: ${name}` }
  }
}

// POST /api/v1/chat/message
const messageHandler: RequestHandler = async (req, res) => {
  try {
    const schema = z.object({
      message: z.string().min(1).max(2000),
      walletAddress: z.string().optional(),
      history: z.array(z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
      })).optional().default([]),
    })
    const { message, walletAddress, history } = schema.parse(req.body)

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      // Return mock response if no API key
      res.json(ok({
        response: `[Demo Mode] I received: "${message}". In production, I would use Claude + TronClaw tools to help you with TRON operations. Try setting ANTHROPIC_API_KEY to enable real AI responses.`,
        toolCalls: [],
      }))
      return
    }

    const client = new Anthropic({ apiKey })

    const systemPrompt = `You are TronClaw AI Agent, an intelligent assistant with full access to TRON blockchain capabilities.
You can help users with payments, DeFi operations, on-chain data analysis, and automated trading.
${walletAddress ? `The user's wallet address is: ${walletAddress}` : ''}
Current network: ${process.env.TRON_NETWORK ?? 'nile'} (testnet)
Mock mode: ${process.env.MOCK_TRON === 'true' ? 'ON (simulated data)' : 'OFF (real blockchain)'}

When using tools, always explain what you're doing and present results clearly.
For payments and trades, always confirm with the user before executing.`

    const messages: Anthropic.MessageParam[] = [
      ...history.map(h => ({ role: h.role as 'user' | 'assistant', content: h.content })),
      { role: 'user', content: message },
    ]

    // Agentic loop: call tools until done
    const toolCallLog: Array<{ tool: string; input: unknown; result: unknown }> = []
    let finalText = ''

    let response = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      system: systemPrompt,
      tools: TRON_TOOLS,
      messages,
    })

    while (response.stop_reason === 'tool_use') {
      const toolUseBlocks = response.content.filter(b => b.type === 'tool_use') as Anthropic.ToolUseBlock[]
      const toolResults: Anthropic.ToolResultBlockParam[] = []

      for (const toolUse of toolUseBlocks) {
        const result = await executeTool(toolUse.name, toolUse.input as Record<string, unknown>)
        toolCallLog.push({ tool: toolUse.name, input: toolUse.input, result })
        toolResults.push({
          type: 'tool_result',
          tool_use_id: toolUse.id,
          content: JSON.stringify(result),
        })
      }

      messages.push({ role: 'assistant', content: response.content })
      messages.push({ role: 'user', content: toolResults })

      response = await client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        system: systemPrompt,
        tools: TRON_TOOLS,
        messages,
      })
    }

    finalText = response.content
      .filter(b => b.type === 'text')
      .map(b => (b as Anthropic.TextBlock).text)
      .join('\n')

    res.json(ok({ response: finalText, toolCalls: toolCallLog }))
  } catch (e) {
    res.status(500).json(err((e as Error).message))
  }
}

chatRouter.post('/message', messageHandler)
