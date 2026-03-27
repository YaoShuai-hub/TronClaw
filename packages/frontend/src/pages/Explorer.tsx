import { useState } from 'react'
import { Search, ExternalLink, ArrowRight } from 'lucide-react'
import axios from 'axios'

interface AddressInfo {
  address: string
  trxBalance: string
  tokenHoldings: Array<{ symbol: string; balance: string; decimals: number }>
  txCount: number
  firstTxDate: string | null
  tags: string[]
}

interface Transaction {
  hash: string
  from: string
  to: string
  value: string
  tokenSymbol: string
  timestamp: number
  confirmed: boolean
}

function shorten(addr: string, n = 8) {
  return addr.length > n * 2 ? `${addr.slice(0, n)}...${addr.slice(-4)}` : addr
}

export default function Explorer() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [addressInfo, setAddressInfo] = useState<AddressInfo | null>(null)
  const [txHistory, setTxHistory] = useState<Transaction[]>([])
  const [error, setError] = useState('')

  const search = async () => {
    if (!query.trim()) return
    setLoading(true)
    setError('')
    try {
      const [addrRes, txRes] = await Promise.all([
        axios.get(`/api/v1/data/address/${query.trim()}`),
        axios.get(`/api/v1/data/transactions/${query.trim()}?limit=10`),
      ])
      setAddressInfo(addrRes.data.data)
      setTxHistory(txRes.data.data)
    } catch (e) {
      setError('Address not found or invalid')
      setAddressInfo(null)
      setTxHistory([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-full overflow-y-auto bg-[#070d1a]">
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-xl font-bold">TRON Explorer</h1>
          <p className="text-sm text-gray-500">Analyze any TRON address on Nile testnet</p>
        </div>

        {/* Search */}
        <div className="flex gap-3">
          <div className="flex-1 flex items-center gap-2 bg-[#0a1220] border border-white/5 rounded-xl px-4">
            <Search size={16} className="text-gray-600" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && search()}
              placeholder="Enter TRON address (T...)"
              className="flex-1 bg-transparent text-sm text-white placeholder-gray-600 outline-none py-3"
            />
          </div>
          <button
            onClick={search}
            disabled={loading || !query.trim()}
            className="px-6 py-3 bg-green-500 hover:bg-green-400 disabled:bg-gray-700 text-black font-semibold rounded-xl text-sm transition-colors"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {/* Quick links */}
        <div className="flex gap-2 flex-wrap">
          <span className="text-xs text-gray-600">Quick:</span>
          {['TXYZopYRdj2D9XRtbG411XZZ3kM5VkAeBf', 'TPL66VK2gCXNCD7EJg9pgJRfqcRazjhUZY'].map(addr => (
            <button
              key={addr}
              onClick={() => { setQuery(addr); }}
              className="text-xs text-green-400/70 hover:text-green-400 font-mono transition-colors"
            >
              {shorten(addr)}
            </button>
          ))}
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-400/10 border border-red-400/20 text-red-400 text-sm">{error}</div>
        )}

        {/* Address info */}
        {addressInfo && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-[#0a1220] border border-white/5">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm font-medium">Address Info</span>
                {addressInfo.tags.map(tag => (
                  <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-blue-400/10 text-blue-400">{tag}</span>
                ))}
              </div>
              <div className="font-mono text-xs text-gray-400 mb-4 break-all">{addressInfo.address}</div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-xs text-gray-600 mb-1">TRX Balance</div>
                  <div className="font-bold">{parseFloat(addressInfo.trxBalance).toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-600 mb-1">Transactions</div>
                  <div className="font-bold">{addressInfo.txCount.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-600 mb-1">First Active</div>
                  <div className="font-bold text-sm">{addressInfo.firstTxDate ?? 'N/A'}</div>
                </div>
              </div>
              {addressInfo.tokenHoldings.length > 0 && (
                <div className="mt-4">
                  <div className="text-xs text-gray-600 mb-2">Token Holdings</div>
                  <div className="flex flex-wrap gap-2">
                    {addressInfo.tokenHoldings.map(t => (
                      <div key={t.symbol} className="px-3 py-1.5 rounded-lg bg-[#070d1a] border border-white/5 text-xs">
                        <span className="text-white font-medium">{t.symbol}</span>
                        <span className="text-gray-500 ml-2">{parseFloat(t.balance).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Tx history */}
            {txHistory.length > 0 && (
              <div className="p-4 rounded-xl bg-[#0a1220] border border-white/5">
                <div className="text-sm font-medium mb-4">Recent Transactions</div>
                <div className="space-y-2">
                  {txHistory.map((tx, i) => (
                    <div key={`${tx.hash}-${i}`} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0 text-xs">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
                      <span className="font-mono text-gray-500">{shorten(tx.hash, 6)}</span>
                      <span className="text-gray-600 font-mono">{shorten(tx.from)}</span>
                      <ArrowRight size={10} className="text-gray-600 flex-shrink-0" />
                      <span className="text-gray-600 font-mono">{shorten(tx.to)}</span>
                      <span className="ml-auto text-green-400 font-medium">{parseFloat(tx.value || '0').toFixed(2)} {tx.tokenSymbol}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {!addressInfo && !error && !loading && (
          <div className="text-center py-20 text-gray-600">
            <Search size={48} className="mx-auto mb-4 opacity-20" />
            <p>Enter a TRON address to explore</p>
          </div>
        )}
      </div>
    </div>
  )
}
