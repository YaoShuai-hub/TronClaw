import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Store, Star, Zap, ExternalLink, DollarSign, X, Clock, CheckCircle, Bot } from 'lucide-react'
import axios from 'axios'
import { useWallet } from '../stores/wallet.ts'

const TRONSCAN = 'https://nile.tronscan.org/#'
const FALLBACK = 'TFp3Ls4mHdzysbX1qxbwXdMzS8mkvhCMx6'

interface Service {
  id: string; name: string; description: string
  agentName: string; agentId: string; price: string; token: string
  category: string; rating: number; totalCalls: number
}

interface InvocationResult {
  id: string; txHash: string | null; amount: string; token: string
  status: string; result: string; createdAt: number
}

interface Stats { totalServices: number; totalVolume: string; activeAgents: number; totalInvocations: number }

const CATEGORIES = ['All', 'Content', 'Trading', 'Security', 'Data', 'DeFi']

export default function Market() {
  const { address } = useWallet()
  const callerAddress = address ?? FALLBACK

  const [services, setServices] = useState<Service[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [category, setCategory] = useState('All')
  const [invoking, setInvoking] = useState<string | null>(null)
  const [invResult, setInvResult] = useState<InvocationResult | null>(null)
  const [selectedSvc, setSelectedSvc] = useState<Service | null>(null)
  const [inputText, setInputText] = useState('')
  const [history, setHistory] = useState<InvocationResult[]>([])

  const loadData = async () => {
    try {
      const [svcRes, statsRes, histRes] = await Promise.all([
        axios.get('/api/v1/market/services'),
        axios.get('/api/v1/market/stats'),
        axios.get(`/api/v1/market/history?address=${callerAddress}`),
      ])
      setServices(svcRes.data.data)
      setStats(statsRes.data.data)
      setHistory(histRes.data.data)
    } catch (e) { console.error(e) }
  }

  useEffect(() => { loadData() }, [callerAddress])

  const filtered = category === 'All' ? services : services.filter(s => s.category === category)

  const invokeService = async (svc: Service, input?: string) => {
    setInvoking(svc.id); setInvResult(null)
    try {
      const { data } = await axios.post('/api/v1/market/invoke', {
        serviceId: svc.id, callerAddress, input: input || svc.name,
      })
      setInvResult(data.data)
      await loadData()
    } catch (e) {
      setInvResult({ id: 'err', txHash: null, amount: svc.price, token: svc.token, status: 'failed', result: (e as Error).message, createdAt: Date.now() })
    } finally { setInvoking(null); setSelectedSvc(null); setInputText('') }
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 space-y-5 max-w-6xl mx-auto">
        {/* Header */}
        <div className="animate-fade-in-up">
          <div className="flex items-center gap-2 mb-1"><span className="text-2xl">💳</span><h1 className="text-2xl font-bold text-text-0">SealPay</h1></div>
          <p className="text-sm text-text-3">AI Agent service marketplace — auto-payment via x402 protocol on TRON</p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-4 gap-4 animate-fade-in-up delay-1">
            {[
              { label: 'Services', value: String(stats.totalServices), icon: Store },
              { label: 'Volume (USDT)', value: stats.totalVolume, icon: DollarSign },
              { label: 'Active Agents', value: String(stats.activeAgents), icon: Bot },
              { label: 'Total Calls', value: String(stats.totalInvocations), icon: Zap },
            ].map(s => (
              <div key={s.label} className="glass-card p-4 flex items-center gap-3">
                <s.icon size={15} className="text-brand" />
                <div><div className="text-lg font-bold text-text-0">{s.value}</div><div className="text-[10px] text-text-3">{s.label}</div></div>
              </div>
            ))}
          </div>
        )}

        {/* Result toast */}
        <AnimatePresence>
          {invResult && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className={`glass-card p-4 border ${invResult.status === 'completed' ? 'border-accent/20' : 'border-red-400/20'}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className={`text-sm font-medium mb-1 flex items-center gap-2 ${invResult.status === 'completed' ? 'text-accent' : 'text-red-400'}`}>
                    {invResult.status === 'completed' ? <CheckCircle size={14} /> : <X size={14} />}
                    {invResult.status === 'completed' ? `Paid ${invResult.amount} ${invResult.token} via x402` : 'Invocation failed'}
                  </div>
                  {invResult.result && <p className="text-xs text-text-2 leading-relaxed">{invResult.result}</p>}
                  {invResult.txHash && (
                    <a href={`${TRONSCAN}/transaction/${invResult.txHash}`} target="_blank" className="text-[10px] text-brand/70 hover:text-brand flex items-center gap-1 mt-2">
                      View tx: {invResult.txHash.slice(0, 20)}... <ExternalLink size={8} />
                    </a>
                  )}
                </div>
                <button onClick={() => setInvResult(null)} className="text-text-3 hover:text-text-0"><X size={14} /></button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Category filter */}
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all
                ${category === cat ? 'border-brand/40 bg-brand/10 text-brand' : 'border-white/[0.06] text-text-3 hover:text-text-0 hover:border-white/[0.12]'}`}>
              {cat}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-5">
          {/* Service grid */}
          <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4">
            {filtered.map((svc, i) => (
              <motion.div key={svc.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="glass-card glow-border p-4 flex flex-col">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-text-0 text-sm truncate">{svc.name}</h3>
                    <p className="text-[10px] text-text-3">by {svc.agentName}</p>
                  </div>
                  <span className="badge badge-orange !text-[9px] ml-2 flex-shrink-0">{svc.category}</span>
                </div>
                <p className="text-xs text-text-2 leading-relaxed flex-1 mb-3">{svc.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-brand">{svc.price} {svc.token}</span>
                    <span className="flex items-center gap-0.5 text-[11px] text-yellow-400"><Star size={10} fill="currentColor" /> {svc.rating.toFixed(1)}</span>
                  </div>
                  <button onClick={() => setSelectedSvc(svc)} disabled={!!invoking}
                    className="btn-primary !text-[10px] !py-1.5 !px-3 disabled:opacity-50">
                    {invoking === svc.id ? '...' : 'Invoke'}
                  </button>
                </div>
                <div className="text-[9px] text-text-3 mt-2">{svc.totalCalls.toLocaleString()} invocations</div>
              </motion.div>
            ))}
          </div>

          {/* History sidebar */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-text-0 flex items-center gap-2"><Clock size={13} className="text-text-3" /> Recent History</h3>
            {history.length === 0 ? (
              <div className="glass-card p-4 text-center text-xs text-text-3">No invocations yet</div>
            ) : history.map(h => (
              <div key={h.id} className="glass-card p-3 text-xs">
                <div className={`flex items-center gap-1.5 mb-1 font-medium ${h.status === 'completed' ? 'text-accent' : 'text-red-400'}`}>
                  <CheckCircle size={11} /> Paid {h.amount} {h.token}
                </div>
                <p className="text-text-3 truncate">{h.result?.slice(0, 50)}...</p>
                {h.txHash && (
                  <a href={`${TRONSCAN}/transaction/${h.txHash}`} target="_blank" className="text-[9px] text-brand/60 hover:text-brand flex items-center gap-0.5 mt-1">
                    {h.txHash.slice(0, 16)}... <ExternalLink size={7} />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Invoke Modal */}
        <AnimatePresence>
          {selectedSvc && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
              onClick={() => setSelectedSvc(null)}>
              <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
                onClick={e => e.stopPropagation()} className="glass-card p-6 w-full max-w-md mx-4">
                <div className="flex items-start justify-between mb-4">
                  <div><h3 className="font-bold text-text-0">{selectedSvc.name}</h3><p className="text-xs text-text-3">by {selectedSvc.agentName}</p></div>
                  <button onClick={() => setSelectedSvc(null)} className="text-text-3 hover:text-text-0"><X size={16} /></button>
                </div>
                <p className="text-sm text-text-2 mb-4">{selectedSvc.description}</p>
                <textarea value={inputText} onChange={e => setInputText(e.target.value)}
                  placeholder="Optional: enter your specific request..."
                  className="w-full bg-bg-4 border border-white/[0.06] rounded-xl px-3 py-2.5 text-sm text-text-0 placeholder-text-3 outline-none resize-none h-20 mb-4 focus:border-brand/40" />
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <span className="text-text-3">Cost: </span>
                    <span className="font-bold text-brand">{selectedSvc.price} {selectedSvc.token}</span>
                    <span className="text-[10px] text-text-3 ml-1">(via x402)</span>
                  </div>
                  <button onClick={() => invokeService(selectedSvc, inputText)} disabled={!!invoking}
                    className="btn-primary disabled:opacity-50">
                    {invoking ? 'Invoking...' : 'Confirm & Pay'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
