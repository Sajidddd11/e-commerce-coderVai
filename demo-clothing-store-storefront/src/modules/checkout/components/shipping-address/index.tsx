import { HttpTypes } from "@medusajs/types"
import { Container } from "@medusajs/ui"
import Input from "@modules/common/components/input"
import { mapKeys } from "lodash"
import React, { useEffect, useMemo, useState } from "react"
import AddressSelect from "../address-select"
import CountrySelect from "../country-select"
import DistrictSelect from "../district-select"

const ShippingAddress = ({
  customer,
  cart,
  checked,
  onChange,
  onDeliveryTypeChange,
  onDistrictChange,
}: {
  customer: HttpTypes.StoreCustomer | null
  cart: HttpTypes.StoreCart | null
  checked: boolean
  onChange: () => void
  onDeliveryTypeChange?: (type: "home" | "pickup") => void
  onDistrictChange?: (district: string) => void
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({
    "shipping_address.full_name":
      cart?.shipping_address?.first_name && cart?.shipping_address?.last_name
        ? `${cart.shipping_address.first_name} ${cart.shipping_address.last_name}`
        : cart?.shipping_address?.first_name || "",
    "shipping_address.address_1": cart?.shipping_address?.address_1 || "",
    "shipping_address.city": cart?.shipping_address?.city || "",
    "shipping_address.country_code": cart?.shipping_address?.country_code || "",
    "shipping_address.phone": cart?.shipping_address?.phone || "",
    email: cart?.email || "",
  })

  const [deliveryType, setDeliveryType] = useState<"home" | "pickup">("home")

  const countriesInRegion = useMemo(
    () => cart?.region?.countries?.map((c) => c.iso_2),
    [cart?.region]
  )

  // check if customer has saved addresses that are in the current region
  const addressesInRegion = useMemo(
    () =>
      customer?.addresses.filter(
        (a) => a.country_code && countriesInRegion?.includes(a.country_code)
      ),
    [customer?.addresses, countriesInRegion]
  )

  const setFormAddress = (
    address?: HttpTypes.StoreCartAddress,
    email?: string
  ) => {
    address &&
      setFormData((prevState: Record<string, any>) => ({
        ...prevState,
        "shipping_address.full_name":
          address?.first_name && address?.last_name
            ? `${address.first_name} ${address.last_name}`
            : address?.first_name || "",
        "shipping_address.address_1": address?.address_1 || "",
        "shipping_address.city": address?.city || "",
        "shipping_address.country_code": address?.country_code || "",
        "shipping_address.phone": address?.phone || "",
      }))

    email &&
      setFormData((prevState: Record<string, any>) => ({
        ...prevState,
        email: email,
      }))
  }

  useEffect(() => {
    // Ensure cart is not null and has a shipping_address before setting form data
    if (cart && cart.shipping_address) {
      setFormAddress(cart?.shipping_address, cart?.email)
    }

    if (cart && !cart.email && customer?.email) {
      setFormAddress(undefined, customer.email)
    }
  }, [cart]) // Add cart as a dependency

  // Notify parent when delivery type changes
  useEffect(() => {
    onDeliveryTypeChange?.(deliveryType)
  }, [deliveryType, onDeliveryTypeChange])

  // Notify parent when district changes
  useEffect(() => {
    const district = formData["shipping_address.city"]
    if (district) {
      onDistrictChange?.(district)
    }
  }, [formData, onDistrictChange])

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLInputElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  // Auto-save address to cart with debouncing (1 second after last keystroke)
  useEffect(() => {
    const timer = setTimeout(async () => {
      // Only auto-save if we have essential fields filled
      if (formData["shipping_address.full_name"] &&
        formData["shipping_address.address_1"] &&
        formData["shipping_address.city"] &&
        formData["shipping_address.country_code"] &&
        formData["shipping_address.phone"] &&
        formData.email) {

        // Import auto-save function dynamically to avoid bundling issues
        const { autoSaveAddress } = await import("@lib/data/autosave")

        // Split full name into first and last name for API compatibility
        const fullName = formData["shipping_address.full_name"].trim()
        const nameParts = fullName.split(' ')
        const firstName = nameParts[0] || fullName
        const lastName = nameParts.slice(1).join(' ') || firstName

        await autoSaveAddress({
          shipping_address: {
            first_name: firstName,
            last_name: lastName,
            address_1: formData["shipping_address.address_1"],
            city: formData["shipping_address.city"],
            country_code: formData["shipping_address.country_code"],
            phone: formData["shipping_address.phone"],
          },
          email: formData.email,
        })
      }
    }, 1000) // Debounce for 1 second

    return () => clearTimeout(timer)
  }, [formData])

  return (
    <>
      {customer && (addressesInRegion?.length || 0) > 0 && (
        <Container className="mb-6 flex flex-col gap-y-4 p-5">
          <p className="text-small-regular">
            {`Hi ${customer.first_name}, do you want to use one of your saved addresses?`}
          </p>
          <AddressSelect
            addresses={customer.addresses}
            addressInput={
              mapKeys(formData, (_, key) =>
                key.replace("shipping_address.", "")
              ) as HttpTypes.StoreCartAddress
            }
            onSelect={setFormAddress}
          />
        </Container>
      )}

      {/* Delivery Type Selector */}
      <div className="mb-6">
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="delivery_type"
              value="home"
              checked={deliveryType === "home"}
              onChange={() => setDeliveryType("home")}
              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">Home Delivery</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="delivery_type"
              value="pickup"
              checked={deliveryType === "pickup"}
              onChange={() => setDeliveryType("pickup")}
              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">Collect From Store Pickup</span>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 small:grid-cols-2 gap-4">
        <Input
          label="Full Name"
          name="shipping_address.full_name"
          autoComplete="name"
          value={formData["shipping_address.full_name"]}
          onChange={handleChange}
          required
          data-testid="shipping-full-name-input"
        />
        <Input
          label="Phone"
          name="shipping_address.phone"
          autoComplete="tel"
          value={formData["shipping_address.phone"]}
          onChange={handleChange}
          required
          data-testid="shipping-phone-input"
        />
        <Input
          label="Email"
          name="email"
          type="email"
          title="Enter a valid email address."
          autoComplete="email"
          value={formData.email}
          onChange={handleChange}
          required
          data-testid="shipping-email-input"
        />
        <DistrictSelect
          value={formData["shipping_address.city"]}
          onChange={handleChange}
          required
          data-testid="shipping-city-select"
        />
        <Input
          label="Address"
          name="shipping_address.address_1"
          autoComplete="address-line1"
          value={formData["shipping_address.address_1"]}
          onChange={handleChange}
          required
          data-testid="shipping-address-input"
        />
        <CountrySelect
          name="shipping_address.country_code"
          autoComplete="country"
          region={cart?.region}
          value={formData["shipping_address.country_code"]}
          onChange={handleChange}
          required
          data-testid="shipping-country-select"
        />
      </div>
      {/* Hidden checkbox - always same as billing */}
      <input
        type="hidden"
        name="same_as_billing"
        value="true"
      />

    </>
  )
}

export default ShippingAddress
