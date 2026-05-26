import type { PostmanVariable, CollectionVariable } from './types'

export function resolveVariables(
  template: string,
  variables: Record<string, string>
): string {
  return template.replace(/\{\{([^}]+)\}\}/g, (match, name) => {
    const trimmed = name.trim()
    return trimmed in variables ? variables[trimmed] : match
  })
}

export function collectUnresolvedVars(template: string): string[] {
  const matches = template.match(/\{\{([^}]+)\}\}/g) ?? []
  return matches.map(m => m.slice(2, -2).trim())
}

export function buildVariableMap(
  envVariables: { key: string; value: string; enabled: boolean }[],
  collectionVariables: CollectionVariable[]
): Record<string, string> {
  const map: Record<string, string> = {}

  for (const v of envVariables) {
    if (v.enabled) map[v.key] = v.value
  }

  // Collection vars take precedence
  for (const v of collectionVariables) {
    if (v.key) map[v.key] = v.value
  }

  return map
}

export function resolvePostmanUrl(
  urlObj: { raw: string; query?: { key: string; value: string; disabled?: boolean }[] } | string,
  variables: Record<string, string>
): string {
  const raw = typeof urlObj === 'string' ? urlObj : urlObj.raw
  return resolveVariables(raw, variables)
}
