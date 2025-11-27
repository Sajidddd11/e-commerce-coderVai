import { ExecArgs } from "@medusajs/framework/types"
import { Modules, ContainerRegistrationKeys } from "@medusajs/framework/utils"

export default async function finalCheck({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const regionModule = container.resolve(Modules.REGION)
  const paymentModule = container.resolve(Modules.PAYMENT)

  try {
    logger.info("=== FINAL CHECK ===\n")
    
    // 1. Check provider exists
    const providers = await paymentModule.listPaymentProviders({})
    const sslProvider = providers.find((p: any) => p.id === "pp_sslcommerz_default")
    
    if (sslProvider) {
      logger.info(`✅ Provider registered: ${sslProvider.id}`)
      logger.info(`   Enabled: ${sslProvider.is_enabled}`)
    } else {
      logger.error(`❌ Provider NOT found!`)
      return
    }
    
    // 2. Check regions
    const regions = await regionModule.listRegions({})
    logger.info(`\nFound ${regions.length} region(s)`)
    
    for (const region of regions) {
      logger.info(`\nRegion: ${region.name} (${region.id})`)
      
      // Try to get region with payment_providers relation
      try {
        const regionWithProviders = await regionModule.retrieveRegion(region.id, {
          relations: ["payment_providers"],
        })
        
        if (regionWithProviders.payment_providers) {
          const providerIds = regionWithProviders.payment_providers.map((pp: any) => pp.id)
          logger.info(`  Payment providers: ${providerIds.join(", ")}`)
          
          if (providerIds.includes("pp_sslcommerz_default")) {
            logger.info(`  ✅ SSLCommerz is linked!`)
          } else {
            logger.info(`  ⚠️  SSLCommerz NOT linked`)
          }
        }
      } catch (error: any) {
        logger.info(`  ⚠️  Could not retrieve relations: ${error.message}`)
      }
    }
    
    logger.info("\n=== NEXT STEPS ===")
    logger.info("1. RESTART your Medusa server (stop and start npm run dev)")
    logger.info("2. Clear browser cache or use incognito mode")
    logger.info("3. Check the checkout page")
    logger.info("\nIf it still doesn't show, the link might need to be created via Admin UI:")
    logger.info("   Settings > Regions > [Your Region] > Payment Providers > Add SSLCommerz")
    
  } catch (error: any) {
    logger.error("Error:", error.message)
    console.error(error)
  }
}

