import { HttpTypes } from "@medusajs/types"
import { sdk, PUBLISHABLE_KEY } from "./sdk"
import { getAuthHeaders, setToken, removeToken } from "@utils/storage"
import { getCartId, removeCartId } from "./cart"
import { mergeGuestHistory } from "./recommendations"

/**
 * Ported from web src/lib/data/customer.ts.
 * JWT stored via expo-secure-store instead of a cookie.
 */
const ACTIVE_PUBLISHABLE_KEY = PUBLISHABLE_KEY ?? ""

export async function retrieveCustomer(): Promise<HttpTypes.StoreCustomer | null> {
  const headers = await getAuthHeaders()
  if (!headers.authorization) return null

  return sdk.client
    .fetch<{ customer: HttpTypes.StoreCustomer }>("/store/customers/me", {
      method: "GET",
      query: { fields: "*orders" },
      headers,
    })
    .then(({ customer }) => customer)
    .catch(() => null)
}

/** Merge the guest cart into the customer account after auth. */
export async function transferCart(): Promise<void> {
  const cartId = await getCartId()
  if (!cartId) return

  const headers = await getAuthHeaders()
  await sdk.store.cart.transferCart(cartId, {}, headers).catch(() => null)
}

export async function login({
  email,
  password,
}: {
  email: string
  password: string
}): Promise<{ success: boolean; error?: string }> {
  try {
    const token = await sdk.auth.login("customer", "emailpass", {
      email,
      password,
    })

    if (typeof token !== "string") {
      return { success: false, error: "Authentication requires more steps" }
    }

    await setToken(token)
    await transferCart()

    // Merge guest browsing history to this customer's account (fire-and-forget)
    const customer = await retrieveCustomer()
    if (customer?.id) {
      mergeGuestHistory(customer.id).catch(() => null)
    }

    return { success: true }
  } catch (e: any) {
    return { success: false, error: e?.message ?? "Wrong email or password" }
  }
}

export async function signup({
  email,
  password,
  first_name,
  last_name,
  phone,
}: {
  email: string
  password: string
  first_name?: string
  last_name?: string
  phone?: string
}): Promise<{ success: boolean; error?: string }> {
  try {
    const registerToken = await sdk.auth.register("customer", "emailpass", {
      email,
      password,
    })

    const headers = { authorization: `Bearer ${registerToken}` }

    await sdk.store.customer.create(
      { email, first_name, last_name, phone },
      {},
      headers
    )

    const loginToken = await sdk.auth.login("customer", "emailpass", {
      email,
      password,
    })

    if (typeof loginToken === "string") {
      await setToken(loginToken)
      await transferCart()

      // Merge guest browsing history after signup
      const customer = await retrieveCustomer()
      if (customer?.id) {
        mergeGuestHistory(customer.id).catch(() => null)
      }
    }

    return { success: true }
  } catch (e: any) {
    return { success: false, error: e?.message ?? "Could not create account" }
  }
}

export async function signout(): Promise<void> {
  await sdk.auth.logout().catch(() => null)
  await removeToken()
  await removeCartId()
}

export async function updateCustomer(
  body: HttpTypes.StoreUpdateCustomer
): Promise<{ success: boolean; error?: string; customer?: HttpTypes.StoreCustomer }> {
  try {
    const headers = await getAuthHeaders()
    const { customer } = await sdk.store.customer.update(body, {}, headers)
    return { success: true, customer }
  } catch (e: any) {
    return { success: false, error: e?.message ?? "Could not update profile" }
  }
}

export async function listCustomerAddresses(): Promise<
  HttpTypes.StoreCustomerAddress[]
> {
  const headers = await getAuthHeaders()
  if (!headers.authorization) return []

  return sdk.store.customer
    .listAddress({}, headers)
    .then(({ addresses }) => addresses)
    .catch(() => [])
}

