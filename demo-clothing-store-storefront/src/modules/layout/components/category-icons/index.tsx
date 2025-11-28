interface CategoryIconProps {
  size?: number
  className?: string
}

// SVG Icons for different categories
export const MenIcon = ({ size = 24, className = "" }: CategoryIconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    className={className}
  >
    <circle cx="12" cy="6" r="3" />
    <path d="M9 11h6M7 17h10M9 17v4M15 17v4" />
  </svg>
)

export const WomenIcon = ({ size = 24, className = "" }: CategoryIconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    className={className}
  >
    <circle cx="12" cy="6" r="3" />
    <path d="M9 11h6M7 13l4 8M17 13l-4 8M11 21h2" />
  </svg>
)

export const KidsIcon = ({ size = 24, className = "" }: CategoryIconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    className={className}
  >
    <circle cx="12" cy="5" r="2.5" />
    <path d="M8 9h8c1 0 1.5.5 1.5 1.5v3c0 1-.5 1.5-1.5 1.5h-8c-1 0-1.5-.5-1.5-1.5v-3c0-1 .5-1.5 1.5-1.5M9 15v5M15 15v5M12 20h0" />
  </svg>
)

export const AccessoriesIcon = ({ size = 24, className = "" }: CategoryIconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    className={className}
  >
    <circle cx="7" cy="9" r="3" />
    <circle cx="17" cy="9" r="3" />
    <rect x="5" y="13" width="14" height="8" rx="1" />
    <path d="M8 17h8M8 20h8" />
  </svg>
)

export const SneakersIcon = ({ size = 24, className = "" }: CategoryIconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M4 14c0 1 .5 2 1.5 2h3c1 0 1.5-1 1.5-2v-3H4v3Z" />
    <path d="M14 14c0 1 .5 2 1.5 2h3c1 0 1.5-1 1.5-2v-3h-6v3Z" />
    <path d="M6 11c0-1.5.5-3 1.5-4s2-1.5 3.5-1.5c1 0 2 .5 2.5 1.5M15 11c0-1.5-.5-3-1.5-4s-2-1.5-3.5-1.5c-1 0-2 .5-2.5 1.5" />
    <path d="M5 16h4M15 16h4" />
  </svg>
)

export const BagIcon = ({ size = 24, className = "" }: CategoryIconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M6 9c0-1.5 1-3 2.5-3s2.5 1.5 2.5 3" />
    <path d="M13 9c0-1.5 1-3 2.5-3s2.5 1.5 2.5 3" />
    <path d="M5 9h14v10c0 1-1 2-2 2H7c-1 0-2-1-2-2V9Z" />
    <path d="M8 9v-2c0-.5.5-1 1-1h6c.5 0 1 .5 1 1v2" />
    <path d="M9 13h6M9 17h6" />
  </svg>
)

export const WashingMachineIcon = ({ size = 24, className = "" }: CategoryIconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="3" y="4" width="18" height="16" rx="1" />
    <circle cx="12" cy="12" r="4" />
    <path d="M8 12h8M12 8v8" />
    <path d="M5 21h14" />
  </svg>
)

export const LampIcon = ({ size = 24, className = "" }: CategoryIconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M9 5h6L14 10H10L9 5Z" />
    <path d="M10 10h4c1 0 1.5 1 1.5 2v2H8.5v-2c0-1 .5-2 1.5-2Z" />
    <path d="M9 14h6M8 16h8M10 18h4" />
  </svg>
)

export const JerseyIcon = ({ size = 24, className = "" }: CategoryIconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M9 3h6v4h3l-1 10H7l-1-10h3V3Z" />
    <path d="M6 7h12M8 12h8M9 18h6" />
    <circle cx="12" cy="11" r="0.5" fill="currentColor" />
  </svg>
)

export const WatchIcon = ({ size = 24, className = "" }: CategoryIconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M8 5v2M16 5v2" />
    <circle cx="12" cy="12" r="5" />
    <path d="M12 10v2l2 1" />
    <path d="M8 19v2M16 19v2" />
  </svg>
)

export const JewelryIcon = ({ size = 24, className = "" }: CategoryIconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    className={className}
  >
    <circle cx="12" cy="8" r="4" />
    <path d="M8 12h8M10 16h4M9 20h6" />
  </svg>
)

export const FashionIcon = ({ size = 24, className = "" }: CategoryIconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    className={className}
  >
    <path d="M6 5h12M8 5L7 9c0 1 .5 2 1.5 2h6c1 0 1.5-1 1.5-2l-1-4M8 11h8M9 11v8h6v-8" />
  </svg>
)

