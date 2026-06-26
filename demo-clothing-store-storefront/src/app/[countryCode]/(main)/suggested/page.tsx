import { Metadata } from "next"
import { getRegion } from "@lib/data/regions"
import { retrieveCustomer } from "@lib/data/customer"
import SuggestedTemplate from "@modules/suggested/templates"

export const metadata: Metadata = {
  title: "Suggested For You | ZAHAN Store",
  description: "Handpicked based on your browsing history.",
}

type Props = {
  params: Promise<{ countryCode: string }>
}

export default async function SuggestedPage(props: Props) {
  const params = await props.params
  const region = await getRegion(params.countryCode)
  const customer = await retrieveCustomer()

  if (!region) {
    return null
  }

  return (
    <SuggestedTemplate
      region={region}
      customerId={customer?.id}
    />
  )
}
