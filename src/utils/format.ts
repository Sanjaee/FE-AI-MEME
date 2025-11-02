// Helper functions for formatting

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `$${(num / 1000000).toFixed(2)}M`
  } else if (num >= 1000) {
    return `$${(num / 1000).toFixed(1)}K`
  }
  return `$${num.toFixed(2)}`
}

export function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 60) return `${diffMins}m`
  if (diffHours < 24) return `${diffHours}h`
  if (diffDays < 30) return `${diffDays}d`
  return `${Math.floor(diffDays / 30)}m`
}

// Deterministic pseudo-random based on seed
export function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

export function calculateChangePercent(marketCap: number): number {
  // Deterministic change based on marketCap
  const seed = marketCap * 0.001
  return (seededRandom(seed) * 50 - 20)
}

