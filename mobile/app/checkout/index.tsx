import { useEffect, useMemo, useState } from "react"
import {
  View,
  ScrollView,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native"
import { useRouter } from "expo-router"
import { ChevronLeft, Check } from "lucide-react-native"
import { HttpTypes } from "@medusajs/types"
import { Screen } from "@components/layout/Screen"
import { ThemedText } from "@components/ui/ThemedText"
import { Button } from "@components/ui/Button"
import { Input } from "@components/ui/Input"
import { DistrictPicker } from "@components/checkout/DistrictPicker"
import { PaymentIcon } from "@components/checkout/PaymentIcon"
import { useCartStore } from "@stores/cart-store"
import { useAuthStore } from "@stores/auth-store"
import { useRegionStore } from "@stores/region-store"
import { useCheckoutStore } from "@stores/checkout-store"
import { listCartShippingMethods } from "@api/fulfillment"
import { listCartPaymentMethods } from "@api/payment"
import { prepareCheckout } from "@api/checkout"
import {
  autoSelectShippingMethod,
  calculateShippingCost,
  enhancePaymentMethods,
  paymentTitle,
} from "@utils/shipping"
import { convertToLocale } from "@utils/money"
import { trackInitiateCheckout } from "@utils/facebook-analytics"
import { colors, spacing, borderRadius } from "@design/theme"

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

  // Hydrate the draft + prefill from the logged-in customer once.
  useEffect(() => {
    hydrate()
  }, [hydrate])

  // Track InitiateCheckout once when the cart is available.
  useEffect(() => {
    if (!cart?.id) return
    trackInitiateCheckout({
      value: cart.total ?? undefined,
      currency: cart.currency_code ?? undefined,
      numItems: cart.items?.length ?? 0,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customer])

  // Load shipping options + payment providers.
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

  // Auto-select the shipping method whenever delivery type / district change.
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shippingMethods, form.deliveryType, form.district])

  const shippingCost = useMemo(() => {
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

  return (
    <Screen edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.back} hitSlop={8}>
          <ChevronLeft size={24} color={colors.grey[90]} />
        </Pressable>
        <ThemedText variant="sectionHeading" color={colors.grey[90]}>
          Checkout
        </ThemedText>
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
          {/* Contact */}
          <Section title="Contact">
            <Input
              label="Email"
              value={form.email}
              onChangeText={(v) => setForm({ email: v })}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="you@example.com"
            />
          </Section>

          {/* Shipping address */}
          <Section title="Shipping address">
            <Input
              label="Full name"
              value={form.fullName}
              onChangeText={(v) => setForm({ fullName: v })}
              autoCapitalize="words"
              placeholder="e.g. Rahim Uddin"
            />
            <Input
              label="Phone"
              value={form.phone}
              onChangeText={(v) => setForm({ phone: v })}
              keyboardType="phone-pad"
              placeholder="01XXXXXXXXX"
            />
            <Input
              label="Address"
              value={form.address1}
              onChangeText={(v) => setForm({ address1: v })}
              placeholder="House, road, area"
            />
            <DistrictPicker
              label="District"
              value={form.district}
              onChange={(d) => setForm({ district: d })}
            />
          </Section>

          {/* Delivery type */}
          <Section title="Delivery type">
            <View style={styles.toggleRow}>
              <ToggleChip
                label="Home delivery"
                active={form.deliveryType === "home"}
                onPress={() => setForm({ deliveryType: "home" })}
              />
              <ToggleChip
                label="Store pickup"
                active={form.deliveryType === "pickup"}
                onPress={() => setForm({ deliveryType: "pickup" })}
              />
            </View>
          </Section>

          {/* Shipping method */}
          <Section title="Delivery option">
            {loadingOptions ? (
              <ActivityIndicator color={colors.brand.teal} />
            ) : shippingMethods.length === 0 ? (
              <ThemedText variant="bodySmall" color={colors.grey[50]}>
                No delivery options available.
              </ThemedText>
            ) : (
              shippingMethods.map((m) => (
                <SelectRow
                  key={m.id}
                  selected={form.shippingMethodId === m.id}
                  onPress={() => setForm({ shippingMethodId: m.id })}
                  title={m.name ?? "Delivery"}
                  right={convertToLocale({
                    amount: m.amount ?? 0,
                    currency_code: currency,
                  })}
                />
              ))
            )}
          </Section>

          {/* Payment method */}
          <Section title="Payment method">
            {loadingOptions ? (
              <ActivityIndicator color={colors.brand.teal} />
            ) : (
              paymentMethods.map((p) => (
                <SelectRow
                  key={p.id}
                  selected={form.paymentProviderId === p.id}
                  onPress={() => setForm({ paymentProviderId: p.id })}
                  title={paymentTitle(p.id)}
                  icon={<PaymentIcon providerId={p.id} />}
                />
              ))
            )}
          </Section>

          {/* Delivery instructions */}
          <Section title="Delivery instructions (optional)">
            <Input
              value={form.deliveryInstructions}
              onChangeText={(v) => setForm({ deliveryInstructions: v })}
              placeholder="Any notes for the courier"
              multiline
              numberOfLines={3}
              style={styles.textArea}
            />
          </Section>

          {error ? (
            <ThemedText
              variant="bodySmall"
              color={colors.error}
              style={styles.error}
            >
              {error}
            </ThemedText>
          ) : null}
        </ScrollView>

        {/* Sticky summary + CTA */}
        <View style={styles.footer}>
          <View style={styles.summaryRow}>
            <ThemedText variant="body" color={colors.grey[60]}>
              Total
            </ThemedText>
            <ThemedText variant="subheading" color={colors.grey[90]}>
              {convertToLocale({ amount: total, currency_code: currency })}
            </ThemedText>
          </View>
          <Button
            title="Review Order"
            fullWidth
            loading={submitting}
            disabled={!canSubmit}
            onPress={onSubmit}
          />
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
      <ThemedText variant="subheading" color={colors.grey[90]}>
        {title}
      </ThemedText>
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
        {
          borderColor: active ? colors.brand.teal : colors.grey[20],
          backgroundColor: active ? colors.brand.tealMuted : colors.grey[0],
        },
      ]}
    >
      <ThemedText
        variant="bodyMedium"
        color={active ? colors.brand.teal : colors.grey[70]}
      >
        {label}
      </ThemedText>
    </Pressable>
  )
}

