import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { NavLink } from 'react-router-dom'
import { Store, TrendingUp, Search, Zap, DollarSign, Activity, Bot, ArrowRight } from 'lucide-react'
import axios from 'axios'
import { useWallet } from '../stores/wallet.ts'

const FALLBACK = 'TFp3Ls4mHdzysbX1qxbwXdMzS8mkvhCMx6'

const MODULES = [
  { to: '/market', icon: Store, emoji: '💳', name: 'SealPay', desc: 'AI Agent service marketplace with x402 auto-payment', color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/20' },
  { to: '/defi', icon: TrendingUp, emoji: '📈', name: 'TronSage', desc: 'AI DeFi advisor — yield optimization & auto-execution', color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' },
  { to: '/data', icon: Search, emoji: '🔍', name: 'ChainEye', desc: 'On-chain analytics — whale tracking & address profiling', color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20' },
  { to: '/auto', icon: Zap, emoji: '⚡', name: 'AutoHarvest', desc: 'Automation hunter — auto-trade, scheduled tasks, whale-follow', color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/20' },
]

function CountUp({ value, decimals = 2 }: { value: number; decimals?: number }) {
  const [d, setD] = useState(0)
  useEffect(() => {
    const s = d, diff = value - s, dur = 800, t0 = performance.now()
    const anim = (now: number) => {
      const p = Math.min((now - t0) / dur, 1)
      setD(s + diff * (1 - Math.pow(1 - p, 3)))
      if (p < 1) requestAnimationFrame(anim)
    }
    requestAnimationFrame(anim)
  }, [value])
  return <>{d.toFixed(decimals)}</>
}

export default function Overview() {
  const { address } = useWallet()
  const addr = address ?? FALLBACK
  const [balances, setBalances] = useState<Array<{ token: string; balance: string; usdValue: string }>>([])
  const [agentCalls, setAgentCalls] = useState(0)

  useEffect(() => {
    const load = async () => {
      try {
        const [b1, b2, b3] = await Promise.all([
          axios.get(`/api/v1/payment/balance?address=${addr}&token=TRX`),
          axios.get(`/api/v1/payment/balance?address=${addr}&token=USDT`),
          axios.get(`/api/v1/payment/balance?address=${addr}&token=USDD`),
        ])
        setBalances([b1.data.data, b2.data.data, b3.data.data])
      } catch {}
    }
    load()
  }, [addr])

  // WS for agent activity count
  useEffect(() => {
    const ws = new WebSocket(`ws://${window.location.host}/ws`)
    ws.onmessage = (evt) => {
      try {
        const e = JSON.parse(evt.data)
        if (e.type === 'agent_tool_call') setAgentCalls(c => c + 1)
      } catch {}
    }
    return () => ws.close()
  }, [])

  const tokenGrad: Record<string, string> = { TRX: 'from-red-500/20 to-orange-500/5', USDT: 'from-green-500/20 to-emerald-500/5', USDD: 'from-blue-500/20 to-cyan-500/5' }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 space-y-6 max-w-6xl mx-auto">

        {/* Header */}
        <div className="animate-fade-in-up">
          <h1 className="text-2xl font-bold text-text-0">TronClaw Overview</h1>
          <p className="text-sm text-text-3 mt-1">AI Agent platform for TRON — 4 integrated modules, all Bank of AI infra</p>
        </div>

        {/* Balance row */}
        <div className="grid grid-cols-3 gap-4">
          {balances.map((b, i) => (
            <motion.div key={b.token} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className={`glass-card p-5 bg-gradient-to-br ${tokenGrad[b.token] ?? ''}`}>
              <div className="flex items-center gap-2 mb-2">
                <DollarSign size={14} className="text-brand" />
                <span className="text-xs font-medium text-text-2">{b.token}</span>
              </div>
              <div className="text-2xl font-bold text-text-0"><CountUp value={parseFloat(b.balance)} /></div>
              <div className="text-xs text-text-3 mt-1">≈ ${parseFloat(b.usdValue).toFixed(2)}</div>
            </motion.div>
          ))}
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Bank of AI Infra', value: '4/4', icon: Activity, color: 'text-brand' },
            { label: 'MCP Tools', value: '15', icon: Bot, color: 'text-accent' },
            { label: 'Agent Calls', value: String(agentCalls), icon: Zap, color: 'text-purple-400' },
            { label: 'Skills', value: '5', icon: Store, color: 'text-blue-400' },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.08 }}
              className="glass-card p-4 flex items-center gap-3">
              <s.icon size={18} className={s.color} />
              <div>
                <div className="text-lg font-bold text-text-0">{s.value}</div>
                <div className="text-[10px] text-text-3">{s.label}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Four modules */}
        <div>
          <h2 className="text-lg font-semibold text-text-0 mb-4">Platform Modules</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {MODULES.map((m, i) => (
              <motion.div key={m.to} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.1 }}>
                <NavLink to={m.to} className={`glass-card glow-border p-5 flex items-start gap-4 group block`}>
                  <div className={`w-11 h-11 rounded-xl ${m.bg} flex items-center justify-center flex-shrink-0 text-xl`}>
                    {m.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`font-semibold text-text-0`}>{m.name}</span>
                      <ArrowRight size={13} className="text-text-3 group-hover:text-brand group-hover:translate-x-1 transition-all" />
                    </div>
                    <p className="text-xs text-text-2 leading-relaxed">{m.desc}</p>
                  </div>
                </NavLink>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bank of AI bar */}
        <div className="glass-card p-4 flex items-center justify-between flex-wrap gap-3">
          <span className="text-xs font-semibold text-text-0">Bank of AI Integration</span>
          <div className="flex gap-2">
            {['x402 Payment', '8004 Identity', 'MCP Server', 'Skills Modules'].map(name => (
              <span key={name} className="badge badge-orange !text-[9px]">✅ {name}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
