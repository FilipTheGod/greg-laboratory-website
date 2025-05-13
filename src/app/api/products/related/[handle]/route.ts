// src/app/api/products/related/[handle]/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getAllProducts, ShopifyProduct } from "@/lib/shopify"

// Helper function to extract the base SKU from a product handle
// e.g., "pc-ss-p23-cream" -> "pc-ss-p23"
function extractBaseSku(handle: string): string {
  // First, try pattern for handles that end with a color
  // Pattern: Look for the last dash followed by a color name
  const colorPatterns: string[] = [
    "black", "beige", "cream", "white", "navy", "olive", "grey", "gray",
    "khaki", "tan", "brown", "natural", "green", "blue", "red", "pink",
    "stone", "sand", "silver"
  ]

  // Handle the case where color is separated by a dash (pc-ss-p23-black)
  for (const color of colorPatterns) {
    const suffix = `-${color}`
    if (handle.toLowerCase().endsWith(suffix)) {
      return handle.slice(0, handle.length - suffix.length)
    }
  }

  // Try to extract based on product naming convention - more aggressive
  // This looks for product SKU patterns like PC-SS-SS25, PC-SS-P23, etc.
  const skuPattern = /(pc-[a-z]{2}-[a-z0-9]{2,4})/i
  const skuMatch = handle.match(skuPattern)

  if (skuMatch) {
    return skuMatch[1].toLowerCase()
  }

  // If no pattern matches, return the original handle
  return handle.toLowerCase()
}

// Helper function to extract color from handle
function extractColor(handle: string): string | null {
  const colorPatterns: string[] = [
    "black", "beige", "cream", "white", "navy", "olive", "grey", "gray",
    "khaki", "tan", "brown", "natural", "green", "blue", "red", "pink",
    "stone", "sand", "silver"
  ]

  // Check for color at the end of the handle
  for (const color of colorPatterns) {
    const suffix = `-${color}`
    if (handle.toLowerCase().endsWith(suffix)) {
      return color.charAt(0).toUpperCase() + color.slice(1)
    }
  }

  // Try to extract from the last part of the URL
  const parts = handle.split("-")
  const lastPart = parts[parts.length - 1].toLowerCase()
  if (colorPatterns.includes(lastPart)) {
    return lastPart.charAt(0).toUpperCase() + lastPart.slice(1)
  }

  return null
}

// Helper function to extract color from title
function extractColorFromTitle(title: string): string | null {
  if (!title) return null

  const lowerTitle = title.toLowerCase()
  const colorPatterns = [
    "black", "beige", "cream", "white", "navy", "olive", "grey", "gray",
    "khaki", "tan", "brown", "natural", "green", "blue", "red", "pink",
    "stone", "sand", "silver"
  ]

  for (const color of colorPatterns) {
    // Look for complete word match with word boundaries
    const regex = new RegExp(`\\b${color}\\b`, 'i')
    if (regex.test(lowerTitle)) {
      return color.charAt(0).toUpperCase() + color.slice(1)
    }
  }

  return null
}

