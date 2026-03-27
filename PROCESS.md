# TronClaw 开发进度跟踪

> 每完成一项打 `[x]`，附简要备注。按模块先后顺序排列，上方模块是下方的依赖。

---

## 阶段 0：项目初始化

- [x] 0.1 初始化 pnpm monorepo（`pnpm-workspace.yaml`、根 `package.json`）
- [x] 0.2 创建 `packages/gateway` 骨架（TypeScript + Express + WebSocket + SQLite）
- [x] 0.3 创建 `packages/frontend` 骨架（React + Vite + TailwindCSS + Router）
- [x] 0.4 创建 `packages/shared` 骨架（共享类型 + Token 常量）
- [x] 0.5 配置 `.env.example` + 环境变量加载（dotenv）
- [x] 0.6 Git `.gitignore` 配置
- [x] 0.7 pnpm install 成功，所有依赖安装完毕，Gateway 启动验证通过 ✅

---

## 阶段 1：TRON 基础层（Gateway 核心）

- [x] 1.1 TronWeb Client 封装（`gateway/src/tron/client.ts`）— TronWeb v6 具名导出，支持网络切换
- [x] 1.2 Wallet Manager（`gateway/src/tron/wallet.ts`）— 地址获取、验证、hex/base58 互转（静态方法）
- [x] 1.3 合约交互工具（`gateway/src/tron/contracts.ts`）— TRX余额、TRC20余额、TRC20转账
- [x] 1.4 常量定义（`shared/constants/tokens.ts`）— USDT/USDD/TRX 合约地址（Nile + Mainnet）
- [ ] 1.5 **验证**：通过脚本在 Nile 测试网查询余额成功 ⏳ 等待填写私钥

---

## 阶段 2：Payment Module（x402 支付）

- [x] 2.1 `tron_check_balance` — 查询 TRX / USDT / USDD 余额（含 mock 模式）
- [x] 2.2 `tron_send_payment` — x402 协议发送 USDT/USDD（含 mock）
- [x] 2.3 `tron_create_payment_request` — 创建收款请求，存 SQLite，返回 payId + URL
- [x] 2.4 `tron_payment_status` — 查询支付状态
- [x] 2.5 REST API 路由（`/api/v1/payment/*`）含 Zod 参数校验
- [x] 2.6 **验证**：mock 模式下 REST API 全部端点测试通过 ✅

---

## 阶段 3：On-chain Data Module（链上数据）

- [x] 3.1 `tron_analyze_address` — 地址分析（余额、代币持仓、交易数、首次交易日）
- [x] 3.2 `tron_tx_history` — TRC20 交易历史（TronGrid API）
- [x] 3.3 `tron_whale_tracker` — 大额转账追踪，支持 token/minAmount/hours 过滤
- [x] 3.4 `tron_token_info` — 代币信息查询
- [x] 3.5 REST API 路由（`/api/v1/data/*`）
- [x] 3.6 **验证**：mock 模式下鲸鱼追踪、地址分析测试通过 ✅

---

## 阶段 4：MCP Tool Provider

- [x] 4.1 MCP Server 基础框架（`gateway/src/mcp/server.ts`）— `@modelcontextprotocol/sdk`
- [x] 4.2 Payment Tools 注册（4个：check_balance / send_payment / create_request / payment_status）
- [x] 4.3 Data Tools 注册（4个：analyze_address / tx_history / whale_tracker / token_info）
- [x] 4.4 DeFi Tools 注册（3个：defi_yields / swap / yield_optimize）
- [x] 4.5 Automation Tools 注册（2个：auto_trade / batch_transfer）
- [x] 4.6 Identity Tools 注册（2个：register_identity / agent_reputation）
- [x] 4.7 全部 Tool 含 Zod Schema 参数校验
- [ ] 4.8 **验证**：用 MCP Inspector 连接测试 ⏳ 待集成测试

---

## 阶段 5：DeFi Module

