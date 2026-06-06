import { useEffect, useMemo, useState } from "react"
import {
  View,
  ScrollView,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Text,
  TextInput
} from "react-native"
import { useRouter } from "expo-router"
import { ChevronLeft, ChevronDown } from "lucide-react-native"
import { HttpTypes } from "@medusajs/types"
import { Screen } from "@components/layout/Screen"
import { Input } from "@components/ui/Input"
import { DistrictPicker } from "@components/checkout/DistrictPicker"
import { AddressLabelSelector } from "@components/checkout/AddressLabelSelector"
import { PaymentIcon } from "@components/checkout/PaymentIcon"
import { useCartStore } from "@stores/cart-store"
import { useAuthStore } from "@stores/auth-store"
import { useRegionStore } from "@stores/region-store"
import { useCheckoutStore } from "@stores/checkout-store"
import { listCartShippingMethods } from "@api/fulfillment"
import { listCartPaymentMethods } from "@api/payment"
import { prepareCheckout } from "@api/checkout"
import { updateCart } from "@api/cart"
import {
  autoSelectShippingMethod,
  calculateShippingCost,
  enhancePaymentMethods,
  paymentTitle,
} from "@utils/shipping"
import { convertToLocale } from "@utils/money"
import { trackInitiateCheckout } from "@utils/facebook-analytics"
import { colors } from "@design/theme"
import { paymentInfoMap } from "@design/constants"

