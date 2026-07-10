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
  TextInput,
  Switch
} from "react-native"
import { useRouter } from "expo-router"
import { ChevronLeft, ChevronDown } from "lucide-react-native"
import { CoinIcon } from "@components/ui/CoinIcon"
import { HttpTypes } from "@medusajs/types"
import { Screen } from "@components/layout/Screen"
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  runOnJS,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolateColor,
} from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Input } from "@components/ui/Input"
import { DistrictPicker } from "@components/checkout/DistrictPicker"
import { AddressLabelSelector } from "@components/checkout/AddressLabelSelector"
import { PaymentIcon } from "@components/checkout/PaymentIcon"
import { useCartStore } from "@stores/cart-store"
import { useAuthStore } from "@stores/auth-store"
import { useRegionStore } from "@stores/region-store"
import { useCheckoutStore } from "@stores/checkout-store"
import { AddressSelect } from "@components/checkout/AddressSelect"
import { listCartShippingMethods } from "@api/fulfillment"
import { listCartPaymentMethods } from "@api/payment"
import { prepareCheckout } from "@api/checkout"
import { updateCart, retrieveCart } from "@api/cart"
import { retrieveLoyaltyDetails, applyLoyaltyPoints, removeLoyaltyPoints } from "@api/loyalty"
import { listCustomerAddresses } from "@api/customer"
import {
  autoSelectShippingMethod,
  calculateShippingCost,
  enhancePaymentMethods,
  paymentTitle,
} from "@utils/shipping"
import { convertToLocale } from "@utils/money"
import { trackInitiateCheckout } from "@utils/facebook-analytics"
import { colors, spacing } from "@design/theme"
import { paymentInfoMap } from "@design/constants"

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

interface PaymentOptionCardProps {
  p: HttpTypes.StorePaymentProvider
  selected: boolean
  onPress: () => void
  info: { title: string; iconKey: string }
  isCod: boolean
}

function PaymentOptionCard({
  p,
  selected,
  onPress,
  info,
  isCod,
}: PaymentOptionCardProps) {
  const progress = useSharedValue(selected ? 1 : 0)

  useEffect(() => {
    progress.value = withSpring(selected ? 1 : 0, {
      damping: 15,
      stiffness: 180,
      mass: 0.6,
    })
  }, [selected])

  const animatedCardStyle = useAnimatedStyle(() => {
    const borderColor = interpolateColor(
      progress.value,
      [0, 1],
      [colors.grey[20], colors.brand.teal]
    )
    const backgroundColor = interpolateColor(
      progress.value,
      [0, 1],
      [
        "rgba(255, 255, 255, 1)",
        isCod ? "rgba(86, 174, 191, 0.08)" : "rgba(86, 174, 191, 0.02)"
      ]
    )
    return {
      borderColor,
      backgroundColor,
    }
  })

  const animatedAccentBarStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scaleY: progress.value },
        { translateX: (1 - progress.value) * -4 }
      ],
      opacity: progress.value,
    }
  })

  const animatedRadioStyle = useAnimatedStyle(() => {
    const borderColor = interpolateColor(
      progress.value,
      [0, 1],
      [colors.grey[20], colors.brand.teal]
    )
    const scale = 1 + progress.value * 0.05
    return {
      borderColor,
      transform: [{ scale }],
    }
  })

  const animatedRadioInnerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: progress.value }],
      opacity: progress.value,
    }
  })

  return (
    <AnimatedPressable
      onPress={onPress}
      style={[
        styles.paymentCard,
        animatedCardStyle,
      ]}
    >
      <Animated.View style={[styles.accentBar, animatedAccentBarStyle]} />
      <Animated.View style={[styles.radio, animatedRadioStyle]}>
        <Animated.View style={[styles.radioInner, animatedRadioInnerStyle]} />
      </Animated.View>
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
    </AnimatedPressable>
  )
}