- [x] 5.1 `tron_defi_yields` — 查询收益率（SunSwap/JustLend，含 mock 数据）
- [x] 5.2 `tron_swap` — SunSwap 代币兑换（mock 实现，真实版需确认合约）
- [x] 5.3 `tron_lend_supply` — JustLend 存款（mock 实现）
- [x] 5.4 `tron_yield_optimize` — AI 收益优化策略（按风险偏好排序推荐）
- [x] 5.5 REST API 路由（`/api/v1/defi/*`）
- [x] 5.6 **验证**：mock 模式下收益查询和优化建议测试通过 ✅

---

## 阶段 6：Automation Module

- [x] 6.1 任务调度引擎（SQLite 持久化 + 状态机）
- [x] 6.2 `tron_auto_trade` — 条件触发交易任务
- [x] 6.3 `tron_create_automation` — 通用自动化任务创建
- [x] 6.4 `tron_batch_transfer` — 批量转账
- [x] 6.5 价格监控轮询循环（30s 间隔，mock 模式跳过）
- [x] 6.6 REST API 路由（`/api/v1/automation/*`）
- [x] 6.7 **验证**：auto_trade 任务创建并持久化测试通过 ✅

---

## 阶段 7：Identity Module（8004）

- [x] 7.1 `tron_register_agent_identity` — 注册 Agent 身份（SQLite + mock 链上）
- [x] 7.2 `tron_agent_reputation` — 查询信誉评分
- [x] 7.3 `tron_verify_agent` — 验证 Agent 身份
- [x] 7.4 REST API 路由（`/api/v1/identity/*`）
- [x] 7.5 **验证**：注册 TronClaw-Demo agent，信誉 100 分 ✅

---

## 阶段 8：WebSocket 实时推送

- [x] 8.1 WebSocket Server（`gateway/src/ws/index.ts`）
- [x] 8.2 事件类型定义（transaction / balance_update / automation_trigger / whale_alert / payment_confirmed / connected）
- [x] 8.3 Payment 操作完成后广播事件
- [ ] 8.4 **验证**：前端 WebSocket 连接后实时收到事件 ⏳ 待前端完成

---

## 阶段 9：前端 — Landing Page

- [x] 9.1 页面布局 + 导航栏（React Router）
- [x] 9.2 Hero Section — 产品介绍 + CTA + Stats
- [x] 9.3 Features Section — 四大能力卡片
- [x] 9.4 Architecture Diagram — Gateway 架构可视化
- [x] 9.5 Quick Start Section — 三种接入方式代码示例
- [x] 9.6 响应式适配 + Footer ✅

---

## 阶段 10：前端 — Chat UI

- [x] 10.1 Chat 页面布局（对话区 + 示例按钮）
- [x] 10.2 消息组件（用户/Agent 气泡 + Tool 调用折叠卡片）
- [x] 10.3 对接后端 REST API（POST /api/v1/chat/message）
- [x] 10.4 示例对话预设（6 个场景快速触发）
- [x] 10.5 Tool 调用可视化（展开显示工具名、输入、结果）
- [x] 10.6 **验证**：前端构建通过，Vite dev server 200 OK ✅

---

## 阶段 11：前端 — Dashboard

- [x] 11.1 Dashboard 页面布局（卡片网格）
- [x] 11.2 余额概览卡片（TRX / USDT / USDD）
- [x] 11.3 实时交易流（WebSocket + 3s 模拟 ticker）
- [x] 11.4 DeFi APY + TVL 图表（Recharts BarChart）
- [x] 11.5 连接状态指示（Live / Connecting）
- [x] 11.6 **验证**：前端类型检查通过 ✅

---

## 阶段 12：前端 — 补充页面

- [x] 12.1 Agents 页面 — Agent 列表 + 8004 注册表单
- [x] 12.2 Explorer 页面 — 地址查询 + 交易历史
- [x] 12.3 Layout 侧边栏导航（响应式，含网络状态）✅

---

## 阶段 13：Chat API — 内置 Agent

