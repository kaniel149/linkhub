/**
 * Agent Detection
 *
 * Detects AI agents from User-Agent strings.
 * Used to track agent visits separately from human visits.
 */

interface AgentDetectionResult {
  isAgent: boolean
  identifier: string | null
  name: string | null
}

const AGENT_PATTERNS: Array<{ pattern: RegExp; identifier: string; name: string }> = [
  // Anthropic / Claude
  { pattern: /claude[-\s]?web|claudebot|anthropic[-\s]?ai/i, identifier: 'claude', name: 'Claude' },
  // OpenAI / ChatGPT
  { pattern: /chatgpt[-\s]?user|gptbot|openai/i, identifier: 'chatgpt', name: 'ChatGPT' },
  // Perplexity
  { pattern: /perplexitybot|perplexity/i, identifier: 'perplexity', name: 'Perplexity' },
  // Google AI
  { pattern: /google[-\s]?extended|googlebot[-\s]?ai|google[-\s]?other/i, identifier: 'google-ai', name: 'Google AI' },
  // Bing AI / Copilot
  { pattern: /bingbot|bingpreview/i, identifier: 'bing-ai', name: 'Bing AI' },
  // Meta AI
  { pattern: /meta[-\s]?external|facebookexternalhit/i, identifier: 'meta-ai', name: 'Meta AI' },
  // Apple AI
  { pattern: /applebot[-\s]?extended/i, identifier: 'apple-ai', name: 'Apple AI' },
  // Cohere
  { pattern: /cohere[-\s]?ai/i, identifier: 'cohere', name: 'Cohere' },
  // Generic bots / crawlers (lower priority)
  { pattern: /bot(?!.*(?:google|bing|facebook|twitter))|crawler|spider|scraper/i, identifier: 'generic-bot', name: 'Bot' },
]

export function detectAgent(userAgent: string | null): AgentDetectionResult {
  if (!userAgent) {
    return { isAgent: false, identifier: null, name: null }
  }

  for (const { pattern, identifier, name } of AGENT_PATTERNS) {
    if (pattern.test(userAgent)) {
      return { isAgent: true, identifier, name }
    }
  }

  return { isAgent: false, identifier: null, name: null }
}

/**
 * Check if a request looks like it's from an AI agent
 * based on both User-Agent and Accept headers
 */
export function isAgentRequest(userAgent: string | null, acceptHeader: string | null): boolean {
  const detection = detectAgent(userAgent)
  if (detection.isAgent) return true

  // Also consider requests with Accept: application/json on profile pages
  // as potentially from agents (though could be developers too)
  return false
}
