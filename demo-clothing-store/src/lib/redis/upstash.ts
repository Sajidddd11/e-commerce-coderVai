import { Redis } from '@upstash/redis'

/**
 * Upstash Redis client for caching payment sessions and cart data
 * Falls back to in-memory storage if Upstash is not configured
 */
class UpstashRedisService {
  private client: Redis | null = null
  private inMemoryStore: Map<string, { value: any; expiresAt: number | null }> = new Map()
  private isConfigured: boolean = false

  constructor() {
    const url = process.env.UPSTASH_REDIS_REST_URL
    const token = process.env.UPSTASH_REDIS_REST_TOKEN

    if (url && token) {
      try {
        this.client = new Redis({
          url,
          token,
        })
        this.isConfigured = true
        console.log('[Upstash] Redis client initialized successfully')
      } catch (error) {
        console.warn('[Upstash] Failed to initialize Redis client:', error)
        this.isConfigured = false
      }
    } else {
      console.warn('[Upstash] Redis not configured. Using in-memory fallback.')
    }
  }

  /**
   * Set a value with optional expiration (in seconds)
   */
  async set(key: string, value: any, expirationSeconds?: number): Promise<void> {
    if (this.isConfigured && this.client) {
      try {
        if (expirationSeconds) {
          await this.client.setex(key, expirationSeconds, JSON.stringify(value))
        } else {
          await this.client.set(key, JSON.stringify(value))
        }
      } catch (error) {
        console.error('[Upstash] Error setting value:', error)
        // Fallback to in-memory
        this.setInMemory(key, value, expirationSeconds)
      }
    } else {
      this.setInMemory(key, value, expirationSeconds)
    }
  }

  /**
   * Get a value by key
   */
  async get<T = any>(key: string): Promise<T | null> {
    if (this.isConfigured && this.client) {
      try {
        const value = await this.client.get(key)
        if (value === null || value === undefined) return null
        return (typeof value === 'string' ? JSON.parse(value) : value) as T
      } catch (error) {
        console.error('[Upstash] Error getting value:', error)
        // Fallback to in-memory
        return this.getInMemory<T>(key)
      }
    } else {
      return this.getInMemory<T>(key)
    }
  }

  /**
   * Delete a key
   */
  async del(key: string): Promise<void> {
    if (this.isConfigured && this.client) {
      try {
        await this.client.del(key)
      } catch (error) {
        console.error('[Upstash] Error deleting value:', error)
      }
    }
    this.inMemoryStore.delete(key)
  }

  /**
   * Check if a key exists
   */
  async exists(key: string): Promise<boolean> {
    if (this.isConfigured && this.client) {
      try {
        const result = await this.client.exists(key)
        return result === 1
      } catch (error) {
        console.error('[Upstash] Error checking existence:', error)
        return this.inMemoryStore.has(key)
      }
    } else {
      return this.inMemoryStore.has(key)
    }
  }

  /**
   * Set expiration on an existing key (in seconds)
   */
  async expire(key: string, seconds: number): Promise<void> {
    if (this.isConfigured && this.client) {
      try {
        await this.client.expire(key, seconds)
      } catch (error) {
        console.error('[Upstash] Error setting expiration:', error)
      }
    } else {
      const item = this.inMemoryStore.get(key)
      if (item) {
        item.expiresAt = Date.now() + seconds * 1000
      }
    }
  }

  // In-memory fallback methods
  private setInMemory(key: string, value: any, expirationSeconds?: number): void {
    const expiresAt = expirationSeconds ? Date.now() + expirationSeconds * 1000 : null
    this.inMemoryStore.set(key, { value, expiresAt })
  }

  private getInMemory<T>(key: string): T | null {
    const item = this.inMemoryStore.get(key)
    if (!item) return null

    // Check expiration
    if (item.expiresAt && Date.now() > item.expiresAt) {
      this.inMemoryStore.delete(key)
      return null
    }

    return item.value as T
  }

  /**
   * Clean up expired in-memory items (call periodically if using fallback)
   */
  cleanupExpired(): void {
    const now = Date.now()
    for (const [key, item] of this.inMemoryStore.entries()) {
      if (item.expiresAt && now > item.expiresAt) {
        this.inMemoryStore.delete(key)
      }
    }
  }
}

// Singleton instance
export const upstashRedis = new UpstashRedisService()