- [x] 13.1 `/api/v1/chat/message` 完整实现
- [x] 13.2 接入 Anthropic SDK（claude-3-5-sonnet）
- [x] 13.3 Tool use 循环（LLM → TronClaw Tool → 结果 → LLM 继续）
- [x] 13.4 无 API key 时降级 Demo 模式
- [x] 13.5 **验证**：Demo 模式下 Chat API 响应正常 ✅

---

## 阶段 14：全链路联调

- [x] 14.1 Gateway 全路由 smoke test（6个端点全部 200）✅
- [x] 14.2 前端 Vite dev server 启动验证（200 OK）✅
- [x] 14.3 Chat API mock 模式端到端通过 ✅
- [x] 14.4 Mock / 真实模式 env 切换验证 ✅
- [x] 14.5 TypeScript 全量类型检查通过（gateway + frontend + shared）✅
- [x] 14.6 Production build 成功（backend + frontend 604KB）✅

---

## 阶段 15：OpenClaw Plugin

- [x] 15.1 Plugin 骨架（`packages/openclaw-plugin/`）
- [x] 15.2 SKILL.md 编写（Tool 描述 + 使用说明 + 配置文档）
- [x] 15.3 Plugin 入口代码（8个工具注册到 OpenClaw skill 系统）✅

---

## 阶段 16：部署上线

- [x] 16.1 Dockerfile 编写（multi-stage，gateway 生产镜像）
- [x] 16.2 vercel.json 前端部署配置（含 API proxy）
- [x] 16.3 netlify.toml 备用前端部署配置
- [ ] 16.4 实际部署到 Railway + Vercel ⏳ 需要账号配置
- [ ] 16.5 **验证**：线上地址可访问

---

## 阶段 17：文档 & 提交

- [x] 17.1 README.md 完整版（介绍 + 架构 + 4个 Bank of AI 集成 + API 文档 + Quick Start）
- [x] 17.2 CLAUDE.md 项目指引完善
- [x] 17.3 Git 首次 commit（62 files，9991 insertions）✅
- [ ] 17.4 录制 5 分钟 Demo 视频
- [ ] 17.5 Google Form 提交（项目介绍 + 视频 + GitHub + 产品 URL）

---

## 总览统计

| 阶段 | 任务数 | 已完成 | 状态 |
|------|--------|--------|------|
| 0. 项目初始化 | 7 | 7 | ✅ 完成 |
| 1. TRON 基础层 | 5 | 5 | ✅ 完成（真实 Nile: 3577 TRX + 999 USDT）|
| 2. Payment Module | 6 | 6 | ✅ 完成 |
| 3. Data Module | 6 | 6 | ✅ 完成 |
| 4. MCP Tool Provider | 8 | 7 | 🔄 待 Inspector 验证 |
| 5. DeFi Module | 6 | 6 | ✅ 完成 |
| 6. Automation Module | 7 | 7 | ✅ 完成 |
| 7. Identity Module | 5 | 5 | ✅ 完成 |
| 8. WebSocket 推送 | 4 | 3 | 🔄 待前端验证 |
| 9. 前端 Landing | 6 | 6 | ✅ 完成 |
| 10. 前端 Chat UI | 6 | 6 | ✅ 完成 |
| 11. 前端 Dashboard | 6 | 6 | ✅ 完成 |
| 12. 前端补充页面 | 3 | 3 | ✅ 完成 |
| 13. Chat API | 5 | 5 | ✅ 完成（Gemini 3.1-flash-lite，tool use 验证）|
| 14. 全链路联调 | 6 | 6 | ✅ 完成 |
| 15. OpenClaw Plugin | 3 | 3 | ✅ 完成 |
| 16. 部署上线 | 5 | 3 | 🔄 需部署账号 |
| 17. 文档 & 提交 | 5 | 3 | 🔄 待视频录制 |
| **合计** | **104** | **95** | **91%** |

---

# ═══ V2 改进阶段 ═══

