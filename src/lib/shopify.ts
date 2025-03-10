// src/lib/shopify.ts
import Client from "shopify-buy"

// src/lib/shopify-types.ts
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
  price:
    | string
    | {
        amount: string
        currencyCode: string
        type?: any
      }
  available?: boolean
}

export interface ShopifyMediaSource {
  url: string
  format?: string
  mimeType?: string
}

export interface ShopifyMediaPreviewImage {
  src: string
}

export interface ShopifyMedia {
  id: string
  mediaContentType: string // VIDEO, IMAGE, etc.
  previewImage?: ShopifyMediaPreviewImage
  sources?: ShopifyMediaSource[]
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
export function extractPriceAmount(
  priceValue: string | { amount: string; currencyCode: string; type?: any }
): string {
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

// Debug function to log objects
const debugLog = (label: string, obj: any) => {
  console.log(`DEBUG ${label}:`, JSON.stringify(obj, null, 2))
}

// Use this in your convertToPlainObject function to normalize price data
const convertToPlainObject = <T>(obj: any): T => {
  const plainObj = JSON.parse(JSON.stringify(obj))

  // Normalize price data if needed
  if (plainObj && Array.isArray(plainObj)) {
    plainObj.forEach((item) => {
      if (item.variants && Array.isArray(item.variants)) {
        item.variants.forEach((variant: any) => {
          // If price is a complex object, extract just the amount
          if (
            variant.price &&
            typeof variant.price === "object" &&
            "amount" in variant.price
          ) {
            // Keep the original structure but also add a priceAmount for easier access
            variant.priceAmount = variant.price.amount
          }
        })
      }
    })
  }

  debugLog("After conversion", plainObj)
  return plainObj as T
}

// Initialize the client
const client = Client.buildClient({
  domain: process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || "",
  storefrontAccessToken:
    process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN || "",
  apiVersion: "2023-07", // Or your preferred API version, e.g., '2023-10'
})

// Debug Shopify client configuration
console.log("Shopify client configuration:", {
  domain: process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || "(not set)",
  tokenProvided: !!process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN,
  apiVersion: "2023-07",
})

// Fetch all products
export async function getAllProducts(): Promise<ShopifyProduct[]> {
  try {
    console.log("Fetching all products...")
    const products = await client.product.fetchAll()
    console.log(`Fetched ${products.length} products`)

    // Check the first product for debugging
    if (products.length > 0) {
      const firstProduct = products[0]
      console.log("First product example:", {
        id: firstProduct.id,
        title: firstProduct.title,
        variants: firstProduct.variants.length,
        hasMedia: !!firstProduct.media,
        mediaLength: firstProduct.media ? firstProduct.media.length : 0,
      })

      // Check price formatting
      const firstVariant = firstProduct.variants[0]
      console.log("First variant price:", {
        rawPrice: firstVariant.price,
        asNumber: parseFloat(firstVariant.price),
        formatted: parseFloat(firstVariant.price).toFixed(2),
      })
    }

    // Convert Shopify response to plain objects to avoid serialization errors
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
    console.log("Product details:", {
      id: product.id,
      title: product.title,
      variants: product.variants.length,
      hasMedia: !!product.media,
      mediaLength: product.media ? product.media.length : 0,
    })

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
