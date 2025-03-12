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

// Function to check if we have the necessary environment variables
function hasRequiredCredentials(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN &&
    process.env.SHOPIFY_ADMIN_ACCESS_TOKEN
  )
}

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
    if (!hasRequiredCredentials()) {
      // Return a standardized empty response instead of an error
      return NextResponse.json(
        {
          data: {
            productByHandle: {
              media: { edges: [] },
            },
          },
        },
        { status: 200 }
      )
    }

    const shopDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN
    const adminToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN

    // Call Shopify Admin API
    try {
      const response = await fetch(
        `https://${shopDomain}/admin/api/2023-07/graphql.json`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Shopify-Access-Token": adminToken as string,
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
        // Return a standardized empty response instead of an error
        return NextResponse.json(
          {
            data: {
              productByHandle: {
                media: { edges: [] },
              },
            },
          },
          { status: 200 }
        )
      }

      const data = await response.json()

      // Check if product exists
      if (!data.data?.productByHandle) {
        // Return a standardized empty response
        return NextResponse.json(
          {
            data: {
              productByHandle: {
                media: { edges: [] },
              },
            },
          },
          { status: 200 }
        )
      }

      return NextResponse.json(data, { status: 200 })
    } catch (error) {
      console.error(`Error fetching from Shopify for handle ${handle}:`, error)
      // Return a standardized empty response instead of an error
      return NextResponse.json(
        {
          data: {
            productByHandle: {
              media: { edges: [] },
            },
          },
        },
        { status: 200 }
      )
    }
  } catch (error) {
    console.error("Error in API handler:", error)
    // Return a standardized empty response instead of an error
    return NextResponse.json(
      {
        data: {
          productByHandle: {
            media: { edges: [] },
          },
        },
      },
      { status: 200 }
    )
  }
}
