// src/lib/shopify.ts (Fixed version)
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
  inventoryQuantity?: number
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
    features?: {
      value: string[] | string // Can be either array or stringified JSON
      type: "json"
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
  // First stringify and parse to ensure we have a plain object
  const plainObj = JSON.parse(JSON.stringify(obj))

  // Log the object structure for debugging (remove in production)
  console.log(
    "Raw Shopify response object structure:",
    Object.keys(plainObj).length > 0 ? Object.keys(plainObj) : "Empty object"
  )

  // Special processing for media items to ensure they're properly mapped
  if (plainObj && "media" in plainObj) {
    console.log(
      "Media found in product:",
      Array.isArray(plainObj.media)
        ? `${plainObj.media.length} items`
        : "Format not as expected"
    )
  }

  // If this is a product object, process its variants to add inventory information
  if (plainObj && plainObj.variants && Array.isArray(plainObj.variants)) {
    plainObj.variants = plainObj.variants.map(
      (variant: Record<string, unknown>) => {
        // Extract inventory quantity if available
        if (
          typeof variant === "object" &&
          variant &&
          "quantityAvailable" in variant
        ) {
          variant.inventoryQuantity = variant.quantityAvailable
        }
        return variant
      }
    )
  }

  return plainObj as T
}

// Initialize the client
const client = Client.buildClient({
  domain: process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || "",
  storefrontAccessToken:
    process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN || "",
  apiVersion: "2023-07", // Make sure this matches your Shopify store's API version
})

// Fetch all products
export async function getAllProducts(): Promise<ShopifyProduct[]> {
  try {
    console.log("Fetching all products from Shopify...")
    const products = await client.product.fetchAll(250)

    console.log(
      `Fetched ${Array.isArray(products) ? products.length : 0} products`
    )

    // Check if media is present in the first product
    if (Array.isArray(products) && products.length > 0) {
      const firstProduct = products[0]
      console.log(
        "First product media check:",
        "media" in firstProduct
          ? `Has media field with ${
              (firstProduct as unknown as { media: unknown[] }).media?.length ||
              0
            } items`
          : "No media field found"
      )
    }

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

    // Debug log to check media
    if ("media" in product) {
      console.log(
        `Product ${handle} media:`,
        Array.isArray((product as unknown as { media: unknown[] }).media)
          ? `${(product as unknown as { media: unknown[] }).media.length} items`
          : "Media property exists but isn't an array"
      )
    } else {
      console.log(`No media property found in product ${handle}`)
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
    // Convert IDs to ensure they're in the correct format
    const formattedLineItems = lineItems.map((item) => ({
      variantId: item.variantId,
      quantity: item.quantity,
    }))

    const checkout = await client.checkout.addLineItems(
      checkoutId,
      formattedLineItems
    )
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
    // Make sure we have properly formatted lineItem IDs (internal Shopify IDs)
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
    // Make sure we have properly formatted lineItem IDs (internal Shopify IDs)
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
