import { useState, useEffect, useRef } from 'react'
import { Activity, DollarSign, TrendingUp, Zap, Bell } from 'lucide-react'
import axios from 'axios'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'

interface TxEvent {
  txHash: string
  from: string
  to: string
  amount: string
  token: string
  timestamp: number
  status: string
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

const DEMO_ADDRESS = 'TXYZopYRdj2D9XRtbG411XZZ3kM5VkAeBf'

function shorten(addr: string) {
  return addr.length > 12 ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : addr
}

function formatNum(n: string) {
  const num = parseFloat(n)
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`
  return num.toFixed(2)
}

export default function Dashboard() {
  const [txFeed, setTxFeed] = useState<TxEvent[]>([])
  const [balances, setBalances] = useState<BalanceData[]>([])
  const [pools, setPools] = useState<DeFiPool[]>([])
  const [connected, setConnected] = useState(false)
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

  // WebSocket connection
  useEffect(() => {
    const wsUrl = `ws://${window.location.host}/ws`
    const ws = new WebSocket(wsUrl)
    wsRef.current = ws

    ws.onopen = () => setConnected(true)
    ws.onclose = () => setConnected(false)
    ws.onmessage = (evt) => {
      try {
        const event = JSON.parse(evt.data)
        if (event.type === 'transaction' || event.type === 'payment_confirmed') {
          setTxFeed(prev => [event.data, ...prev].slice(0, 20))
        }
      } catch {}
    }
    return () => ws.close()
  }, [])

  // Simulate live tx feed in demo mode
  useEffect(() => {
    const tokens = ['USDT', 'USDD', 'TRX']
    const interval = setInterval(() => {
      const mock: TxEvent = {
        txHash: `0x${Math.random().toString(16).slice(2, 10)}`,
        from: `T${Math.random().toString(36).slice(2, 8).toUpperCase()}...`,
        to: `T${Math.random().toString(36).slice(2, 8).toUpperCase()}...`,
        amount: (Math.random() * 10000).toFixed(2),
        token: tokens[Math.floor(Math.random() * tokens.length)],
        timestamp: Date.now(),
        status: 'confirmed',
      }
      setTxFeed(prev => [mock, ...prev].slice(0, 20))
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const apyChartData = pools.map(p => ({ name: p.name.replace(' LP', '').replace(' Supply', ''), apy: parseFloat(p.apy) }))

  const tvlChartData = pools.map(p => ({
    name: p.name.replace(' LP', '').replace(' Supply', ''),
    tvl: parseFloat(p.tvl) / 1_000_000,
  }))

  return (
    <div className="h-full overflow-y-auto bg-[#070d1a]">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Dashboard</h1>
            <p className="text-sm text-gray-500">{DEMO_ADDRESS}</p>
          </div>
          <div className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border
            ${connected ? 'border-green-400/30 bg-green-400/10 text-green-400' : 'border-gray-700 bg-gray-800/50 text-gray-500'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-green-400 animate-pulse' : 'bg-gray-600'}`} />
            {connected ? 'Live' : 'Connecting...'}
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

        {/* Charts row */}
        <div className="grid grid-cols-2 gap-4">
          {/* APY Chart */}
          <div className="p-4 rounded-xl bg-[#0a1220] border border-white/5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={14} className="text-blue-400" />
              <span className="text-sm font-medium">DeFi APY (%)</span>
            </div>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={apyChartData} barSize={18}>
                <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#0a1220', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 8 }}
                  labelStyle={{ color: '#9ca3af' }}
                  itemStyle={{ color: '#4ade80' }}
                />
                <Bar dataKey="apy" fill="#4ade80" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* TVL Chart */}
          <div className="p-4 rounded-xl bg-[#0a1220] border border-white/5">
            <div className="flex items-center gap-2 mb-4">
              <Activity size={14} className="text-purple-400" />
              <span className="text-sm font-medium">TVL ($M)</span>
            </div>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={tvlChartData} barSize={18}>
                <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#0a1220', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 8 }}
                  labelStyle={{ color: '#9ca3af' }}
                  itemStyle={{ color: '#a78bfa' }}
                />
                <Bar dataKey="tvl" fill="#a78bfa" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Transaction Feed */}
        <div className="p-4 rounded-xl bg-[#0a1220] border border-white/5">
          <div className="flex items-center gap-2 mb-4">
            <Zap size={14} className="text-green-400" />
            <span className="text-sm font-medium">Live Transaction Feed</span>
            <span className="ml-auto text-xs text-gray-600">{txFeed.length} events</span>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {txFeed.length === 0 ? (
              <div className="text-center text-gray-600 text-sm py-8">Waiting for transactions...</div>
            ) : txFeed.map((tx, i) => (
              <div key={`${tx.txHash}-${i}`}
                className="flex items-center gap-3 py-2 px-3 rounded-lg bg-[#070d1a] border border-white/5 text-xs animate-in fade-in duration-300">
                <span className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
                <span className="text-gray-500 font-mono">{shorten(tx.from)}</span>
                <span className="text-gray-600">→</span>
                <span className="text-gray-500 font-mono">{shorten(tx.to)}</span>
                <span className="ml-auto font-medium text-green-400">{parseFloat(tx.amount).toFixed(2)} {tx.token}</span>
              </div>
            ))}
          </div>
        </div>

        {/* DeFi pools table */}
        <div className="p-4 rounded-xl bg-[#0a1220] border border-white/5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={14} className="text-blue-400" />
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
