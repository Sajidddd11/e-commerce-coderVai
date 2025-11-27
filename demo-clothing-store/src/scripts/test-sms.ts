/**
 * Test script to verify SMS integration
 * Run with: npm run dev -- exec ./src/scripts/test-sms.ts
 */

import { getBulkSmsClient } from "../lib/sms/bulk-sms-bd"
import { validateAndNormalizeBDPhone } from "../lib/sms/phone-validator"
import type { ExecArgs } from "@medusajs/framework/types"

export default async function testSmsIntegration({ container }: ExecArgs) {
  const logger = container.resolve("logger")
  
  logger.info("=".repeat(60))
  logger.info("SMS Integration Test")
  logger.info("=".repeat(60))

  // Test 1: Environment Variables
  logger.info("\n[Test 1] Checking environment variables...")
  const requiredEnvVars = [
    "BULKSMSBD_API_KEY",
    "BULKSMSBD_SENDER_ID",
    "BULKSMSBD_API_URL",
  ]

  let envCheckPassed = true
  for (const envVar of requiredEnvVars) {
    if (process.env[envVar]) {
      logger.info(`  ✓ ${envVar} is set`)
    } else {
      logger.error(`  ✗ ${envVar} is missing`)
      envCheckPassed = false
    }
  }

  if (!envCheckPassed) {
    logger.error("\n❌ Environment variables check failed!")
    logger.error("Please configure SMS settings in .env file")
    return
  }

  logger.info("✅ Environment variables check passed!")

  // Test 2: SMS Client Initialization
  logger.info("\n[Test 2] Initializing SMS client...")
  try {
    let smsLogService
    try {
      smsLogService = container.resolve("smsLogModuleService")
      logger.info("  ✓ SMS log service is available")
    } catch {
      logger.warn("  ⚠ SMS log service not available (non-critical)")
    }

    const client = getBulkSmsClient()
    logger.info("✅ SMS client initialized successfully!")

    // Test 3: Check Balance
    logger.info("\n[Test 3] Checking SMS balance...")
    const balanceResponse = await client.getBalance()
    
    if (balanceResponse.success) {
      logger.info(`  ✓ API is reachable`)
      logger.info(`  ✓ Balance: ${balanceResponse.balance || "N/A"}`)
      logger.info(`  ✓ Validity: ${balanceResponse.validity || "N/A"}`)
      logger.info(`  ✓ Response: ${balanceResponse.description}`)
      logger.info("✅ Balance check passed!")
    } else {
      logger.error(`  ✗ Balance check failed: ${balanceResponse.description}`)
      logger.error(`  ✗ Response code: ${balanceResponse.code}`)
      logger.error("❌ Balance check failed!")
    }

    // Test 4: Phone Number Validation
    logger.info("\n[Test 4] Testing phone number validation...")
    const testPhones = [
      { input: "8801712345678", shouldPass: true },
      { input: "+8801712345678", shouldPass: true },
      { input: "01712345678", shouldPass: true },
      { input: "1712345678", shouldPass: true },
      { input: "01012345678", shouldPass: false },
      { input: "+1234567890", shouldPass: false },
    ]

    
    let validationPassed = true
    for (const test of testPhones) {
      const result = validateAndNormalizeBDPhone(test.input)
      const status = result.isValid === test.shouldPass ? "✓" : "✗"
      
      if (result.isValid === test.shouldPass) {
        logger.info(`  ${status} "${test.input}" → ${result.isValid ? result.normalized : result.error}`)
      } else {
        logger.error(`  ${status} "${test.input}" → Expected ${test.shouldPass ? "valid" : "invalid"}, got ${result.isValid ? "valid" : "invalid"}`)
        validationPassed = false
      }
    }

    if (validationPassed) {
      logger.info("✅ Phone validation tests passed!")
    } else {
      logger.error("❌ Phone validation tests failed!")
    }

    // Test 5: Check SMS Log Module
    logger.info("\n[Test 5] Checking SMS log module...")
    if (smsLogService) {
      try {
        const [logs, count] = await smsLogService.listAndCountSmsLogs({}, { take: 5 })
        logger.info(`  ✓ SMS log module is working`)
        logger.info(`  ✓ Total SMS logs in database: ${count}`)
        if (logs.length > 0) {
          logger.info(`  ✓ Recent logs:`)
          logs.forEach((log: any) => {
            logger.info(`    - ${log.status}: ${log.recipient} at ${log.created_at}`)
          })
        }
        logger.info("✅ SMS log module check passed!")
      } catch (error: any) {
        logger.error(`  ✗ SMS log module error: ${error.message}`)
        logger.error("❌ SMS log module check failed!")
      }
    } else {
      logger.warn("⚠ SMS log module not available (skipping test)")
    }

    // Test 6: Subscriber Configuration
    logger.info("\n[Test 6] Checking subscriber configuration...")
    const notifyFlag = process.env.BULKSMSBD_NOTIFY_ORDER_PLACED
    if (!notifyFlag || ["true", "1", "yes"].includes(notifyFlag.toLowerCase())) {
      logger.info("  ✓ Order SMS notifications are ENABLED")
    } else {
      logger.warn("  ⚠ Order SMS notifications are DISABLED")
      logger.warn("    Set BULKSMSBD_NOTIFY_ORDER_PLACED=true to enable")
    }

    const brandName = process.env.BULKSMSBD_BRAND_NAME || "Medusa Store"
    logger.info(`  ✓ Brand name: "${brandName}"`)
    logger.info("✅ Subscriber configuration check passed!")

    // Summary
    logger.info("\n" + "=".repeat(60))
    logger.info("Test Summary")
    logger.info("=".repeat(60))
    logger.info("✅ All tests completed!")
    logger.info("\nNext steps:")
    logger.info("1. Test manual SMS: curl -X POST http://localhost:9000/admin/sms/send \\")
    logger.info('     -H "Content-Type: application/json" \\')
    logger.info('     -d \'{"numbers":["8801712345678"],"message":"Test"}\'')
    logger.info("2. Place a test order with a valid phone number")
    logger.info("3. Check SMS logs: curl http://localhost:9000/admin/sms/logs")
    logger.info("\nFor troubleshooting, see: docs/sms-troubleshooting-guide.md")

  } catch (error: any) {
    logger.error("\n❌ SMS client initialization failed!")
    logger.error(`Error: ${error.message}`)
    logger.error(error.stack)
  }
}

