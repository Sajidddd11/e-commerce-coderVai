import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    },
    /**
     * Force insecure cookies for local HTTPS-less runs. Remove/override
     * when deploying behind HTTPS so admin sessions stay protected.
     */
    cookieOptions: {
      secure: false,
      sameSite: "lax",
    },
    // AWS RDS requires SSL encryption, but standard VPS Docker DBs do not run SSL by default
    databaseDriverOptions: process.env.DATABASE_URL?.includes("rds.amazonaws.com")
      ? {
          connection: {
            ssl: {
              rejectUnauthorized: false, // AWS RDS uses self-signed certificates
            },
          },
        }
      : {},
  },
  // Index Engine temporarily disabled - migrations need SSL fix
  // Will re-enable after fixing migration SSL issues
  // featureFlags: {
  //   index_engine: true,
  // },
  modules: [
    // Index module temporarily disabled
    // {
    //   resolve: "@medusajs/index",
    // },
    // Note: Cache-redis commented out temporarily - enable once Redis is running
    // Redis caching for product queries and cart operations
    {
      resolve: "@medusajs/cache-redis",
      key: "cache",
      options: {
        redisUrl: process.env.REDIS_URL,
        ttl: 3600, // 1 hour — products don't change that frequently
      },
    },
    {
      resolve: "@medusajs/auth",
      options: {
        providers: [
          {
            resolve: "@medusajs/auth-google",
            id: "google",
            options: {
              clientId: process.env.GOOGLE_CLIENT_ID,
              clientSecret: process.env.GOOGLE_CLIENT_SECRET,
              callbackUrl: process.env.GOOGLE_CALLBACK_URL,
            },
          },
        ],
      },
    },
    // Blog Module - Custom module for managing blog posts
    {
      resolve: "./src/modules/blog",
    },
    // Customer Notification Module - Custom module for managing in-app notifications
    {
      resolve: "./src/modules/customer-notification",
    },
    // Loyalty Module - Custom reward points system
    {
      resolve: "./src/modules/loyalty",
    },
    // Delete Log Module - Audit trail for all deletions
    {
      resolve: "./src/modules/delete-log",
    },
    // Review Module - Custom module for product reviews and ratings
    {
      resolve: "./src/modules/review",
    },
    // Hero Module - Custom module for managing hero slider (web storefront)
    {
      resolve: "./src/modules/hero",
    },
    // Bulk Order Module - Custom module for managing bulk-available products
    {
      resolve: "./src/modules/bulk",
    },
    // Custom Chat Module
    {
      resolve: "./src/modules/chat",
    },
    // Perfume Asset Module - Custom module for managing perfume volumes & bottles
    {
      resolve: "./src/modules/perfume-asset",
    },
    // Recommendation Module - Behaviour tracking + "Suggested For You" engine
    {
      resolve: "./src/modules/recommendation",
    },
    {
      resolve: "@medusajs/file",
      options: {
        providers: [
          {
            resolve: "@medusajs/file-s3",
            id: "aws-s3",
            options: {
              file_url: process.env.S3_FILE_URL,
              access_key_id: process.env.S3_ACCESS_KEY_ID,
              secret_access_key: process.env.S3_SECRET_ACCESS_KEY,
              region: process.env.S3_REGION,
              bucket: process.env.S3_BUCKET,
              endpoint: process.env.S3_ENDPOINT,
            },
          },
        ],
      },
    },
    {
      resolve: "@medusajs/payment",
      options: {
        providers: [
          {
            resolve: "./src/modules/sslcommerz",
            id: "default",
          },
        ],
      },
    },
  ],
})
