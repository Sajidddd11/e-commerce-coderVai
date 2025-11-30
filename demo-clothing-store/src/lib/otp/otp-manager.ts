import Redis from "ioredis"

type OTPData = {
    otp: string
    phone: string
    attempts: number
    createdAt: number
}

type OTPRequestData = {
    count: number
    lastRequest: number
}

export class OTPManager {
    private redis: Redis

    constructor(redis: Redis) {
        this.redis = redis
    }

    /**
     * Generate a 6-digit OTP code
     */
    private generateOTP(): string {
        return Math.floor(100000 + Math.random() * 900000).toString()
    }

    /**
     * Store OTP in Redis with expiration
     * @param phone - Customer phone number
     * @param expiryMinutes - OTP expiration time in minutes (default: 5)
     */
    async createOTP(phone: string, expiryMinutes: number = 5): Promise<string> {
        const otp = this.generateOTP()
        const key = `otp:${phone}`

        const data: OTPData = {
            otp,
            phone,
            attempts: 0,
            createdAt: Date.now(),
        }

        // Store OTP with expiration (in seconds)
        await this.redis.setex(key, expiryMinutes * 60, JSON.stringify(data))

        return otp
    }

    /**
     * Verify OTP code
     * @param phone - Customer phone number
     * @param otp - OTP code to verify
     * @returns true if valid, false otherwise
     */
    async verifyOTP(phone: string, otp: string): Promise<boolean> {
        const key = `otp:${phone}`
        const dataStr = await this.redis.get(key)

        if (!dataStr) {
            return false
        }

        const data: OTPData = JSON.parse(dataStr)

        // Increment attempt counter
        data.attempts += 1

        // Check if max attempts exceeded (5 attempts)
        if (data.attempts > 5) {
            await this.redis.del(key)
            return false
        }

        // Update attempts in Redis
        const ttl = await this.redis.ttl(key)
        if (ttl > 0) {
            await this.redis.setex(key, ttl, JSON.stringify(data))
        }

        // Verify OTP
        if (data.otp === otp) {
            // Delete OTP after successful verification (one-time use)
            await this.redis.del(key)
            return true
        }

        return false
    }

    /**
     * Check if customer can request OTP (rate limiting)
     * Max 3 requests per hour
     * @param phone - Customer phone number
     */
    async canRequestOTP(phone: string): Promise<{ allowed: boolean; remainingTime?: number }> {
        const key = `otp:requests:${phone}`
        const dataStr = await this.redis.get(key)

        if (!dataStr) {
            return { allowed: true }
        }

        const data: OTPRequestData = JSON.parse(dataStr)
        const hourInMs = 60 * 60 * 1000
        const timeSinceFirst = Date.now() - data.lastRequest

        // If more than an hour has passed, reset
        if (timeSinceFirst > hourInMs) {
            await this.redis.del(key)
            return { allowed: true }
        }

        // Check if exceeded max requests (3 per hour)
        if (data.count >= 3) {
            const remainingTime = Math.ceil((hourInMs - timeSinceFirst) / 1000 / 60) // in minutes
            return { allowed: false, remainingTime }
        }

        return { allowed: true }
    }

    /**
     * Record OTP request for rate limiting
     * @param phone - Customer phone number
     */
    async recordOTPRequest(phone: string): Promise<void> {
        const key = `otp:requests:${phone}`
        const dataStr = await this.redis.get(key)

        let data: OTPRequestData

        if (!dataStr) {
            data = {
                count: 1,
                lastRequest: Date.now(),
            }
        } else {
            data = JSON.parse(dataStr)
            data.count += 1
            data.lastRequest = Date.now()
        }

        // Store for 1 hour
        await this.redis.setex(key, 60 * 60, JSON.stringify(data))
    }

    /**
     * Generate a temporary reset token after OTP verification
     * Valid for 15 minutes
     * @param phone - Customer phone number
     */
    async createResetToken(phone: string): Promise<string> {
        const token = `reset_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
        const key = `reset:token:${token}`

        await this.redis.setex(key, 15 * 60, phone) // 15 minutes expiration

        return token
    }

    /**
     * Validate reset token and get associated phone number
     * @param token - Reset token
     */
    async validateResetToken(token: string): Promise<string | null> {
        const key = `reset:token:${token}`
        const phone = await this.redis.get(key)

        if (!phone) {
            return null
        }

        // Delete token after validation (one-time use)
        await this.redis.del(key)

        return phone
    }

    /**
     * Clear all OTP data for a phone number (for testing/cleanup)
     * @param phone - Customer phone number
     */
    async clearOTP(phone: string): Promise<void> {
        await this.redis.del(`otp:${phone}`)
        await this.redis.del(`otp:requests:${phone}`)
    }
}

// Singleton instance
let otpManagerInstance: OTPManager | undefined

export const getOTPManager = (): OTPManager => {
    if (otpManagerInstance) {
        return otpManagerInstance
    }

    const redisUrl = process.env.REDIS_URL || "redis://localhost:6379"
    const redis = new Redis(redisUrl)

    otpManagerInstance = new OTPManager(redis)

    return otpManagerInstance
}
