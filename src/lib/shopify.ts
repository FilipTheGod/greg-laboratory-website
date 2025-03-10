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

const debugLog = (label: string, obj: any) => {
  // Only log in development
  if (process.env.NODE_ENV === "development") {
    console.log(`DEBUG ${label}:`, JSON.stringify(obj, null, 2))

    // Add specific debugging for media objects
    if (obj && Array.isArray(obj)) {
      obj.forEach((item) => {
        if (item.media && Array.isArray(item.media) && item.media.length > 0) {
          console.log(`DEBUG MEDIA for ${item.title}:`, {
            mediaCount: item.media.length,
            mediaTypes: item.media.map((m) => m.mediaContentType),
            hasVideoMedia: item.media.some(
              (m) => m.mediaContentType === "VIDEO"
            ),
            firstMediaType: item.media[0]?.mediaContentType,
            firstMediaHasSources: !!item.media[0]?.sources,
            firstMediaSourcesCount: item.media[0]?.sources?.length,
          })
        }
      })
    }
  }
}
const convertToPlainObject = <T>(obj: any): T => {
  const plainObj = JSON.parse(JSON.stringify(obj))

  // Process and enhance media data
  if (plainObj && Array.isArray(plainObj)) {
    plainObj.forEach((item) => {
      // Process media data
      if (item.media && Array.isArray(item.media)) {
        // Flag products with video content for easier filtering
        item.hasVideoMedia = item.media.some(
          (m) => m.mediaContentType === "VIDEO"
        )

        // Ensure media sources are correctly structured
        item.media.forEach((mediaItem: any) => {
          if (
            mediaItem.mediaContentType === "VIDEO" &&
            (!mediaItem.sources || mediaItem.sources.length === 0)
          ) {
            console.warn(
              `Video media without sources found for product: ${item.title}`
            )
          }
        })
      }

      // Process variants/prices
      if (item.variants && Array.isArray(item.variants)) {
        item.variants.forEach((variant: any) => {
          if (
            variant.price &&
            typeof variant.price === "object" &&
            "amount" in variant.price
          ) {
            variant.priceAmount = variant.price.amount
          }
        })
      }
    })
  }

  debugLog("After conversion", plainObj)
  return plainObj as T
}

export function inspectProductMedia(product: ShopifyProduct): void {
  if (!product) {
    console.log("No product provided for media inspection")
    return
  }

  console.log(`Media inspection for ${product.title}:`, {
    hasMedia: !!product.media,
    mediaCount: product.media?.length || 0,
    mediaTypes: product.media?.map((m) => m.mediaContentType) || [],
    hasVideoMedia:
      product.media?.some((m) => m.mediaContentType === "VIDEO") || false,
    firstMediaDetails: product.media?.[0]
      ? {
          type: product.media[0].mediaContentType,
          hasSources: !!product.media[0].sources,
          sourcesCount: product.media[0].sources?.length || 0,
          firstSourceUrl: product.media[0].sources?.[0]?.url || "No URL",
          hasPreviewImage: !!product.media[0].previewImage,
        }
      : "No media",
  })
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

export async function getAllProducts(): Promise<ShopifyProduct[]> {
  try {
    console.log("Fetching all products...")
    const products = await client.product.fetchAll()
    console.log(`Fetched ${products.length} products`)

    // Enhanced debugging for media
    if (products.length > 0) {
      const productsWithVideo = products.filter(
        (p) =>
          p.media &&
          p.media.length > 0 &&
          p.media.some((m) => m.mediaContentType === "VIDEO")
      )

      console.log(
        `Found ${productsWithVideo.length} products with video content`
      )

      if (productsWithVideo.length > 0) {
        const firstVideoProduct = productsWithVideo[0]
        const videoMedia = firstVideoProduct.media.find(
          (m) => m.mediaContentType === "VIDEO"
        )

        console.log("First video product details:", {
          title: firstVideoProduct.title,
          videoMediaId: videoMedia?.id,
          videoSources: videoMedia?.sources?.map((s) => ({
            url: s.url,
            format: s.format,
          })),
          hasPreviewImage: !!videoMedia?.previewImage,
        })
      }
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

    // Add more detailed logging
    console.log(
      `Client initialized with domain: ${
        process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || "(not set)"
      }`
    )
    console.log(`Using API version: ${client.config.apiVersion}`)

    const product = await client.product.fetchByHandle(handle)

    if (!product) {
      console.log(`No product found with handle: ${handle}`)
      return null
    }

    console.log(`Found product: ${product.title}`)

    // Log more detailed information
    console.log("Product details:", {
      id: product.id,
      title: product.title,
      variants: product.variants?.length || 0,
      hasMedia: !!product.media,
      mediaLength: product.media ? product.media.length : 0,
      hasVideoMedia:
        product.media &&
        product.media.some((m) => m.mediaContentType === "VIDEO"),
      mediaTypes: product.media
        ? product.media.map((m) => m.mediaContentType)
        : [],
    })

    // Convert Shopify response to plain object
    return convertToPlainObject<ShopifyProduct>(product)
  } catch (error) {
    console.error(`Error fetching product by handle ${handle}:`, error)
    // Log more details about the error
    if (error instanceof Error) {
      console.error("Error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack,
      })
    }
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
