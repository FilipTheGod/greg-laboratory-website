// src/app/api/products/related/[handle]/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getAllProducts } from "@/lib/shopify"

// Helper function to extract the base SKU from a product handle
// e.g., "pc-fs-t24-cream" -> "pc-fs-t24"
function extractBaseSku(handle: string): string {
  // Pattern: Look for the last dash followed by a color name
  const parts = handle.split("-")

  // Common color names that might appear at the end of a handle
  const commonColors = [
    "black",
    "cream",
    "white",
    "navy",
    "olive",
    "grey",
    "khaki",
    "tan",
    "brown",
    "natural",
    "green",
    "blue",
    "red",
    "pink",
    "stone",
  ]

  // Check if the last part is a color
  const lastPart = parts[parts.length - 1].toLowerCase()
  if (commonColors.includes(lastPart)) {
    // Remove the color suffix to get the base SKU
    return parts.slice(0, parts.length - 1).join("-")
  }

  // If no color is found, return the original handle
  return handle
}

// Helper function to extract color from handle
function extractColor(handle: string): string | null {
  const parts = handle.split("-")
  const lastPart = parts[parts.length - 1].toLowerCase()

  // Common color names that might appear at the end of a handle
  const commonColors = [
    "black",
    "cream",
    "white",
    "navy",
    "olive",
    "grey",
    "khaki",
    "tan",
    "brown",
    "natural",
    "green",
    "blue",
    "red",
    "pink",
    "stone",
  ]

  if (commonColors.includes(lastPart)) {
    // Capitalize the first letter of the color
    return lastPart.charAt(0).toUpperCase() + lastPart.slice(1)
  }

  return null
}

export async function GET(
  request: NextRequest,
  { params }: { params: { handle: string } }
) {
  try {
    const handle = params.handle

    if (!handle) {
      return NextResponse.json(
        { error: "Product handle is required" },
        { status: 400 }
      )
    }

    // Extract the base SKU from the handle
    const baseSku = extractBaseSku(handle)

    // Fetch all products
    const products = await getAllProducts()

    // Find related products with the same base SKU
    const relatedProducts = products.filter((product) => {
      const productBaseSku = extractBaseSku(product.handle)
      return productBaseSku === baseSku && product.handle !== handle
    })

    // Map to a simpler structure with just what we need
    const colorVariants = relatedProducts.map((product) => {
      return {
        id: product.id,
        handle: product.handle,
        title: product.title,
        color: extractColor(product.handle) || "Unknown",
        image:
          product.images && product.images.length > 0
            ? product.images[0].src
            : null,
      }
    })

    return NextResponse.json({
      baseSku,
      currentColor: extractColor(handle),
      colorVariants,
    })
  } catch (error) {
    console.error("Error fetching related products:", error)
    return NextResponse.json(
      { error: "Failed to fetch related products" },
      { status: 500 }
    )
  }
}
