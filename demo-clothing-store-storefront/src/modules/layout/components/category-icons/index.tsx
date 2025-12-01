import {
  User,
  UserRound,
  Baby,
  Watch,
  ShoppingBag,
  Shirt,
  Home,
  Footprints,
  Gem,
  Sparkles,
  Dumbbell,
  Headphones,
  Monitor,
  Package,
} from "lucide-react"

interface CategoryIconProps {
  size?: number
  className?: string
}

// Re-export Lucide icons with consistent interface
export const MenIcon = ({ size = 24, className = "" }: CategoryIconProps) => (
  <User size={size} className={className} strokeWidth={1.5} />
)

export const WomenIcon = ({ size = 24, className = "" }: CategoryIconProps) => (
  <UserRound size={size} className={className} strokeWidth={1.5} />
)

export const KidsIcon = ({ size = 24, className = "" }: CategoryIconProps) => (
  <Baby size={size} className={className} strokeWidth={1.5} />
)

export const AccessoriesIcon = ({ size = 24, className = "" }: CategoryIconProps) => (
  <Watch size={size} className={className} strokeWidth={1.5} />
)

export const ShoesIcon = ({ size = 24, className = "" }: CategoryIconProps) => (
  <Footprints size={size} className={className} strokeWidth={1.5} />
)

export const BagIcon = ({ size = 24, className = "" }: CategoryIconProps) => (
  <ShoppingBag size={size} className={className} strokeWidth={1.5} />
)

export const ApplianceIcon = ({ size = 24, className = "" }: CategoryIconProps) => (
  <Package size={size} className={className} strokeWidth={1.5} />
)

export const HomeDecorIcon = ({ size = 24, className = "" }: CategoryIconProps) => (
  <Home size={size} className={className} strokeWidth={1.5} />
)

export const TShirtIcon = ({ size = 24, className = "" }: CategoryIconProps) => (
  <Shirt size={size} className={className} strokeWidth={1.5} />
)

export const WatchIcon = ({ size = 24, className = "" }: CategoryIconProps) => (
  <Watch size={size} className={className} strokeWidth={1.5} />
)

export const JewelryIcon = ({ size = 24, className = "" }: CategoryIconProps) => (
  <Gem size={size} className={className} strokeWidth={1.5} />
)

export const FashionIcon = ({ size = 24, className = "" }: CategoryIconProps) => (
  <Sparkles size={size} className={className} strokeWidth={1.5} />
)

export const BeautyIcon = ({ size = 24, className = "" }: CategoryIconProps) => (
  <Sparkles size={size} className={className} strokeWidth={1.5} />
)

export const SportsIcon = ({ size = 24, className = "" }: CategoryIconProps) => (
  <Dumbbell size={size} className={className} strokeWidth={1.5} />
)

export const HeadphonesIcon = ({ size = 24, className = "" }: CategoryIconProps) => (
  <Headphones size={size} className={className} strokeWidth={1.5} />
)

export const ElectronicsIcon = ({ size = 24, className = "" }: CategoryIconProps) => (
  <Monitor size={size} className={className} strokeWidth={1.5} />
)

export const DefaultIcon = ({ size = 24, className = "" }: CategoryIconProps) => (
  <Package size={size} className={className} strokeWidth={1.5} />
)

// Mapping category names to icons
const categoryIconMap: Record<string, React.ComponentType<CategoryIconProps>> = {
  // Fixed Categories
  sneakers: ShoesIcon,
  sneaker: ShoesIcon,
  bags: BagIcon,
  bag: BagIcon,
  "home appliances": ApplianceIcon,
  appliances: ApplianceIcon,
  appliance: ApplianceIcon,
  "interior items": HomeDecorIcon,
  interior: HomeDecorIcon,
  "home decor": HomeDecorIcon,
  decor: HomeDecorIcon,
  furniture: HomeDecorIcon,
  jerseys: TShirtIcon,
  jersey: TShirtIcon,
  watches: WatchIcon,
  watch: WatchIcon,
  "jourser watch": WatchIcon,
  headphones: HeadphonesIcon,
  headphone: HeadphonesIcon,
  "electric products": ElectronicsIcon,
  "electric product": ElectronicsIcon,
  electronics: ElectronicsIcon,
  electronic: ElectronicsIcon,

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
  shoes: ShoesIcon,
  footwear: ShoesIcon,
  boots: ShoesIcon,
  sandals: ShoesIcon,

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
  shirts: TShirtIcon,
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