/**
 * ZAHAN Mobile Design Tokens
 * Ported from demo-clothing-store-storefront (tailwind.config.js + globals.css)
 * Use these values everywhere — never hardcode hex in components.
 */

export const colors = {
  // Fallbacks for un-refactored components
  background: "#FFFFFF",
  card: "#FFFFFF",
  text: "#111827",
  textMuted: "#6B7280",
  border: "#E5E7EB",
  primary: "#56AEBF",
  primaryHover: "#458F9E",
  primaryMuted: "rgba(86, 174, 191, 0.1)",
  cardBorder: "#F3F4F6",
  overlay: "rgba(0, 0, 0, 0.4)",
  skeleton: "#E5E7EB",
  surface: "#F9FAFB",

  // Brand
  brand: {
    teal: "#56AEBF",
    tealHover: "#458F9E",
    tealGlow: "rgba(86, 174, 191, 0.5)",
    tealMuted: "rgba(86, 174, 191, 0.1)",
  },

  // Grey scale (custom — matches web grey-* tokens)
  grey: {
    0: "#FFFFFF",
    5: "#F9FAFB",
    10: "#F3F4F6",
    20: "#E5E7EB",
    30: "#D1D5DB",
    40: "#9CA3AF",
    50: "#6B7280",
    60: "#4B5563",
    70: "#374151",
    80: "#1F2937",
    90: "#111827",
  },

  // Commerce neutrals (slate — used on product cards, CTAs)
  slate: {
    50: "#F8FAFC",
    100: "#F1F5F9",
    200: "#E2E8F0",
    300: "#CBD5E1",
    800: "#1E293B",
    900: "#0F172A",
  },

  // Semantic
  success: "#22C55E",
  error: "#EF4444",
  warning: "#F59E0B",
  sale: "#EF4444", // red-500 discount badges
  whatsapp: "#22C55E", // green-500

  // Marketing accents (homepage gradients)
  gradient: {
    orangePink: ["#FB923C", "#EC4899"] as const, // from-orange-500 to-pink-500
    blueCyan: ["#2563EB", "#0891B2"] as const,
  },

  // Dark marketing pages (About, Offers)
  dark: {
    bg: "#000000",
    card: "rgba(255, 255, 255, 0.03)",
    border: "rgba(255, 255, 255, 0.1)",
    modal: "#0F0F1E",
  },
} as const

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  "2xl": 32,
  "3xl": 40,
  "4xl": 48,
} as const

export const borderRadius = {
  none: 0,
  soft: 2,
  base: 4,
  rounded: 8,
  large: 16,
  xl: 20, // rounded-2xl
  circle: 9999,
  full: 9999,
} as const

export const shadows = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, // Increased from 0.05
    shadowRadius: 4, // Increased from 2
    elevation: 3, // Increased from 1
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
  },
  xl: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 12,
  },
  brandGlow: {
    shadowColor: colors.brand.teal,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 8,
  },
} as const

export const layout = {
  maxContentWidth: 1440,
  headerHeight: 64, // h-16
  categoryBarHeight: 48, // h-12
  tabBarHeight: 56,
  productImageAspectRatio: 1, // 1:1 square
  heroHeight: {
    mobile: 180,
    tablet: 280,
    desktop: 370,
  },
} as const

export const animation = {
  // Signature spring easing from web mobile menu
  spring: { damping: 15, stiffness: 150, mass: 1 },
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
    hero: 2000, // hero carousel crossfade
  },
  heroAutoplayInterval: 5000,
  whatsappPulseDuration: 10000,
} as const

export const theme = {
  colors,
  spacing,
  borderRadius,
  shadows,
  layout,
  animation,
} as const

export const lightColors = {
  background: colors.grey[0],
  card: colors.grey[0],
  text: colors.grey[90],
  textMuted: colors.grey[50],
  border: colors.grey[20],
  primary: colors.brand.teal,
  primaryHover: colors.brand.tealHover,
  primaryMuted: colors.brand.tealMuted,
  success: colors.success,
  error: colors.error,
  warning: colors.warning,
  sale: colors.sale,
  tint: colors.brand.teal,
  tabIconDefault: colors.grey[40],
  tabIconSelected: colors.brand.teal,
  inputBackground: colors.grey[5],
  inputBorder: colors.grey[20],
  cardBorder: colors.grey[10],
  overlay: "rgba(0, 0, 0, 0.4)",
  whatsapp: colors.whatsapp,
  skeleton: colors.grey[20],
  surface: colors.grey[5], // slightly off-white for headers/footers
} as const;

export const darkColors = {
  background: "#000000",
  card: "#121212", // dark grey for cards
  text: colors.grey[0],
  textMuted: colors.grey[40],
  border: colors.grey[80],
  primary: colors.brand.teal,
  primaryHover: colors.brand.tealHover,
  primaryMuted: "rgba(86, 174, 191, 0.2)",
  success: colors.success,
  error: colors.error,
  warning: colors.warning,
  sale: colors.sale,
  tint: colors.brand.teal,
  tabIconDefault: colors.grey[50],
  tabIconSelected: colors.brand.teal,
  inputBackground: colors.grey[90],
  inputBorder: colors.grey[80],
  cardBorder: colors.grey[80],
  overlay: "rgba(0, 0, 0, 0.6)",
  whatsapp: colors.whatsapp,
  skeleton: colors.grey[80],
  surface: "#0A0A0A",
} as const;

export type ThemeColors = typeof lightColors;

export type Theme = typeof theme
