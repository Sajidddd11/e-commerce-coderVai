import { ExecArgs } from "@medusajs/framework/types"
import { Modules, ContainerRegistrationKeys } from "@medusajs/framework/utils"

export default async function checkSslProvider({ container }: ExecArgs) {
  const paymentModule = container.resolve(Modules.PAYMENT)
  
  try {
    const providers = await paymentModule.listPaymentProviders({})
    
    console.log("\n=== Payment Providers ===")
    providers.forEach((provider: any) => {
      console.log(`ID: ${provider.id}, Enabled: ${provider.is_enabled}`)
    })
    
    const sslProvider = providers.find((p: any) => p.id === "pp_sslcommerz_default")
    
    if (sslProvider) {
      console.log("\n✅ SSLCommerz provider found!")
      console.log(`   ID: ${sslProvider.id}`)
      console.log(`   Enabled: ${sslProvider.is_enabled}`)
      
      if (!sslProvider.is_enabled) {
        console.log("\n⚠️  Provider is DISABLED. You need to enable it.")
      }
    } else {
      console.log("\n❌ SSLCommerz provider NOT found!")
      console.log("   Make sure you've restarted the server after adding the provider.")
    }
    
    // Check regions
    const link = container.resolve(ContainerRegistrationKeys.LINK)
    const regionModule = container.resolve(Modules.REGION)
    
    const regions = await regionModule.listRegions({})
    
    console.log("\n=== Regions and Payment Providers ===")
    for (const region of regions) {
      const links = await (link as any).list({
        region_id: region.id,
      })
      
      const paymentProviderLinks = links.filter(
        (link: any) => link.payment_provider_id
      )
      
      console.log(`\nRegion: ${region.name} (${region.id})`)
      console.log(`  Currency: ${region.currency_code}`)
      
      if (paymentProviderLinks.length > 0) {
        console.log(`  Payment Providers:`)
        paymentProviderLinks.forEach((link: any) => {
          console.log(`    - ${link.payment_provider_id}`)
        })
      } else {
        console.log(`  ⚠️  No payment providers linked!`)
      }
    }
  } catch (error: any) {
    console.error("Error checking providers:", error.message)
  }
}

