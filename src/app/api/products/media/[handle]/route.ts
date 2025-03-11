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
  { params }: { params: { handle: string } }
) {
  // Make sure params.handle is a string before using it
  const handle = params.handle

  if (!handle) {
    return NextResponse.json(
      { error: "Product handle is required" },
      { status: 400 }
    )
  }

  try {
    // Check if we have the required environment variables
    const shopDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN
    const adminToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN

    if (!shopDomain || !adminToken) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      )
    }

    // Call Shopify Admin API
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
      throw new Error(`HTTP error! Status: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching product media:", error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
