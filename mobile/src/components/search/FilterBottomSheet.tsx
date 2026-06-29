import React, { useState, useEffect } from "react"
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TouchableWithoutFeedback,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { X } from "lucide-react-native"
import { HttpTypes } from "@medusajs/types"
import { SortOptions } from "@utils/sort-products"
import { colors, spacing } from "@design/theme"
import { fontFamily, fontSize } from "@design/typography"
import { Input } from "@components/ui/Input"

const SORT_OPTIONS: { key: SortOptions; label: string }[] = [
  { key: "created_at", label: "Latest" },
  { key: "best_selling", label: "Best Selling" },
  { key: "price_asc", label: "Price ↑" },
  { key: "price_desc", label: "Price ↓" },
]

interface FilterBottomSheetProps {
  visible: boolean
  onClose: () => void
  categories: HttpTypes.StoreProductCategory[]
  initialSortBy: SortOptions
  initialCategory?: string | null
  initialCategories?: string[]
  initialPriceMin?: number | null
  initialPriceMax?: number | null
  onApply: (
    sortBy: SortOptions,
    category: string | null,
    priceMin: number | null,
    priceMax: number | null,
    categories?: string[]
  ) => void
}

export function FilterBottomSheet({
  visible,
  onClose,
  categories,
  initialSortBy,
  initialCategory = null,
  initialCategories = [],
  initialPriceMin = null,
  initialPriceMax = null,
  onApply,
}: FilterBottomSheetProps) {
  const [sortBy, setSortBy] = useState<SortOptions>(initialSortBy)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [priceMin, setPriceMin] = useState<string>("")
  const [priceMax, setPriceMax] = useState<string>("")

  useEffect(() => {
    if (visible) {
      setSortBy(initialSortBy)
      
      if (initialCategories && initialCategories.length > 0) {
        setSelectedCategories(initialCategories)
      } else if (initialCategory) {
        setSelectedCategories([initialCategory])
      } else {
        setSelectedCategories([])
      }

      setPriceMin(initialPriceMin !== null ? String(initialPriceMin) : "")
      setPriceMax(initialPriceMax !== null ? String(initialPriceMax) : "")
    }
  }, [visible, initialSortBy, initialCategory, initialCategories, initialPriceMin, initialPriceMax])

  const handleApply = () => {
    const minVal = priceMin.trim() ? parseFloat(priceMin) : null
    const maxVal = priceMax.trim() ? parseFloat(priceMax) : null
    const singleCategory = selectedCategories.length > 0 ? selectedCategories[0] : null
    onApply(sortBy, singleCategory, minVal, maxVal, selectedCategories)
    onClose()
  }

  const handleReset = () => {
    setSortBy("created_at")
    setSelectedCategories([])
    setPriceMin("")
    setPriceMax("")
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>

      <View style={styles.sheet}>
        <SafeAreaView edges={["bottom"]}>
          <View style={styles.header}>
            <Text style={styles.title}>Filters & Sort</Text>
            <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={8}>
              <X size={20} color={colors.grey[90]} />
            </Pressable>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Sort Section */}
            <Text style={styles.sectionTitle}>Sort By</Text>
            <View style={styles.optionsGrid}>
              {SORT_OPTIONS.map((opt) => {
                const active = sortBy === opt.key
                return (
                  <Pressable
                    key={opt.key}
                    onPress={() => setSortBy(opt.key)}
                    style={[styles.chip, active ? styles.chipActive : styles.chipInactive]}
                  >
                    <Text style={[styles.chipText, active ? styles.chipTextActive : styles.chipTextInactive]}>
                      {opt.label}
                    </Text>
                  </Pressable>
                )
              })}
            </View>

            {/* Category Section */}
            {categories.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Category</Text>
                <View style={styles.optionsGrid}>
                  {categories.map((cat) => {
                    const active = selectedCategories.includes(cat.id)
                    return (
                      <Pressable
                        key={cat.id}
                        onPress={() => {
                          if (active) {
                            setSelectedCategories(selectedCategories.filter((id) => id !== cat.id))
                          } else {
                            setSelectedCategories([...selectedCategories, cat.id])
                          }
                        }}
                        style={[styles.chip, active ? styles.chipActive : styles.chipInactive]}
                      >
                        <Text style={[styles.chipText, active ? styles.chipTextActive : styles.chipTextInactive]}>
                          {cat.name}
                        </Text>
                      </Pressable>
                    )
                  })}
                </View>
              </>
            )}

            {/* Price Range Section */}
            <Text style={styles.sectionTitle}>Price Range (BDT)</Text>
            <View style={styles.priceRow}>
              <View style={styles.priceInputContainer}>
                <Input
                  placeholder="Min"
                  value={priceMin}
                  onChangeText={setPriceMin}
                  keyboardType="numeric"
                  containerStyle={{ width: "100%" }}
                  style={styles.priceInput}
                />
              </View>
              <Text style={styles.priceSeparator}>—</Text>
              <View style={styles.priceInputContainer}>
                <Input
                  placeholder="Max"
                  value={priceMax}
                  onChangeText={setPriceMax}
                  keyboardType="numeric"
                  containerStyle={{ width: "100%" }}
                  style={styles.priceInput}
                />
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Pressable onPress={handleReset} style={styles.resetBtn}>
              <Text style={styles.resetText}>Reset</Text>
            </Pressable>
            <Pressable onPress={handleApply} style={styles.applyBtn}>
              <Text style={styles.applyText}>Apply Filters</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.base,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.grey[20],
  },
  title: {
    fontFamily: fontFamily.interSemiBold,
    fontSize: fontSize.lg,
    color: colors.grey[90],
  },
  closeBtn: {
    padding: 4,
  },
  content: {
    paddingHorizontal: spacing.base,
    paddingBottom: 30,
  },
  sectionTitle: {
    fontFamily: fontFamily.interMedium,
    fontSize: fontSize.sm,
    color: colors.grey[60],
    marginTop: 24,
    marginBottom: 12,
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: 9999,
    borderWidth: 1,
  },
  chipActive: {
    backgroundColor: "rgba(86, 174, 191, 0.1)",
    borderColor: colors.brand.teal,
  },
  chipInactive: {
    backgroundColor: "white",
    borderColor: colors.grey[20],
  },
  chipText: {
    fontFamily: fontFamily.interMedium,
    fontSize: fontSize.sm,
  },
  chipTextActive: {
    color: colors.brand.teal,
  },
  chipTextInactive: {
    color: colors.grey[60],
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  priceInputContainer: {
    flex: 1,
  },
  priceInput: {
    minHeight: 40,
    paddingVertical: 8,
  },
  priceSeparator: {
    color: colors.grey[40],
    fontSize: fontSize.sm,
    fontFamily: fontFamily.interMedium,
  },
  footer: {
    flexDirection: "row",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.grey[20],
    gap: 12,
  },
  resetBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: colors.grey[30],
    justifyContent: "center",
    alignItems: "center",
  },
  resetText: {
    fontFamily: fontFamily.interSemiBold,
    fontSize: fontSize.base,
    color: colors.grey[70],
  },
  applyBtn: {
    flex: 2,
    backgroundColor: colors.brand.teal,
    paddingVertical: 14,
    borderRadius: 9999,
    justifyContent: "center",
    alignItems: "center",
  },
  applyText: {
    fontFamily: fontFamily.interSemiBold,
    fontSize: fontSize.base,
    color: "white",
  },
})
