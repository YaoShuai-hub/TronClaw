import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, ArrowRightLeft, Droplets, Shield, Loader2, ExternalLink } from 'lucide-react'
import axios from 'axios'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

interface Pool { protocol: string; name: string; token0: string; token1?: string; apy: string; tvl: string; riskLevel: string }

const RISK_STYLE: Record<string, string> = { low: 'badge-green', medium: 'badge-orange', high: 'badge-red' }

export default function DeFi() {
  const [pools, setPools] = useState<Pool[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [swapFrom, setSwapFrom] = useState('TRX')
  const [swapTo, setSwapTo] = useState('USDT')
  const [swapAmount, setSwapAmount] = useState('100')
  const [swapping, setSwapping] = useState(false)
  const [swapResult, setSwapResult] = useState<string | null>(null)
  const [optimizing, setOptimizing] = useState(false)
  const [strategy, setStrategy] = useState<{ strategy: string; expectedApy: string; steps: Array<{ action: string; description: string }> } | null>(null)

  useEffect(() => {
    axios.get('/api/v1/defi/yields').then(r => { setPools(r.data.data); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const filtered = filter === 'all' ? pools : pools.filter(p => p.protocol === filter)
  const totalTVL = pools.reduce((s, p) => s + parseFloat(p.tvl), 0)
  const avgAPY = pools.length ? (pools.reduce((s, p) => s + parseFloat(p.apy), 0) / pools.length).toFixed(1) : '0'
  const chartData = pools.slice(0, 6).map(p => ({ name: p.name.replace(' LP', '').replace(' Supply', ''), apy: parseFloat(p.apy) }))

  const handleSwap = async () => {
    setSwapping(true); setSwapResult(null)
    try {
      const { data } = await axios.post('/api/v1/defi/swap', { fromToken: swapFrom, toToken: swapTo, amount: swapAmount, slippage: 0.5 })
      setSwapResult(`✅ Swapped ${swapAmount} ${swapFrom} → ${data.data.toAmount} ${swapTo}`)
    } catch (e) { setSwapResult('❌ Swap failed') }
    finally { setSwapping(false) }
  }

  const handleOptimize = async () => {
    setOptimizing(true); setStrategy(null)
    try {
      const { data } = await axios.post('/api/v1/defi/optimize', { portfolio: [{ token: 'USDT', amount: '1000' }], riskPreference: 'low' })
      setStrategy(data.data)
    } catch {}
    finally { setOptimizing(false) }
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 space-y-5 max-w-6xl mx-auto">
        <div className="animate-fade-in-up">
          <div className="flex items-center gap-2 mb-1"><span className="text-2xl">📈</span><h1 className="text-2xl font-bold text-text-0">TronSage</h1></div>
          <p className="text-sm text-text-3">AI DeFi advisor — yield optimization & strategy execution on TRON</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 animate-fade-in-up delay-1">
          <div className="glass-card p-4"><div className="text-[10px] text-text-3 mb-1">Total TVL</div><div className="text-xl font-bold text-text-0">${(totalTVL / 1e6).toFixed(0)}M</div></div>
          <div className="glass-card p-4"><div className="text-[10px] text-text-3 mb-1">Avg APY</div><div className="text-xl font-bold text-accent">{avgAPY}%</div></div>
          <div className="glass-card p-4"><div className="text-[10px] text-text-3 mb-1">Protocols</div><div className="text-xl font-bold text-text-0">{new Set(pools.map(p => p.protocol)).size}</div></div>
        </div>

        {/* Chart + Swap side by side */}
        <div className="grid lg:grid-cols-2 gap-4">
          {/* APY Chart */}
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-4"><TrendingUp size={14} className="text-blue-400" /><span className="text-sm font-semibold text-text-0">Yield Rates (%)</span></div>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={chartData} barSize={20}>
                <XAxis dataKey="name" tick={{ fill: '#52525b', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#52525b', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#141419', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, fontSize: 12 }} />
                <Bar dataKey="apy" fill="url(#apyG)" radius={[6, 6, 0, 0]} />
                <defs><linearGradient id="apyG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f97316" /><stop offset="100%" stopColor="#f97316" stopOpacity={0.3} /></linearGradient></defs>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Swap Panel */}
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-4"><ArrowRightLeft size={14} className="text-brand" /><span className="text-sm font-semibold text-text-0">Quick Swap</span></div>
            <div className="space-y-3">
              <div className="flex gap-2 items-center">
                <select value={swapFrom} onChange={e => setSwapFrom(e.target.value)} className="flex-1 bg-bg-4 border border-white/[0.06] rounded-xl px-3 py-2.5 text-sm text-text-0 outline-none">
                  <option value="TRX">TRX</option><option value="USDT">USDT</option><option value="USDD">USDD</option>
                </select>
                <span className="text-text-3">→</span>
                <select value={swapTo} onChange={e => setSwapTo(e.target.value)} className="flex-1 bg-bg-4 border border-white/[0.06] rounded-xl px-3 py-2.5 text-sm text-text-0 outline-none">
                  <option value="USDT">USDT</option><option value="TRX">TRX</option><option value="USDD">USDD</option>
                </select>
              </div>
              <input value={swapAmount} onChange={e => setSwapAmount(e.target.value)} placeholder="Amount"
                className="w-full bg-bg-4 border border-white/[0.06] rounded-xl px-3 py-2.5 text-sm text-text-0 outline-none focus:border-brand/40" />
              <button onClick={handleSwap} disabled={swapping} className="btn-primary w-full !text-sm disabled:opacity-50">
                {swapping ? <><Loader2 size={14} className="animate-spin" /> Swapping...</> : 'Swap (SunSwap)'}
              </button>
              {swapResult && <div className="text-xs text-accent">{swapResult}</div>}
            </div>
          </div>
        </div>

        {/* AI Strategy */}
        <div className="glass-card glow-border p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2"><Shield size={14} className="text-purple-400" /><span className="text-sm font-semibold text-text-0">AI Yield Optimizer</span></div>
            <button onClick={handleOptimize} disabled={optimizing} className="btn-primary !text-[11px] !py-1.5 !px-4 disabled:opacity-50">
              {optimizing ? 'Analyzing...' : 'Optimize 1000 USDT (Low Risk)'}
            </button>
          </div>
          {strategy && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <div className="text-sm text-text-0 font-medium mb-2">{strategy.strategy}</div>
              <div className="flex items-center gap-2 mb-3"><span className="badge badge-green">APY {strategy.expectedApy}%</span></div>
              <div className="space-y-2">
                {strategy.steps.map((s, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs"><span className="badge !text-[9px]">Step {i + 1}</span><span className="text-text-2">{s.description}</span></div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Protocol filter + Pool list */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <Droplets size={14} className="text-blue-400" />
            <span className="text-sm font-semibold text-text-0">All Pools</span>
            <div className="flex gap-2 ml-auto">
              {['all', 'justlend', 'sunswap'].map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`text-[11px] px-3 py-1 rounded-full border transition-all capitalize
                    ${filter === f ? 'border-brand/30 bg-brand/10 text-brand' : 'border-white/[0.06] text-text-3 hover:text-text-0'}`}>
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            {filtered.map((pool, i) => (
              <motion.div key={pool.name} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                className="glass-card p-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-text-0">{pool.name}</div>
                  <div className="text-[10px] text-text-3 capitalize">{pool.protocol}</div>
                </div>
                <div className="text-right">
                  <div className="text-brand font-bold text-sm">{pool.apy}%</div>
                  <div className="text-[10px] text-text-3">${(parseFloat(pool.tvl) / 1e6).toFixed(1)}M</div>
                </div>
                <span className={`badge !text-[9px] ${RISK_STYLE[pool.riskLevel] ?? ''}`}>{pool.riskLevel}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
