import { useState, useEffect, useRef } from 'react'
import { Activity, DollarSign, TrendingUp, Zap, Bot } from 'lucide-react'
import axios from 'axios'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

interface AgentToolCall {
  tool: string
  method: string
  path: string
  input: unknown
  result: unknown
  success: boolean
  duration: number
  timestamp: number
}

interface BalanceData {
  token: string
  balance: string
  usdValue: string
}

interface DeFiPool {
  protocol: string
  name: string
  apy: string
  tvl: string
  riskLevel: string
}

const DEMO_ADDRESS = 'TFp3Ls4mHdzysbX1qxbwXdMzS8mkvhCMx6'

function shorten(addr: string) {
  return addr && addr.length > 12 ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : addr
}

function formatNum(n: string) {
  const num = parseFloat(n)
  if (isNaN(num)) return '0'
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`
  return num.toFixed(2)
}

const TOOL_COLORS: Record<string, string> = {
  tron_payment: 'text-green-400',
  tron_data: 'text-purple-400',
  tron_defi: 'text-blue-400',
  tron_automation: 'text-orange-400',
  tron_identity: 'text-pink-400',
}

function toolColor(tool: string) {
  const prefix = Object.keys(TOOL_COLORS).find(k => tool.startsWith(k))
  return prefix ? TOOL_COLORS[prefix] : 'text-gray-400'
}

function toolIcon(tool: string) {
  if (tool.includes('payment') || tool.includes('balance')) return '💳'
  if (tool.includes('whale') || tool.includes('data') || tool.includes('address')) return '🔍'
  if (tool.includes('defi') || tool.includes('yield') || tool.includes('swap')) return '📈'
  if (tool.includes('auto') || tool.includes('batch')) return '⚡'
  if (tool.includes('identity') || tool.includes('agent')) return '🪪'
  return '🔧'
}

export default function Dashboard() {
  const [agentCalls, setAgentCalls] = useState<AgentToolCall[]>([])
  const [balances, setBalances] = useState<BalanceData[]>([])
  const [pools, setPools] = useState<DeFiPool[]>([])
  const [connected, setConnected] = useState(false)
  const [agentCount, setAgentCount] = useState(0)
  const wsRef = useRef<WebSocket | null>(null)

  // Load initial data
  useEffect(() => {
    const load = async () => {
      try {
        const [b1, b2, b3, defi] = await Promise.all([
          axios.get(`/api/v1/payment/balance?address=${DEMO_ADDRESS}&token=TRX`),
          axios.get(`/api/v1/payment/balance?address=${DEMO_ADDRESS}&token=USDT`),
          axios.get(`/api/v1/payment/balance?address=${DEMO_ADDRESS}&token=USDD`),
          axios.get('/api/v1/defi/yields'),
        ])
        setBalances([b1.data.data, b2.data.data, b3.data.data])
        setPools(defi.data.data.slice(0, 5))
      } catch (e) {
        console.error('Failed to load dashboard data', e)
      }
    }
    load()
  }, [])

  // WebSocket — receive real agent tool calls
  useEffect(() => {
    const wsUrl = `ws://${window.location.host}/ws`
    const ws = new WebSocket(wsUrl)
    wsRef.current = ws

    ws.onopen = () => {
      setConnected(true)
      setAgentCount(c => c + 1)
    }
    ws.onclose = () => setConnected(false)
    ws.onmessage = (evt) => {
      try {
        const event = JSON.parse(evt.data)
        if (event.type === 'agent_tool_call') {
          setAgentCalls(prev => [event.data as AgentToolCall, ...prev].slice(0, 50))
        }
        if (event.type === 'payment_confirmed' || event.type === 'transaction') {
          setAgentCalls(prev => [{
            tool: 'tron_payment_confirmed',
            method: 'EVENT',
            path: '/ws',
            input: {},
            result: event.data,
            success: true,
            duration: 0,
            timestamp: event.timestamp,
          }, ...prev].slice(0, 50))
        }
      } catch {}
    }
    return () => ws.close()
  }, [])

  const apyChartData = pools.map(p => ({
    name: p.name.replace(' LP', '').replace(' Supply', ''),
    apy: parseFloat(p.apy),
  }))

  return (
    <div className="h-full overflow-y-auto bg-[#070d1a]">
      <div className="p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Dashboard</h1>
            <p className="text-xs text-gray-500 font-mono">{DEMO_ADDRESS}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border
              ${connected ? 'border-green-400/30 bg-green-400/10 text-green-400' : 'border-gray-700 bg-gray-800/50 text-gray-500'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-green-400 animate-pulse' : 'bg-gray-600'}`} />
              {connected ? 'Live' : 'Connecting...'}
            </div>
            {agentCount > 0 && (
              <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border border-blue-400/30 bg-blue-400/10 text-blue-400">
                <Bot size={12} />
                {agentCount} agent{agentCount > 1 ? 's' : ''} connected
              </div>
            )}
          </div>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-3 gap-4">
          {balances.length > 0 ? balances.map(b => (
            <div key={b.token} className="p-4 rounded-xl bg-[#0a1220] border border-white/5">
              <div className="flex items-center gap-2 mb-3">
                <DollarSign size={14} className="text-green-400" />
                <span className="text-xs text-gray-500">{b.token}</span>
              </div>
              <div className="text-2xl font-bold">{formatNum(b.balance)}</div>
              <div className="text-xs text-gray-600 mt-1">≈ ${formatNum(b.usdValue)}</div>
            </div>
          )) : [{ token: 'TRX' }, { token: 'USDT' }, { token: 'USDD' }].map(b => (
            <div key={b.token} className="p-4 rounded-xl bg-[#0a1220] border border-white/5 animate-pulse">
              <div className="h-4 bg-white/5 rounded mb-3 w-16" />
              <div className="h-8 bg-white/5 rounded w-24" />
            </div>
          ))}
        </div>

        {/* Agent Activity Feed — MAIN FEATURE */}
        <div className="p-4 rounded-xl bg-[#0a1220] border border-green-400/10">
          <div className="flex items-center gap-2 mb-4">
            <Bot size={14} className="text-green-400" />
            <span className="text-sm font-medium text-green-400">Agent Activity Feed</span>
            <span className="ml-auto text-xs text-gray-600">{agentCalls.length} calls</span>
          </div>
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {agentCalls.length === 0 ? (
              <div className="text-center py-8 text-gray-600 text-sm">
                <Bot size={32} className="mx-auto mb-3 opacity-20" />
                <p>Waiting for agent connections...</p>
                <p className="text-xs mt-1">Connect an agent via MCP or Skills to see activity here</p>
              </div>
            ) : agentCalls.map((call, i) => (
              <div key={`${call.timestamp}-${i}`}
                className="flex items-center gap-3 py-2 px-3 rounded-lg bg-[#070d1a] border border-white/5 text-xs">
                <span className="text-lg flex-shrink-0">{toolIcon(call.tool)}</span>
                <div className="flex-1 min-w-0">
                  <div className={`font-mono font-medium ${toolColor(call.tool)}`}>{call.tool}</div>
                  <div className="text-gray-600 truncate">
                    {call.method} {call.path}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-gray-600">{call.duration}ms</span>
                  <span className={call.success ? 'text-green-400' : 'text-red-400'}>
                    {call.success ? '✓' : '✗'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* DeFi APY Chart */}
        <div className="p-4 rounded-xl bg-[#0a1220] border border-white/5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={14} className="text-blue-400" />
            <span className="text-sm font-medium">DeFi APY (%)</span>
          </div>
          <ResponsiveContainer width="100%" height={130}>
            <BarChart data={apyChartData} barSize={18}>
              <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#0a1220', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 8 }}
                labelStyle={{ color: '#9ca3af' }} itemStyle={{ color: '#4ade80' }} />
              <Bar dataKey="apy" fill="#4ade80" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* DeFi pools */}
        <div className="p-4 rounded-xl bg-[#0a1220] border border-white/5">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={14} className="text-blue-400" />
            <span className="text-sm font-medium">Top DeFi Pools</span>
          </div>
          <div className="space-y-2">
            {pools.map(pool => (
              <div key={pool.name} className="flex items-center gap-4 py-2 border-b border-white/5 last:border-0 text-sm">
                <div className="flex-1">
                  <div className="font-medium">{pool.name}</div>
                  <div className="text-xs text-gray-600 capitalize">{pool.protocol}</div>
                </div>
                <div className="text-right">
                  <div className="text-green-400 font-bold">{pool.apy}%</div>
                  <div className="text-xs text-gray-600">${formatNum(pool.tvl)} TVL</div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full
                  ${pool.riskLevel === 'low' ? 'bg-green-400/10 text-green-400' :
                    pool.riskLevel === 'medium' ? 'bg-yellow-400/10 text-yellow-400' :
                    'bg-red-400/10 text-red-400'}`}>
                  {pool.riskLevel}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
