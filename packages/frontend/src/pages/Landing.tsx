import { NavLink } from 'react-router-dom'
import { ArrowRight, Zap, Shield, BarChart3, Bot, Code2, Terminal, Layers } from 'lucide-react'

const FEATURES = [
  { icon: Zap, color: 'text-orange-400', bg: 'bg-orange-400/10', title: 'AI Payment Agent', desc: 'Agents auto-collect USDT/USDD via x402 protocol. Micropayments for AI services, instant settlement.', tag: 'x402', tagClass: 'badge-orange' },
  { icon: BarChart3, color: 'text-blue-400', bg: 'bg-blue-400/10', title: 'AI DeFi Assistant', desc: 'Analyze yields across SunSwap & JustLend. AI optimizes your DeFi strategy automatically.', tag: 'Skills', tagClass: 'badge-blue' },
  { icon: Bot, color: 'text-purple-400', bg: 'bg-purple-400/10', title: 'On-chain Data Agent', desc: 'Track whale movements, analyze any address, real-time TRON blockchain intelligence.', tag: 'MCP', tagClass: 'badge-purple' },
  { icon: Shield, color: 'text-green-400', bg: 'bg-green-400/10', title: 'AI Automation', desc: 'Price-triggered auto-trades, batch transfers, scheduled tasks. Agents that never sleep.', tag: '8004', tagClass: 'badge-green' },
]

const INFRA = [
  { name: 'x402 Payment Protocol', desc: 'AI-native payment. Agents send & receive USDT/USDD autonomously.', color: '#f97316' },
  { name: '8004 On-chain Identity', desc: 'Verifiable agent identity with trust score & reputation on TRON.', color: '#4ade80' },
  { name: 'MCP Server', desc: 'Standard protocol layer connecting any AI agent to the blockchain.', color: '#3b82f6' },
  { name: 'Skills Modules', desc: 'Plug-and-play DeFi operations: Swap, Lending, Asset Management.', color: '#8b5cf6' },
]

