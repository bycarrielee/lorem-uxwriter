export function isFigmaUrl(raw: string): boolean {
  try {
    const url = new URL(raw.trim())
    return (
      (url.hostname === 'www.figma.com' || url.hostname === 'figma.com') &&
      /\/(design|file|proto)\//.test(url.pathname)
    )
  } catch {
    return false
  }
}

export interface FigmaParsedUrl {
  fileKey: string
  nodeId: string
}

export function parseFigmaUrl(raw: string): FigmaParsedUrl | null {
  try {
    const url = new URL(raw.trim())
    const pathMatch = url.pathname.match(/\/(design|file|proto)\/([^/]+)/)
    if (!pathMatch) return null
    const fileKey = pathMatch[2]

    const nodeIdRaw = url.searchParams.get('node-id')
    if (!nodeIdRaw) return null

    // Convert "123-456" → "123:456"
    const nodeId = nodeIdRaw.replace('-', ':')
    return { fileKey, nodeId }
  } catch {
    return null
  }
}