export const BeautyIcon = ({ size = 24, className = "" }: CategoryIconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    className={className}
  >
    <circle cx="12" cy="9" r="4" />
    <path d="M7 14h10c1 0 2 1 2 2v5H5v-5c0-1 1-2 2-2Z" />
  </svg>
)

export const SportsIcon = ({ size = 24, className = "" }: CategoryIconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    className={className}
  >
    <circle cx="12" cy="8" r="3" />
    <path d="M8 12h8M9 15h6M10 18h4" />
  </svg>
)

export const HeadphonesIcon = ({ size = 24, className = "" }: CategoryIconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M5 10c0-3 2-5 5-5s5 2 5 5v3c0 1 .5 1.5 1 1.5h2c.5 0 1-.5 1-1.5v-3c0-3 2-5 5-5s5 2 5 5v3c0 1 .5 1.5 1 1.5h2c.5 0 1-.5 1-1.5v-3c0-3-2-5-5-5s-5 2-5 5" />
    <circle cx="6" cy="14" r="2" />
    <circle cx="18" cy="14" r="2" />
    <path d="M6 16v2c0 1 .5 2 1 2h10c.5 0 1-1 1-2v-2" />
  </svg>
)

export const PlugIcon = ({ size = 24, className = "" }: CategoryIconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M9 6v6c0 1 .5 2 1 2h4c.5 0 1-1 1-2V6" />
    <path d="M9 6c0-1 .5-2 1-2s1 1 1 2M11 6c0-1 .5-2 1-2s1 1 1 2" />
    <path d="M8 12h8" />
    <path d="M9 14l-1 4h6l-1-4" />
    <path d="M10 18h4" />
  </svg>
)

export const DefaultIcon = ({ size = 24, className = "" }: CategoryIconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    className={className}
  >
    <rect x="3" y="5" width="18" height="14" rx="1" />
    <path d="M12 12v0" />
  </svg>
)

// Mapping category names to icons
const categoryIconMap: Record<string, React.ComponentType<CategoryIconProps>> = {
  // Fixed Categories
  sneakers: SneakersIcon,
  bags: BagIcon,
  "home appliances": WashingMachineIcon,
  "interior items": LampIcon,
  jerseys: JerseyIcon,
  jersey: JerseyIcon,
  watches: WatchIcon,
  watch: WatchIcon,
  "jourser watch": WatchIcon,
  headphones: HeadphonesIcon,
  headphone: HeadphonesIcon,
  "electric products": PlugIcon,
  "electric product": PlugIcon,

  // Men
  men: MenIcon,
  "men's": MenIcon,
  "mens": MenIcon,
  man: MenIcon,
  male: MenIcon,

  // Women
  women: WomenIcon,
  "women's": WomenIcon,
  womens: WomenIcon,
  woman: WomenIcon,
  female: WomenIcon,

  // Kids
  kids: KidsIcon,
  children: KidsIcon,
  child: KidsIcon,
  boys: KidsIcon,
  girls: KidsIcon,
  baby: KidsIcon,
  toddler: KidsIcon,

  // Accessories
  accessories: AccessoriesIcon,
  accessory: AccessoriesIcon,
  wallet: AccessoriesIcon,
  belt: AccessoriesIcon,
  scarves: AccessoriesIcon,
  hats: AccessoriesIcon,

  // Shoes
  shoes: SneakersIcon,
  footwear: SneakersIcon,
  boots: SneakersIcon,
  sandals: SneakersIcon,

  // Jewelry
  jewelry: JewelryIcon,
  jewellery: JewelryIcon,
  rings: JewelryIcon,
  necklace: JewelryIcon,
  bracelets: JewelryIcon,
  earrings: JewelryIcon,

  // Fashion
  fashion: FashionIcon,
  clothing: FashionIcon,
  apparel: FashionIcon,
  clothes: FashionIcon,
  dresses: FashionIcon,
  shirts: FashionIcon,
  pants: FashionIcon,
  jeans: FashionIcon,
  tops: FashionIcon,
  outfits: FashionIcon,

  // Beauty
  beauty: BeautyIcon,
  cosmetics: BeautyIcon,
  makeup: BeautyIcon,
  skincare: BeautyIcon,
  perfume: BeautyIcon,

  // Sports
  sports: SportsIcon,
  athletic: SportsIcon,
  activewear: SportsIcon,
  gym: SportsIcon,
  fitness: SportsIcon,
  training: SportsIcon,
}

export const getCategoryIcon = (categoryName: string): React.ComponentType<CategoryIconProps> => {
  const lowerName = categoryName.toLowerCase().trim()
  return categoryIconMap[lowerName] || DefaultIcon
}

export default getCategoryIcon