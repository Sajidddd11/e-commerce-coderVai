import { ExecArgs } from "@medusajs/framework/types"
import { Modules, ContainerRegistrationKeys } from "@medusajs/framework/utils"

export default async function fixSslLink({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const link = container.resolve(ContainerRegistrationKeys.LINK)
  const regionModule = container.resolve(Modules.REGION)
  const paymentModule = container.resolve(Modules.PAYMENT)

  try {
    const regions = await regionModule.listRegions({})
    const providers = await paymentModule.listPaymentProviders({})
    const sslProvider = providers.find((p: any) => p.id === "pp_sslcommerz_default")

    if (!sslProvider) {
      logger.error("SSLCommerz provider not found!")
      return
    }

    logger.info(`Found SSLCommerz provider: ${sslProvider.id}`)

    for (const region of regions) {
      logger.info(`\nLinking to region: ${region.name} (${region.id})`)

      try {
        // Create the link using the proper format
        await link.create({
          [Modules.REGION]: {
            region_id: region.id,
          },
          [Modules.PAYMENT]: {
            payment_provider_id: sslProvider.id,
          },
        })
        logger.info(`  ✅ Link created successfully`)
      } catch (error: any) {
        if (error.message?.includes("already exists") || error.message?.includes("duplicate")) {
          logger.info(`  ✅ Link already exists`)
        } else {
          logger.error(`  ❌ Error: ${error.message}`)
          console.error(error)
        }
      }
    }

    logger.info("\n✅ Done! Now restart your server and clear browser cache.")
  } catch (error: any) {
    logger.error("Error:", error.message)
    console.error(error)
  }
}

