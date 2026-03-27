import { useState, useEffect } from 'react'
import { Bot, Shield, Zap, CheckCircle } from 'lucide-react'
import axios from 'axios'

interface AgentIdentity {
  agentId: string
  agentName: string
  ownerAddress: string
  capabilities: string[]
  trustScore: number
  totalTransactions: number
  successRate: number
  registeredAt: number
}

const DEMO_AGENTS = [
  {
    agentId: 'agent_tronclaw_demo',
    agentName: 'TronClaw Demo Agent',
    ownerAddress: 'TXYZopYRdj2D9XRtbG411XZZ3kM5VkAeBf',
    capabilities: ['payment', 'defi', 'data', 'automation'],
    trustScore: 100,
    totalTransactions: 42,
    successRate: 1.0,
    registeredAt: Date.now() - 86400000,
  },
  {
    agentId: 'agent_openclaw_writer',
    agentName: 'OpenClaw Writing Assistant',
    ownerAddress: 'TPL66VK2gCXNCD7EJg9pgJRfqcRazjhUZY',
    capabilities: ['payment', 'content_generation'],
    trustScore: 95,
    totalTransactions: 128,
    successRate: 0.98,
    registeredAt: Date.now() - 172800000,
  },
  {
    agentId: 'agent_defi_optimizer',
    agentName: 'DeFi Yield Optimizer',
    ownerAddress: 'TGjgkFPfBhMkXdB2E8bBHRQLQ11Z4BBgKu',
    capabilities: ['defi', 'automation', 'data'],
    trustScore: 88,
    totalTransactions: 305,
    successRate: 0.96,
    registeredAt: Date.now() - 259200000,
  },
]

const CAPABILITY_COLORS: Record<string, string> = {
  payment: 'text-green-400 bg-green-400/10',
  defi: 'text-blue-400 bg-blue-400/10',
  data: 'text-purple-400 bg-purple-400/10',
  automation: 'text-orange-400 bg-orange-400/10',
  content_generation: 'text-pink-400 bg-pink-400/10',
}

export default function Agents() {
  const [agents, setAgents] = useState<AgentIdentity[]>(DEMO_AGENTS)
  const [registering, setRegistering] = useState(false)
  const [form, setForm] = useState({ name: '', address: '' })

  const register = async () => {
    if (!form.name || !form.address) return
    setRegistering(true)
    try {
      const { data } = await axios.post('/api/v1/identity/register', {
        agentName: form.name,
        capabilities: ['payment', 'data'],
        ownerAddress: form.address,
      })
      setAgents(prev => [data.data, ...prev])
      setForm({ name: '', address: '' })
    } catch (e) {
      console.error(e)
    } finally {
      setRegistering(false)
    }
  }

  return (
    <div className="h-full overflow-y-auto bg-[#070d1a]">
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-xl font-bold">Agent Marketplace</h1>
          <p className="text-sm text-gray-500">Agents registered with TronClaw via 8004 Identity Protocol</p>
        </div>

        {/* Register new agent */}
        <div className="p-4 rounded-xl bg-[#0a1220] border border-white/5">
          <div className="flex items-center gap-2 mb-4">
            <Shield size={14} className="text-green-400" />
            <span className="text-sm font-medium">Register Agent Identity (8004 Protocol)</span>
          </div>
          <div className="flex gap-3">
            <input
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder="Agent name"
              className="flex-1 bg-[#070d1a] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 outline-none focus:border-green-400/40"
            />
            <input
              value={form.address}
              onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
              placeholder="Owner TRON address"
              className="flex-1 bg-[#070d1a] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 outline-none focus:border-green-400/40"
            />
            <button
              onClick={register}
              disabled={registering || !form.name || !form.address}
              className="px-4 py-2 bg-green-500 hover:bg-green-400 disabled:bg-gray-700 text-black font-semibold rounded-lg text-sm transition-colors"
            >
              {registering ? 'Registering...' : 'Register'}
            </button>
          </div>
        </div>

        {/* Agent list */}
        <div className="space-y-3">
          {agents.map(agent => (
            <div key={agent.agentId} className="p-4 rounded-xl bg-[#0a1220] border border-white/5 hover:border-green-400/20 transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center flex-shrink-0">
                  <Bot size={20} className="text-green-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-semibold">{agent.agentName}</span>
                    <CheckCircle size={14} className="text-green-400" />
                    <span className="text-xs text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">
                      Trust: {agent.trustScore}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 font-mono mb-2 truncate">{agent.agentId}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {agent.capabilities.map(cap => (
                      <span key={cap} className={`text-xs px-2 py-0.5 rounded-full ${CAPABILITY_COLORS[cap] ?? 'text-gray-400 bg-gray-400/10'}`}>
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-right text-xs text-gray-600 flex-shrink-0">
                  <div>{agent.totalTransactions} txns</div>
                  <div>{(agent.successRate * 100).toFixed(0)}% success</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
