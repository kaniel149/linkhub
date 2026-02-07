import { toolDefinitions, callTool } from './tools'
import { getResourceDefinitions, readResource } from './resources'
import type { AuthResult } from './auth'

/**
 * MCP Protocol Handler
 *
 * Implements JSON-RPC 2.0 over HTTP for the Model Context Protocol.
 * Handles: initialize, tools/list, tools/call, resources/list, resources/read.
 */

// ---------------------------------------------------------------------------
// JSON-RPC 2.0 types
// ---------------------------------------------------------------------------

export interface JsonRpcRequest {
  jsonrpc: '2.0'
  id: string | number
  method: string
  params?: Record<string, unknown>
}

export interface JsonRpcResponse {
  jsonrpc: '2.0'
  id: string | number
  result?: unknown
  error?: { code: number; message: string; data?: unknown }
}

// JSON-RPC error codes
const PARSE_ERROR = -32700
const INVALID_REQUEST = -32600
const METHOD_NOT_FOUND = -32601
const INVALID_PARAMS = -32602
const INTERNAL_ERROR = -32603

// ---------------------------------------------------------------------------
// Server metadata
// ---------------------------------------------------------------------------

const SERVER_INFO = {
  name: 'linkhub-mcp',
  version: '1.0.0',
}

const SERVER_CAPABILITIES = {
  tools: {},
  resources: {},
}

// ---------------------------------------------------------------------------
// Protocol handler
// ---------------------------------------------------------------------------

export async function handleRequest(
  body: unknown,
  username: string,
  auth: AuthResult | null
): Promise<JsonRpcResponse> {
  // Validate JSON-RPC structure
  if (!body || typeof body !== 'object') {
    return makeError(null, PARSE_ERROR, 'Parse error: expected JSON object')
  }

  const request = body as Record<string, unknown>

  if (request.jsonrpc !== '2.0') {
    return makeError(
      request.id as string | number | null,
      INVALID_REQUEST,
      'Invalid request: jsonrpc must be "2.0"'
    )
  }

  if (!request.id && request.id !== 0) {
    return makeError(null, INVALID_REQUEST, 'Invalid request: id is required')
  }

  const id = request.id as string | number
  const method = request.method as string
  const params = (request.params || {}) as Record<string, unknown>

  if (!method || typeof method !== 'string') {
    return makeError(id, INVALID_REQUEST, 'Invalid request: method is required')
  }

  try {
    switch (method) {
      case 'initialize':
        return handleInitialize(id, username)
      case 'tools/list':
        return handleToolsList(id)
      case 'tools/call':
        return await handleToolsCall(id, params, username, auth)
      case 'resources/list':
        return handleResourcesList(id, username)
      case 'resources/read':
        return await handleResourcesRead(id, params, username)
      case 'ping':
        return makeResult(id, {})
      default:
        return makeError(id, METHOD_NOT_FOUND, `Method not found: ${method}`)
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return makeError(id, INTERNAL_ERROR, message)
  }
}

// ---------------------------------------------------------------------------
// Method handlers
// ---------------------------------------------------------------------------

function handleInitialize(
  id: string | number,
  username: string
): JsonRpcResponse {
  return makeResult(id, {
    protocolVersion: '2024-11-05',
    serverInfo: SERVER_INFO,
    capabilities: SERVER_CAPABILITIES,
    instructions: `You are interacting with the LinkHub profile of @${username}. Use tools to get profile info, list links and services, or send inquiries. Read-only operations do not require authentication. Write operations (send_message, request_quote) require a valid API key with "inquire" permission.`,
  })
}

function handleToolsList(id: string | number): JsonRpcResponse {
  return makeResult(id, {
    tools: toolDefinitions,
  })
}

async function handleToolsCall(
  id: string | number,
  params: Record<string, unknown>,
  username: string,
  auth: AuthResult | null
): Promise<JsonRpcResponse> {
  const toolName = params.name as string
  const toolArgs = (params.arguments || {}) as Record<string, unknown>

  if (!toolName || typeof toolName !== 'string') {
    return makeError(id, INVALID_PARAMS, 'Missing or invalid "name" parameter')
  }

  // Verify the tool exists
  const toolDef = toolDefinitions.find((t) => t.name === toolName)
  if (!toolDef) {
    return makeError(id, INVALID_PARAMS, `Unknown tool: ${toolName}`)
  }

  // Write tools require authentication
  const writeMethods = ['send_message', 'request_quote']
  if (writeMethods.includes(toolName)) {
    if (!auth?.valid) {
      return makeError(
        id,
        -32001,
        'Authentication required. Provide a valid API key in the Authorization header (Bearer lh_xxx...).'
      )
    }
  }

  const result = await callTool(toolName, toolArgs, {
    username,
    profileId: auth?.profileId,
    permissions: auth?.permissions,
  })

  return makeResult(id, result)
}

function handleResourcesList(
  id: string | number,
  username: string
): JsonRpcResponse {
  return makeResult(id, {
    resources: getResourceDefinitions(username),
  })
}

async function handleResourcesRead(
  id: string | number,
  params: Record<string, unknown>,
  username: string
): Promise<JsonRpcResponse> {
  const uri = params.uri as string

  if (!uri || typeof uri !== 'string') {
    return makeError(id, INVALID_PARAMS, 'Missing or invalid "uri" parameter')
  }

  const result = await readResource(uri, username)

  if (!result) {
    return makeError(id, INVALID_PARAMS, `Resource not found: ${uri}`)
  }

  return makeResult(id, result)
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeResult(id: string | number, result: unknown): JsonRpcResponse {
  return { jsonrpc: '2.0', id, result }
}

function makeError(
  id: string | number | null,
  code: number,
  message: string,
  data?: unknown
): JsonRpcResponse {
  return {
    jsonrpc: '2.0',
    id: id ?? 0,
    error: { code, message, ...(data !== undefined ? { data } : {}) },
  }
}
