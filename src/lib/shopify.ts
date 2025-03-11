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

// // Simple, focused debug logging function
// const debugLog = (label: string, obj: unknown): void => {
//   if (process.env.NODE_ENV === "development") {
//     console.log(`DEBUG ${label}:`, obj)
//   }
// }

// Add to src/lib/shopify.ts
export async function debugProductMedia(handle: string) {
  try {
    console.log(`Fetching product media debug for handle: ${handle}`)
    const product = await client.product.fetchByHandle(handle)

    console.log("Raw product data:", JSON.stringify(product, null, 2))
    console.log("Media field exists:", "media" in product)
    console.log("Media field value:", product.media)

    return product
  } catch (error) {
    console.error("Error in debug media:", error)
    return null
  }
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

// In src/lib/shopify.ts
export async function getAllProducts(): Promise<ShopifyProduct[]> {
  try {
    console.log("Fetching all products...")

    // Use query instead of fetchAll to explicitly request media fields
    const products = await client.product.fetchAll(250)
    console.log(`Fetched ${products.length} products`)

    // Debugging the first product's media
    if (products.length > 0) {
      const firstProduct = products[0]
      console.log("First product media:", {
        hasMedia: !!firstProduct.media,
        mediaCount: firstProduct.media ? firstProduct.media.length : 0,
        mediaFields: firstProduct.media
          ? Object.keys(firstProduct.media[0] || {})
          : [],
      })
    }

    // Convert Shopify response to plain objects
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
    console.log(`Fetching product with handle: ${handle}`)
    const product = await client.product.fetchByHandle(handle)

    if (!product) {
      console.log(`No product found with handle: ${handle}`)
      return null
    }

    console.log(`Found product: ${product.title}`)

    // Convert Shopify response to plain object
    return convertToPlainObject<ShopifyProduct>(product)
  } catch (error) {
    console.error(`Error fetching product by handle ${handle}:`, error)
    return null
  }
}

// Create a new checkout
export async function createCheckout() {
  try {
    console.log("Creating new checkout...")
    const checkout = await client.checkout.create()
    console.log("Checkout created:", checkout.id)
    return convertToPlainObject(checkout)
  } catch (error) {
    console.error("Error creating checkout:", error)
    throw error
  }
}

// Fetch an existing checkout
export async function fetchCheckout(checkoutId: string) {
  try {
    console.log(`Fetching checkout: ${checkoutId}`)
    const checkout = await client.checkout.fetch(checkoutId)
    console.log("Checkout fetched:", checkout.id)
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
    console.log(`Adding items to checkout: ${checkoutId}`, lineItems)
    const checkout = await client.checkout.addLineItems(checkoutId, lineItems)
    console.log("Items added to checkout")
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
    console.log(`Updating items in checkout: ${checkoutId}`, lineItems)
    const checkout = await client.checkout.updateLineItems(
      checkoutId,
      lineItems
    )
    console.log("Items updated in checkout")
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
    console.log(`Removing items from checkout: ${checkoutId}`, lineItemIds)
    const checkout = await client.checkout.removeLineItems(
      checkoutId,
      lineItemIds
    )
    console.log("Items removed from checkout")
    return convertToPlainObject(checkout)
  } catch (error) {
    console.error("Error removing checkout items:", error)
    throw error
  }
}
