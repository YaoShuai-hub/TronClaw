/**
 * Identity Module — Bank of AI 8004 On-chain Identity Protocol
 */
import { v4 as uuidv4 } from 'uuid'
import { getDb } from '../../db/index.js'
import type { AgentIdentity } from '@tronclaw/shared'

export async function registerAgentIdentity(
  agentName: string,
  capabilities: string[],
  ownerAddress: string,
): Promise<AgentIdentity> {
  const agentId = `agent_${uuidv4().replace(/-/g, '').slice(0, 16)}`
  const now = Date.now()

  // TODO: call Bank of AI 8004 API to register on-chain
  // For now: persist locally and return identity
  const identity: AgentIdentity = {
    agentId,
    agentName,
    ownerAddress,
    capabilities,
    trustScore: 100,
    totalTransactions: 0,
    successRate: 1.0,
    registeredAt: now,
    identityTxHash: `mock_identity_${agentId}`,
  }

  const db = getDb()
  db.prepare(`
    INSERT OR REPLACE INTO agent_identities
    (agent_id, agent_name, owner_address, capabilities, trust_score, total_transactions, success_rate, registered_at, identity_tx_hash)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    agentId, agentName, ownerAddress,
    JSON.stringify(capabilities),
    100, 0, 1.0, now,
    identity.identityTxHash,
  )

  return identity
}

export async function getAgentReputation(agentId: string): Promise<AgentIdentity | null> {
  const db = getDb()
  const row = db.prepare('SELECT * FROM agent_identities WHERE agent_id = ?').get(agentId) as
    Record<string, unknown> | undefined

  if (!row) return null

  return {
    agentId: row.agent_id as string,
    agentName: row.agent_name as string,
    ownerAddress: row.owner_address as string,
    capabilities: JSON.parse(row.capabilities as string),
    trustScore: row.trust_score as number,
    totalTransactions: row.total_transactions as number,
    successRate: row.success_rate as number,
    registeredAt: row.registered_at as number,
    identityTxHash: row.identity_tx_hash as string,
  }
}

export async function verifyAgent(agentId: string): Promise<{ verified: boolean; identity: AgentIdentity | null }> {
  const identity = await getAgentReputation(agentId)
  return {
    verified: identity !== null && identity.trustScore >= 50,
    identity,
  }
}
