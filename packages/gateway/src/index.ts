import 'dotenv/config'
import { createServer } from './server.js'

const PORT = parseInt(process.env.PORT ?? '3000', 10)

const server = createServer()

server.listen(PORT, () => {
  console.log(`🦀 TronClaw Gateway running on http://localhost:${PORT}`)
  console.log(`   Network: ${process.env.TRON_NETWORK ?? 'nile'}`)
  console.log(`   Mock mode: ${process.env.MOCK_TRON === 'true' ? 'ON' : 'OFF'}`)
})
