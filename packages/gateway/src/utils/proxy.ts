/**
 * HTTP proxy support for Gemini API calls in restricted regions
 * Reads HTTPS_PROXY from env and patches global fetch if set
 */

let proxyPatched = false

export async function setupProxy(): Promise<void> {
  const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY || process.env.https_proxy || process.env.http_proxy
  if (!proxyUrl || proxyPatched) return

  try {
    // Use undici ProxyAgent for Node.js fetch
    const { ProxyAgent, setGlobalDispatcher } = await import('undici')
    setGlobalDispatcher(new ProxyAgent(proxyUrl))
    proxyPatched = true
    console.log(`[Proxy] Global fetch proxy set → ${proxyUrl}`)
  } catch {
    console.warn('[Proxy] undici not available, trying https-proxy-agent...')
    try {
      // Fallback: set global agent for http/https modules
      const { HttpsProxyAgent } = await import('https-proxy-agent')
      const agent = new HttpsProxyAgent(proxyUrl)
      // @ts-expect-error global agent override
      globalThis[Symbol.for('undici.globalDispatcher.1')] = undefined
      const https = await import('https')
      https.globalAgent = agent as unknown as typeof https.globalAgent
      proxyPatched = true
      console.log(`[Proxy] https-proxy-agent set → ${proxyUrl}`)
    } catch {
      console.warn('[Proxy] No proxy agent available. Install undici or https-proxy-agent for proxy support.')
    }
  }
}
