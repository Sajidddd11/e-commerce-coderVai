import { Tabs } from "expo-router"
import { Home, ShoppingBag, ShoppingCart, User } from "lucide-react-native"
import { useBootstrap } from "@hooks/useBootstrap"
import { useCartStore } from "@stores/cart-store"
import { colors } from "@design/theme"
import { fontFamily, fontSize } from "@design/typography"

export default function TabsLayout() {
  useBootstrap()
  const itemCount = useCartStore((s) => s.itemCount)

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brand.teal,
        tabBarInactiveTintColor: colors.grey[50],
        tabBarStyle: {
          backgroundColor: colors.grey[0],
          borderTopColor: colors.grey[20],
        },
        tabBarLabelStyle: {
          fontFamily: fontFamily.bodyMedium,
          fontSize: fontSize.xs,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="shop"
        options={{
          title: "Shop",
          tabBarIcon: ({ color, size }) => (
            <ShoppingBag color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: "Cart",
          tabBarBadge: itemCount > 0 ? itemCount : undefined,
          tabBarBadgeStyle: { backgroundColor: colors.sale, color: colors.grey[0] },
          tabBarIcon: ({ color, size }) => (
            <ShoppingCart color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: "Account",
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tabs>
  )
}
