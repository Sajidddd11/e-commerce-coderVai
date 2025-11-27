type CacheEntry<T> = {
  data: T
  timestamp: number
  ttl: number
}

const cache = new Map<string, CacheEntry<any>>()

const DEFAULT_TTL = 5 * 60 * 1000 // 5 minutes

export function getCacheKey(...parts: string[]): string {
  return parts.join(":::")
}

export function getCachedData<T>(key: string): T | null {
  const entry = cache.get(key)
  
  if (!entry) return null
  
  const now = Date.now()
  if (now - entry.timestamp > entry.ttl) {
    cache.delete(key)
    return null
  }
  
  return entry.data as T
}

export function setCachedData<T>(key: string, data: T, ttl: number = DEFAULT_TTL): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    ttl,
  })
}

export function clearCache(): void {
  cache.clear()
}

export function clearCacheKey(key: string): void {
  cache.delete(key)
}
