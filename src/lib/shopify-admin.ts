// src/lib/shopify-admin.ts
/**
 * This file contains functions to interact with the Shopify Admin API
 * Required for updating product metafields
 */

// Define types for metafield values
type MetafieldValue = string | string[] | number | boolean | null

interface ShopifyError {
  field: string
  message: string
}

// GraphQL mutation for updating a product metafield
const UPDATE_PRODUCT_METAFIELD = `
  mutation productMetafieldsSet($productId: ID!, $metafields: [MetafieldsSetInput!]!) {
    productMetafieldsSet(productId: $productId, metafields: $metafields) {
      metafields {
        key
        namespace
        value
      }
      userErrors {
        field
        message
      }
    }
  }
`

// Function to update product metafields
export async function updateProductMetafields(
  productId: string,
  namespace: string,
  key: string,
  value: MetafieldValue,
  type: string
) {
  const headers = {
    "Content-Type": "application/json",
    "X-Shopify-Access-Token": process.env.SHOPIFY_ADMIN_ACCESS_TOKEN || "",
  }

  // Convert ID to gid format if needed
  const formattedProductId = productId.includes("gid://")
    ? productId
    : `gid://shopify/Product/${productId}`

  // Prepare the request body
  const requestBody = {
    query: UPDATE_PRODUCT_METAFIELD,
    variables: {
      productId: formattedProductId,
      metafields: [
        {
          namespace,
          key,
          value: JSON.stringify(value),
          type,
        },
      ],
    },
  }

  try {
    // Make the request to Shopify Admin API
    const response = await fetch(
      `https://${process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN}/admin/api/2023-07/graphql.json`,
      {
        method: "POST",
        headers,
        body: JSON.stringify(requestBody),
      }
    )

    if (!response.ok) {
      throw new Error(`Shopify Admin API error: ${response.statusText}`)
    }

    const result = await response.json()

    // Check for errors in the response
    if (result.data?.productMetafieldsSet?.userErrors?.length > 0) {
      const errorMessages = result.data.productMetafieldsSet.userErrors
        .map((err: ShopifyError) => err.message)
        .join(", ")
      throw new Error(`Shopify API errors: ${errorMessages}`)
    }

    return result.data?.productMetafieldsSet?.metafields || []
  } catch (error) {
    console.error("Error updating product metafields:", error)
    throw error
  }
}

// Function to update product features specifically
export async function updateProductFeatures(
  productId: string,
  features: string[]
) {
  return updateProductMetafields(
    productId,
    "custom", // Using the namespace you set up in Shopify
    "features", // Using the key you set up in Shopify
    features,
    "json"
  )
}

// Function to get product ID from handle
export async function getProductIdFromHandle(handle: string) {
  const headers = {
    "Content-Type": "application/json",
    "X-Shopify-Access-Token": process.env.SHOPIFY_ADMIN_ACCESS_TOKEN || "",
  }

  const query = `
    {
      productByHandle(handle: "${handle}") {
        id
      }
    }
  `

  try {
    const response = await fetch(
      `https://${process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN}/admin/api/2023-07/graphql.json`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({ query }),
      }
    )

    if (!response.ok) {
      throw new Error(`Shopify Admin API error: ${response.statusText}`)
    }

    const result = await response.json()

    if (!result.data?.productByHandle) {
      throw new Error(`Product with handle ${handle} not found`)
    }

    return result.data.productByHandle.id
  } catch (error) {
    console.error(`Error getting product ID for handle ${handle}:`, error)
    throw error
  }
}
