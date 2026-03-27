import { useState, useRef, useEffect } from 'react'
import { Send, Loader2, Zap, Bot, User } from 'lucide-react'
import axios from 'axios'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  toolCalls?: Array<{ tool: string; input: unknown; result: unknown }>
  timestamp: number
}

const EXAMPLES = [
  '查询余额 TXYZopYRdj2D9XRtbG411XZZ3kM5VkAeBf',
  '最近24小时有哪些大额USDT转账？',
  '当前TRON DeFi最高收益池是哪个？',
  '帮我把1000 USDT做收益优化，风险偏好低',
  '当TRX跌到0.08时自动买入500个',
  '创建一个收款请求，收0.5 USDT，用于AI写作服务',
]

function ToolCallCard({ toolCalls }: { toolCalls: Array<{ tool: string; input: unknown; result: unknown }> }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="mt-2 rounded-lg border border-green-400/20 bg-green-400/5 text-xs">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-3 py-2 flex items-center gap-2 text-green-400 hover:bg-green-400/5 rounded-lg"
      >
        <Zap size={12} />
        <span>{toolCalls.length} tool call{toolCalls.length > 1 ? 's' : ''} executed</span>
        <span className="ml-auto">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="px-3 pb-3 space-y-2">
          {toolCalls.map((tc, i) => (
            <div key={i} className="rounded bg-black/30 p-2">
              <div className="text-green-400 font-mono mb-1">⚡ {tc.tool}</div>
              <div className="text-gray-500 font-mono text-[10px] overflow-auto max-h-20">
                {JSON.stringify(tc.result, null, 2)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: '你好！我是 TronClaw AI Agent 🦀\n\n我可以帮你完成所有 TRON 链上操作：查询余额、发送支付、分析DeFi收益、追踪鲸鱼动向、设置自动交易...\n\n有什么我可以帮你做的吗？',
      timestamp: Date.now(),
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }))
      const { data } = await axios.post('/api/v1/chat/message', {
        message: text,
        walletAddress: 'TFp3Ls4mHdzysbX1qxbwXdMzS8mkvhCMx6',
        history,
      })

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.data.response,
        toolCalls: data.data.toolCalls?.length ? data.data.toolCalls : undefined,
        timestamp: Date.now(),
      }
      setMessages(prev => [...prev, assistantMsg])
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      console.error('[Chat] Error:', e)
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: `❌ 请求失败: ${msg}`,
        timestamp: Date.now(),
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-full flex flex-col bg-[#070d1a]">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
          <Bot size={16} className="text-green-400" />
        </div>
        <div>
          <div className="font-semibold text-sm">TronClaw AI Agent</div>
          <div className="text-xs text-gray-500 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Nile Testnet · Mock Mode
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map(msg => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs
              ${msg.role === 'assistant' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>
              {msg.role === 'assistant' ? <Bot size={14} /> : <User size={14} />}
            </div>
            <div className={`max-w-[75%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
              <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap
                ${msg.role === 'assistant'
                  ? 'bg-[#0a1220] text-gray-200 border border-white/5'
                  : 'bg-blue-500/20 text-white border border-blue-400/20'
                }`}>
                {msg.content}
              </div>
              {msg.toolCalls && <ToolCallCard toolCalls={msg.toolCalls} />}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-green-500/20 flex items-center justify-center">
              <Bot size={14} className="text-green-400" />
            </div>
            <div className="px-4 py-3 rounded-2xl bg-[#0a1220] border border-white/5">
              <Loader2 size={16} className="text-green-400 animate-spin" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Examples */}
      {messages.length <= 1 && (
        <div className="px-4 pb-3">
          <div className="text-xs text-gray-600 mb-2">试试这些示例：</div>
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map(e => (
              <button
                key={e}
                onClick={() => sendMessage(e)}
                className="text-xs px-3 py-1.5 rounded-full bg-[#0a1220] border border-white/5 text-gray-400 hover:border-green-400/30 hover:text-green-400 transition-colors"
              >
                {e}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="px-4 pb-4">
        <div className="flex gap-2 bg-[#0a1220] rounded-2xl border border-white/5 p-2">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                sendMessage(input)
              }
            }}
            placeholder="问我任何关于 TRON 链上操作的问题..."
            rows={1}
            className="flex-1 bg-transparent text-sm text-white placeholder-gray-600 resize-none outline-none px-2 py-1.5 max-h-32"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            className="w-9 h-9 rounded-xl bg-green-500 hover:bg-green-400 disabled:bg-gray-700 disabled:text-gray-500 text-black flex items-center justify-center transition-colors flex-shrink-0 self-end"
          >
            <Send size={16} />
          </button>
        </div>
        <p className="text-center text-xs text-gray-700 mt-2">TronClaw · Nile Testnet · Press Enter to send</p>
      </div>
    </div>
  )
}
