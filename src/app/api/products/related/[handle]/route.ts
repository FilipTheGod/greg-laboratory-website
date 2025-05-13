// src/app/api/products/related/[handle]/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getAllProducts } from "@/lib/shopify"

// Helper function to extract the base SKU from a product handle
// e.g., "pc-ss-p23-cream" -> "pc-ss-p23"
function extractBaseSku(handle: string): string {
  // Look for color patterns at the end of the handle
  const colorPatterns = [
    /-black$/,
    /-beige$/,
    /-cream$/,
    /-white$/,
    /-navy$/,
    /-olive$/,
    /-grey$/,
    /-gray$/,
    /-khaki$/,
    /-tan$/,
    /-brown$/,
    /-natural$/,
    /-green$/,
    /-blue$/,
    /-red$/,
    /-pink$/,
    /-stone$/,
    /-sand$/,
    /-silver$/
  ]

  // Check if the handle ends with any color pattern
  for (const pattern of colorPatterns) {
    if (pattern.test(handle)) {
      // Remove the color suffix to get the base SKU
      return handle.replace(pattern, '')
    }
  }

  // Advanced pattern matching - look for alphanumeric-color pattern
  const generalPattern = /^(.+)-([a-z]+)$/
  const match = handle.match(generalPattern)

  if (match) {
    const potentialBaseSku = match[1]
    const potentialColor = match[2]

    // Common color names to check against
    const commonColors = [
      "black", "beige", "cream", "white", "navy", "olive", "grey", "gray",
      "khaki", "tan", "brown", "natural", "green", "blue", "red", "pink",
      "stone", "sand", "silver"
    ]

    if (commonColors.includes(potentialColor)) {
      return potentialBaseSku
    }
  }

  // If no color is found, try to extract based on product naming convention
  // Pattern: "pc-xx-xxx" where xx is a category code and xxx is a product number
  const skuPattern = /(pc-[a-z]{2}-[a-z0-9]{2,4})/i
  const skuMatch = handle.match(skuPattern)

  if (skuMatch) {
    return skuMatch[1]
  }

  // If no pattern matches, return the original handle
  return handle
}

// Helper function to extract color from handle
function extractColor(handle: string): string | null {
  const colorPatterns: Record<string, string> = {
    "-black$": "Black",
    "-beige$": "Beige",
    "-cream$": "Cream",
    "-white$": "White",
    "-navy$": "Navy",
    "-olive$": "Olive",
    "-grey$": "Grey",
    "-gray$": "Gray",
    "-khaki$": "Khaki",
    "-tan$": "Tan",
    "-brown$": "Brown",
    "-natural$": "Natural",
    "-green$": "Green",
    "-blue$": "Blue",
    "-red$": "Red",
    "-pink$": "Pink",
    "-stone$": "Stone",
    "-sand$": "Sand",
    "-silver$": "Silver"
  };

  for (const [pattern, colorName] of Object.entries(colorPatterns)) {
    const regex = new RegExp(pattern);
    if (regex.test(handle)) {
      return colorName;
    }
  }

  // Advanced pattern matching - look for alphanumeric-color pattern
  const generalPattern = /^(.+)-([a-z]+)$/
  const match = handle.match(generalPattern)

  if (match) {
    const potentialColor = match[2]

    // Common color names to check against
    const commonColors = [
      "black", "beige", "cream", "white", "navy", "olive", "grey", "gray",
      "khaki", "tan", "brown", "natural", "green", "blue", "red", "pink",
      "stone", "sand", "silver"
    ]

    if (commonColors.includes(potentialColor)) {
      return potentialColor.charAt(0).toUpperCase() + potentialColor.slice(1)
    }
  }

  return null
}

// Helper function to extract color from title
function extractColorFromTitle(title: string): string | null {
  const lowerTitle = title.toLowerCase()
  const colorPatterns = [
    { pattern: "\\bblack\\b", name: "Black" },
    { pattern: "\\bbeige\\b", name: "Beige" },
    { pattern: "\\bcream\\b", name: "Cream" },
    { pattern: "\\bwhite\\b", name: "White" },
    { pattern: "\\bnavy\\b", name: "Navy" },
    { pattern: "\\bolive\\b", name: "Olive" },
    { pattern: "\\bgrey\\b", name: "Grey" },
    { pattern: "\\bgray\\b", name: "Gray" },
    { pattern: "\\bkhaki\\b", name: "Khaki" },
    { pattern: "\\btan\\b", name: "Tan" },
    { pattern: "\\bbrown\\b", name: "Brown" },
    { pattern: "\\bnatural\\b", name: "Natural" },
    { pattern: "\\bgreen\\b", name: "Green" },
    { pattern: "\\bblue\\b", name: "Blue" },
    { pattern: "\\bred\\b", name: "Red" },
    { pattern: "\\bpink\\b", name: "Pink" },
    { pattern: "\\bstone\\b", name: "Stone" },
    { pattern: "\\bsand\\b", name: "Sand" },
    { pattern: "\\bsilver\\b", name: "Silver" }
  ];

  for (const { pattern, name } of colorPatterns) {
    const regex = new RegExp(pattern, 'i');
    if (regex.test(lowerTitle)) {
      return name;
    }
  }

  return null;
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

    // Extract the base SKU from the handle
    const baseSku = extractBaseSku(handle)

    // Log debug information to help diagnose issues
    console.log(`Processing related products for handle: ${handle}`)
    console.log(`Extracted base SKU: ${baseSku}`)

    // Find related products with the same base SKU pattern
    const relatedProducts = products.filter((product) => {
      // First try to extract base SKU using our method
      const productBaseSku = extractBaseSku(product.handle)

      // Also check for simple pattern match in the product handle
      const simpleMatchBaseSku = product.handle.includes(baseSku) && product.handle !== handle

      // Return true if either method finds a match
      return (productBaseSku === baseSku && product.handle !== handle) || simpleMatchBaseSku
    })

    console.log(`Found ${relatedProducts.length} related products`)

    // Log each related product for debugging
    relatedProducts.forEach(product => {
      console.log(`Related product: ${product.handle} (Base SKU: ${extractBaseSku(product.handle)})`)
    })

    // Map to a simpler structure with just what we need
    const colorVariants = relatedProducts.map((product) => {
      // Try to extract color in multiple ways for better reliability
      const colorFromHandle = extractColor(product.handle)
      const colorFromTitle = extractColorFromTitle(product.title)

      const color = colorFromHandle || colorFromTitle || "Unknown"
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

    return NextResponse.json({
      baseSku,
      currentColor: extractColor(handle) || extractColorFromTitle(products.find(p => p.handle === handle)?.title || "") || null,
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