const INTEGRATIONS = [
  { icon: Layers, name: 'Skills', code: 'Load tronclaw-payment SKILL.md into your agent', desc: 'Lightweight, context-efficient. Load only what you need.' },
  { icon: Terminal, name: 'MCP Protocol', code: 'npx tronclaw-mcp --stdio', desc: 'Standard MCP for Claude Desktop, Cursor, and more.' },
  { icon: Code2, name: 'REST API', code: 'GET /api/v1/payment/balance?address=T...', desc: 'Universal HTTP — works with any agent or app.' },
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-bg-0 text-text-1 overflow-hidden">
      {/* ─── Nav ────────────────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/[0.06] bg-bg-0/80 backdrop-blur-lg">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/logo.svg" alt="" className="w-7 h-7" />
            <span className="font-bold text-lg gradient-text">TronClaw</span>
          </div>
          <div className="flex items-center gap-5">
            <a href="https://github.com/YaoShuai-hub/TronClaw" target="_blank" rel="noopener" className="text-sm text-text-2 hover:text-text-0 transition-colors">GitHub</a>
            <NavLink to="/dashboard" className="text-sm text-text-2 hover:text-text-0 transition-colors">Dashboard</NavLink>
            <NavLink to="/chat" className="btn-primary text-xs !py-2 !px-4">Try Demo <ArrowRight size={13} /></NavLink>
          </div>
        </div>
      </nav>

      {/* ─── Hero ───────────────────────────────────────── */}
      <section className="relative pt-32 pb-24 px-6 text-center bg-grid-animated overflow-hidden glow-spot-orange glow-spot-green">
        <div className="relative z-10 max-w-4xl mx-auto">
          {/* Badge */}
          <div className="animate-fade-in-up delay-0">
            <span className="badge badge-orange mb-8 inline-flex">
              <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
              TRON × Bank of AI Hackathon 2026
            </span>
          </div>

          {/* Title */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.08] tracking-tight mb-6 animate-fade-in-up delay-1">
            The AI gateway<br />
            that gives agents<br />
            <span className="gradient-text">TRON superpowers.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg text-text-2 max-w-xl mx-auto mb-10 animate-fade-in-up delay-2 leading-relaxed">
            Connect any AI Agent and instantly unlock payments, DeFi, on-chain data, and automation on TRON — through a single gateway.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 animate-fade-in-up delay-3">
            <NavLink to="/chat" className="btn-primary text-base !py-3 !px-8">
              Open Demo <ArrowRight size={16} />
            </NavLink>
            <NavLink to="/dashboard" className="btn-secondary text-base !py-3 !px-8">
              Dashboard
            </NavLink>
          </div>

          {/* Stats */}
          <div className="mt-16 flex items-center justify-center gap-12 animate-fade-in-up delay-4">
            {[
              { value: '15', label: 'AI Tools' },
              { value: '4', label: 'Bank of AI Infra' },
              { value: '3', label: 'Integration Modes' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="text-3xl font-bold text-text-0">{s.value}</div>
                <div className="text-xs text-text-3 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features ───────────────────────────────────── */}
      <section className="py-24 px-6 relative">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">Four Superpowers</h2>
            <p className="text-text-2">Everything an agent needs to operate on TRON.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            {FEATURES.map((f, i) => (
              <div key={f.title} className={`glass-card glow-border p-6 animate-fade-in-up delay-${i}`}>
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl ${f.bg} flex items-center justify-center flex-shrink-0`}>
                    <f.icon size={20} className={f.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <h3 className="font-semibold text-text-0">{f.title}</h3>
                      <span className={`badge ${f.tagClass} !text-[10px] !py-0 !px-2`}>{f.tag}</span>
                    </div>
                    <p className="text-sm text-text-2 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Bank of AI Integration ─────────────────────── */}
      <section className="py-24 px-6 border-t border-white/[0.04]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="badge badge-green mb-4 inline-flex">All 4 Integrated</span>
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">Powered by Bank of AI</h2>
            <p className="text-text-2">TronClaw integrates every Bank of AI infrastructure component.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {INFRA.map((inf, i) => (
              <div key={inf.name} className={`glass-card p-5 flex items-start gap-4 animate-fade-in-up delay-${i}`}>
                <div className="w-1 h-10 rounded-full flex-shrink-0" style={{ background: inf.color }} />
                <div>
                  <h3 className="font-semibold text-sm text-text-0 mb-1">{inf.name}</h3>
                  <p className="text-xs text-text-2 leading-relaxed">{inf.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Architecture ───────────────────────────────── */}
      <section className="py-24 px-6 border-t border-white/[0.04]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-3">Universal Agent Gateway</h2>
          <p className="text-text-2 mb-12">Any agent, any protocol — one gateway to TRON.</p>
          <div className="glass-card p-8 font-mono text-sm animate-fade-in-up">
            <div className="flex flex-col items-center gap-4">
              <div className="flex gap-3 flex-wrap justify-center">
                {['Claude Desktop', 'OpenClaw', 'Custom Agent', 'Any MCP Client'].map(a => (
                  <span key={a} className="badge">{a}</span>
                ))}
              </div>
              <div className="text-text-3 text-xs">Skills │ MCP │ REST API</div>
              <div className="text-lg">↓</div>
              <div className="btn-primary !text-xs !py-2 !cursor-default">
                <img src="/logo.svg" alt="" className="w-4 h-4" /> TronClaw Gateway
              </div>
              <div className="text-lg">↓</div>
              <div className="flex gap-3 flex-wrap justify-center">
                {INFRA.map(inf => (
                  <span key={inf.name} className="text-xs px-3 py-1.5 rounded-lg bg-bg-4 border border-white/[0.06]" style={{ color: inf.color }}>
                    {inf.name}
                  </span>
                ))}
              </div>
              <div className="text-lg">↓</div>
              <span className="badge text-text-3">TRON Network</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Integration ────────────────────────────────── */}
      <section className="py-24 px-6 border-t border-white/[0.04]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">Three Ways to Connect</h2>
            <p className="text-text-2">Choose the best fit for your agent.</p>
          </div>
          <div className="space-y-4">
            {INTEGRATIONS.map((intg, i) => (
              <div key={intg.name} className={`glass-card glow-border p-5 animate-fade-in-up delay-${i}`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center">
                    <intg.icon size={16} className="text-brand" />
                  </div>
                  <span className="font-semibold text-text-0">{intg.name}</span>
                </div>
                <pre className="bg-bg-4 rounded-lg px-4 py-3 text-sm text-accent font-mono overflow-x-auto mb-2">{intg.code}</pre>
                <p className="text-xs text-text-3">{intg.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ────────────────────────────────────────── */}
      <section className="py-28 px-6 text-center relative glow-spot-orange overflow-hidden">
        <div className="relative z-10 max-w-2xl mx-auto">
          <img src="/logo.svg" alt="" className="w-16 h-16 mx-auto mb-6 animate-float" />
          <h2 className="text-4xl font-bold mb-4">Ready to build?</h2>
          <p className="text-text-2 mb-8">Try the live demo or integrate TronClaw into your agent today.</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <NavLink to="/chat" className="btn-primary text-base !py-3 !px-8">
              Open Demo <ArrowRight size={16} />
            </NavLink>
            <a href="https://github.com/YaoShuai-hub/TronClaw" target="_blank" className="btn-secondary text-base !py-3 !px-8">
              View on GitHub
            </a>
          </div>
        </div>
      </section>

      {/* ─── Footer ─────────────────────────────────────── */}
      <footer className="border-t border-white/[0.04] py-8 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-xs text-text-3">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="" className="w-4 h-4 opacity-50" />
            <span>TronClaw — TRON × Bank of AI Hackathon 2026</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="https://github.com/YaoShuai-hub/TronClaw" target="_blank" className="hover:text-text-1 transition-colors">GitHub</a>
            <a href="https://bankofai.io" target="_blank" className="hover:text-text-1 transition-colors">Bank of AI</a>
            <a href="https://nile.tronscan.org" target="_blank" className="hover:text-text-1 transition-colors">TronScan</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
