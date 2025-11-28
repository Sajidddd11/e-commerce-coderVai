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
    // AWS RDS requires SSL encryption
    databaseDriverOptions: {
      connection: {
        ssl: {
          rejectUnauthorized: false, // AWS RDS uses self-signed certificates
        },
      },
    },
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
        ttl: 30,
      },
    },
    // File storage temporarily disabled to test AWS RDS connection
    // Re-enable after confirming database works
    // {
    //   resolve: "@medusajs/file",
    //   options: {
    //     providers: [
    //       {
    //         resolve: "@medusajs/file-s3",
    //         id: "supabase-s3",
    //         options: {
    //           file_url: process.env.S3_FILE_URL,
    //           access_key_id: process.env.S3_ACCESS_KEY_ID,
    //           secret_access_key: process.env.S3_SECRET_ACCESS_KEY,
    //           region: process.env.S3_REGION,
    //           bucket: process.env.S3_BUCKET,
    //           endpoint: process.env.S3_ENDPOINT,
    //           additional_client_config: {
    //             forcePathStyle: true, // Supabase's S3 adapter requires path-style URLs
    //           },
    //         },
    //       },
    //     ],
    //   },
    // },
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
