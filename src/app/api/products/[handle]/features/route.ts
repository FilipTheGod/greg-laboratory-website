// src/app/api/products/[handle]/features/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getProductByHandle } from "@/lib/shopify"
import { FeatureType } from "@/components/products/ProductFeatureIcon"

// GET request handler to fetch product features
export async function GET(
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
      Array.isArray(product.metafields.features.value)
    ) {
      features = product.metafields.features.value as FeatureType[]
    }

    // Return the features
    return NextResponse.json({
      handle: product.handle,
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

    // In a real implementation, you would update the product metafields in Shopify here
    // This would require using the Shopify Admin API, which needs an admin access token

    // For now, we'll just simulate a successful update
    // In a real implementation, you would replace this with an actual API call

    // Example with Shopify Admin API (pseudocode):
    // const response = await shopifyAdminClient.product.updateMetafields({
    //   productId: product.id,
    //   metafields: [
    //     {
    //       key: "features",
    //       namespace: "custom",
    //       value: JSON.stringify(body.features),
    //       type: "json_string"
    //     }
    //   ]
    // });

    // For now, just return success
    return NextResponse.json({
      success: true,
      message: "Features updated successfully",
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