function SelectRow({
  selected,
  onPress,
  title,
  right,
  icon,
}: {
  selected: boolean
  onPress: () => void
  title: string
  right?: string
  icon?: React.ReactNode
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.selectRow,
        { borderColor: selected ? colors.brand.teal : colors.grey[20] },
      ]}
    >
      <View
        style={[
          styles.radio,
          {
            borderColor: selected ? colors.brand.teal : colors.grey[30],
            backgroundColor: selected ? colors.brand.teal : "transparent",
          },
        ]}
      >
        {selected ? <Check size={12} color={colors.grey[0]} /> : null}
      </View>
      {icon ? <View style={styles.rowIcon}>{icon}</View> : null}
      <ThemedText variant="body" color={colors.grey[90]} style={styles.flex}>
        {title}
      </ThemedText>
      {right ? (
        <ThemedText variant="bodyMedium" color={colors.grey[80]}>
          {right}
        </ThemedText>
      ) : null}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.grey[20],
  },
  back: { padding: spacing.xs },
  scroll: {
    padding: spacing.base,
    gap: spacing.lg,
    paddingBottom: spacing["2xl"],
  },
  section: { gap: spacing.sm },
  sectionBody: { gap: spacing.md },
  toggleRow: { flexDirection: "row", gap: spacing.sm },
  toggleChip: {
    flex: 1,
    alignItems: "center",
    paddingVertical: spacing.md,
    borderRadius: borderRadius.rounded,
    borderWidth: 1,
  },
  selectRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderWidth: 1,
    borderRadius: borderRadius.rounded,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.base,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: borderRadius.circle,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  rowIcon: { marginRight: -spacing.xs },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
    paddingTop: spacing.md,
  },
  error: { marginTop: spacing.xs },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.grey[20],
    padding: spacing.base,
    gap: spacing.sm,
    backgroundColor: colors.grey[0],
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
})
