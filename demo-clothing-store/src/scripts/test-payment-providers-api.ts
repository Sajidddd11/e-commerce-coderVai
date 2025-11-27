import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, remoteQueryObjectFromString } from "@medusajs/framework/utils"

export default async function testPaymentProvidersApi({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const remoteQuery = container.resolve(ContainerRegistrationKeys.REMOTE_QUERY)
  const regionModule = container.resolve("region")

  try {
    const regions = await regionModule.listRegions({})
    
    for (const region of regions) {
      logger.info(`\n=== Testing API for Region: ${region.name} (${region.id}) ===`)
      
      // Simulate what the API endpoint does
      const queryObject = remoteQueryObjectFromString({
        entryPoint: "region_payment_provider",
        variables: {
          filters: {
            region_id: region.id,
          },
        },
        fields: ["payment_provider.id", "payment_provider.is_enabled"],
      })
      
      const result = await remoteQuery(queryObject)
      const rows = result?.rows || []
      const paymentProviders = rows.map(
        (relation: any) => relation.payment_provider
      )
      
      logger.info(`Payment providers returned by API:`)
      if (paymentProviders.length === 0) {
        logger.info(`  ⚠️  NONE - This is why SSLCommerz isn't showing!`)
      } else {
        paymentProviders.forEach((pp: any) => {
          logger.info(`  - ${pp.id} (enabled: ${pp.is_enabled})`)
        })
      }
    }
  } catch (error: any) {
    logger.error("Error:", error.message)
    console.error(error)
  }
}