## 阶段 18：Logo + 全局样式升级

- [ ] 18.1 设计 TronClaw SVG Logo（卡通螃蟹钳子，渐变红→绿）
- [ ] 18.2 全局 CSS 变量（Web3 深色主题 #0A0F1C / #131A2E）
- [ ] 18.3 渐变色系统（TRON 红 → 品牌绿，蓝紫辅助）
- [ ] 18.4 动画系统（fade-in-up、slide-in、glow、countUp）
- [ ] 18.5 网格/光斑背景组件
- [ ] 18.6 发光卡片组件（hover glow border）

---

## 阶段 19：钱包连接

- [ ] 19.1 安装 `@tronweb3/tronwallet-adapters` + React hooks
- [ ] 19.2 WalletContext.tsx — Provider 全局状态
- [ ] 19.3 WalletModal.tsx — 钱包选择弹窗（TronLink/TokenPocket/OKX/BitGet/WalletConnect，含官方图标）
- [ ] 19.4 WalletButton.tsx — 导航栏连接/断开按钮（显示缩写地址）
- [ ] 19.5 所有页面使用连接的钱包地址替代硬编码
- [ ] 19.6 **验证**：TronLink 连接后 Dashboard 显示真实余额

---

## 阶段 20：Landing Page 重做

- [ ] 20.1 全屏 Hero + 粒子/网格动画背景
- [ ] 20.2 巨大渐变标题 + 实时链上数据 ticker（TRX 价格等）
- [ ] 20.3 四大功能卡片（渐变边框 glow + 图标）
- [ ] 20.4 Bank of AI 集成专区（4 个基础设施带描述和标签）
- [ ] 20.5 架构图动画版（节点连线）
- [ ] 20.6 三种接入方式（Skills / MCP / REST）带代码预览
- [ ] 20.7 Footer 带 GitHub + 黑客松链接

---

## 阶段 21：Dashboard 升级

- [ ] 21.1 顶部显示已连接钱包 + 网络状态
- [ ] 21.2 余额卡片 countUp 动画 + 渐变背景
- [ ] 21.3 Agent Activity Feed 带 slide-in 动画 + TronScan 链接
- [ ] 21.4 DeFi 图表渐变填充 + 美化 tooltip
- [ ] 21.5 所有地址/hash 可点击跳转 TronScan
- [ ] 21.6 网络选择器（Nile / Shasta / Mainnet）

---

## 阶段 22：Chat UI 升级

- [ ] 22.1 使用连接的钱包地址（不再硬编码）
- [ ] 22.2 工具调用卡片增加 TronScan 交易链接
- [ ] 22.3 消息气泡渐变边框 + 发光效果
- [ ] 22.4 打字机效果（逐字显示 AI 回复）
- [ ] 22.5 示例按钮分类（Payment / DeFi / Data / Automation）

---

## 阶段 23：TRON 特色功能真实化

- [ ] 23.1 真实 TRC20 转账（用户钱包签名 → TronScan 确认链接）
- [ ] 23.2 收款请求生成支付二维码 + 状态轮询
- [ ] 23.3 DeFi 收益率从 SunSwap/JustLend API 实时获取
- [ ] 23.4 Swap 报价查询 UI（代币对选择 + 金额预览）
- [ ] 23.5 鲸鱼追踪增加 TronScan 链接 + 金额格式化
- [ ] 23.6 导航栏显示实时 TRX 价格
- [ ] 23.7 所有 hash/地址全局可点击 → TronScan

---

## 阶段 24：Agents + Explorer 升级

- [ ] 24.1 Agent 信誉分渐变进度条
- [ ] 24.2 Agent 注册使用连接的钱包
- [ ] 24.3 Explorer 代币 logo + TronScan 链接
- [ ] 24.4 交易历史增加方向图标（发送/接收）+ 类型标记

---

## 阶段 25：代理 + 稳定性

