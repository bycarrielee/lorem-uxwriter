export interface FigmaTextNode {
  nodeId: string
  name: string
  characters: string
}

export interface FigmaExtractResult {
  nodes: FigmaTextNode[]
  frameInfo: { name: string; nodeId: string }
}

export type FigmaExtractError = {
  error: 'no_token' | 'not_found' | 'no_text_nodes' | 'api_error'
  detail?: string
}

export type FigmaResult = FigmaExtractResult | FigmaExtractError

export async function fetchFigmaTextNodes(
  fileKey: string,
  nodeId: string,
  clientToken?: string,
): Promise<FigmaResult> {
  const token = clientToken ?? process.env.FIGMA_ACCESS_TOKEN
  if (!token) {
    return { error: 'no_token' }
  }

  const url = `https://api.figma.com/v1/files/${fileKey}/nodes?ids=${encodeURIComponent(nodeId)}`
  let data: Record<string, unknown>
  try {
    const res = await fetch(url, {
      headers: { 'X-Figma-Token': token },
    })
    if (res.status === 404 || res.status === 403) {
      return { error: 'not_found' }
    }
    if (!res.ok) {
      const text = await res.text()
      return { error: 'api_error', detail: `HTTP ${res.status}: ${text.slice(0, 200)}` }
    }
    data = await res.json() as Record<string, unknown>
  } catch (err) {
    return { error: 'api_error', detail: err instanceof Error ? err.message : 'fetch failed' }
  }

  const nodesMap = data.nodes as Record<string, { document: FigmaNode }> | undefined
  if (!nodesMap) {
    return { error: 'api_error', detail: 'Unexpected Figma API response shape' }
  }

  const nodeKey = Object.keys(nodesMap)[0]
  if (!nodeKey || !nodesMap[nodeKey]) {
    return { error: 'not_found' }
  }

  const rootDoc = nodesMap[nodeKey].document
  const frameInfo = { name: rootDoc.name ?? 'Untitled frame', nodeId }

  // Walk node tree iteratively to collect TEXT nodes
  const textNodes: FigmaTextNode[] = []
  const seen = new Set<string>() // deduplicate by name+characters
  const stack: FigmaNode[] = [rootDoc]

  while (stack.length > 0) {
    const node = stack.pop()!
    if (node.type === 'TEXT' && typeof node.characters === 'string') {
      const key = `${node.name}||${node.characters}`
      if (!seen.has(key)) {
        seen.add(key)
        textNodes.push({
          nodeId: node.id,
          name: node.name,
          characters: node.characters,
        })
      }
    }
    // Include all children regardless of visibility
    if (Array.isArray(node.children)) {
      for (const child of node.children) {
        stack.push(child)
      }
    }
  }

  if (textNodes.length === 0) {
    return { error: 'no_text_nodes' }
  }

  return { nodes: textNodes, frameInfo }
}

interface FigmaNode {
  id: string
  name: string
  type: string
  characters?: string
  children?: FigmaNode[]
}
