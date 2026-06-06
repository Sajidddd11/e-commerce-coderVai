/**
 * ZAHAN Typography System
 * Ported from src/styles/globals.css typography classes
 *
 * Fonts to load via expo-font:
 *   - Montserrat_500Medium, Montserrat_600SemiBold, Montserrat_700Bold
 *   - Inter_400Regular, Inter_500Medium, Inter_600SemiBold
 *   - SolaimanLipi (Bangla — bundle as custom font if needed)
 */

export const fontFamily = {
  interRegular: "Inter_400Regular",
  interMedium: "Inter_500Medium",
  interSemiBold: "Inter_600SemiBold",
  interBold: "Inter_700Bold",
  brand: "Montserrat_700Bold",
  heading: "Montserrat_600SemiBold",
  subheading: "Montserrat_500Medium",
  body: "Inter_400Regular",
  bodyMedium: "Inter_500Medium",
  button: "Inter_600SemiBold",
  bangla: "SolaimanLipi", // fallback to system if not bundled
} as const

export const fontSize = {
  8: 8,
  9: 9,
  10: 10,
  11: 11,
  12: 12,
  13: 13,
  xs: 12,
  sm: 14,
  base: 14,
  md: 16,
  lg: 18,
  xl: 20,
  "2xl": 24,
  "3xl": 30,
  "4xl": 36,
  hero: 40,
} as const

export const lineHeight = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.625,
  loose: 2,
} as const

/** Pre-composed text styles matching web typography-* classes */
export const textStyles = {
  brand: {
    fontFamily: fontFamily.brand,
    fontSize: fontSize.lg,
    lineHeight: fontSize.lg * lineHeight.tight,
  },
  hero: {
    fontFamily: fontFamily.brand,
    fontSize: fontSize["4xl"],
    lineHeight: fontSize["4xl"] * lineHeight.tight,
  },
  sectionHeading: {
    fontFamily: fontFamily.heading,
    fontSize: fontSize["2xl"],
    lineHeight: fontSize["2xl"] * lineHeight.tight,
  },
  subheading: {
    fontFamily: fontFamily.subheading,
    fontSize: fontSize.md,
    lineHeight: fontSize.md * lineHeight.normal,
  },
  body: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    lineHeight: fontSize.base * lineHeight.relaxed,
  },
  bodySmall: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * lineHeight.relaxed,
  },
  bodyMedium: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.base,
    lineHeight: fontSize.base * lineHeight.normal,
  },
  productTitle: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.md,
    lineHeight: fontSize.md * lineHeight.normal,
  },
  productPrice: {
    fontFamily: fontFamily.brand,
    fontSize: fontSize.xl,
    lineHeight: fontSize.xl * lineHeight.tight,
  },
  nav: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * lineHeight.normal,
  },
  button: {
    fontFamily: fontFamily.button,
    fontSize: fontSize.base,
    lineHeight: fontSize.base * lineHeight.normal,
  },
  footer: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * lineHeight.relaxed,
  },
} as const