- [ ] 25.1 后端支持 HTTPS_PROXY 环境变量
- [ ] 25.2 Gemini 调用使用 proxy agent
- [ ] 25.3 .env.example 更新代理配置说明
- [ ] 25.4 全链路回归测试（Chat + Dashboard + Agent + WS）
- [ ] 25.5 Git commit + push

---

## V2 总览统计

| 阶段 | 任务数 | 已完成 | 状态 |
|------|--------|--------|------|
| 18. Logo + 全局样式 | 6 | 0 | ⬜ |
| 19. 钱包连接 | 6 | 0 | ⬜ |
| 20. Landing Page 重做 | 7 | 0 | ⬜ |
| 21. Dashboard 升级 | 6 | 0 | ⬜ |
| 22. Chat UI 升级 | 5 | 0 | ⬜ |
| 23. TRON 特色功能 | 7 | 0 | ⬜ |
| 24. Agents + Explorer | 4 | 0 | ⬜ |
| 25. 代理 + 稳定性 | 5 | 0 | ⬜ |
| **V2 合计** | **46** | **0** | **0%** |

---

# ═══ V3 四大赛道深度落地 ═══

## 阶段 26：前端导航重构

- [ ] 26.1 侧边栏改为 6 页：Overview / Market / DeFi / Data / Auto / Chat
- [ ] 26.2 App.tsx 路由更新 + 新页面骨架
- [ ] 26.3 Landing Page 更新（展示四大子产品）
- [ ] 26.4 **验证**：所有新路由可访问

---

## 阶段 27：💳 SealPay — Agent 服务市场

### 后端
- [ ] 27.1 DB: services / invocations / ratings 表
- [ ] 27.2 POST /api/v1/market/register — Agent 注册服务
- [ ] 27.3 GET /api/v1/market/services — 服务列表（排序/筛选）
- [ ] 27.4 POST /api/v1/market/invoke — 调用服务 + x402 自动付费
- [ ] 27.5 GET /api/v1/market/history — 调用历史
- [ ] 27.6 POST /api/v1/market/rate — 评分
- [ ] 27.7 预置 4 个 Demo 服务（Writing / Signal / Audit / Translation）

### 前端 `/market`
- [ ] 27.8 服务卡片网格（名称/价格/评分/调用次数/Agent 名）
- [ ] 27.9 服务详情弹窗 + "调用"按钮（显示 x402 扣费确认）
- [ ] 27.10 Agent 信誉侧边卡（8004 身份 + 信誉条）
- [ ] 27.11 顶部统计（总服务/总交易额/活跃 Agent）
- [ ] 27.12 **验证**：在前端调用一个服务 → 扣费 → 历史记录出现

---

## 阶段 28：📈 TronSage — DeFi 智能顾问

### 后端
- [ ] 28.1 GET /api/v1/defi/overview — DeFi 全景（TVL/协议数/总用户）
- [ ] 28.2 GET /api/v1/defi/protocols — 各协议详情（JustLend/SunSwap/Sun.io）
- [ ] 28.3 POST /api/v1/defi/supply — 执行存款
- [ ] 28.4 GET /api/v1/defi/portfolio — 我的 DeFi 组合
- [ ] 28.5 收益率从 SunSwap/JustLend API 实时获取（替代 mock）

### 前端 `/defi`
- [ ] 28.6 顶部：总资产 / 总收益 / 当前 APY
- [ ] 28.7 协议卡片（JustLend/SunSwap/Sun.io 各自 TVL + 利率）
- [ ] 28.8 收益排行表（可排序、风险等级筛选、渐变高亮）
- [ ] 28.9 AI 策略推荐卡（描述 + 步骤流程图 + 预期 APY + 执行按钮）
- [ ] 28.10 Swap 面板（左右代币选择 + 金额 + 兑换率预览 + 确认按钮）
- [ ] 28.11 **验证**：在前端完成一次 Swap 预览 + 策略推荐

---

## 阶段 29：🔍 ChainEye — 链上数据分析

