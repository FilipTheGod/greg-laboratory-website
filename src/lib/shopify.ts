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

// Define interface for metafield data
export interface ShopifyMetafield {
  namespace: string
  key: string
  value: string
  type?: string
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

// Create a custom client with direct GraphQL access
const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || ""
const storefrontAccessToken =
  process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN || ""

const client = Client.buildClient({
  domain,
  storefrontAccessToken,
  apiVersion: "2023-07",
})

// Define GraphQL types
interface ShopifyGraphQLEdge<T> {
  node: T;
  cursor?: string;
}

interface ShopifyGraphQLConnection<T> {
  edges: ShopifyGraphQLEdge<T>[];
  pageInfo?: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

interface ShopifyGraphQLImage {
  id: string;
  src: string;
  altText: string | null;
}

interface ShopifyGraphQLVariant {
  id: string;
  title: string;
  price: {
    amount: string;
    currencyCode: string;
  };
  availableForSale: boolean;
  quantityAvailable: number;
}

interface ShopifyGraphQLMedia {
  id?: string;
  mediaContentType: "VIDEO" | "IMAGE" | "EXTERNAL_VIDEO" | "MODEL_3D";
  alt: string | null;
  previewImage: {
    src: string;
    altText: string | null;
  } | null;
  sources?: ShopifyMediaSource[];
}

interface ShopifyGraphQLProduct {
  id: string;
  title: string;
  handle: string;
  descriptionHtml: string;
  productType: string;
  variants: ShopifyGraphQLConnection<ShopifyGraphQLVariant>;
  images: ShopifyGraphQLConnection<ShopifyGraphQLImage>;
  media: ShopifyGraphQLConnection<ShopifyGraphQLMedia>;
}

// Custom GraphQL fetch function for direct API access
async function shopifyGraphQLFetch(query: string) {
  const URL = `https://${domain}/api/2023-07/graphql.json`

  const response = await fetch(URL, {
    method: "POST",
    headers: {
      "X-Shopify-Storefront-Access-Token": storefrontAccessToken,
      "Accept": "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query })
  })

  return response.json()
}

// Helper function to convert API response to properly typed objects
const convertToPlainObject = <T>(obj: unknown): T => {
  // First stringify and parse to ensure we have a plain object
  const plainObj = JSON.parse(JSON.stringify(obj))

  // Process variants to add inventory information if needed
  if (plainObj && plainObj.variants && Array.isArray(plainObj.variants)) {
    plainObj.variants = plainObj.variants.map(
      (variant: Record<string, unknown>) => {
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

// Format product data from GraphQL response to match our ShopifyProduct interface
function formatGraphQLProduct(product: ShopifyGraphQLProduct): ShopifyProduct {
  // Convert images from edges/node structure
  const images = product.images?.edges?.map((edge) => ({
    id: edge.node.id,
    src: edge.node.src,
    altText: edge.node.altText || undefined,
  })) || []

  // Convert variants from edges/node structure
  const variants = product.variants?.edges?.map((edge) => ({
    id: edge.node.id,
    title: edge.node.title,
    price: edge.node.price.amount, // Extract amount as string
    available: edge.node.availableForSale, // Use availableForSale
    inventoryQuantity: edge.node.quantityAvailable,
  })) || []

  // Convert media from edges/node structure with special handling for videos
  const media = product.media?.edges?.map((edge) => {
    const node = edge.node
    const mediaObject: ShopifyMedia = {
      id: node.id || `media-${Math.random().toString(36).substr(2, 9)}`,
      mediaContentType: node.mediaContentType,
      alt: node.alt || undefined,
      previewImage: node.previewImage ? {
        src: node.previewImage.src,
        altText: node.previewImage.altText || undefined,
      } : undefined,
    }

    // Add sources for VIDEO type
    if (node.mediaContentType === "VIDEO" && node.sources) {
      mediaObject.sources = node.sources.map((source) => ({
        url: source.url,
        format: source.format,
        mimeType: source.mimeType,
      }))
    }

    return mediaObject
  }) || []

  return {
    id: product.id,
    title: product.title,
    handle: product.handle,
    descriptionHtml: product.descriptionHtml,
    productType: product.productType,
    images,
    variants,
    media,
    metafields: {},
  }
}

// Feature keys we want to check for - must match the keys in Shopify
const featureKeys = [
  "stretch",
  "breathable",
  "water_repellent",
  "light_weight",
  "quick_dry",
  "anti_pilling",
  "easy_care",
  "antistatic_thread",
  "keep_warm",
  "cotton_touch",
  "uv_cut",
  "washable",
  "eco",
  "water_proof",
  "water_absorption",
]

// Fetch a single product by handle WITH metafields and media including video sources
export async function getProductByHandle(
  handle: string
): Promise<ShopifyProduct | null> {
  try {
    console.log(`Fetching product with handle: ${handle}`)

    // Define query with GraphQL fragment for videos
    const query = `
    {
      productByHandle(handle: "${handle}") {
        id
        title
        handle
        descriptionHtml
        productType
        variants(first: 100) {
          edges {
            node {
              id
              title
              price {
                amount
                currencyCode
              }
              availableForSale
              quantityAvailable
            }
          }
        }
        images(first: 20) {
          edges {
            node {
              id
              src
              altText
            }
          }
        }
        media(first: 10) {
          edges {
            node {
              id
              mediaContentType
              alt
              previewImage {
                src
                altText
              }
              ... on Video {
                sources {
                  url
                  format
                  mimeType
                }
              }
            }
          }
        }
      }
    }
    `

    // Execute the GraphQL query
    const result = await shopifyGraphQLFetch(query)
    console.log("Query result:", JSON.stringify(result, null, 2))

    if (!result.data?.productByHandle) {
      console.log(`No product found with handle: ${handle}`)
      return null
    }

    // Convert product to our format
    const product = formatGraphQLProduct(result.data.productByHandle)

    // Now fetch metafields for each feature using individual queries
    try {
      // Initialize metafields object if needed
      product.metafields = product.metafields || {}

      // Query the metafields one by one (current API requirement)
      for (const key of featureKeys) {
        const metafieldQuery = `
          query GetProductMetafield($handle: String!) {
            productByHandle(handle: $handle) {
              metafield(namespace: "features", key: "${key}") {
                namespace
                key
                value
              }
            }
          }
        `

        // Execute the GraphQL query
        const response = await fetch(
          `https://${domain}/api/2023-07/graphql.json`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Shopify-Storefront-Access-Token": storefrontAccessToken,
            },
            body: JSON.stringify({
              query: metafieldQuery,
              variables: { handle },
            }),
          }
        )

        // Parse the response
        const metafieldResult = await response.json()

        // Extract the metafield data if it exists
        if (metafieldResult.data?.productByHandle?.metafield) {
          const metafield = metafieldResult.data.productByHandle.metafield
          const metafieldKey = `features.${metafield.key}`

          // Add to product metafields, converting string "true"/"false" to boolean
          product.metafields[metafieldKey] = {
            value:
              metafield.value === "true"
                ? true
                : metafield.value === "false"
                ? false
                : metafield.value,
            namespace: metafield.namespace,
            key: metafield.key,
          }

          console.log(
            `Found metafield ${metafieldKey} with value: ${metafield.value}`
          )
        }
      }

      // Log the final metafields object
      console.log("Processed metafields:", product.metafields)
    } catch (metafieldError) {
      console.error("Error fetching metafields:", metafieldError)
    }

    return product
  } catch (error) {
    console.error(`Error fetching product by handle ${handle}:`, error)
    return null
  }
}

// Updated getAllProducts function with video support
export async function getAllProducts(): Promise<ShopifyProduct[]> {
  try {
    console.log("Fetching all products from Shopify...")

    // Define your GraphQL query with Video fragment
    const query = `
    {
      products(first: 250) {
        edges {
          node {
            id
            title
            handle
            descriptionHtml
            productType
            variants(first: 100) {
              edges {
                node {
                  id
                  title
                  price {
                    amount
                    currencyCode
                  }
                  availableForSale
                  quantityAvailable
                }
              }
            }
            images(first: 20) {
              edges {
                node {
                  id
                  src
                  altText
                }
              }
            }
            media(first: 10) {
              edges {
                node {
                  id
                  mediaContentType
                  alt
                  previewImage {
                    src
                    altText
                  }
                  ... on Video {
                    sources {
                      url
                      format
                      mimeType
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    `

    // Execute the GraphQL query
    const result = await shopifyGraphQLFetch(query)

    console.log("GraphQL Response:", JSON.stringify(result, null, 2))

    if (!result.data?.products?.edges) {
      console.log("No products found or invalid response format")
      return []
    }

    console.log("Raw product count:", result.data.products.edges.length)

    // Process the GraphQL response
    const products = result.data.products.edges.map((edge: ShopifyGraphQLEdge<ShopifyGraphQLProduct>) =>
      formatGraphQLProduct(edge.node)
    )

    console.log(`Found ${products.length} formatted products`)

    // Log each product's type for debugging category filtering
    products.forEach((product: ShopifyProduct) => {
      console.log(`Product: ${product.title}, Type: ${product.productType}`)
    })

    return products
  } catch (error) {
    console.error("Error fetching all products:", error)
    return []
  }
}

// The rest of your functions can stay the same...

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