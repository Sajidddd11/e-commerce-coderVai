import { useCallback, useEffect, useState } from "react"
import {
  View,
  ScrollView,
  Pressable,
  StyleSheet,
  Modal,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native"
import { useRouter } from "expo-router"
import { ChevronLeft, Plus, Pencil, Trash2, X } from "lucide-react-native"
import { HttpTypes } from "@medusajs/types"
import { Screen } from "@components/layout/Screen"
import { ThemedText } from "@components/ui/ThemedText"
import { Button } from "@components/ui/Button"
import { Input } from "@components/ui/Input"
import { DistrictPicker } from "@components/checkout/DistrictPicker"
import { useRegionStore } from "@stores/region-store"
import {
  listCustomerAddresses,
  addCustomerAddress,
  updateCustomerAddress,
  deleteCustomerAddress,
} from "@api/customer"
import { colors, spacing, borderRadius } from "@design/theme"

interface AddressForm {
  first_name: string
  last_name: string
  address_1: string
  city: string
  phone: string
}

const EMPTY_FORM: AddressForm = {
  first_name: "",
  last_name: "",
  address_1: "",
  city: "",
  phone: "",
}

export default function AddressesScreen() {
  const router = useRouter()
  const countryCode = useRegionStore((s) => s.countryCode)

  const [addresses, setAddresses] = useState<HttpTypes.StoreCustomerAddress[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<AddressForm>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const list = await listCustomerAddresses()
    setAddresses(list)
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const openAdd = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setModalOpen(true)
  }

  const openEdit = (a: HttpTypes.StoreCustomerAddress) => {
    setEditingId(a.id)
    setForm({
      first_name: a.first_name ?? "",
      last_name: a.last_name ?? "",
      address_1: a.address_1 ?? "",
      city: a.city ?? "",
      phone: a.phone ?? "",
    })
    setModalOpen(true)
  }

  const save = async () => {
    setSaving(true)
    const payload = { ...form, country_code: countryCode }
    const res = editingId
      ? await updateCustomerAddress(editingId, payload)
      : await addCustomerAddress(payload)
    setSaving(false)
    if (res.success) {
      setModalOpen(false)
      load()
    } else {
      Alert.alert("Error", res.error ?? "Could not save address.")
    }
  }

  const confirmDelete = (a: HttpTypes.StoreCustomerAddress) => {
    Alert.alert("Delete address", "Remove this saved address?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteCustomerAddress(a.id)
          load()
        },
      },
    ])
  }

  return (
    <Screen edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.back} hitSlop={8}>
          <ChevronLeft size={24} color={colors.grey[90]} />
        </Pressable>
        <ThemedText variant="sectionHeading" color={colors.grey[90]}>
          Addresses
        </ThemedText>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.brand.teal} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {addresses.length === 0 ? (
            <ThemedText variant="body" color={colors.grey[50]} style={styles.emptyText}>
              You have no saved addresses.
            </ThemedText>
          ) : (
            addresses.map((a) => (
              <View key={a.id} style={styles.addressCard}>
                <View style={styles.flex}>
                  <ThemedText variant="bodyMedium" color={colors.grey[90]}>
                    {a.first_name} {a.last_name}
                  </ThemedText>
                  <ThemedText variant="body" color={colors.grey[60]}>
                    {a.address_1}
                  </ThemedText>
                  <ThemedText variant="body" color={colors.grey[60]}>
                    {a.city}
                  </ThemedText>
                  <ThemedText variant="body" color={colors.grey[60]}>
                    {a.phone}
                  </ThemedText>
                </View>
                <View style={styles.actions}>
                  <Pressable onPress={() => openEdit(a)} hitSlop={6} style={styles.iconBtn}>
                    <Pencil size={18} color={colors.grey[60]} />
                  </Pressable>
                  <Pressable onPress={() => confirmDelete(a)} hitSlop={6} style={styles.iconBtn}>
                    <Trash2 size={18} color={colors.error} />
                  </Pressable>
                </View>
              </View>
            ))
          )}

          <Button
            title="Add address"
            variant="secondary"
            leftIcon={<Plus size={18} color={colors.slate[900]} />}
            onPress={openAdd}
            style={styles.addBtn}
          />
        </ScrollView>
      )}

      <Modal visible={modalOpen} animationType="slide" transparent onRequestClose={() => setModalOpen(false)}>
        <View style={styles.backdrop}>
          <KeyboardAvoidingView
            behavior="padding"
            style={styles.sheet}
          >
            <View style={styles.sheetHeader}>
              <ThemedText variant="subheading" color={colors.grey[90]}>
                {editingId ? "Edit address" : "Add address"}
              </ThemedText>
              <Pressable onPress={() => setModalOpen(false)} hitSlop={8}>
                <X size={22} color={colors.grey[60]} />
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={styles.formBody} keyboardShouldPersistTaps="handled">
              <Input
                label="First name"
                value={form.first_name}
                onChangeText={(v) => setForm({ ...form, first_name: v })}
                autoCapitalize="words"
              />
              <Input
                label="Last name"
                value={form.last_name}
                onChangeText={(v) => setForm({ ...form, last_name: v })}
                autoCapitalize="words"
              />
              <Input
                label="Address"
                value={form.address_1}
                onChangeText={(v) => setForm({ ...form, address_1: v })}
              />
              <DistrictPicker
                label="District"
                value={form.city}
                onChange={(d) => setForm({ ...form, city: d })}
              />
              <Input
                label="Phone"
                value={form.phone}
                onChangeText={(v) => setForm({ ...form, phone: v })}
                keyboardType="phone-pad"
              />
              <Button title="Save address" fullWidth loading={saving} onPress={save} style={styles.save} />
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </Screen>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: 2 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.grey[20],
  },
  back: { padding: spacing.xs },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  list: { padding: spacing.base, gap: spacing.sm },
  emptyText: { textAlign: "center", paddingVertical: spacing.xl },
  addressCard: {
    flexDirection: "row",
    gap: spacing.md,
    backgroundColor: colors.grey[0],
    borderWidth: 1,
    borderColor: colors.grey[20],
    borderRadius: borderRadius.rounded,
    padding: spacing.base,
  },
  actions: { flexDirection: "row", gap: spacing.sm },
  iconBtn: { padding: spacing.xs },
  addBtn: { marginTop: spacing.sm },
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: colors.grey[0],
    borderTopLeftRadius: borderRadius.large,
    borderTopRightRadius: borderRadius.large,
    paddingTop: spacing.base,
    maxHeight: "90%",
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  formBody: { padding: spacing.base, gap: spacing.base },
  save: { marginTop: spacing.sm },
})
