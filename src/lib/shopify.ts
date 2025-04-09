// src/lib/shopify.ts - Updated to fetch metafields
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

// Updated interface definition for metafields
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
    [key: string]: {
      value: string | boolean | number | null
      type?: string
      namespace?: string
      key?: string
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

// Create a custom client with direct GraphQL access
const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || ""
const storefrontAccessToken = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN || ""

const client = Client.buildClient({
  domain,
  storefrontAccessToken,
  apiVersion: "2023-07",
})

// Convert Shopify response to properly typed objects
const convertToPlainObject = <T>(obj: unknown): T => {
  // First stringify and parse to ensure we have a plain object
  const plainObj = JSON.parse(JSON.stringify(obj))

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

// Fetch a single product by handle WITH metafields
export async function getProductByHandle(
  handle: string
): Promise<ShopifyProduct | null> {
  try {
    console.log(`Fetching product with handle: ${handle}`)

    // First use the SDK to get the product
    const sdkProduct = await client.product.fetchByHandle(handle)

    if (!sdkProduct) {
      console.log(`No product found with handle: ${handle}`)
      return null
    }

    // Convert the SDK product to our format
    const product = convertToPlainObject<ShopifyProduct>(sdkProduct)

    // Now fetch metafields using a direct GraphQL query
    try {
      // Construct a simple fetch request to the Storefront API
      const response = await fetch(
        `https://${domain}/api/2023-07/graphql.json`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Shopify-Storefront-Access-Token": storefrontAccessToken,
          },
          body: JSON.stringify({
            query: `
              query GetProductMetafields($handle: String!) {
                productByHandle(handle: $handle) {
                  metafields(namespace: "features", first: 20) {
                    edges {
                      node {
                        namespace
                        key
                        value
                      }
                    }
                  }
                }
              }
            `,
            variables: {
              handle: handle,
            },
          }),
        }
      )

      const metafieldData = await response.json()
      console.log("Metafield Response:", metafieldData)

      if (metafieldData?.data?.productByHandle?.metafields?.edges) {
        // Add metafields to our product object
        product.metafields = {}

        metafieldData.data.productByHandle.metafields.edges.forEach(
          (edge: any) => {
            const { namespace, key, value } = edge.node
            const metafieldKey = `${namespace}.${key}`

            product.metafields![metafieldKey] = {
              value: value === "true" ? true : value === "false" ? false : value,
              namespace: namespace,
              key: key,
            }
          }
        )

        console.log("Processed metafields:", product.metafields)
      }
    } catch (metafieldError) {
      console.error("Error fetching metafields:", metafieldError)
    }

    return product
  } catch (error) {
    console.error(`Error fetching product by handle ${handle}:`, error)
    return null
  }
}

// The rest of your other functions (createCheckout, fetchCheckout, etc.)
// would remain the same...

export async function getAllProducts(): Promise<ShopifyProduct[]> {
  try {
    console.log("Fetching all products from Shopify...")

    // Get products using the SDK method
    const products = await client.product.fetchAll()

    // Process products to format them correctly
    const formattedProducts = products.map((product: any) => {
      return convertToPlainObject<ShopifyProduct>(product)
    })

    // Note: Metafields aren't included in the fetchAll response
    // If you need metafields, you'd need to fetch them separately for each product

    return formattedProducts
  } catch (error) {
    console.error("Error fetching all products:", error)
    return []
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