export default function CheckoutScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
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
  const [savedAddresses, setSavedAddresses] = useState<
    HttpTypes.StoreCustomerAddress[]
  >([])

  const [pointsBalance, setPointsBalance] = useState<number | null>(null)
  const [applyingCoins, setApplyingCoins] = useState(false)
  const [coinsError, setCoinsError] = useState<string | null>(null)
  const [attemptedSubmit, setAttemptedSubmit] = useState(false)
  const [footerHeight, setFooterHeight] = useState(280)

  useEffect(() => {
    if (!customer) {
      setSavedAddresses([])
      return
    }
    listCustomerAddresses().then((list) => {
      setSavedAddresses(list ?? [])
    })
  }, [customer])

  useEffect(() => {
    if (customer) {
      retrieveLoyaltyDetails().then(({ account }) => {
        if (account) setPointsBalance(account.points)
      })
    }
  }, [customer, cart?.id])

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
    if (customer.email && form.email !== customer.email) patch.email = customer.email
    if (!form.phone && customer.phone) patch.phone = customer.phone
    if (Object.keys(patch).length) setForm(patch)
  }, [customer, form.email])

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
        const shipping_address: any = {
          city: form.district,
          country_code: countryCode,
        }
        if (firstName) shipping_address.first_name = firstName
        if (lastName) shipping_address.last_name = lastName
        if (form.address1) shipping_address.address_1 = form.address1
        if (form.phone) shipping_address.phone = form.phone
        if (form.company) shipping_address.company = form.company

        const updateData: any = { shipping_address }
        if (form.email) updateData.email = form.email

        await updateCart(updateData)
        
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

  const metadata = (cart?.metadata || {}) as Record<string, any>
  const appliedPoints = Number(metadata.loyalty_points_to_redeem) || 0
  const appliedDiscount = (Number(metadata.loyalty_discount_amount) || 0) / 100

  const handleToggleCoins = async (checked: boolean) => {
    if (!cart?.id) return
    setCoinsError(null)
    setApplyingCoins(true)
    try {
      if (checked) {
        if (pointsBalance === null || pointsBalance <= 0) return
        const res = await applyLoyaltyPoints(cart.id, pointsBalance)
        if (res && (res as any).error) {
          setCoinsError((res as any).error)
        } else if (res) {
          const freshCart = await retrieveCart()
          useCartStore.getState().setCart(freshCart)
          const details = await retrieveLoyaltyDetails()
          if (details.account) setPointsBalance(details.account.points)
        }
      } else {
        const res = await removeLoyaltyPoints(cart.id)
        if (res && (res as any).error) {
          setCoinsError((res as any).error)
        } else {
          const freshCart = await retrieveCart()
          useCartStore.getState().setCart(freshCart)
          const details = await retrieveLoyaltyDetails()
          if (details.account) setPointsBalance(details.account.points)
        }
      }
    } catch (e: any) {
      setCoinsError(e.message || "Failed to update coins")
    } finally {
      setApplyingCoins(false)
    }
  }

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
    setAttemptedSubmit(true)
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
          contentContainerStyle={[styles.scroll, { paddingBottom: footerHeight + 24 }]}
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
            {savedAddresses.length > 0 ? (
              <AddressSelect
                addresses={savedAddresses}
                addressInput={form}
                onSelect={(address) => {
                  setForm({
                    fullName: `${address.first_name ?? ""} ${address.last_name ?? ""}`.trim(),
                    address1: address.address_1 ?? "",
                    district: address.city ?? "",
                    phone: address.phone ?? "",
                    company: address.company ?? "",
                  })
                }}
              />
            ) : null}

            <Input
              label="Full Name"
              value={form.fullName}
              onChangeText={(v) => setForm({ fullName: v })}
              autoCapitalize="words"
              placeholder="Full name"
              error={attemptedSubmit && !form.fullName.trim() ? "Full name is required" : undefined}
            />

            <View style={styles.phoneInputWrap}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <View
                style={[
                  styles.phoneInputBox,
                  attemptedSubmit && !form.phone.trim() && { borderColor: colors.error },
                ]}
              >
                <View style={styles.phonePrefix}>
                  <Text style={styles.phonePrefixText}>+88</Text>
                </View>
                <TextInput
                  style={styles.phoneInput}
                  value={form.phone}
                  onChangeText={(v) => setForm({ phone: v })}
                  keyboardType="phone-pad"
                  placeholder="01XXXXXXXXX"
                />
              </View>
              {attemptedSubmit && !form.phone.trim() ? (
                <Text style={[styles.error, { marginTop: 2 }]}>
                  Phone number is required
                </Text>
              ) : null}
            </View>

            <Input
              label="Email or Phone Number"
              value={form.email}
              onChangeText={(v) => setForm({ email: v })}
              autoCapitalize="none"
              editable={!customer}
              error={attemptedSubmit && !form.email.trim() ? "Email or Phone Number is required" : undefined}
            />

            <DistrictPicker
              label="District"
              value={form.district}
              onChange={(d) => setForm({ district: d })}
              error={attemptedSubmit && !form.district ? "District is required" : undefined}
            />

            <Input
              label="Address Line"
              value={form.address1}
              onChangeText={(v) => setForm({ address1: v })}
              placeholder="House, road, area"
              error={attemptedSubmit && !form.address1.trim() ? "Address is required" : undefined}
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

          {customer && pointsBalance !== null && (pointsBalance > 0 || appliedPoints > 0) ? (
            <Section title="Zahan Coins">
              <View style={styles.coinsCard}>
                <View style={styles.coinsCardHeader}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <CoinIcon size={20} />
                    <Text style={styles.coinsCardTitle}>Redeem Zahan Coins</Text>
                  </View>
                  <Switch
                    value={appliedPoints > 0}
                    onValueChange={handleToggleCoins}
                    disabled={applyingCoins}
                    trackColor={{ false: colors.grey[20], true: colors.brand.teal }}
                    thumbColor={Platform.OS === "android" ? "white" : undefined}
                  />
                </View>

                <View style={styles.coinsCardBody}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <Text style={styles.coinsBalanceLabel}>Available Balance:</Text>
                    <Text style={styles.coinsBalanceValue}>{pointsBalance} Coins</Text>
                  </View>

                  {applyingCoins ? (
                    <ActivityIndicator size="small" color={colors.brand.teal} style={{ marginTop: 8 }} />
                  ) : appliedPoints > 0 ? (
                    <View style={styles.coinsAppliedBox}>
                      <Text style={styles.coinsAppliedTitle}>Redeeming {appliedPoints} Coins</Text>
                      <Text style={styles.coinsAppliedSubtitle}>
                        Discount: {convertToLocale({ amount: appliedDiscount, currency_code: currency })}
                      </Text>
                    </View>
                  ) : null}

                  {coinsError ? (
                    <Text style={styles.coinsError}>{coinsError}</Text>
                  ) : null}
                </View>
              </View>
            </Section>
          ) : null}

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
                    <PaymentOptionCard
                      key={p.id}
                      p={p}
                      selected={selected}
                      onPress={() => setForm({ paymentProviderId: p.id })}
                      info={info}
                      isCod={isCod}
                    />
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

        <View
          style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}
          onLayout={(e) => setFooterHeight(e.nativeEvent.layout.height)}
        >
          {/* Subtotal */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
            <Text style={{ fontFamily: "Inter-Regular", color: colors.grey[50], fontSize: 13 }}>
              Subtotal
            </Text>
            <Text style={{ fontFamily: "Inter-Medium", color: colors.slate[900], fontSize: 13 }}>
              {convertToLocale({ amount: subtotal, currency_code: currency })}
            </Text>
          </View>

          {/* Discount */}
          {discount > 0 ? (
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
              <Text style={{ fontFamily: "Inter-Regular", color: colors.grey[50], fontSize: 13 }}>
                {appliedPoints > 0 ? "Zahan Coins Discount" : "Discount"}
              </Text>
              <Text style={{ fontFamily: "Inter-Medium", color: colors.sale, fontSize: 13 }}>
                -{convertToLocale({ amount: discount, currency_code: currency })}
              </Text>
            </View>
          ) : null}

          {/* Shipping */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
            <Text style={{ fontFamily: "Inter-Regular", color: colors.grey[50], fontSize: 13 }}>
              Shipping {getShippingLabel() ? `(${getShippingLabel()})` : ""}
            </Text>
            <Text style={{ fontFamily: "Inter-Medium", color: colors.slate[900], fontSize: 13 }}>
              {convertToLocale({ amount: shippingCost, currency_code: currency })}
            </Text>
          </View>

          {/* Divider */}
          <View style={{ height: 1, backgroundColor: colors.grey[20], marginBottom: 12 }} />

          {/* Total */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 16 }}>
            <Text style={{ fontFamily: "Inter-SemiBold", color: colors.slate[900], fontSize: 15 }}>
              Total
            </Text>
            <Text style={{ fontFamily: "Inter-Bold", color: colors.slate[900], fontSize: 16 }}>
              {convertToLocale({ amount: total, currency_code: currency })}
            </Text>
          </View>

          <Pressable
            style={styles.reviewBtn}
            disabled={submitting}
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
    paddingHorizontal: spacing.md, // px-4
    paddingTop: 4, // reduced from 12
    paddingBottom: 8, // reduced from 12
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
    paddingTop: 8,
    paddingBottom: 8,
    paddingHorizontal: spacing.md,
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
    paddingHorizontal: spacing.md,
    paddingBottom: 280, // fallback; overridden dynamically via footerHeight
    gap: 24,
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
    borderLeftWidth: 1, // specified explicitly to prevent layout jump during selection transition
    borderColor: colors.grey[20],
    borderRadius: 8, // rounded-lg
    backgroundColor: "white",
    alignItems: "flex-start",
    overflow: "hidden", // clipping the accentBar perfectly
  },
  accentBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: colors.brand.teal,
    borderTopLeftRadius: 7,
    borderBottomLeftRadius: 7,
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
  coinsCard: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: colors.grey[20],
    borderRadius: 8,
    padding: 16,
    gap: 12,
  },
  coinsCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  coinsCardTitle: {
    fontFamily: "Inter-SemiBold",
    fontWeight: "600",
    fontSize: 14,
    color: colors.slate[900],
  },
  coinsCardBody: {
    gap: 8,
  },
  coinsBalanceLabel: {
    fontFamily: "Inter-Regular",
    fontSize: 13,
    color: colors.grey[50],
  },
  coinsBalanceValue: {
    fontFamily: "Inter-SemiBold",
    fontWeight: "600",
    fontSize: 13,
    color: colors.slate[900],
  },
  coinsAppliedBox: {
    marginTop: 8,
    padding: 12,
    backgroundColor: colors.grey[5],
    borderWidth: 1,
    borderColor: colors.grey[20],
    borderRadius: 6,
    gap: 2,
  },
  coinsAppliedTitle: {
    fontFamily: "Inter-SemiBold",
    fontWeight: "600",
    fontSize: 12,
    color: colors.slate[900],
  },
  coinsAppliedSubtitle: {
    fontFamily: "Inter-Regular",
    fontSize: 10,
    color: colors.grey[50],
  },
  coinsError: {
    fontFamily: "Inter-Regular",
    fontSize: 11,
    color: colors.error,
    marginTop: 4,
  },
})
