import * as SecureStore from "expo-secure-store"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { Platform } from "react-native"

/**
 * Replaces web cookie-based auth/cart storage.
 *   - JWT  → expo-secure-store (encrypted)   [web: _medusa_jwt cookie]
 *   - Cart → AsyncStorage                     [web: _medusa_cart_id cookie]
 */

const JWT_KEY = "medusa_jwt"
const useSecure = Platform.OS !== "web"

export const STORAGE_KEYS = {
  cartId: "medusa_cart_id",
  cartIdSsl: "medusa_cart_id_ssl",
  checkoutForm: "checkout_form_state",
  region: "medusa_region",
} as const

async function secureGet(key: string): Promise<string | null> {
  try {
    if (useSecure) return await SecureStore.getItemAsync(key)
    return await AsyncStorage.getItem(key)
  } catch {
    return null
  }
}

async function secureSet(key: string, value: string): Promise<void> {
  try {
    if (useSecure) await SecureStore.setItemAsync(key, value)
    else await AsyncStorage.setItem(key, value)
  } catch {
    // no-op
  }
}

async function secureDelete(key: string): Promise<void> {
  try {
    if (useSecure) await SecureStore.deleteItemAsync(key)
    else await AsyncStorage.removeItem(key)
  } catch {
    // no-op
  }
}

export const getToken = () => secureGet(JWT_KEY)
export const setToken = (token: string) => secureSet(JWT_KEY, token)
export const removeToken = () => secureDelete(JWT_KEY)

export async function getAuthHeaders(): Promise<Record<string, string>> {
  const token = await getToken()
  return token ? { authorization: `Bearer ${token}` } : {}
}

/** Plain (non-encrypted) key/value storage for cart id, drafts, etc. */
export const storage = {
  get: (key: string) => AsyncStorage.getItem(key),
  set: (key: string, value: string) => AsyncStorage.setItem(key, value),
  remove: (key: string) => AsyncStorage.removeItem(key),
}
