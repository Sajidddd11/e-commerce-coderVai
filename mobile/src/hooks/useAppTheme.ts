import { useColorScheme } from "react-native";
import { lightColors, darkColors } from "@design/theme";
import { useThemeStore } from "@stores/theme-store";
import { useEffect } from "react";

export function useAppTheme() {
  const colorScheme = useColorScheme();
  const themePreference = useThemeStore((state) => state.themePreference);
  const initThemeStore = useThemeStore((state) => state.init);

  useEffect(() => {
    initThemeStore();
  }, [initThemeStore]);

  const activeTheme = themePreference === "system" ? colorScheme : themePreference;
  const isDark = activeTheme === "dark";

  return {
    colors: isDark ? darkColors : lightColors,
    isDark,
  };
}