export async function addCustomerAddress(
  address: HttpTypes.StoreCreateCustomerAddress
): Promise<{ success: boolean; error?: string }> {
  try {
    const headers = await getAuthHeaders()
    await sdk.store.customer.createAddress(address, {}, headers)
    return { success: true }
  } catch (e: any) {
    return { success: false, error: e?.message ?? "Could not add address" }
  }
}

export async function updateCustomerAddress(
  addressId: string,
  address: HttpTypes.StoreUpdateCustomerAddress
): Promise<{ success: boolean; error?: string }> {
  try {
    const headers = await getAuthHeaders()
    await sdk.store.customer.updateAddress(addressId, address, {}, headers)
    return { success: true }
  } catch (e: any) {
    return { success: false, error: e?.message ?? "Could not update address" }
  }
}

export async function deleteCustomerAddress(
  addressId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const headers = await getAuthHeaders()
    await sdk.store.customer.deleteAddress(addressId, headers)
    return { success: true }
  } catch (e: any) {
    return { success: false, error: e?.message ?? "Could not delete address" }
  }
}

export async function registerWithGoogleDetails(body: {
  authIdentityId: string
  email: string
  first_name: string
  last_name: string
  phone: string
}): Promise<{ success: boolean; token?: string; error?: string }> {
  try {
    const response = await sdk.client.fetch<{ success: boolean; token: string; message?: string }>(
      "/store/auth/google-register",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-publishable-api-key": ACTIVE_PUBLISHABLE_KEY,
        },
        body,
      }
    )

    if (!response.success || !response.token) {
      return { success: false, error: response.message || "Registration failed." }
    }

    await setToken(response.token)
    await transferCart()

    // Merge guest browsing history after registration
    const customer = await retrieveCustomer()
    if (customer?.id) {
      mergeGuestHistory(customer.id).catch(() => null)
    }

    return { success: true, token: response.token }
  } catch (e: any) {
    return { success: false, error: e?.message ?? "Could not complete registration" }
  }
}

export async function requestPhoneOtp(phone: string): Promise<{ success: boolean; message?: string }> {
  try {
    console.log("[DEBUG] requestPhoneOtp phone:", phone);
    console.log("[DEBUG] requestPhoneOtp publishable key:", ACTIVE_PUBLISHABLE_KEY);
    return await sdk.client.fetch<{ success: boolean; message?: string }>("/store/auth/phone-send-otp", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "x-publishable-api-key": ACTIVE_PUBLISHABLE_KEY,
      },
      body: { phone },
    })
  } catch (e: any) {
    return { success: false, message: e?.message ?? "Failed to request code." }
  }
}

export async function verifyPhoneOtp(
  phone: string,
  otp: string
): Promise<{ success: boolean; exists?: boolean; email?: string; message?: string }> {
  try {
    return await sdk.client.fetch<{ success: boolean; exists?: boolean; email?: string; message?: string }>(
      "/store/auth/phone-verify-otp",
      {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-publishable-api-key": ACTIVE_PUBLISHABLE_KEY,
        },
        body: { phone, otp },
      }
    )
  } catch (e: any) {
    return { success: false, message: e?.message ?? "Failed to verify code." }
  }
}

export async function signupWithPhone(body: {
  phone: string
  otp: string
  first_name: string
  last_name?: string
  password?: string
}): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await sdk.client.fetch<{ success: boolean; token?: string; message?: string }>(
      "/store/auth/phone-register",
      {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-publishable-api-key": ACTIVE_PUBLISHABLE_KEY,
        },
        body,
      }
    )

    if (!response.success || !response.token) {
      return { success: false, error: response.message || "Registration failed." }
    }

    await setToken(response.token)
    await transferCart()

    const customer = await retrieveCustomer()
    if (customer?.id) {
      mergeGuestHistory(customer.id).catch(() => null)
    }

    return { success: true }
  } catch (e: any) {
    return { success: false, error: e?.message ?? "Could not complete phone registration" }
  }
}
