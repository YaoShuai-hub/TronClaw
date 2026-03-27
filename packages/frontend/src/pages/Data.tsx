import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ExternalLink, ArrowUpRight, ArrowDownLeft, Eye, Waves, Activity } from 'lucide-react'
import axios from 'axios'

const TRONSCAN = 'https://nile.tronscan.org/#'
function shorten(s: string, n = 6) { return s.length > n * 2 ? `${s.slice(0, n)}...${s.slice(-4)}` : s }

interface AddressInfo {
  address: string; trxBalance: string
  tokenHoldings: Array<{ symbol: string; balance: string }>
  txCount: number; firstTxDate: string | null; tags: string[]
}
interface Transaction { hash: string; from: string; to: string; value: string; tokenSymbol: string; timestamp: number }
interface WhaleTransfer { hash: string; from: string; to: string; amount: string; tokenSymbol: string; timestamp: number; usdValue: string }

export default function Data() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [info, setInfo] = useState<AddressInfo | null>(null)
  const [txs, setTxs] = useState<Transaction[]>([])
  const [whales, setWhales] = useState<WhaleTransfer[]>([])
  const [whaleLoading, setWhaleLoading] = useState(true)
  const [error, setError] = useState('')

  // Load whales on mount
  useEffect(() => {
    axios.get('/api/v1/data/whales?token=USDT&hours=24')
      .then(r => { setWhales(r.data.data); setWhaleLoading(false) })
      .catch(() => setWhaleLoading(false))
  }, [])

  // WS for live whale alerts
  useEffect(() => {
    const ws = new WebSocket(`ws://${window.location.host}/ws`)
    ws.onmessage = (evt) => {
      try {
        const e = JSON.parse(evt.data)
        if (e.type === 'whale_alert') setWhales(prev => [e.data, ...prev].slice(0, 20))
      } catch {}
    }
    return () => ws.close()
  }, [])

  const search = async () => {
    if (!query.trim()) return
    setLoading(true); setError('')
    try {
      const [addrRes, txRes] = await Promise.all([
        axios.get(`/api/v1/data/address/${query.trim()}`),
        axios.get(`/api/v1/data/transactions/${query.trim()}?limit=10`),
      ])
      setInfo(addrRes.data.data); setTxs(txRes.data.data)
    } catch { setError('Address not found or invalid'); setInfo(null); setTxs([]) }
    finally { setLoading(false) }
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 space-y-5 max-w-6xl mx-auto">
        <div className="animate-fade-in-up">
          <div className="flex items-center gap-2 mb-1"><span className="text-2xl">🔍</span><h1 className="text-2xl font-bold text-text-0">ChainEye</h1></div>
          <p className="text-sm text-text-3">AI on-chain analytics — address profiling, whale tracking, data intelligence</p>
        </div>

        {/* Search */}
        <div className="flex gap-3 animate-fade-in-up delay-1">
          <div className="flex-1 flex items-center gap-2 glass-card px-4 !rounded-xl">
            <Search size={15} className="text-text-3" />
            <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && search()}
              placeholder="Address / Tx Hash / Token name..." className="flex-1 bg-transparent text-sm text-text-0 placeholder-text-3 outline-none py-3 font-mono" />
          </div>
          <button onClick={search} disabled={loading || !query.trim()} className="btn-primary !py-2.5 disabled:opacity-40">
            {loading ? 'Searching...' : 'Analyze'}
          </button>
        </div>

        {error && <div className="glass-card p-3 border-red-400/20 text-red-400 text-sm">{error}</div>}

        <div className="grid lg:grid-cols-5 gap-5">
          {/* Left: search results (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            {info && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                {/* Address card */}
                <div className="glass-card p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye size={14} className="text-purple-400" />
                    <span className="text-sm font-semibold text-text-0">Address Profile</span>
                    {info.tags.map(t => <span key={t} className="badge badge-purple !text-[9px]">{t}</span>)}
                  </div>
                  <a href={`${TRONSCAN}/address/${info.address}`} target="_blank" className="text-xs font-mono text-text-2 hover:text-brand flex items-center gap-1 mb-4 break-all">
                    {info.address} <ExternalLink size={10} />
                  </a>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div><div className="text-[10px] text-text-3 uppercase mb-0.5">TRX Balance</div><div className="text-lg font-bold text-text-0">{parseFloat(info.trxBalance).toLocaleString()}</div></div>
                    <div><div className="text-[10px] text-text-3 uppercase mb-0.5">Transactions</div><div className="text-lg font-bold text-text-0">{info.txCount.toLocaleString()}</div></div>
                    <div><div className="text-[10px] text-text-3 uppercase mb-0.5">First Active</div><div className="text-lg font-bold text-text-0">{info.firstTxDate ?? 'N/A'}</div></div>
                  </div>
                  {info.tokenHoldings.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {info.tokenHoldings.map(t => (
                        <div key={t.symbol} className="badge"><span className="text-text-0 font-medium">{t.symbol}</span><span className="text-text-3">{parseFloat(t.balance).toLocaleString()}</span></div>
                      ))}
                    </div>
                  )}
                </div>
                {/* Tx history */}
                {txs.length > 0 && (
                  <div className="glass-card p-5">
                    <div className="text-sm font-semibold text-text-0 mb-3">Recent Transactions</div>
                    <div className="space-y-2">
                      {txs.map((tx, i) => {
                        const isSend = tx.from.toLowerCase() === query.trim().toLowerCase()
                        return (
                          <motion.div key={`${tx.hash}-${i}`} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                            className="flex items-center gap-3 py-2 px-3 rounded-xl bg-bg-3/50 border border-white/[0.04] text-xs">
                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${isSend ? 'bg-red-400/10 text-red-400' : 'bg-accent/10 text-accent'}`}>
                              {isSend ? <ArrowUpRight size={12} /> : <ArrowDownLeft size={12} />}
                            </div>
                            <a href={`${TRONSCAN}/transaction/${tx.hash}`} target="_blank" className="font-mono text-text-2 hover:text-brand">{shorten(tx.hash)}</a>
                            <span className={`ml-auto font-medium ${isSend ? 'text-red-400' : 'text-accent'}`}>
                              {isSend ? '-' : '+'}{parseFloat(tx.value || '0').toLocaleString()} {tx.tokenSymbol}
                            </span>
                          </motion.div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
            {!info && !error && !loading && (
              <div className="glass-card p-12 text-center"><Search size={40} className="mx-auto mb-3 text-text-3 opacity-15" /><p className="text-sm text-text-3">Enter a TRON address or tx hash to analyze</p></div>
            )}
          </div>

          {/* Right: Whale Monitor (2 cols) */}
          <div className="lg:col-span-2">
            <div className="glass-card p-5 sticky top-6">
              <div className="flex items-center gap-2 mb-4">
                <Waves size={14} className="text-brand" />
                <span className="text-sm font-semibold text-text-0">🐋 Whale Monitor</span>
                <span className="badge badge-orange !text-[9px] ml-auto">24h</span>
              </div>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                <AnimatePresence mode="popLayout">
                  {whaleLoading ? (
                    <div className="text-center py-8 text-text-3 text-xs">Loading whale data...</div>
                  ) : whales.length === 0 ? (
                    <div className="text-center py-8 text-text-3 text-xs">No whale transfers in last 24h</div>
                  ) : whales.map((w, i) => (
                    <motion.div key={`${w.hash}-${i}`} layout initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}
                      className="p-2.5 rounded-xl bg-bg-3/50 border border-white/[0.04] text-[11px]">
                      <div className="flex items-center justify-between mb-1">
                        <a href={`${TRONSCAN}/transaction/${w.hash}`} target="_blank" className="font-mono text-text-2 hover:text-brand">
                          {shorten(w.hash, 5)}
                        </a>
                        <span className="font-bold text-brand">{parseFloat(w.amount).toLocaleString()} {w.tokenSymbol}</span>
                      </div>
                      <div className="flex items-center gap-1 text-text-3">
                        <span className="font-mono">{shorten(w.from, 4)}</span> → <span className="font-mono">{shorten(w.to, 4)}</span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
