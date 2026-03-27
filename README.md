# 🦀 TronClaw — AI Agent TRON Capability Gateway

> **"Any AI Agent, Instant TRON Superpowers."**

[![TRON](https://img.shields.io/badge/TRON-Nile%20Testnet-red)](https://nile.trongrid.io)
[![Bank of AI](https://img.shields.io/badge/Bank%20of%20AI-x402%20%7C%208004%20%7C%20MCP%20%7C%20Skills-green)](https://bankofai.io)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

TronClaw is a **platform-level TRON capability gateway** built for the [TRON × Bank of AI Hackathon 2026](doc/TRON_BankOfAI_Hackathon.md). Instead of building a single AI agent, TronClaw enables **any** AI Agent to instantly access TRON's on-chain capabilities through a unified gateway.

---

## 🌟 What TronClaw Does

```
External AI Agents (OpenClaw / Claude Desktop / Any Agent)
          │
          │  OpenClaw Plugin │ MCP Protocol │ REST API
          ▼
   🦀 TronClaw Gateway
          │
          ├── 💳 Payment Module    — x402 Protocol (USDT/USDD)
          ├── 📈 DeFi Module       — SunSwap + JustLend
          ├── 🔍 Data Module       — Whale tracking, address analysis
          ├── ⚡ Automation Module — Price alerts, auto-trade
          └── 🪪 Identity Module   — 8004 On-chain Agent Identity
          │
          ▼
   TRON Network + Bank of AI Infrastructure
```

## 🏗️ Bank of AI Integration

| Infrastructure | Usage |
|---------------|-------|
| **x402 Payment Protocol** | AI agents auto-collect USDT/USDD for services |
| **8004 On-chain Identity** | Agent registration & reputation on TRON |
| **MCP Server** | Standard protocol for any MCP-compatible agent |
| **Skills Modules** | DeFi operations (Swap/Lending/Asset Management) |

All four Bank of AI infrastructure components are integrated.

---

## 🚀 Quick Start

### Prerequisites
- Node.js >= 20
- pnpm >= 9
- TRON wallet with Nile testnet tokens ([faucet](https://nileex.io/join/getJoinPage))
- TronGrid API key ([free](https://www.trongrid.io/))

### Setup

```bash
git clone https://github.com/YOUR_USERNAME/tronclaw
cd tronclaw
pnpm install

# Configure environment
cp .env.example packages/gateway/.env
# Fill in TRON_PRIVATE_KEY and TRONGRID_API_KEY

# Start development
pnpm dev
```

Frontend: http://localhost:5173
Gateway API: http://localhost:3000

### Mock Mode (no wallet needed)

```bash
# In packages/gateway/.env
MOCK_TRON=true
TRON_PRIVATE_KEY=any_value_here
```

---

## 🔌 Three Ways to Connect

### 1. OpenClaw Plugin
```bash
clawhub install tronclaw
```

### 2. MCP Protocol (Claude Desktop / Cursor)
```json
{
  "mcpServers": {
    "tronclaw": {
      "command": "node",
      "args": ["path/to/tronclaw/packages/gateway/dist/mcp-entry.js"]
    }
  }
}
```

### 3. REST API
```bash
# Check balance
curl "https://api.tronclaw.io/api/v1/payment/balance?address=T...&token=USDT"

# Create payment request
curl -X POST "https://api.tronclaw.io/api/v1/payment/request" \
  -H "Content-Type: application/json" \
  -d '{"amount":"0.5","token":"USDT","description":"AI Writing Service"}'

# Query DeFi yields
curl "https://api.tronclaw.io/api/v1/defi/yields"
```

---

## 📋 API Reference

### Payment
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/payment/balance` | GET | Check TRX/USDT/USDD balance |
| `/api/v1/payment/send` | POST | Send payment (x402) |
| `/api/v1/payment/request` | POST | Create payment request |
| `/api/v1/payment/status/:payId` | GET | Check payment status |

### On-chain Data
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/data/address/:address` | GET | Analyze TRON address |
| `/api/v1/data/transactions/:address` | GET | Transaction history |
| `/api/v1/data/whales` | GET | Whale transfer tracker |
| `/api/v1/data/token/:address` | GET | Token information |

### DeFi
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/defi/yields` | GET | DeFi yield rates |
| `/api/v1/defi/swap` | POST | Token swap (SunSwap) |
| `/api/v1/defi/optimize` | POST | AI yield optimization |

### Automation
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/automation/trade` | POST | Create auto-trade task |
| `/api/v1/automation/tasks` | GET | List all tasks |
| `/api/v1/automation/batch-transfer` | POST | Batch transfer |

### Identity (8004)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/identity/register` | POST | Register agent identity |
| `/api/v1/identity/reputation/:agentId` | GET | Get trust score |
| `/api/v1/identity/verify/:agentId` | GET | Verify agent |

### Chat (AI Agent)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/chat/message` | POST | Natural language → Tool execution |

---

## 🧩 MCP Tools (15 Tools)

TronClaw exposes 15 tools via MCP protocol:

- `tron_check_balance` — Check wallet balance
- `tron_send_payment` — Send USDT/USDD (x402)
- `tron_create_payment_request` — Create payment URL
- `tron_payment_status` — Check payment status
- `tron_analyze_address` — Analyze any address
- `tron_tx_history` — Transaction history
- `tron_whale_tracker` — Track large transfers
- `tron_token_info` — Token information
- `tron_defi_yields` — DeFi yield rates
- `tron_swap` — Swap tokens
- `tron_yield_optimize` — AI yield strategy
- `tron_auto_trade` — Price-triggered auto trade
- `tron_batch_transfer` — Batch transfers
- `tron_register_agent_identity` — Register on 8004
- `tron_agent_reputation` — Query reputation

---

## 🏗️ Architecture

```
packages/
├── gateway/          # Node.js + Express + TypeScript
│   └── src/
│       ├── api/      # REST API routes
│       ├── mcp/      # MCP Tool Provider
│       ├── modules/  # payment | defi | data | automation | identity
│       ├── tron/     # TronWeb client + contracts
│       ├── db/       # SQLite (tasks, identities, tx log)
│       └── ws/       # WebSocket realtime broadcast
├── frontend/         # React + Vite + TailwindCSS
│   └── src/pages/    # Landing | Chat | Dashboard | Agents | Explorer
└── shared/           # Shared TypeScript types & constants
```

## 🛠 Tech Stack

- **Backend**: Node.js + Express + TypeScript + TronWeb 6.x
- **Payments**: @t402/tron (x402 Protocol)
- **AI**: Anthropic Claude (tool use loop)
- **MCP**: @modelcontextprotocol/sdk
- **Frontend**: React 18 + Vite + TailwindCSS + Recharts
- **DB**: SQLite (better-sqlite3)
- **Realtime**: WebSocket

---

## 📝 Environment Variables

```env
TRON_NETWORK=nile          # nile | mainnet
TRON_PRIVATE_KEY=          # Wallet private key
TRONGRID_API_KEY=          # TronGrid API key
X402_PAYMENT_ADDRESS=      # Payment receiving address
ANTHROPIC_API_KEY=         # For AI chat (optional)
MOCK_TRON=false            # true = use mock data
PORT=3000
```

---

## 📄 License

MIT — Built for TRON × Bank of AI Hackathon 2026
