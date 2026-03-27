import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Plus, Pause, Play, Trash2, Clock, ExternalLink, Activity } from 'lucide-react'
import axios from 'axios'

const TRONSCAN = 'https://nile.tronscan.org/#'

interface Task {
  taskId: string; type: string; status: string
  conditions: Record<string, unknown>; triggerCount: number; createdAt: number
}

const STATUS_STYLE: Record<string, string> = {
  active: 'badge-green', paused: 'badge-orange', triggered: 'badge-blue',
  completed: 'badge-purple', cancelled: 'badge-red',
}

const TYPE_EMOJI: Record<string, string> = {
  auto_swap: '💱', price_alert: '🔔', scheduled_transfer: '📅', whale_alert: '🐋',
}

export default function Auto() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ type: 'auto_swap', tokenPair: 'TRX/USDT', triggerPrice: '0.08', action: 'buy', amount: '500' })
  const [result, setResult] = useState<string | null>(null)

  const loadTasks = () => {
    axios.get('/api/v1/automation/tasks').then(r => { setTasks(r.data.data); setLoading(false) }).catch(() => setLoading(false))
  }

  useEffect(() => { loadTasks() }, [])

  const createTask = async () => {
    setCreating(true); setResult(null)
    try {
      await axios.post('/api/v1/automation/trade', {
        tokenPair: form.tokenPair, triggerPrice: form.triggerPrice,
        action: form.action, amount: form.amount,
      })
      setResult('✅ Task created!')
      setShowCreate(false)
      loadTasks()
    } catch (e) { setResult('❌ Failed') }
    finally { setCreating(false) }
  }

  const cancelTask = async (id: string) => {
    try { await axios.delete(`/api/v1/automation/tasks/${id}`); loadTasks() } catch {}
  }

  const activeCount = tasks.filter(t => t.status === 'active').length
  const totalTriggers = tasks.reduce((s, t) => s + t.triggerCount, 0)

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 space-y-5 max-w-5xl mx-auto">
        <div className="animate-fade-in-up">
          <div className="flex items-center gap-2 mb-1"><span className="text-2xl">⚡</span><h1 className="text-2xl font-bold text-text-0">AutoHarvest</h1></div>
          <p className="text-sm text-text-3">AI automation hunter — auto-trade, scheduled tasks, whale-follow</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 animate-fade-in-up delay-1">
          <div className="glass-card p-4 flex items-center gap-3">
            <Zap size={16} className="text-accent" /><div><div className="text-lg font-bold text-text-0">{activeCount}</div><div className="text-[10px] text-text-3">Active Tasks</div></div>
          </div>
          <div className="glass-card p-4 flex items-center gap-3">
            <Activity size={16} className="text-brand" /><div><div className="text-lg font-bold text-text-0">{totalTriggers}</div><div className="text-[10px] text-text-3">Total Triggers</div></div>
          </div>
          <div className="glass-card p-4 flex items-center gap-3">
            <Clock size={16} className="text-purple-400" /><div><div className="text-lg font-bold text-text-0">{tasks.length}</div><div className="text-[10px] text-text-3">All Tasks</div></div>
          </div>
        </div>

        {/* Create task */}
        <div className="animate-fade-in-up delay-2">
          <button onClick={() => setShowCreate(v => !v)} className="btn-primary !text-sm gap-2 mb-4">
            <Plus size={15} /> Create Automation Task
          </button>

          <AnimatePresence>
            {showCreate && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="glass-card p-5 mb-4 overflow-hidden">
                <h3 className="text-sm font-semibold text-text-0 mb-3">New Auto-Trade Task</h3>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="text-[10px] text-text-3 block mb-1">Token Pair</label>
                    <select value={form.tokenPair} onChange={e => setForm(f => ({ ...f, tokenPair: e.target.value }))}
                      className="w-full bg-bg-4 border border-white/[0.06] rounded-xl px-3 py-2 text-sm text-text-0 outline-none">
                      <option>TRX/USDT</option><option>USDD/USDT</option><option>TRX/USDD</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-text-3 block mb-1">Action</label>
                    <select value={form.action} onChange={e => setForm(f => ({ ...f, action: e.target.value }))}
                      className="w-full bg-bg-4 border border-white/[0.06] rounded-xl px-3 py-2 text-sm text-text-0 outline-none">
                      <option value="buy">Buy (price below trigger)</option><option value="sell">Sell (price above trigger)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-text-3 block mb-1">Trigger Price</label>
                    <input value={form.triggerPrice} onChange={e => setForm(f => ({ ...f, triggerPrice: e.target.value }))}
                      className="w-full bg-bg-4 border border-white/[0.06] rounded-xl px-3 py-2 text-sm text-text-0 outline-none focus:border-brand/40" />
                  </div>
                  <div>
                    <label className="text-[10px] text-text-3 block mb-1">Amount</label>
                    <input value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                      className="w-full bg-bg-4 border border-white/[0.06] rounded-xl px-3 py-2 text-sm text-text-0 outline-none focus:border-brand/40" />
                  </div>
                </div>
                <button onClick={createTask} disabled={creating} className="btn-primary !text-xs disabled:opacity-50">
                  {creating ? 'Creating...' : 'Create Task'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
          {result && <div className="text-xs text-accent mb-3">{result}</div>}
        </div>

        {/* Task list */}
        <div>
          <h3 className="text-sm font-semibold text-text-0 mb-3">Task Queue</h3>
          <div className="space-y-2">
            {loading ? (
              <div className="glass-card p-8 text-center text-text-3 text-sm">Loading tasks...</div>
            ) : tasks.length === 0 ? (
              <div className="glass-card p-8 text-center"><Zap size={32} className="mx-auto mb-2 text-text-3 opacity-20" /><p className="text-sm text-text-3">No tasks yet. Create one above!</p></div>
            ) : tasks.map((task, i) => (
              <motion.div key={task.taskId} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                className="glass-card p-4 flex items-center gap-4">
                <span className="text-xl">{TYPE_EMOJI[task.type] ?? '🔧'}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-medium text-sm text-text-0 capitalize">{task.type.replace(/_/g, ' ')}</span>
                    <span className={`badge !text-[9px] ${STATUS_STYLE[task.status] ?? ''}`}>{task.status}</span>
                  </div>
                  <div className="text-[10px] text-text-3 font-mono">
                    {String(task.conditions.tokenPair
                      ? `${task.conditions.tokenPair} @ ${task.conditions.triggerPrice} → ${task.conditions.action} ${task.conditions.amount ?? ''}`
                      : JSON.stringify(task.conditions).slice(0, 60)
                    )}
                  </div>
                </div>
                <div className="text-right text-[10px] text-text-3 flex-shrink-0">
                  <div>Triggers: {task.triggerCount}</div>
                  <div>{new Date(task.createdAt).toLocaleDateString()}</div>
                </div>
                {task.status === 'active' && (
                  <button onClick={() => cancelTask(task.taskId)} className="text-red-400 hover:bg-red-400/10 p-1.5 rounded-lg transition-colors" title="Cancel">
                    <Trash2 size={14} />
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
