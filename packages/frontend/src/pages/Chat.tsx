import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Loader2, Zap, Bot, User, ExternalLink } from 'lucide-react'
import axios from 'axios'
import { useWallet } from '../stores/wallet.ts'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  toolCalls?: Array<{ tool: string; input: unknown; result: unknown }>
  timestamp: number
}

const TRONSCAN = 'https://nile.tronscan.org/#'
const FALLBACK_ADDRESS = 'TFp3Ls4mHdzysbX1qxbwXdMzS8mkvhCMx6'

const EXAMPLES = [
  { cat: '💳', text: '查询我的USDT余额' },
  { cat: '💳', text: '创建一个收款请求，收0.5 USDT，AI写作服务费' },
  { cat: '📈', text: '当前TRON DeFi最高收益池是哪个？' },
  { cat: '📈', text: '帮我把1000 USDT做低风险收益优化' },
  { cat: '🔍', text: '最近24小时有哪些大额USDT转账？' },
  { cat: '⚡', text: '当TRX跌到0.08时自动买入500个' },
]

function ToolCallCard({ toolCalls }: { toolCalls: Message['toolCalls'] }) {
  const [open, setOpen] = useState(false)
  if (!toolCalls?.length) return null
  return (
    <div className="mt-2 rounded-xl border border-brand/20 bg-brand/5 text-xs overflow-hidden">
      <button onClick={() => setOpen(!open)}
        className="w-full px-3 py-2 flex items-center gap-2 text-brand hover:bg-brand/5 transition-colors">
        <Zap size={11} />
        <span className="font-medium">{toolCalls.length} tool call{toolCalls.length > 1 ? 's' : ''}</span>
        <span className="ml-auto text-text-3">{open ? '▲' : '▼'}</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
            className="overflow-hidden">
            <div className="px-3 pb-3 space-y-2">
              {toolCalls.map((tc, i) => (
                <div key={i} className="rounded-lg bg-bg-4/80 p-2.5">
                  <div className="text-brand font-mono font-medium mb-1">⚡ {tc.tool}</div>
                  <pre className="text-text-3 font-mono text-[10px] overflow-auto max-h-20 whitespace-pre-wrap">
                    {JSON.stringify(tc.result, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Simple typewriter effect
function TypeWriter({ text, speed = 15 }: { text: string; speed?: number }) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)
  useEffect(() => {
    setDisplayed('')
    setDone(false)
    let i = 0
    const iv = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1))
        i++
      } else {
        setDone(true)
        clearInterval(iv)
      }
    }, speed)
    return () => clearInterval(iv)
  }, [text, speed])
  return <>{displayed}{!done && <span className="inline-block w-0.5 h-4 bg-brand animate-pulse ml-0.5" />}</>
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0', role: 'assistant',
      content: '你好！我是 TronClaw AI Agent 🦀\n\n我可以帮你完成 TRON 链上操作：查余额、发送支付、DeFi 收益优化、鲸鱼追踪、自动交易...\n\n连接你的钱包或直接输入指令开始吧！',
      timestamp: Date.now(),
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const [latestId, setLatestId] = useState('')
  const { address: walletAddress } = useWallet()
  const activeAddress = walletAddress ?? FALLBACK_ADDRESS

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text, timestamp: Date.now() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }))
      const { data } = await axios.post('/api/v1/chat/message', {
        message: text,
        walletAddress: activeAddress,
        history,
      })
      const id = (Date.now() + 1).toString()
      setLatestId(id)
      const assistantMsg: Message = {
        id, role: 'assistant',
        content: data.data.response,
        toolCalls: data.data.toolCalls?.length ? data.data.toolCalls : undefined,
        timestamp: Date.now(),
      }
      setMessages(prev => [...prev, assistantMsg])
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(), role: 'assistant' as const,
        content: `请求失败: ${msg}`, timestamp: Date.now(),
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-6 py-3.5 border-b border-white/[0.06] flex items-center gap-3 bg-bg-1/50 backdrop-blur-sm">
        <div className="w-8 h-8 rounded-xl bg-brand/10 flex items-center justify-center">
          <Bot size={16} className="text-brand" />
        </div>
        <div>
          <div className="font-semibold text-sm text-text-0">TronClaw AI</div>
          <div className="text-[10px] text-text-3 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            Nile Testnet
            <span className="mx-1 text-text-3/30">|</span>
            <a href={`${TRONSCAN}/address/${activeAddress}`} target="_blank" className="hover:text-brand transition-colors flex items-center gap-0.5">
              {activeAddress.slice(0, 6)}...{activeAddress.slice(-4)} <ExternalLink size={8} />
            </a>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
        <AnimatePresence mode="popLayout">
          {messages.map(msg => (
            <motion.div
              key={msg.id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-xs
                ${msg.role === 'assistant' ? 'bg-brand/15 text-brand' : 'bg-blue-500/15 text-blue-400'}`}>
                {msg.role === 'assistant' ? <Bot size={13} /> : <User size={13} />}
              </div>
              <div className={`max-w-[75%] flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed
                  ${msg.role === 'assistant'
                    ? 'bg-bg-2 text-text-1 border border-white/[0.06]'
                    : 'bg-brand/15 text-text-0 border border-brand/20'
                  }`}>
                  {msg.role === 'assistant' && msg.id === latestId && !loading
                    ? <TypeWriter text={msg.content} />
                    : <span className="whitespace-pre-wrap">{msg.content}</span>
                  }
                </div>
                <ToolCallCard toolCalls={msg.toolCalls} />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
            <div className="w-7 h-7 rounded-lg bg-brand/15 flex items-center justify-center">
              <Bot size={13} className="text-brand" />
            </div>
            <div className="px-4 py-3 rounded-2xl bg-bg-2 border border-white/[0.06]">
              <div className="flex items-center gap-2 text-xs text-text-3">
                <Loader2 size={14} className="text-brand animate-spin" />
                Calling TRON tools...
              </div>
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Examples */}
      {messages.length <= 1 && (
        <div className="px-4 pb-3">
          <div className="text-xs text-text-3 mb-2">Try these:</div>
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map(e => (
              <button key={e.text} onClick={() => sendMessage(e.text)}
                className="text-xs px-3 py-1.5 rounded-full bg-bg-2 border border-white/[0.06] text-text-2
                  hover:border-brand/30 hover:text-brand hover:bg-brand/5 transition-all duration-200">
                {e.cat} {e.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="px-4 pb-4 pt-1">
        <div className="flex gap-2 bg-bg-2 rounded-2xl border border-white/[0.06] p-2 focus-within:border-brand/30 transition-colors">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input) } }}
            placeholder="Ask anything about TRON..."
            rows={1}
            className="flex-1 bg-transparent text-sm text-text-0 placeholder-text-3 resize-none outline-none px-2 py-1.5 max-h-28"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 self-end transition-all duration-200
              disabled:bg-bg-4 disabled:text-text-3 bg-brand hover:shadow-[0_0_20px_rgba(249,115,22,0.3)] text-white"
          >
            <Send size={15} />
          </button>
        </div>
        <p className="text-center text-[10px] text-text-3 mt-2">TronClaw · Nile Testnet · Gemini 3.1 Flash Lite</p>
      </div>
    </div>
  )
}
