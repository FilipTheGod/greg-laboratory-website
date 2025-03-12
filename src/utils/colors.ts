// src/utils/colors.ts

/**
 * Utility functions for working with product color data
 */

// Enhanced color map with accurate color values
const COLOR_MAP: Record<string, string> = {
  Black: "#000000",
  White: "#FFFFFF",
  Cream: "#FFFDD0",
  Navy: "#000080",
  Olive: "#556B2F",
  Grey: "##91918E",
  Khaki: "#C3B091",
  Tan: "#D2B48C",
  Brown: "#A52A2A",
  Natural: "#F5F5DC",
  Green: "#008000",
  Blue: "#0000FF",
  Red: "#FF0000",
  Pink: "#FFC0CB",
  Stone: "#DAD6C5",
}

/**
 * Get the hex color value from a color name
 */
export function getColorHex(colorName: string): string {
  return COLOR_MAP[colorName] || "#CCCCCC" // Default gray for unknown colors
}

/**
 * Get color styling for a given color name
 * Used for color swatches and visual elements
 */
export function getColorStyle(colorName: string): {
  backgroundColor: string
  borderColor: string
} {
  const colorHex = getColorHex(colorName)

  // Special handling for white to ensure visibility
  const needsBorder = colorHex === "#FFFFFF"

  return {
    backgroundColor: colorHex,
    borderColor: needsBorder ? "#DDDDDD" : "transparent",
  }
}

/**
 * Get appropriate text color (black or white) based on background color
 * Useful for ensuring text is readable on colored backgrounds
 */
export function getContrastTextColor(colorName: string): string {
  const colorHex = getColorHex(colorName)

  // Convert hex to RGB
  const r = parseInt(colorHex.substring(1, 3), 16)
  const g = parseInt(colorHex.substring(3, 5), 16)
  const b = parseInt(colorHex.substring(5, 7), 16)

  // Calculate luminance - common formula for perceived brightness
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

  // Use white text on dark backgrounds, black text on light backgrounds
  return luminance > 0.5 ? "#000000" : "#FFFFFF"
}

/**
 * Extract color metafield data from a product if available
 * Falls back to standard color map if not found
 */
export function getProductColorData(
  product: { metafields?: { colors?: { value?: string } } },
  colorName: string
): {
  hexValue: string
  displayName: string
} {
  let hexValue = COLOR_MAP[colorName] || "#CCCCCC"
  const displayName = colorName

  // Check if product has metafields with color information
  if (product?.metafields?.colors?.value) {
    try {
      const colorData = JSON.parse(product.metafields.colors.value)
      if (colorData[colorName]) {
        hexValue = colorData[colorName]
      }
    } catch (e) {
      console.error("Error parsing color metafields:", e)
    }
  }

  return {
    hexValue,
    displayName,
  }
}
