import { ExecArgs } from "@medusajs/framework/types"
import { Modules, ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { updateRegionsWorkflow } from "@medusajs/medusa/core-flows"

export default async function linkSslToRegions({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const regionModule = container.resolve(Modules.REGION)
  const paymentModule = container.resolve(Modules.PAYMENT)

  try {
    // Get all regions
    const regions = await regionModule.listRegions({})
    
    // Get SSLCommerz provider
    const providers = await paymentModule.listPaymentProviders({})
    const sslProvider = providers.find((p: any) => p.id === "pp_sslcommerz_default")

    if (!sslProvider) {
      logger.error("SSLCommerz provider not found! Make sure it's registered in medusa-config.ts")
      return
    }

    logger.info(`Found SSLCommerz provider: ${sslProvider.id}`)

    // Update each region to include SSLCommerz provider
    for (const region of regions) {
      logger.info(`\nProcessing region: ${region.name} (${region.id})`)

      // Get current payment providers for this region
      const currentProviders = region.payment_providers?.map((p: any) => p.id) || []
      
      if (currentProviders.includes("pp_sslcommerz_default")) {
        logger.info(`  ✅ Already has ${sslProvider.id}`)
      } else {
        // Add SSLCommerz to the list
        const updatedProviders = [...currentProviders, "pp_sslcommerz_default"]
        
        logger.info(`  Current providers: ${currentProviders.join(", ")}`)
        logger.info(`  Adding: ${sslProvider.id}`)
        
        // Update the region
        await updateRegionsWorkflow(container).run({
          input: {
            selector: { id: region.id },
            update: {
              payment_providers: updatedProviders,
            },
          },
        })
        
        logger.info(`  ✅ Updated region with ${sslProvider.id}`)
      }
    }

    logger.info("\n✅ Done! Restart your server and check the checkout page.")
    logger.info("If it still doesn't show, clear your browser cache and try again.")
  } catch (error: any) {
    logger.error("Error linking providers:", error.message)
    console.error(error)
  }
}
