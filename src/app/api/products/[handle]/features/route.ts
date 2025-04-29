// src/app/api/products/[handle]/features/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getProductByHandle } from "@/lib/shopify"
import { getProductFeatures } from "@/lib/shopify-metafields"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  try {
    // Await the params promise to get the handle
    const handle = (await params).handle

    if (!handle) {
      return NextResponse.json(
        { error: "Product handle is required" },
        { status: 400 }
      )
    }

    // Fetch the product with its metafields
    const product = await getProductByHandle(handle)

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Extract features from product metafields
    const features = getProductFeatures(product)

    // Return the product title and features
    return NextResponse.json({
      title: product.title,
      features,
    })
  } catch (error) {
    console.error("Error fetching product features:", error)
    return NextResponse.json(
      { error: "Failed to fetch product features" },
      { status: 500 }
    )
  }
}