// src/lib/shopify.ts
import Client from "shopify-buy"

// Define types for the line items
interface LineItem {
  variantId: string
  quantity: number
}

interface LineItemUpdate {
  id: string
  quantity: number
}

// Define Shopify product types
export interface ShopifyVariant {
  id: string
  title: string
  price: string
  available?: boolean
  image?: string
}

export interface ShopifyImage {
  src: string
  alt?: string
}

export interface ShopifyProduct {
  id: string
  title: string
  handle: string
  productType: string
  descriptionHtml: string
  variants: ShopifyVariant[]
  images: ShopifyImage[]
}

// Create a Shopify client
const client = Client.buildClient({
  domain: process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN!,
  storefrontAccessToken:
    process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN!,
  apiVersion: "2024-01", // Required apiVersion
})

export async function getAllProducts(): Promise<ShopifyProduct[]> {
  try {
    const products = await client.product.fetchAll()
    return JSON.parse(JSON.stringify(products))
  } catch (error) {
    console.error("Error fetching all products:", error)
    return []
  }
}

export async function getProductByHandle(
  handle: string
): Promise<ShopifyProduct | null> {
  try {
    if (!handle) {
      throw new Error("Product handle is undefined")
    }
    const product = await client.product.fetchByHandle(handle)
    return JSON.parse(JSON.stringify(product))
  } catch (error) {
    console.error(`Error fetching product with handle ${handle}:`, error)
    return null
  }
}

// Cart functions using the new Cart API
export async function createCart() {
  try {
    const cart = await client.cart.create()
    return cart
  } catch (error) {
    console.error("Error creating cart:", error)
    throw error
  }
}

export async function fetchCart(cartId: string) {
  try {
    const cart = await client.cart.fetch(cartId)
    return cart
  } catch (error) {
    console.error("Error fetching cart:", error)
    throw error
  }
}

export async function addItemToCart(
  cartId: string,
  lineItemsToAdd: LineItem[]
) {
  try {
    const cart = await client.cart.addLineItems(cartId, lineItemsToAdd)
    return cart
  } catch (error) {
    console.error("Error adding item to cart:", error)
    throw error
  }
}

export async function updateCartItem(
  cartId: string,
  lineItemsToUpdate: LineItemUpdate[]
) {
  try {
    const cart = await client.cart.updateLineItems(cartId, lineItemsToUpdate)
    return cart
  } catch (error) {
    console.error("Error updating cart item:", error)
    throw error
  }
}

export async function removeCartItem(
  cartId: string,
  lineItemIdsToRemove: string[]
) {
  try {
    const cart = await client.cart.removeLineItems(cartId, lineItemIdsToRemove)
    return cart
  } catch (error) {
    console.error("Error removing cart item:", error)
    throw error
  }
}

// For backwards compatibility (these will use the Cart API internally)
export async function createCheckout() {
  return createCart()
}

export async function fetchCheckout(checkoutId: string) {
  return fetchCart(checkoutId)
}

export async function addItemToCheckout(
  checkoutId: string,
  lineItemsToAdd: LineItem[]
) {
  return addItemToCart(checkoutId, lineItemsToAdd)
}

export async function updateCheckoutItem(
  checkoutId: string,
  lineItemsToUpdate: LineItemUpdate[]
) {
  return updateCartItem(checkoutId, lineItemsToUpdate)
}

export async function removeCheckoutItem(
  checkoutId: string,
  lineItemIdsToRemove: string[]
) {
  return removeCartItem(checkoutId, lineItemIdsToRemove)
}

export default client
