// src/lib/shopify.ts
import Client from "shopify-buy"

export interface MoneyV2 {
  amount: string
  currencyCode: string
}

export interface ShopifyImage {
  id: string
  src: string
  altText?: string
  width?: number
  height?: number
}

export interface ShopifyProductVariant {
  id: string
  title: string
  price: string | MoneyV2
  available?: boolean
}

export interface ShopifyMediaSource {
  url: string
  format: string
  mimeType: string
}

export interface ShopifyMediaPreviewImage {
  src: string
  width?: number
  height?: number
  altText?: string
}

export interface ShopifyMedia {
  id: string
  mediaContentType: "VIDEO" | "IMAGE" | "EXTERNAL_VIDEO" | "MODEL_3D"
  previewImage?: ShopifyMediaPreviewImage
  sources?: ShopifyMediaSource[]
  alt?: string
}

export interface ShopifyMetafield {
  waterRepellent?: boolean
  breathable?: boolean
  stretch?: boolean
  durable?: boolean
  lightweight?: boolean
  easycare?: boolean
}

export interface ShopifyProduct {
  id: string
  title: string
  handle: string
  descriptionHtml: string
  productType: string
  images: ShopifyImage[]
  variants: ShopifyProductVariant[]
  media?: ShopifyMedia[]
  metafields?: {
    custom?: {
      features?: {
        value: {
          waterRepellent: boolean
          breathable: boolean
          stretch: boolean
          durable: boolean
          lightweight: boolean
          easycare: boolean
        }
      }
    }
  }
}

// Helper function to extract price amount regardless of format
export function extractPriceAmount(priceValue: string | MoneyV2): string {
  if (typeof priceValue === "string") {
    return priceValue
  } else if (
    typeof priceValue === "object" &&
    priceValue &&
    priceValue.amount
  ) {
    return priceValue.amount
  }
  return "0.00"
}

// Convert Shopify response to properly typed objects
const convertToPlainObject = <T>(obj: unknown): T => {
  const plainObj = JSON.parse(JSON.stringify(obj))
  return plainObj as T
}

// Initialize the client
const client = Client.buildClient({
  domain: process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || "",
  storefrontAccessToken:
    process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN || "",
  apiVersion: "2023-07",
})

// Fetch all products
export async function getAllProducts(): Promise<ShopifyProduct[]> {
  try {
    const products = await client.product.fetchAll(250)
    return convertToPlainObject<ShopifyProduct[]>(products)
  } catch (error) {
    console.error("Error fetching all products:", error)
    return []
  }
}

// Fetch a product by handle
export async function getProductByHandle(
  handle: string
): Promise<ShopifyProduct | null> {
  try {
    const product = await client.product.fetchByHandle(handle)

    if (!product) {
      return null
    }

    return convertToPlainObject<ShopifyProduct>(product)
  } catch (error) {
    console.error(`Error fetching product by handle ${handle}:`, error)
    return null
  }
}

// Create a new checkout
export async function createCheckout() {
  try {
    const checkout = await client.checkout.create()
    return convertToPlainObject(checkout)
  } catch (error) {
    console.error("Error creating checkout:", error)
    throw error
  }
}

// Fetch an existing checkout
export async function fetchCheckout(checkoutId: string) {
  try {
    const checkout = await client.checkout.fetch(checkoutId)
    return convertToPlainObject(checkout)
  } catch (error) {
    console.error("Error fetching checkout:", error)
    throw error
  }
}

// Add items to a checkout
export interface LineItem {
  variantId: string
  quantity: number
}

export async function addItemToCheckout(
  checkoutId: string,
  lineItems: LineItem[]
) {
  try {
    const checkout = await client.checkout.addLineItems(checkoutId, lineItems)
    return convertToPlainObject(checkout)
  } catch (error) {
    console.error("Error adding items to checkout:", error)
    throw error
  }
}

// Update items in a checkout
export interface LineItemUpdate {
  id: string
  quantity: number
}
export async function updateCheckoutItem(
  checkoutId: string,
  lineItems: LineItemUpdate[]
) {
  try {
    const checkout = await client.checkout.updateLineItems(
      checkoutId,
      lineItems
    )
    return convertToPlainObject(checkout)
  } catch (error) {
    console.error("Error updating checkout items:", error)
    throw error
  }
}

// Remove items from a checkout
export async function removeCheckoutItem(
  checkoutId: string,
  lineItemIds: string[]
) {
  try {
    const checkout = await client.checkout.removeLineItems(
      checkoutId,
      lineItemIds
    )
    return convertToPlainObject(checkout)
  } catch (error) {
    console.error("Error removing checkout items:", error)
    throw error
  }
}
