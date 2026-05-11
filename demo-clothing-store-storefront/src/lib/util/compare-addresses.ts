import { isEqual, pick } from "lodash"

export default function compareAddresses(address1: any, address2: any) {
  return isEqual(
    pick(address1, [
      "address_1",
      "city",
      "country_code",
      "phone",
    ]),
    pick(address2, [
      "address_1",
      "city",
      "country_code",
      "phone",
    ])
  )
}
