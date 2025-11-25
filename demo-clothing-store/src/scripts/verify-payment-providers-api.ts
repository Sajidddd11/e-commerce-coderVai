import { ExecArgs } from "@medusajs/framework/types"
import { Modules, ContainerRegistrationKeys } from "@medusajs/framework/utils"

export default async function verifyPaymentProvidersApi({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const regionModule = container.resolve(Modules.REGION)
  const link = container.resolve(ContainerRegistrationKeys.LINK)

  try {
    const regions = await regionModule.listRegions({})
    
    for (const region of regions) {
      logger.info(`\n=== Region: ${region.name} (${region.id}) ===`)
      
      // Get all links for this region
      const allLinks = await (link as any).list({
        region_id: region.id,
      })
      
      logger.info(`Total links: ${allLinks.length}`)
      
      // Filter payment provider links
      const paymentLinks = allLinks.filter((l: any) => {
        const keys = Object.keys(l)
        return keys.some(key => key.includes('payment_provider'))
      })
      
      logger.info(`Payment provider links: ${paymentLinks.length}`)
      
      paymentLinks.forEach((link: any) => {
        logger.info(`  Link data: ${JSON.stringify(link, null, 2)}`)
      })
      
      // Also check the region's payment_providers relation directly
      const regionWithProviders = await regionModule.retrieveRegion(region.id, {
        relations: ["payment_providers"],
      })
      
      if (regionWithProviders.payment_providers) {
        logger.info(`\nRegion payment_providers relation:`)
        regionWithProviders.payment_providers.forEach((pp: any) => {
          logger.info(`  - ${pp.id} (enabled: ${pp.is_enabled})`)
        })
      } else {
        logger.info(`\n⚠️  No payment_providers relation found on region`)
      }
    }
  } catch (error: any) {
    logger.error("Error:", error.message)
    console.error(error)
  }
}