// Specific product handling to ensure certain products show the right color variants
function getSpecificProductVariants(
  products: ShopifyProduct[],
  currentProduct: ShopifyProduct,
  currentHandle: string
): { variantProducts: ShopifyProduct[], currentColor: string | null } {
  // Default values
  let variantProducts: ShopifyProduct[] = []
  let currentColor: string | null = null

  // Extract the base product code (PC-SS-P23, PC-SS-J25, etc.)
  const baseCode = currentHandle.split('-').slice(0, 3).join('-').toUpperCase()

  // Handle specific jacket case (PC-SS-J25)
  if (baseCode === 'PC-SS-J25') {
    // Try to determine current color (black or silver)
    currentColor = currentHandle.toLowerCase().includes('black') ? 'Black' :
                  currentHandle.toLowerCase().includes('silver') ? 'Silver' : null

    // Find all pants products (any with PC-SS-J25 in the handle)
    variantProducts = products.filter(product =>
      product.handle.toUpperCase().includes('PC-SS-J25') &&
      product.handle !== currentHandle
    )

    console.log(`Special case for jacket ${baseCode}. Current color: ${currentColor}`)
    console.log(`Found ${variantProducts.length} variant products`)

    // If our detection doesn't work, we hardcode some values as fallback
    if (!currentColor || variantProducts.length === 0) {
      // Hardcoded case for jackets
      if (currentHandle.toLowerCase().includes('black')) {
        // Current is black, find silver variants
        currentColor = 'Black'
        variantProducts = products.filter(p =>
          p.handle.toLowerCase().includes('j25') &&
          p.handle.toLowerCase().includes('silver')
        )
      } else {
        // Current is silver or unknown, find black variants
        currentColor = 'Silver'
        variantProducts = products.filter(p =>
          p.handle.toLowerCase().includes('j25') &&
          p.handle.toLowerCase().includes('black')
        )
      }
    }
  }
  // Handle specific pants case (PC-SS-P23)
  else if (baseCode === 'PC-SS-P23') {
    // Try to determine current color (black or beige)
    currentColor = currentHandle.toLowerCase().includes('black') ? 'Black' :
                  currentHandle.toLowerCase().includes('beige') ? 'Beige' : null

    // Find all pants products (any with PC-SS-P23 in the handle)
    variantProducts = products.filter(product =>
      product.handle.toUpperCase().includes('PC-SS-P23') &&
      product.handle !== currentHandle
    )

    console.log(`Special case for pants ${baseCode}. Current color: ${currentColor}`)
    console.log(`Found ${variantProducts.length} variant products`)

    // If our detection doesn't work, we hardcode some values as fallback
    if (!currentColor || variantProducts.length === 0) {
      // Hardcoded case for pants
      if (currentHandle.toLowerCase().includes('black')) {
        // Current is black, find beige variants
        currentColor = 'Black'
        variantProducts = products.filter(p =>
          p.handle.toLowerCase().includes('p23') &&
          p.handle.toLowerCase().includes('beige')
        )
      } else {
        // Current is beige or unknown, find black variants
        currentColor = 'Beige'
        variantProducts = products.filter(p =>
          p.handle.toLowerCase().includes('p23') &&
          p.handle.toLowerCase().includes('black')
        )
      }
    }
  }

  return { variantProducts, currentColor }
}

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ handle: string } | Promise<{ handle: string }>> }
) {
  const params = await props.params;
  try {
    // Ensure params is awaited before using its properties
    const resolvedParams = params instanceof Promise ? await params : params
    const handle = resolvedParams?.handle

    if (!handle) {
      return NextResponse.json(
        { error: "Product handle is required" },
        { status: 400 }
      )
    }

    // Get all products first
    const products = await getAllProducts()

    // Find the current product
    const currentProduct = products.find(p => p.handle === handle)
    if (!currentProduct) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      )
    }

    console.log(`Processing related products for handle: ${handle}`)
    console.log(`Product type: ${currentProduct.productType}`)

    let relatedProducts: ShopifyProduct[] = []
    let currentColor: string | null = null

    // Check if this is one of our special case products
    if (handle.toUpperCase().includes('PC-SS-J25') || handle.toUpperCase().includes('PC-SS-P23')) {
      // Use our special case handler
      const { variantProducts, currentColor: detectedColor } = getSpecificProductVariants(
        products,
        currentProduct,
        handle
      )

      relatedProducts = variantProducts
      currentColor = detectedColor

      console.log(`Special case handling result: ${relatedProducts.length} variants, color: ${currentColor}`)
    } else {
      // Extract the base SKU for standard handling
      const baseSku = extractBaseSku(handle)
      console.log(`Using standard detection with base SKU: ${baseSku}`)

      // Find related products with the same base SKU pattern
      relatedProducts = products.filter((product) => {
        const productBaseSku = extractBaseSku(product.handle)
        return productBaseSku === baseSku && product.handle !== handle
      })

      // Try to extract the current color
      currentColor = extractColor(handle) || extractColorFromTitle(currentProduct.title)
    }

    console.log(`Found ${relatedProducts.length} related products`)

    // Map to a simpler structure with just what we need
    const colorVariants = relatedProducts.map((product) => {
      // Try to extract color in multiple ways for better reliability
      let color: string | null = null

      // Special case handling for jackets and pants
      if (handle.toUpperCase().includes('PC-SS-J25')) {
        color = product.handle.toLowerCase().includes('black') ? 'Black' : 'Silver'
      } else if (handle.toUpperCase().includes('PC-SS-P23')) {
        color = product.handle.toLowerCase().includes('black') ? 'Black' : 'Beige'
      } else {
        // Standard color extraction
        color = extractColor(product.handle) || extractColorFromTitle(product.title)
      }

      // Fallback color extraction from handle if all else fails
      if (!color) {
        if (product.handle.includes('black')) {
          color = "Black"
        } else if (product.handle.includes('white')) {
          color = "White"
        } else if (product.handle.includes('beige')) {
          color = "Beige"
        } else if (product.handle.includes('silver')) {
          color = "Silver"
        } else {
          color = "Unknown"
        }
      }

      console.log(`Extracted color for ${product.handle}: ${color}`)

      return {
        id: product.id,
        handle: product.handle,
        title: product.title,
        color: color,
        image:
          product.images && product.images.length > 0
            ? product.images[0].src
            : null,
      }
    })
    
    // Extract baseSku for response
    const baseSku = extractBaseSku(handle)

    return NextResponse.json({
      baseSku,
      currentColor,
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