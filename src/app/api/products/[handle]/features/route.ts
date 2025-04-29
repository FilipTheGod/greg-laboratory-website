// src/app/api/products/[handle]/features/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getProductByHandle } from "@/lib/shopify"
import { FeatureType } from "@/components/products/ProductFeatureIcon"

// GET request handler to fetch product features
export async function GET(
  request: NextRequest,
  context: { params: { handle: string } }
) {
  const { handle } = context.params

  if (!handle) {
    return NextResponse.json(
      { error: "Product handle is required" },
      { status: 400 }
    )
  }

  try {
    // Fetch the product
    const product = await getProductByHandle(handle)

    // If product doesn't exist
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Extract features from metafields
    let features: FeatureType[] = []

    if (
      product.metafields &&
      product.metafields.features &&
      product.metafields.features.value
    ) {
      // Parse the features value if it's a string
      if (typeof product.metafields.features.value === "string") {
        try {
          features = JSON.parse(
            product.metafields.features.value
          ) as FeatureType[]
        } catch (error) {
          console.error(`Error parsing features for ${handle}:`, error)
        }
      } else if (Array.isArray(product.metafields.features.value)) {
        features = product.metafields.features.value as FeatureType[]
      }
    }

    // Return the product features along with basic product info
    return NextResponse.json({
      handle: product.handle,
      title: product.title,
      productType: product.productType,
      features,
    })
  } catch (error) {
    console.error(`Error fetching features for product ${handle}:`, error)
    return NextResponse.json(
      { error: "Failed to fetch product features" },
      { status: 500 }
    )
  }
}

// POST request handler to update product features
export async function POST(
  request: NextRequest,
  { params }: { params: { handle: string } }
) {
  const handle = params.handle

  if (!handle) {
    return NextResponse.json(
      { error: "Product handle is required" },
      { status: 400 }
    )
  }

  try {
    // Parse the request body
    const body = await request.json()

    // Validate the features array
    if (!body.features || !Array.isArray(body.features)) {
      return NextResponse.json(
        { error: "Features array is required" },
        { status: 400 }
      )
    }

    // Fetch the product to verify it exists
    const product = await getProductByHandle(handle)

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Update the product metafields in Shopify using the Admin API
    try {
      // Import the admin API functions
      const { getProductIdFromHandle, updateProductFeatures } = await import(
        "@/lib/shopify-admin"
      )

      // Get the product ID from its handle
      const productId = await getProductIdFromHandle(handle)

      // Update the features metafield
      await updateProductFeatures(productId, body.features)
    } catch (adminError) {
      console.error(
        `Error updating Shopify metafields for ${handle}:`,
        adminError
      )
      return NextResponse.json(
        { error: "Failed to update product features in Shopify" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Features updated successfully",
      handle: product.handle,
      title: product.title,
      features: body.features,
    })
  } catch (error) {
    console.error(`Error updating features for product ${handle}:`, error)
    return NextResponse.json(
      { error: "Failed to update product features" },
      { status: 500 }
    )
  }
}