export default function CheckoutScreen() {
  const router = useRouter()
  const cart = useCartStore((s) => s.cart)
  const customer = useAuthStore((s) => s.customer)
  const region = useRegionStore((s) => s.region)
  const countryCode = useRegionStore((s) => s.countryCode)

  const form = useCheckoutStore((s) => s.form)
  const setForm = useCheckoutStore((s) => s.set)
  const hydrate = useCheckoutStore((s) => s.hydrate)

  const [shippingMethods, setShippingMethods] = useState<
    HttpTypes.StoreCartShippingOption[]
  >([])
  const [paymentMethods, setPaymentMethods] = useState<
    HttpTypes.StorePaymentProvider[]
  >([])
  const [loadingOptions, setLoadingOptions] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const currency = cart?.currency_code || region?.currency_code || "bdt"

  useEffect(() => {
    hydrate()
  }, [hydrate])

  useEffect(() => {
    if (!cart?.id) return
    trackInitiateCheckout({
      value: cart.total ?? undefined,
      currency: cart.currency_code ?? undefined,
      numItems: cart.items?.length ?? 0,
    })
  }, [cart?.id])

  useEffect(() => {
    if (!customer) return
    const patch: Record<string, string> = {}
    if (!form.fullName && (customer.first_name || customer.last_name)) {
      patch.fullName = `${customer.first_name ?? ""} ${customer.last_name ?? ""}`.trim()
    }
    if (!form.email && customer.email) patch.email = customer.email
    if (!form.phone && customer.phone) patch.phone = customer.phone
    if (Object.keys(patch).length) setForm(patch)
  }, [customer])

  useEffect(() => {
    if (!cart?.id || !region?.id) return
    setLoadingOptions(true)
    Promise.all([
      listCartShippingMethods(cart.id),
      listCartPaymentMethods(region.id),
    ])
      .then(([methods, providers]) => {
        setShippingMethods(methods ?? [])
        setPaymentMethods(enhancePaymentMethods(providers ?? []))
      })
      .finally(() => setLoadingOptions(false))
  }, [cart?.id, region?.id])

  useEffect(() => {
    if (!shippingMethods.length) return
    const match = autoSelectShippingMethod(
      shippingMethods,
      form.deliveryType,
      form.district
    )
    if (match && match.id !== form.shippingMethodId) {
      setForm({ shippingMethodId: match.id })
    }
  }, [shippingMethods, form.deliveryType, form.district])

  // Auto-save address to cart with debouncing (mirrors web logic)
  useEffect(() => {
    // Only auto-save if we have the district (so backend can determine shipping options)
    if (!form.district.trim() || !cart?.id || !countryCode) {
      return
    }

    const timer = setTimeout(async () => {
      const nameParts = form.fullName.trim().split(" ")
      const firstName = nameParts[0] ?? ""
      const lastName = nameParts.slice(1).join(" ") || firstName

      try {
        await updateCart({
          shipping_address: {
            first_name: firstName,
            last_name: lastName,
            address_1: form.address1,
            city: form.district,
            country_code: countryCode,
            phone: form.phone,
            company: form.company,
          },
          email: form.email,
        })
        
        // Refresh shipping methods since the address changed
        const methods = await listCartShippingMethods(cart.id)
        if (methods) {
          setShippingMethods(methods)
        }
      } catch (e) {
        console.warn("Failed to auto-save address", e)
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [
    form.fullName,
    form.phone,
    form.email,
    form.address1,
    form.district,
    form.company,
    cart?.id,
    countryCode,
  ])

  const getShippingLabel = () => {
    if (form.deliveryType === "pickup") return "Collect From Store"
    if (!form.district) return ""
    // Match web logic: only the city of "Dhaka" = Inside Dhaka
    const isInsideDhaka = form.district.toLowerCase() === "dhaka"
    return isInsideDhaka ? "Inside Dhaka" : "Outside Dhaka"
  }

  const shippingCost = useMemo(() => {
    if (form.deliveryType === "home" && form.district) {
      return calculateShippingCost(form.district, form.deliveryType)
    }
    const selected = shippingMethods.find((m) => m.id === form.shippingMethodId)
    if (selected && typeof selected.amount === "number") return selected.amount
    return calculateShippingCost(form.district, form.deliveryType)
  }, [shippingMethods, form.shippingMethodId, form.district, form.deliveryType])

  const subtotal = cart?.item_subtotal ?? cart?.subtotal ?? 0
  const discount = cart?.discount_total ?? 0
  const total = subtotal + shippingCost - discount

  const canSubmit =
    !!form.fullName.trim() &&
    !!form.email.trim() &&
    !!form.phone.trim() &&
    !!form.address1.trim() &&
    !!form.district &&
    !!form.shippingMethodId &&
    !!form.paymentProviderId

  const onSubmit = async () => {
    setError(null)
    if (!canSubmit) {
      setError("Please complete all required fields.")
      return
    }
    setSubmitting(true)
    try {
      const result = await prepareCheckout({
        fullName: form.fullName,
        address1: form.address1,
        city: form.district,
        countryCode,
        phone: form.phone,
        company: form.company,
        email: form.email,
        deliveryInstructions: form.deliveryInstructions,
        shippingMethodId: form.shippingMethodId,
        paymentProviderId: form.paymentProviderId,
      })
      if (!result.success) {
        setError(result.error ?? "Could not prepare your order.")
        return
      }
      router.push("/checkout/review")
    } finally {
      setSubmitting(false)
    }
  }


  const selectedShippingMethod = shippingMethods.find((m) => m.id === form.shippingMethodId)

  return (
    <Screen edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.headerIcon}>
          <ChevronLeft size={20} color={colors.slate[900]} />
        </Pressable>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={styles.headerIcon} />
      </View>

      <View style={styles.stepIndicator}>
        <View style={styles.stepItem}>
          <View style={styles.stepCircleActive}>
            <Text style={styles.stepNumberActive}>1</Text>
          </View>
          <Text style={styles.stepLabelActive}>Details</Text>
        </View>
        <View style={styles.stepLine} />
        <View style={styles.stepItem}>
          <View style={styles.stepCircle}>
            <Text style={styles.stepNumber}>2</Text>
          </View>
          <Text style={styles.stepLabel}>Review</Text>
        </View>
        <View style={styles.stepLine} />
        <View style={styles.stepItem}>
          <View style={styles.stepCircle}>
            <Text style={styles.stepNumber}>3</Text>
          </View>
          <Text style={styles.stepLabel}>Confirm</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={80}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Section title="Delivery Type">
            <View style={{ flexDirection: "row", gap: 16 }}>
              <Pressable
                style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
                onPress={() => setForm({ deliveryType: "home" })}
              >
                <View style={[styles.radio, form.deliveryType === "home" && styles.radioActive]}>
                  {form.deliveryType === "home" && <View style={styles.radioInner} />}
                </View>
                <Text style={{ fontFamily: "Inter-Medium", color: colors.slate[900] }}>
                  Home Delivery
                </Text>
              </Pressable>

              <Pressable
                style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
                onPress={() => setForm({ deliveryType: "pickup" })}
              >
                <View style={[styles.radio, form.deliveryType === "pickup" && styles.radioActive]}>
                  {form.deliveryType === "pickup" && <View style={styles.radioInner} />}
                </View>
                <Text style={{ fontFamily: "Inter-Medium", color: colors.slate[900] }}>
                  Collect From Store Pickup
                </Text>
              </Pressable>
            </View>
          </Section>

          <Section title="Shipping Address">
            <Input
              label="Full Name"
              value={form.fullName}
              onChangeText={(v) => setForm({ fullName: v })}
              autoCapitalize="words"
              placeholder="Full name"
            />

            <View style={styles.phoneInputWrap}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <View style={styles.phoneInputBox}>
                <View style={styles.phonePrefix}>
                  <Text style={styles.phonePrefixText}>+880</Text>
                </View>
                <TextInput
                  style={styles.phoneInput}
                  value={form.phone}
                  onChangeText={(v) => setForm({ phone: v })}
                  keyboardType="phone-pad"
                  placeholder="01XXXXXXXXX"
                />
              </View>
            </View>

            <Input
              label="Email address"
              value={form.email}
              onChangeText={(v) => setForm({ email: v })}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="your@email.com"
            />

            <DistrictPicker
              label="District"
              value={form.district}
              onChange={(d) => setForm({ district: d })}
            />

            <Input
              label="Address Line"
              value={form.address1}
              onChangeText={(v) => setForm({ address1: v })}
              placeholder="House, road, area"
            />

            <AddressLabelSelector
              value={form.company}
              onChange={(val) => setForm({ company: val })}
            />

            <Input
              label="Delivery Instructions (Optional)"
              value={form.deliveryInstructions}
              onChangeText={(v) => setForm({ deliveryInstructions: v })}
              placeholder="e.g. Leave with security guard"
            />
          </Section>

          <Section title="Payment Method">
            {loadingOptions ? (
              <ActivityIndicator color={colors.brand.teal} />
            ) : (
              <View style={{ gap: 8 }}>
                {paymentMethods.map((p) => {
                  const info = paymentInfoMap[p.id] || { title: p.id, iconKey: "default" }
                  const isCod = p.id.startsWith("pp_system_default")
                  const selected = form.paymentProviderId === p.id
                  return (
                    <Pressable
                      key={p.id}
                      onPress={() => setForm({ paymentProviderId: p.id })}
                      style={[
                        styles.paymentCard,
                        selected && isCod && styles.paymentCardActiveCod,
                        selected && !isCod && styles.paymentCardActiveOther,
                      ]}
                    >
                      <View style={[styles.radio, selected && styles.radioActive]}>
                        {selected && <View style={styles.radioInner} />}
                      </View>
                      <PaymentIcon providerId={p.id} size={24} />
                      <View style={{ flex: 1, gap: 2 }}>
                        <Text style={styles.paymentTitle}>
                          {info.title}
                        </Text>
                        <Text style={styles.paymentDesc}>
                          {isCod 
                            ? "Pay when you receive" 
                            : p.id.includes("bkash")
                              ? "Pay securely via bKash"
                              : p.id.includes("nagad")
                                ? "Pay securely via Nagad"
                                : "Visa · Mastercard · Amex"
                          }
                        </Text>
                      </View>
                    </Pressable>
                  )
                })}
              </View>
            )}
          </Section>

          {error ? (
            <Text style={styles.error}>
              {error}
            </Text>
          ) : null}
        </ScrollView>

        <View style={styles.footer}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
            <Text style={{ fontFamily: "Inter-Medium", color: colors.slate[900], fontSize: 14 }}>
              Shipping {getShippingLabel() ? `(${getShippingLabel()})` : ""}
            </Text>
            <Text style={{ fontFamily: "Inter-SemiBold", color: colors.slate[900], fontSize: 14 }}>
              {convertToLocale({ amount: shippingCost, currency_code: currency })}
            </Text>
          </View>

          <Pressable
            style={styles.reviewBtn}
            disabled={!canSubmit || submitting}
            onPress={onSubmit}
          >
            {submitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.reviewBtnText}>Review Order →</Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  )
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>
        {title}
      </Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  )
}

function ToggleChip({
  label,
  active,
  onPress,
}: {
  label: string
  active: boolean
  onPress: () => void
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.toggleChip,
        active ? styles.toggleChipActive : styles.toggleChipInactive
      ]}
    >
      <Text
        style={[
          styles.toggleChipText,
          active ? styles.toggleChipTextActive : styles.toggleChipTextInactive
        ]}
      >
        {label}
      </Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16, // px-4
    paddingTop: 48, // pt-12
    paddingBottom: 12, // pb-3
    borderBottomWidth: 1,
    borderBottomColor: colors.grey[20],
    backgroundColor: "white",
  },
  headerIcon: {
    width: 32, // w-8
    height: 32, // h-8
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontFamily: "Inter-SemiBold",
    fontWeight: "600",
    fontSize: 18, // text-lg
    letterSpacing: -0.5, // tracking-tight
    color: colors.slate[900],
  },
  stepIndicator: {
    backgroundColor: "white",
    flexDirection: "row",
    padding: 16, // p-4
    justifyContent: "center",
    alignItems: "center",
  },
  stepItem: {
    flexDirection: "column",
    alignItems: "center",
    gap: 4, // gap-1
  },
  stepCircleActive: {
    width: 28, // w-7
    height: 28, // h-7
    borderRadius: 14,
    backgroundColor: colors.brand.teal, // bg-[#56AEBF]
    justifyContent: "center",
    alignItems: "center",
  },
  stepNumberActive: {
    color: "white",
    fontSize: 11, // text-[11px]
    fontWeight: "600",
  },
  stepLabelActive: {
    color: colors.brand.teal,
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.grey[20],
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  stepNumber: {
    color: colors.grey[50],
    fontSize: 11,
    fontWeight: "500",
  },
  stepLabel: {
    color: colors.grey[50],
    fontSize: 11,
    fontWeight: "500",
    marginTop: 2,
  },
  stepLine: {
    width: 48, // w-12
    height: 2, // h-0.5
    backgroundColor: colors.grey[20],
    marginHorizontal: 4, // mx-1
    marginBottom: 16, // mb-4
  },
  scroll: {
    paddingHorizontal: 16, // px-4
    paddingBottom: 112, // pb-28
    gap: 24, // gap-6
    paddingTop: 16,
  },
  section: { gap: 12 }, // gap-3
  sectionTitle: {
    color: colors.slate[900],
    fontSize: 16, // text-base
    fontWeight: "600",
    letterSpacing: -0.5,
  },
  sectionBody: { gap: 12 },
  inputLabel: {
    fontFamily: "Inter-Medium",
    fontWeight: "500",
    fontSize: 13, // text-[13px]
    color: colors.slate[900],
    marginBottom: 4,
  },
  phoneInputWrap: {
    flexDirection: "column",
    gap: 4,
  },
  phoneInputBox: {
    flexDirection: "row",
    height: 48, // h-12
    borderWidth: 2,
    borderColor: colors.grey[20],
    borderRadius: 8, // rounded-lg
    alignItems: "center",
    backgroundColor: "white",
    overflow: "hidden",
  },
  phonePrefix: {
    height: "100%",
    paddingHorizontal: 12,
    justifyContent: "center",
    backgroundColor: colors.grey[10], // bg-[oklch(0.967_0.001_286.375)]
    borderRightWidth: 1,
    borderRightColor: colors.grey[20],
  },
  phonePrefixText: {
    fontWeight: "600",
    fontSize: 13,
    color: colors.slate[900],
  },
  phoneInput: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 12,
    fontSize: 14, // text-sm
    color: colors.slate[900],
  },
  toggleRow: { flexDirection: "row", gap: 8 }, // gap-2
  toggleChip: {
    flex: 1,
    height: 44, // h-11
    borderRadius: 8, // rounded-lg
    justifyContent: "center",
    alignItems: "center",
  },
  toggleChipActive: {
    backgroundColor: colors.slate[900],
    borderWidth: 0,
  },
  toggleChipInactive: {
    backgroundColor: "white",
    borderWidth: 2,
    borderColor: colors.grey[20],
  },
  toggleChipText: {
    fontSize: 13,
  },
  toggleChipTextActive: {
    color: "white",
    fontWeight: "600",
  },
  toggleChipTextInactive: {
    color: colors.slate[900],
    fontWeight: "500",
  },
  paymentCard: {
    flexDirection: "row",
    padding: 16, // p-4
    gap: 12, // gap-3
    borderWidth: 1,
    borderColor: colors.grey[20],
    borderRadius: 8, // rounded-lg
    backgroundColor: "white",
    alignItems: "flex-start",
  },
  paymentCardActiveCod: {
    borderColor: colors.brand.teal, // border-l-[#56AEBF] border-1
    borderLeftWidth: 4, // simulate border-l-[#56AEBF] slightly
    backgroundColor: "rgba(86, 174, 191, 0.08)", // bg-[#56aebf]/8
  },
  paymentCardActiveOther: {
    borderColor: colors.brand.teal,
    borderLeftWidth: 4,
    backgroundColor: "white",
  },
  radio: {
    width: 20, // w-5
    height: 20, // h-5
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.grey[20],
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2, // mt-0.5
  },
  radioActive: {
    borderColor: colors.brand.teal,
  },
  radioInner: {
    width: 10, // w-2.5
    height: 10, // h-2.5
    borderRadius: 5,
    backgroundColor: colors.brand.teal,
  },
  paymentTitle: {
    color: colors.slate[900],
    fontSize: 14, // text-sm
    fontWeight: "600",
  },
  paymentDesc: {
    color: colors.grey[50], // text-[oklch(0.552...)]
    fontSize: 12, // text-xs
  },
  paymentMethodsRow: {
    flexDirection: "row",
    gap: 6, // gap-1.5
    flexWrap: "wrap",
    marginTop: 4,
  },
  paymentMethodPill: {
    paddingHorizontal: 8, // px-2
    paddingVertical: 2, // py-0.5
    borderWidth: 1,
    borderColor: colors.grey[20],
    borderRadius: 2, // rounded-sm
    backgroundColor: colors.grey[10],
  },
  paymentMethodPillText: {
    fontSize: 11, // text-[11px]
    fontWeight: "600",
  },
  error: { color: colors.error, fontSize: 12 },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: colors.grey[20],
    padding: 16, // p-4
    backgroundColor: "white",
  },
  reviewBtn: {
    backgroundColor: colors.slate[900],
    borderRadius: 8, // rounded-lg
    height: 56, // h-14
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 8, // gap-2
  },
  reviewBtnText: {
    color: "white",
    fontSize: 14, // text-sm
    fontWeight: "600",
  },
})