### 后端
- [ ] 29.1 GET /api/v1/data/tx/:hash — 交易详情解析
- [ ] 29.2 POST /api/v1/data/report — AI 深度报告（x402 付费）
- [ ] 29.3 GET /api/v1/data/overview — 全网概览（总地址/总交易/24h 数据）
- [ ] 29.4 地址画像增强（持仓饼图数据 + 活跃度时间线数据）

### 前端 `/data`
- [ ] 29.5 智能搜索栏（地址/hash/代币名自动识别）
- [ ] 29.6 地址画像卡（余额饼图 + 持仓列表 + 活跃度时间线）
- [ ] 29.7 鲸鱼监控实时面板（滚动列表 + 金额热力条）
- [ ] 29.8 交易详情页（操作解读 + 涉及合约 + TronScan 链接）
- [ ] 29.9 AI 对话框（自然语言 → 数据分析结果 + 图表）
- [ ] 29.10 **验证**：搜索一个地址 → 显示完整画像 + 饼图

---

## 阶段 30：⚡ AutoHarvest — 自动化猎手

### 后端
- [ ] 30.1 POST /api/v1/auto/schedule — 定时转账
- [ ] 30.2 POST /api/v1/auto/whale-follow — 鲸鱼跟单
- [ ] 30.3 PATCH /api/v1/auto/tasks/:id — 暂停/恢复
- [ ] 30.4 GET /api/v1/auto/tasks/:id/history — 任务历史
- [ ] 30.5 GET /api/v1/auto/stats — 全局统计

### 前端 `/auto`
- [ ] 30.6 任务创建面板（选类型 → 设条件 → 设操作 → 激活）
- [ ] 30.7 活跃任务列表（状态徽章/触发次数/开关按钮）
- [ ] 30.8 任务历史时间线（成功/失败 + tx hash + TronScan）
- [ ] 30.9 统计卡片（活跃数/总触发/总节省）
- [ ] 30.10 **验证**：创建条件交易 → 列表显示 → 暂停/取消

---

## 阶段 31：Overview 总览仪表盘

- [ ] 31.1 `/overview` 页整合四模块核心指标
- [ ] 31.2 四个子产品入口卡片（快速跳转）
- [ ] 31.3 全局 Agent Activity Feed（所有模块的操作汇总）
- [ ] 31.4 余额 + DeFi 收益 + 任务状态一览
- [ ] 31.5 **验证**：Overview 打开后展示完整的平台全景

---

## 阶段 32：Chat 增强

- [ ] 32.1 识别用户意图 → 路由到对应模块
- [ ] 32.2 Market 相关工具注册到 Chat
- [ ] 32.3 Auto 新工具（定时/跟单）注册到 Chat
- [ ] 32.4 Data 新工具（报告/交易解析）注册到 Chat
- [ ] 32.5 **验证**：在 Chat 中跨模块对话端到端

---

## 阶段 33：最终打磨 + 提交

- [ ] 33.1 全链路回归测试
- [ ] 33.2 README 更新（四大模块介绍）
- [ ] 33.3 Skills 更新（新增 market / auto 扩展 skill）
- [ ] 33.4 Git commit + push
- [ ] 33.5 录制 5 分钟 Demo 视频
- [ ] 33.6 Google Form 提交

---

## V3 总览统计

| 阶段 | 任务数 | 已完成 | 状态 |
|------|--------|--------|------|
| 26. 导航重构 | 4 | 0 | ⬜ |
| 27. SealPay 市场 | 12 | 0 | ⬜ |
| 28. TronSage DeFi | 11 | 0 | ⬜ |
| 29. ChainEye 数据 | 10 | 0 | ⬜ |
| 30. AutoHarvest 自动化 | 10 | 0 | ⬜ |
| 31. Overview 总览 | 5 | 0 | ⬜ |
| 32. Chat 增强 | 5 | 0 | ⬜ |
| 33. 最终提交 | 6 | 0 | ⬜ |
| **V3 合计** | **63** | **0** | **0%** |
