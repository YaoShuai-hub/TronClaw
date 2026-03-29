import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plug, Copy, Check, ExternalLink, Terminal, Layers, Code2, ChevronDown, X, Zap } from 'lucide-react'
import axios from 'axios'

interface ConnectConfig {
  mcp: { config: object; configPath: string; description: string }
  openclaw: { configSnippet: string; installCmd: string; description: string; gatewayUrl: string }
  rest: { baseUrl: string; healthCheck: string }
  status: { gateway: string; network: string; mock: boolean; tools: number }
}

export default function AgentConnect() {
  const [open, setOpen] = useState(false)
  const [config, setConfig] = useState<ConnectConfig | null>(null)
  const [tab, setTab] = useState<'openclaw' | 'mcp' | 'rest'>('openclaw')
  const [copied, setCopied] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const loadConfig = async () => {
    if (config) { setOpen(true); return }
    setLoading(true)
    try {
      const { data } = await axios.get('/api/v1/agent/connect-config')
      setConfig(data.data)
      setOpen(true)
    } catch { setOpen(true) }
    finally { setLoading(false) }
  }

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  const TABS = [
    { id: 'openclaw' as const, icon: Terminal, label: 'OpenClaw' },
    { id: 'mcp' as const, icon: Layers, label: 'MCP' },
    { id: 'rest' as const, icon: Code2, label: 'REST API' },
  ]

  return (
    <>
      <button
        onClick={loadConfig}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-brand/30 bg-brand/5 hover:bg-brand/10 hover:border-brand/50 transition-all text-sm font-medium text-brand"
      >
        <Plug size={15} />
        <span className="hidden sm:inline">{loading ? 'Loading...' : 'Connect Agent'}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="glass-card w-full max-w-lg mx-4 p-6"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-text-0 flex items-center gap-2">
                    <Plug size={16} className="text-brand" /> Connect External Agent
                  </h2>
                  {config && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                      <span className="text-xs text-text-3">{config.status.network} • {config.status.tools} tools • {config.status.gateway}</span>
                    </div>
                  )}
                </div>
                <button onClick={() => setOpen(false)} className="text-text-3 hover:text-text-0">
                  <X size={16} />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-1.5 mb-5 bg-bg-4 rounded-xl p-1">
                {TABS.map(t => (
                  <button key={t.id} onClick={() => setTab(t.id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-all
                      ${tab === t.id ? 'bg-bg-2 text-text-0 shadow-sm' : 'text-text-3 hover:text-text-1'}`}>
                    <t.icon size={12} /> {t.label}
                  </button>
                ))}
              </div>

              {/* OpenClaw tab */}
              {tab === 'openclaw' && (
                <div className="space-y-4">
                  <p className="text-xs text-text-2">Connect TronClaw to your local OpenClaw instance in 2 steps.</p>

                  <div>
                    <div className="text-xs text-text-3 mb-1.5 flex items-center gap-1"><span className="w-4 h-4 rounded-full bg-brand/20 text-brand text-[10px] flex items-center justify-center font-bold">1</span> Install TronClaw skill</div>
                    <div className="bg-bg-4 rounded-xl p-3 flex items-center justify-between gap-2">
                      <code className="text-xs text-accent font-mono flex-1 overflow-x-auto">
                        {config?.openclaw.installCmd ?? 'clawhub install tronclaw'}
                      </code>
                      <button onClick={() => copy(config?.openclaw.installCmd ?? '', 'install')} className="text-text-3 hover:text-text-0 flex-shrink-0">
                        {copied === 'install' ? <Check size={13} className="text-accent" /> : <Copy size={13} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-text-3 mb-1.5 flex items-center gap-1"><span className="w-4 h-4 rounded-full bg-brand/20 text-brand text-[10px] flex items-center justify-center font-bold">2</span> Add to ~/.openclaw/config.yaml</div>
                    <div className="bg-bg-4 rounded-xl p-3 flex items-start justify-between gap-2">
                      <pre className="text-xs text-accent font-mono flex-1 overflow-x-auto whitespace-pre">
                        {config?.openclaw.configSnippet ?? 'skills:\n  tronclaw:\n    gateway_url: http://localhost:3000'}
                      </pre>
                      <button onClick={() => copy(config?.openclaw.configSnippet ?? '', 'snippet')} className="text-text-3 hover:text-text-0 flex-shrink-0 mt-1">
                        {copied === 'snippet' ? <Check size={13} className="text-accent" /> : <Copy size={13} />}
                      </button>
                    </div>
                  </div>

                  <div className="glass-card p-3 border-accent/10 text-xs text-text-2">
                    <div className="flex items-start gap-2"><Zap size={12} className="text-accent mt-0.5" />
                      <div>After setup, OpenClaw agents can call TronClaw tools directly:<br />
                        <span className="text-accent font-mono">"查询我的USDT余额" → tron_check_balance</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* MCP tab */}
              {tab === 'mcp' && (
                <div className="space-y-4">
                  <p className="text-xs text-text-2">Add to Claude Desktop, Cursor or any MCP-compatible client.</p>
                  <div>
                    <div className="text-xs text-text-3 mb-1.5">Add to {config?.mcp.configPath ?? '~/.config/claude/claude_desktop_config.json'}</div>
                    <div className="bg-bg-4 rounded-xl p-3 flex items-start justify-between gap-2 max-h-48 overflow-y-auto">
                      <pre className="text-xs text-accent font-mono flex-1 whitespace-pre">
                        {JSON.stringify(config?.mcp.config ?? {}, null, 2)}
                      </pre>
                      <button onClick={() => copy(JSON.stringify(config?.mcp.config ?? {}, null, 2), 'mcp')} className="text-text-3 hover:text-text-0 flex-shrink-0">
                        {copied === 'mcp' ? <Check size={13} className="text-accent" /> : <Copy size={13} />}
                      </button>
                    </div>
                  </div>
                  <div className="text-xs text-text-3">Restart Claude Desktop / Cursor after saving config.</div>
                </div>
              )}

              {/* REST tab */}
              {tab === 'rest' && (
                <div className="space-y-3">
                  <p className="text-xs text-text-2">Direct HTTP integration — works with any agent or application.</p>
                  {[
                    { label: 'Base URL', value: config?.rest.baseUrl ?? 'http://localhost:3000/api/v1', key: 'base' },
                    { label: 'Health Check', value: config?.rest.healthCheck ?? 'http://localhost:3000/health', key: 'health' },
                  ].map(item => (
                    <div key={item.key}>
                      <div className="text-[10px] text-text-3 mb-1">{item.label}</div>
                      <div className="bg-bg-4 rounded-xl px-3 py-2 flex items-center justify-between gap-2">
                        <code className="text-xs text-accent font-mono flex-1 overflow-x-auto">{item.value}</code>
                        <button onClick={() => copy(item.value, item.key)} className="text-text-3 hover:text-text-0 flex-shrink-0">
                          {copied === item.key ? <Check size={12} className="text-accent" /> : <Copy size={12} />}
                        </button>
                      </div>
                    </div>
                  ))}
                  <a href="https://github.com/YaoShuai-hub/TronClaw#api-reference" target="_blank" rel="noopener"
                    className="flex items-center gap-1.5 text-xs text-brand/70 hover:text-brand transition-colors">
                    <ExternalLink size={11} /> View full API documentation
                  </a>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
