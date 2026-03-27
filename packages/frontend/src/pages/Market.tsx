import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Store, Star, Zap, ExternalLink, DollarSign } from 'lucide-react'
import axios from 'axios'
import { useWallet } from '../stores/wallet.ts'

interface Service {
  id: string
  name: string
  description: string
  agentName: string
  agentId: string
  price: string
  token: string
  rating: number
  totalCalls: number
  category: string
}

const DEMO_SERVICES: Service[] = [
  { id: 'svc_001', name: 'AI Writing Assistant', description: 'Generate articles, blog posts, marketing copy with AI. Auto-charged per request.', agentName: 'TronClaw Writer', agentId: 'agent_writer_01', price: '0.10', token: 'USDT', rating: 4.8, totalCalls: 1247, category: 'Content' },
  { id: 'svc_002', name: 'TRX Trading Signal', description: 'AI-analyzed trading signals for TRX/USDT pair. Real-time market insights.', agentName: 'TronClaw Analyst', agentId: 'agent_analyst_01', price: '0.50', token: 'USDT', rating: 4.5, totalCalls: 856, category: 'Trading' },
  { id: 'svc_003', name: 'Smart Contract Audit', description: 'Automated security analysis of TRON smart contracts. Find vulnerabilities fast.', agentName: 'TronClaw Auditor', agentId: 'agent_auditor_01', price: '1.00', token: 'USDT', rating: 4.9, totalCalls: 312, category: 'Security' },
  { id: 'svc_004', name: 'CN↔EN Translation', description: 'High-quality Chinese-English bidirectional translation for crypto content.', agentName: 'TronClaw Translator', agentId: 'agent_translator_01', price: '0.05', token: 'USDT', rating: 4.7, totalCalls: 2103, category: 'Content' },
  { id: 'svc_005', name: 'Whale Alert Summary', description: 'Daily summary of whale movements on TRON. Know what big players are doing.', agentName: 'ChainEye Bot', agentId: 'agent_chaineye_01', price: '0.20', token: 'USDT', rating: 4.6, totalCalls: 678, category: 'Data' },
  { id: 'svc_006', name: 'DeFi Yield Report', description: 'Weekly AI-generated DeFi yield optimization report for your portfolio.', agentName: 'TronSage Bot', agentId: 'agent_sage_01', price: '0.30', token: 'USDT', rating: 4.4, totalCalls: 445, category: 'DeFi' },
]

const CATEGORIES = ['All', 'Content', 'Trading', 'Security', 'Data', 'DeFi']

export default function Market() {
  const [services] = useState<Service[]>(DEMO_SERVICES)
  const [category, setCategory] = useState('All')
  const [invoking, setInvoking] = useState<string | null>(null)
  const [lastResult, setLastResult] = useState<string | null>(null)

  const filtered = category === 'All' ? services : services.filter(s => s.category === category)
  const totalVolume = services.reduce((sum, s) => sum + parseFloat(s.price) * s.totalCalls, 0)

  const invokeService = async (service: Service) => {
    setInvoking(service.id)
    setLastResult(null)
    // Simulate x402 payment + service invocation
    await new Promise(r => setTimeout(r, 1500))
    setInvoking(null)
    setLastResult(`✅ ${service.name} completed! Charged ${service.price} ${service.token} via x402.`)
    setTimeout(() => setLastResult(null), 5000)
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 space-y-5 max-w-6xl mx-auto">
        {/* Header */}
        <div className="animate-fade-in-up">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">💳</span>
            <h1 className="text-2xl font-bold text-text-0">SealPay</h1>
          </div>
          <p className="text-sm text-text-3">AI Agent service marketplace — auto-payment via x402 protocol</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 animate-fade-in-up delay-1">
          {[
            { label: 'Services', value: String(services.length), icon: Store },
            { label: 'Total Volume', value: `$${totalVolume.toFixed(0)}`, icon: DollarSign },
            { label: 'Active Agents', value: String(new Set(services.map(s => s.agentId)).size), icon: Zap },
          ].map(s => (
            <div key={s.label} className="glass-card p-4 flex items-center gap-3">
              <s.icon size={16} className="text-brand" />
              <div>
                <div className="text-lg font-bold text-text-0">{s.value}</div>
                <div className="text-[10px] text-text-3">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Category filter */}
        <div className="flex gap-2 flex-wrap animate-fade-in-up delay-2">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all
                ${category === cat
                  ? 'border-brand/40 bg-brand/10 text-brand'
                  : 'border-white/[0.06] text-text-3 hover:text-text-0 hover:border-white/[0.12]'
                }`}>
              {cat}
            </button>
          ))}
        </div>

        {/* Success toast */}
        {lastResult && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="glass-card p-3 border-accent/20 text-accent text-sm">{lastResult}</motion.div>
        )}

        {/* Service grid */}
        <div className="grid sm:grid-cols-2 gap-4">
          {filtered.map((svc, i) => (
            <motion.div key={svc.id}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="glass-card glow-border p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-text-0 text-sm">{svc.name}</h3>
                  <p className="text-[11px] text-text-3 mt-0.5">by {svc.agentName}</p>
                </div>
                <span className="badge badge-orange !text-[10px]">{svc.category}</span>
              </div>
              <p className="text-xs text-text-2 mb-4 leading-relaxed">{svc.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-brand">{svc.price} {svc.token}</span>
                  <span className="flex items-center gap-1 text-xs text-yellow-400">
                    <Star size={11} fill="currentColor" /> {svc.rating}
                  </span>
                  <span className="text-[10px] text-text-3">{svc.totalCalls.toLocaleString()} calls</span>
                </div>
                <button onClick={() => invokeService(svc)} disabled={!!invoking}
                  className="btn-primary !text-[11px] !py-1.5 !px-3 disabled:opacity-50">
                  {invoking === svc.id ? 'Paying...' : 'Invoke'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
