// src/lib/shopify.ts
import Client from "shopify-buy"

// Create a Shopify client
const client = Client.buildClient({
  domain: process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN!,
  storefrontAccessToken:
    process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN!,
  apiVersion: "",
})

export async function getAllProducts() {
  try {
    const products = await client.product.fetchAll()
    return JSON.parse(JSON.stringify(products))
  } catch (error) {
    console.error("Error fetching all products:", error)
    return []
  }
}

export async function getProductByHandle(handle: string) {
  try {
    const product = await client.product.fetchByHandle(handle)
    return JSON.parse(JSON.stringify(product))
  } catch (error) {
    console.error(`Error fetching product with handle ${handle}:`, error)
    return null
  }
}

// Checkout functions
export async function createCheckout() {
  try {
    const checkout = await client.checkout.create()
    return checkout
  } catch (error) {
    console.error("Error creating checkout:", error)
    throw error
  }
}

export async function fetchCheckout(checkoutId: string) {
  try {
    const checkout = await client.checkout.fetch(checkoutId)
    return checkout
  } catch (error) {
    console.error("Error fetching checkout:", error)
    throw error
  }
}

export async function addItemToCheckout(
  checkoutId: string,
  lineItemsToAdd: any[]
) {
  try {
    const checkout = await client.checkout.addLineItems(
      checkoutId,
      lineItemsToAdd
    )
    return checkout
  } catch (error) {
    console.error("Error adding item to checkout:", error)
    throw error
  }
}

export async function updateCheckoutItem(
  checkoutId: string,
  lineItemsToUpdate: any[]
) {
  try {
    const checkout = await client.checkout.updateLineItems(
      checkoutId,
      lineItemsToUpdate
    )
    return checkout
  } catch (error) {
    console.error("Error updating checkout item:", error)
    throw error
  }
}

export async function removeCheckoutItem(
  checkoutId: string,
  lineItemIdsToRemove: string[]
) {
  try {
    const checkout = await client.checkout.removeLineItems(
      checkoutId,
      lineItemIdsToRemove
    )
    return checkout
  } catch (error) {
    console.error("Error removing checkout item:", error)
    throw error
  }
}

export default client
