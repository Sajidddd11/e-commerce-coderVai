import React, { useMemo, useState } from "react"
import {
  View,
  Modal,
  Pressable,
  FlatList,
  StyleSheet,
} from "react-native"
import { ChevronDown, X, Check } from "lucide-react-native"
import { ThemedText } from "@components/ui/ThemedText"
import { HttpTypes } from "@medusajs/types"
import { colors, spacing, borderRadius } from "@design/theme"

interface AddressSelectProps {
  addresses: HttpTypes.StoreCustomerAddress[]
  addressInput: {
    fullName: string
    address1: string
    district: string
    phone: string
    company: string
  }
  onSelect: (address: HttpTypes.StoreCustomerAddress) => void
}

export function AddressSelect({
  addresses,
  addressInput,
  onSelect,
}: AddressSelectProps) {
  const [open, setOpen] = useState(false)

  const selectedAddress = useMemo(() => {
    return addresses.find((a) => {
      const addressFullName = `${a.first_name ?? ""} ${a.last_name ?? ""}`.trim()
      return (
        addressFullName === addressInput.fullName &&
        (a.address_1 ?? "") === addressInput.address1 &&
        (a.city ?? "") === addressInput.district &&
        (a.phone ?? "") === addressInput.phone &&
        (a.company ?? "") === addressInput.company
      )
    })
  }, [addresses, addressInput])

  return (
    <View style={styles.wrap}>
      <ThemedText variant="bodySmall" color={colors.grey[70]}>
        Saved Address
      </ThemedText>

      <Pressable
        style={styles.trigger}
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel="Select saved address"
      >
        <ThemedText
          variant="body"
          color={selectedAddress ? colors.grey[90] : colors.grey[50]}
          numberOfLines={1}
        >
          {selectedAddress
            ? `${selectedAddress.first_name} ${selectedAddress.last_name} (${selectedAddress.address_1})`
            : "Use a saved address..."}
        </ThemedText>
        <ChevronDown size={18} color={colors.grey[50]} />
      </Pressable>

      <Modal
        visible={open}
        animationType="slide"
        transparent
        onRequestClose={() => setOpen(false)}
      >
        <View style={styles.backdrop}>
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <ThemedText variant="subheading" color={colors.grey[90]}>
                Select saved address
              </ThemedText>
              <Pressable onPress={() => setOpen(false)} hitSlop={8}>
                <X size={22} color={colors.grey[60]} />
              </Pressable>
            </View>

            <FlatList
              data={addresses}
              keyExtractor={(item) => item.id}
              keyboardShouldPersistTaps="handled"
              style={styles.list}
              renderItem={({ item }) => {
                const active = selectedAddress?.id === item.id
                return (
                  <Pressable
                    style={[styles.row, active && styles.rowActive]}
                    onPress={() => {
                      onSelect(item)
                      setOpen(false)
                    }}
                  >
                    <View style={styles.addressInfo}>
                      <View style={styles.nameRow}>
                        <ThemedText
                          variant="bodyMedium"
                          color={active ? colors.brand.teal : colors.grey[90]}
                        >
                          {item.first_name} {item.last_name}
                        </ThemedText>
                        {item.company ? (
                          <View style={styles.labelBadge}>
                            <ThemedText variant="bodySmall" color={colors.grey[60]}>
                              {item.company}
                            </ThemedText>
                          </View>
                        ) : null}
                      </View>
                      <ThemedText variant="bodySmall" color={colors.grey[60]} style={styles.detailText}>
                        {item.address_1}
                      </ThemedText>
                      <ThemedText variant="bodySmall" color={colors.grey[60]} style={styles.detailText}>
                        {item.city}
                      </ThemedText>
                      <ThemedText variant="bodySmall" color={colors.grey[60]} style={styles.detailText}>
                        {item.phone}
                      </ThemedText>
                    </View>
                    {active ? (
                      <Check size={18} color={colors.brand.teal} />
                    ) : null}
                  </Pressable>
                )
              }}
              ListEmptyComponent={
                <View style={styles.empty}>
                  <ThemedText variant="body" color={colors.grey[50]}>
                    No saved addresses found
                  </ThemedText>
                </View>
              }
            />
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.grey[10],
    borderWidth: 1,
    borderColor: colors.grey[20],
    borderRadius: borderRadius.base,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    minHeight: 48,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: colors.grey[0],
    borderTopLeftRadius: borderRadius.large,
    borderTopRightRadius: borderRadius.large,
    paddingTop: spacing.base,
    height: "60%",
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.grey[20],
  },
  list: {
    marginTop: spacing.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.grey[10],
  },
  rowActive: {
    backgroundColor: "rgba(86, 174, 191, 0.04)",
  },
  addressInfo: {
    flex: 1,
    gap: 2,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  labelBadge: {
    backgroundColor: colors.grey[10],
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.grey[20],
  },
  detailText: {
    marginTop: 1,
  },
  empty: {
    padding: spacing.xl,
    alignItems: "center",
  },
})
