import { NavLink } from 'react-router-dom'

const FEATURES = [
  {
    icon: '💳',
    title: 'AI Payment Agent',
    desc: 'AI agents automatically collect USDT/USDD via x402 protocol. Pay for AI services on-chain.',
    tag: 'x402 Protocol',
    tagColor: 'text-green-400 bg-green-400/10',
  },
  {
    icon: '📈',
    title: 'AI DeFi Assistant',
    desc: 'Analyze DeFi yields across SunSwap & JustLend. Execute optimal strategies automatically.',
    tag: 'Skills Modules',
    tagColor: 'text-blue-400 bg-blue-400/10',
  },
  {
    icon: '🔍',
    title: 'On-chain Data Agent',
    desc: 'Track whale movements, analyze addresses, and get real-time TRON blockchain insights.',
    tag: 'MCP Server',
    tagColor: 'text-purple-400 bg-purple-400/10',
  },
  {
    icon: '⚡',
    title: 'AI Automation Agent',
    desc: 'Set price-triggered trades, scheduled transfers, and automated on-chain tasks.',
    tag: 'MCP Server',
    tagColor: 'text-orange-400 bg-orange-400/10',
  },
]

const INTEGRATIONS = [
  {
    name: 'OpenClaw Plugin',
    code: 'clawhub install tronclaw',
    desc: 'One command to add TRON superpowers to OpenClaw',
  },
  {
    name: 'MCP Protocol',
    code: '{"mcpServers":{"tronclaw":{"url":"https://api.tronclaw.io/mcp"}}}',
    desc: 'Works with Claude Desktop, Cursor, and any MCP-compatible agent',
  },
  {
    name: 'REST API',
    code: 'POST /api/v1/payment/balance?address=T...&token=USDT',
    desc: 'Universal HTTP API for any agent or application',
  },
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#070d1a] text-white">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/5 bg-[#070d1a]/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🦀</span>
            <span className="font-bold text-green-400 text-lg">TronClaw</span>
          </div>
          <div className="flex items-center gap-4">
            <NavLink to="/dashboard" className="text-sm text-gray-400 hover:text-white transition-colors">Dashboard</NavLink>
            <NavLink to="/chat" className="px-4 py-1.5 bg-green-500 hover:bg-green-400 text-black text-sm font-semibold rounded-lg transition-colors">
              Try Demo
            </NavLink>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-400/10 border border-green-400/20 text-green-400 text-xs font-medium mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          TRON × Bank of AI Hackathon 2026
        </div>
        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
          Any AI Agent,<br />
          <span className="text-green-400">Instant TRON</span><br />
          Superpowers.
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10">
          TronClaw is the universal TRON capability gateway. Connect any AI Agent and instantly
          unlock payments, DeFi, on-chain data, and automation — powered by Bank of AI infrastructure.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <NavLink to="/chat" className="px-8 py-3 bg-green-500 hover:bg-green-400 text-black font-bold rounded-xl transition-colors text-lg">
            Try Live Demo →
          </NavLink>
          <NavLink to="/dashboard" className="px-8 py-3 border border-white/20 hover:border-green-400/50 text-white rounded-xl transition-colors text-lg">
            View Dashboard
          </NavLink>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-3 gap-6 max-w-lg mx-auto">
          {[
            { value: '15', label: 'Tools Available' },
            { value: '4', label: 'Bank of AI Infra' },
            { value: '3', label: 'Integration Modes' },
          ].map(s => (
            <div key={s.label} className="text-center">
              <div className="text-3xl font-bold text-green-400">{s.value}</div>
              <div className="text-xs text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-[#0a1220]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Four TRON Superpowers</h2>
          <p className="text-gray-400 text-center mb-12">Everything your AI Agent needs to operate on TRON — in one gateway.</p>
          <div className="grid md:grid-cols-2 gap-6">
            {FEATURES.map(f => (
              <div key={f.title} className="p-6 rounded-2xl border border-white/5 bg-[#070d1a] hover:border-green-400/20 transition-colors group">
                <div className="flex items-start gap-4">
                  <div className="text-4xl">{f.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-white">{f.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${f.tagColor}`}>{f.tag}</span>
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Universal Agent Gateway</h2>
          <p className="text-gray-400 mb-12">Three ways to connect — any agent, any protocol</p>
          <div className="relative p-8 rounded-2xl border border-white/5 bg-[#0a1220] font-mono text-sm">
            <div className="flex flex-col items-center gap-3">
              <div className="flex gap-4">
                {['OpenClaw Plugin', 'MCP Protocol', 'REST API'].map(l => (
                  <div key={l} className="px-3 py-1.5 rounded-lg bg-[#070d1a] border border-green-400/30 text-green-400 text-xs">{l}</div>
                ))}
              </div>
              <div className="text-gray-600">↓ ↓ ↓</div>
              <div className="px-6 py-3 rounded-xl bg-green-500/10 border border-green-400/30 text-green-400 font-bold">
                🦀 TronClaw Gateway
              </div>
              <div className="text-gray-600">↓ ↓ ↓ ↓</div>
              <div className="flex gap-3 flex-wrap justify-center">
                {['x402 Payment', '8004 Identity', 'MCP Server', 'Skills Modules'].map(l => (
                  <div key={l} className="px-3 py-1.5 rounded-lg bg-[#070d1a] border border-blue-400/30 text-blue-400 text-xs">{l}</div>
                ))}
              </div>
              <div className="text-gray-600">↓</div>
              <div className="px-4 py-2 rounded-lg bg-[#070d1a] border border-white/10 text-gray-400 text-xs">
                TRON Network (Nile Testnet / Mainnet)
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Integration */}
      <section className="py-20 px-6 bg-[#0a1220]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Quick Integration</h2>
          <p className="text-gray-400 text-center mb-12">Get started in under 60 seconds</p>
          <div className="space-y-4">
            {INTEGRATIONS.map((intg, i) => (
              <div key={intg.name} className="p-5 rounded-xl border border-white/5 bg-[#070d1a]">
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-6 h-6 rounded-full bg-green-500/20 text-green-400 text-xs flex items-center justify-center font-bold">{i + 1}</span>
                  <span className="font-semibold">{intg.name}</span>
                </div>
                <code className="block bg-black/40 rounded-lg px-4 py-2.5 text-green-400 text-sm font-mono mb-2 overflow-x-auto">{intg.code}</code>
                <p className="text-gray-500 text-sm">{intg.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="text-5xl mb-6">🦀</div>
          <h2 className="text-4xl font-bold mb-4">Ready to give your Agent TRON superpowers?</h2>
          <p className="text-gray-400 mb-8">Try the live demo and see TronClaw in action on Nile testnet.</p>
          <NavLink to="/chat" className="inline-block px-10 py-4 bg-green-500 hover:bg-green-400 text-black font-bold rounded-xl transition-colors text-lg">
            Open TronClaw Demo →
          </NavLink>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6 text-center text-gray-600 text-sm">
        TronClaw — Built for TRON × Bank of AI Hackathon 2026 &nbsp;·&nbsp; Powered by Bank of AI Infrastructure
      </footer>
    </div>
  )
}
