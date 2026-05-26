// Blocks requests to private/internal network ranges to prevent SSRF attacks.
// AWS instance metadata (169.254.x.x) is especially dangerous to expose.

const PRIVATE_IPV4_RANGES = [
  /^127\./,           // loopback
  /^10\./,            // RFC1918
  /^172\.(1[6-9]|2\d|3[01])\./,  // RFC1918
  /^192\.168\./,      // RFC1918
  /^169\.254\./,      // link-local / AWS metadata
  /^0\./,             // reserved
  /^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./,  // CGNAT
]

const PRIVATE_HOSTNAMES = ['localhost', 'metadata.google.internal']

function isPrivateIP(ip: string): boolean {
  // IPv6 private ranges
  if (ip === '::1') return true
  if (ip.startsWith('fc') || ip.startsWith('fd') || ip.startsWith('fe80')) return true

  return PRIVATE_IPV4_RANGES.some((re) => re.test(ip))
}

export function validateProxyUrl(rawUrl: string): { valid: false; reason: string } | { valid: true; parsed: URL } {
  let parsed: URL
  try {
    parsed = new URL(rawUrl)
  } catch {
    return { valid: false, reason: 'Invalid URL' }
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return { valid: false, reason: 'Only http and https are allowed' }
  }

  const hostname = parsed.hostname.toLowerCase()

  if (PRIVATE_HOSTNAMES.includes(hostname)) {
    return { valid: false, reason: 'Requests to private hosts are not allowed' }
  }

  // Block direct IP addresses in private ranges
  if (/^[\d.]+$/.test(hostname) || /^[0-9a-f:]+$/i.test(hostname)) {
    if (isPrivateIP(hostname)) {
      return { valid: false, reason: 'Requests to private IP addresses are not allowed' }
    }
  }

  return { valid: true, parsed }
}

export const ALLOWED_METHODS = new Set(['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'])
