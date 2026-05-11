import { Redis } from '@upstash/redis'
import IORedis from 'ioredis'

/**
 * Redis client that prioritizes:
 * 1. Local Redis (REDIS_URL) - fastest
 * 2. Upstash Redis (cloud) - fallback for serverless
 * 3. In-memory storage - last resort
 */
class UpstashRedisService {
  private upstashClient: Redis | null = null
  private localClient: IORedis | null = null
  private inMemoryStore: Map<string, { value: any; expiresAt: number | null }> = new Map()
  private isConfigured: boolean = false
  private clientType: 'local' | 'upstash' | 'memory' = 'memory'

  constructor() {
    // Priority 1: Try local Redis first (much faster!)
    const redisUrl = process.env.REDIS_URL
    if (redisUrl) {
      try {
        this.localClient = new IORedis(redisUrl, {
          maxRetriesPerRequest: 3,
          enableReadyCheck: true,
          lazyConnect: true,
        })

        this.localClient.connect().then(() => {
          this.isConfigured = true
          this.clientType = 'local'
          console.log('[Redis] Local Redis client connected successfully')
        }).catch((err) => {
          console.warn('[Redis] Local Redis connection failed, trying Upstash...', err.message)
          this.tryUpstash()
        })

      } catch (error) {
        console.warn('[Redis] Failed to initialize local Redis:', error)
        this.tryUpstash()
      }
    } else {
      this.tryUpstash()
    }
  }

  private tryUpstash() {
    // Priority 2: Try Upstash (cloud Redis)
    const url = process.env.UPSTASH_REDIS_REST_URL
    const token = process.env.UPSTASH_REDIS_REST_TOKEN

    if (url && token) {
      try {
        this.upstashClient = new Redis({ url, token })
        this.isConfigured = true
        this.clientType = 'upstash'
        console.log('[Redis] Upstash Redis client initialized')
      } catch (error) {
        console.warn('[Redis] Failed to initialize Upstash:', error)
        console.warn('[Redis] Using in-memory fallback')
      }
    } else {
      console.warn('[Redis] No Redis configured. Using in-memory storage.')
    }
  }

  /**
   * Set a value with optional expiration (in seconds)
   */
  async set(key: string, value: any, expirationSeconds?: number): Promise<void> {
    if (this.isConfigured) {
      try {
        if (this.clientType === 'local' && this.localClient) {
          // Use local Redis (ioredis)
          if (expirationSeconds) {
            await this.localClient.setex(key, expirationSeconds, JSON.stringify(value))
          } else {
            await this.localClient.set(key, JSON.stringify(value))
          }
        } else if (this.clientType === 'upstash' && this.upstashClient) {
          // Use Upstash Redis
          if (expirationSeconds) {
            await this.upstashClient.setex(key, expirationSeconds, JSON.stringify(value))
          } else {
            await this.upstashClient.set(key, JSON.stringify(value))
          }
        }
      } catch (error: any) {
        // Silently fall back to in-memory
        this.setInMemory(key, value, expirationSeconds)
      }
    } else {
      this.setInMemory(key, value, expirationSeconds)
    }
  }

  /**
   * Get a value from Redis
   */
  async get<T = any>(key: string): Promise<T | null> {
    if (this.isConfigured) {
      try {
        let value: string | null = null

        if (this.clientType === 'local' && this.localClient) {
          value = await this.localClient.get(key)
        } else if (this.clientType === 'upstash' && this.upstashClient) {
          value = await this.upstashClient.get(key)
        }

        if (value === null || value === undefined) return null
        return (typeof value === 'string' ? JSON.parse(value) : value) as T
      } catch (error) {
        // Silently fall back to in-memory
        return this.getInMemory<T>(key)
      }
    } else {
      return this.getInMemory<T>(key)
    }
  }

  /**
   * Delete a value from Redis
   */
  async del(key: string): Promise<void> {
    if (this.isConfigured) {
      try {
        if (this.clientType === 'local' && this.localClient) {
          await this.localClient.del(key)
        } else if (this.clientType === 'upstash' && this.upstashClient) {
          await this.upstashClient.del(key)
        }
      } catch (error) {
        // Silently handle error
      }
    }
    this.inMemoryStore.delete(key)
  }

  /**
   * Check if a key exists
   */
  async exists(key: string): Promise<boolean> {
    if (this.isConfigured) {
      try {
        let result: number = 0

        if (this.clientType === 'local' && this.localClient) {
          result = await this.localClient.exists(key)
        } else if (this.clientType === 'upstash' && this.upstashClient) {
          result = await this.upstashClient.exists(key)
        }

        return result === 1
      } catch (error) {
        // Silently fall back
        return this.inMemoryStore.has(key)
      }
    } else {
      return this.inMemoryStore.has(key)
    }
  }

  /**
   * Set expiration on a key
   */
  async expire(key: string, seconds: number): Promise<void> {
    if (this.isConfigured) {
      try {
        if (this.clientType === 'local' && this.localClient) {
          await this.localClient.expire(key, seconds)
        } else if (this.clientType === 'upstash' && this.upstashClient) {
          await this.upstashClient.expire(key, seconds)
        }
      } catch (error) {
        // Silently handle error  
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
