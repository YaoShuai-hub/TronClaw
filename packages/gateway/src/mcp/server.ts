/**
 * MCP Tool Provider — Bank of AI: MCP Server infrastructure
 * Exposes all TronClaw tools via Model Context Protocol
 * Compatible with Claude Desktop, OpenClaw, and any MCP client
 */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'
import { checkBalance, sendPayment, createPaymentRequest, getPaymentStatus } from '../modules/payment/index.js'
import { analyzeAddress, getTxHistory, trackWhales, getTokenInfo } from '../modules/data/index.js'
import { getDefiYields, swapTokens, optimizeYield } from '../modules/defi/index.js'
import { createAutomationTask, createAutoTrade, batchTransfer, listTasks } from '../modules/automation/index.js'
import { registerAgentIdentity, getAgentReputation, verifyAgent } from '../modules/identity/index.js'
import type { TokenSymbol } from '@tronclaw/shared'

export function createMcpServer(): McpServer {
  const server = new McpServer({
    name: 'TronClaw',
    version: '1.0.0',
  })

  // ─── Payment Tools ─────────────────────────────────────────────────────────

  server.tool(
    'tron_check_balance',
    'Check TRX, USDT, or USDD balance for a TRON address',
    {
      address: z.string().describe('TRON wallet address (base58)'),
      token: z.enum(['TRX', 'USDT', 'USDD']).optional().default('USDT').describe('Token to check'),
    },
    async ({ address, token }) => {
      const result = await checkBalance(address, token as TokenSymbol)
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(result, null, 2),
        }],
      }
    },
  )

  server.tool(
    'tron_send_payment',
    'Send USDT or USDD to a TRON address using x402 protocol',
    {
      to: z.string().describe('Recipient TRON address'),
      amount: z.string().describe('Amount to send (e.g. "1.5")'),
      token: z.enum(['USDT', 'USDD']).describe('Token to send'),
      memo: z.string().optional().describe('Optional payment memo'),
    },
    async ({ to, amount, token, memo }) => {
      const result = await sendPayment(to, amount, token as TokenSymbol, memo)
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(result, null, 2),
        }],
      }
    },
  )

  server.tool(
    'tron_create_payment_request',
    'Create an x402 payment request URL for collecting USDT/USDD',
    {
      amount: z.string().describe('Amount to collect'),
      token: z.enum(['USDT', 'USDD']).describe('Token to collect'),
      description: z.string().describe('Description of the service/product'),
    },
    async ({ amount, token, description }) => {
      const result = await createPaymentRequest(amount, token as TokenSymbol, description)
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(result, null, 2),
        }],
      }
    },
  )

  server.tool(
    'tron_payment_status',
    'Check the status of a payment request by payId',
    {
      payId: z.string().describe('Payment request ID'),
    },
    async ({ payId }) => {
      const result = await getPaymentStatus(payId)
      return {
        content: [{
          type: 'text',
          text: result ? JSON.stringify(result, null, 2) : 'Payment request not found',
        }],
      }
    },
  )

  // ─── On-chain Data Tools ───────────────────────────────────────────────────

  server.tool(
    'tron_analyze_address',
    'Analyze a TRON address: balances, token holdings, tx count, tags',
    {
      address: z.string().describe('TRON address to analyze'),
    },
    async ({ address }) => {
      const result = await analyzeAddress(address)
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(result, null, 2),
        }],
      }
    },
  )

  server.tool(
    'tron_tx_history',
    'Get TRC20 transaction history for a TRON address',
    {
      address: z.string().describe('TRON address'),
      limit: z.number().optional().default(20).describe('Number of transactions (max 100)'),
    },
    async ({ address, limit }) => {
      const result = await getTxHistory(address, limit)
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(result, null, 2),
        }],
      }
    },
  )

  server.tool(
    'tron_whale_tracker',
    'Track large USDT/USDD transfers on TRON (whale movements)',
    {
      token: z.enum(['TRX', 'USDT', 'USDD']).optional().default('USDT').describe('Token to track'),
      minAmount: z.string().optional().describe('Minimum transfer amount threshold'),
      hours: z.number().optional().default(24).describe('Time range in hours'),
    },
    async ({ token, minAmount, hours }) => {
      const result = await trackWhales(token as TokenSymbol, minAmount, hours)
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(result, null, 2),
        }],
      }
    },
  )

  server.tool(
    'tron_token_info',
    'Get information about a TRC20 token: name, supply, holders, price',
    {
      tokenAddress: z.string().describe('TRC20 contract address'),
    },
    async ({ tokenAddress }) => {
      const result = await getTokenInfo(tokenAddress)
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(result, null, 2),
        }],
      }
    },
  )

  // ─── DeFi Tools ────────────────────────────────────────────────────────────

  server.tool(
    'tron_defi_yields',
    'Query current DeFi yield rates on TRON (SunSwap, JustLend)',
    {
      protocol: z.enum(['sunswap', 'justlend', 'all']).optional().default('all').describe('Protocol to query'),
    },
    async ({ protocol }) => {
      const result = await getDefiYields(protocol)
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(result, null, 2),
        }],
      }
    },
  )

  server.tool(
    'tron_swap',
    'Swap tokens on SunSwap DEX',
    {
      fromToken: z.string().describe('Source token symbol or address (e.g. TRX, USDT)'),
      toToken: z.string().describe('Target token symbol or address'),
      amount: z.string().describe('Amount to swap'),
      slippage: z.number().optional().default(0.5).describe('Slippage tolerance in percent'),
    },
    async ({ fromToken, toToken, amount, slippage }) => {
      const result = await swapTokens(fromToken, toToken, amount, slippage)
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(result, null, 2),
        }],
      }
    },
  )

  server.tool(
    'tron_yield_optimize',
    'Get AI-powered DeFi yield optimization strategy for your portfolio',
    {
      portfolio: z.array(z.object({
        token: z.string(),
        amount: z.string(),
      })).describe('Current token holdings'),
      riskPreference: z.enum(['low', 'medium', 'high']).default('medium').describe('Risk tolerance'),
    },
    async ({ portfolio, riskPreference }) => {
      const result = await optimizeYield(portfolio, riskPreference)
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(result, null, 2),
        }],
      }
    },
  )

  // ─── Automation Tools ──────────────────────────────────────────────────────

  server.tool(
    'tron_auto_trade',
    'Set up an automated trade triggered by price conditions',
    {
      tokenPair: z.string().describe('Token pair e.g. TRX/USDT'),
      triggerPrice: z.string().describe('Price that triggers the trade'),
      action: z.enum(['buy', 'sell']).describe('Buy or sell'),
      amount: z.string().describe('Amount to trade'),
    },
    async ({ tokenPair, triggerPrice, action, amount }) => {
      const result = await createAutoTrade(tokenPair, triggerPrice, action, amount)
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(result, null, 2),
        }],
      }
    },
  )

  server.tool(
    'tron_batch_transfer',
    'Send tokens to multiple addresses in one operation',
    {
      transfers: z.array(z.object({
        to: z.string(),
        amount: z.string(),
        token: z.enum(['USDT', 'USDD', 'TRX']),
      })).describe('List of transfers'),
    },
    async ({ transfers }) => {
      const result = await batchTransfer(transfers)
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(result, null, 2),
        }],
      }
    },
  )

  // ─── Identity Tools ────────────────────────────────────────────────────────

  server.tool(
    'tron_register_agent_identity',
    'Register an AI Agent on-chain identity using 8004 protocol',
    {
      agentName: z.string().describe('Name for the agent'),
      capabilities: z.array(z.string()).describe('List of agent capabilities'),
      ownerAddress: z.string().describe('Owner TRON address'),
    },
    async ({ agentName, capabilities, ownerAddress }) => {
      const result = await registerAgentIdentity(agentName, capabilities, ownerAddress)
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(result, null, 2),
        }],
      }
    },
  )

  server.tool(
    'tron_agent_reputation',
    'Query on-chain reputation and trust score for an AI Agent',
    {
      agentId: z.string().describe('Agent ID'),
    },
    async ({ agentId }) => {
      const result = await getAgentReputation(agentId)
      return {
        content: [{
          type: 'text',
          text: result ? JSON.stringify(result, null, 2) : 'Agent not found',
        }],
      }
    },
  )

  return server
}

/**
 * Start MCP server in stdio mode (for Claude Desktop / OpenClaw integration)
 */
export async function startMcpStdio() {
  const server = createMcpServer()
  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error('[MCP] TronClaw MCP server running on stdio')
}
