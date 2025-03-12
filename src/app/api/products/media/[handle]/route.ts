// src/app/api/products/media/[handle]/route.ts
import { NextRequest, NextResponse } from "next/server"

// GraphQL query to get product media
const PRODUCT_MEDIA_QUERY = `
  query getProductMedia($handle: String!) {
    productByHandle(handle: $handle) {
      id
      title
      handle
      media(first: 10) {
        edges {
          node {
            id
            mediaContentType
            ... on Video {
              id
              preview {
                image {
                  url
                  altText
                  width
                  height
                }
              }
              sources {
                format
                mimeType
                url
              }
            }
            ... on ExternalVideo {
              id
              embeddedUrl
            }
            ... on MediaImage {
              id
              image {
                url
                altText
                width
                height
              }
            }
          }
        }
      }
    }
  }
`

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ handle: string }> | { handle: string } }
) {
  try {
    // Await the params if it's a Promise
    const resolvedParams = params instanceof Promise ? await params : params
    const handle = resolvedParams.handle

    if (!handle) {
      return NextResponse.json(
        { error: "Product handle is required" },
        { status: 400 }
      )
    }

    // Check if we have the required environment variables
    const shopDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN
    const adminToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN

    if (!shopDomain || !adminToken) {
      return NextResponse.json(
        { data: null, error: "Server configuration error" },
        { status: 200 } // Return 200 to avoid client errors, but include error message
      )
    }

    // Call Shopify Admin API
    try {
      const response = await fetch(
        `https://${shopDomain}/admin/api/2023-07/graphql.json`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Shopify-Access-Token": adminToken,
          },
          body: JSON.stringify({
            query: PRODUCT_MEDIA_QUERY,
            variables: {
              handle: handle,
            },
          }),
        }
      )

      if (!response.ok) {
        console.error(`API error: ${response.status} for handle ${handle}`)
        return NextResponse.json(
          { data: null, error: `Shopify API error: ${response.status}` },
          { status: 200 } // Return 200 to avoid client errors
        )
      }

      const data = await response.json()

      // Check if product exists
      if (!data.data?.productByHandle) {
        console.log(`Product not found for handle: ${handle}`)
        return NextResponse.json(
          { data: { productByHandle: null }, error: null },
          { status: 200 } // Always return 200
        )
      }

      return NextResponse.json(data, { status: 200 })
    } catch (error) {
      console.error(`Error fetching from Shopify for handle ${handle}:`, error)
      return NextResponse.json(
        { data: null, error: "Error fetching from Shopify" },
        { status: 200 } // Return 200 to avoid client errors
      )
    }
  } catch (error) {
    console.error("Error in API handler:", error)
    return NextResponse.json(
      { data: null, error: "Server error" },
      { status: 200 } // Return 200 to avoid client errors
    )
  }
}
