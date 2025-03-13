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
  Grey: "#91918E",
  Gray: "#91918E", // Alternative spelling
  Khaki: "#C3B091",
  Tan: "#D2B48C",
  Brown: "#A52A2A",
  Natural: "#F5F5DC",
  Green: "#008000",
  Blue: "#0000FF",
  Red: "#FF0000",
  Pink: "#FFC0CB",
  Stone: "#DAD6C5",
  Beige: "#F5F5DC",
  Charcoal: "#36454F",
  Sage: "#9CAF88",
  Sand: "#C2B280",
  Terracotta: "#E2725B",
  Rust: "#B7410E",
  Burgundy: "#800020",
  Camel: "#C19A6B",
  Ivory: "#FFFFF0",
  Taupe: "#483C32",
  Clay: "#A7745B",
  Oatmeal: "#E0DAB8",
  Mustard: "#E1AD01",
}

/**
 * Get the hex color value from a color name
 * Falls back to a default gray if the color is not recognized
 */
export function getColorHex(colorName: string): string {
  // Normalize the color name
  const normalizedName = colorName
    .trim()
    .replace(/\s+/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ")

  return COLOR_MAP[normalizedName] || "#CCCCCC" // Default gray for unknown colors
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

  // Special handling for light colors to ensure visibility
  const isLightColor = [
    "#FFFFFF",
    "#FFFDD0",
    "#F5F5DC",
    "#FFFFF0",
    "#E0DAB8",
  ].includes(colorHex)

  return {
    backgroundColor: colorHex,
    borderColor: isLightColor ? "#DDDDDD" : "transparent",
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
 * Check if a color name is known in our system
 */
export function isKnownColor(colorName: string): boolean {
  // Normalize the color name
  const normalizedName = colorName
    .trim()
    .replace(/\s+/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ")

  return normalizedName in COLOR_MAP
}

/**
 * Extract a color name from a product handle or title
 */
export function extractColorFromText(text: string): string | null {
  // Convert to lowercase for easier matching
  const lowerText = text.toLowerCase()

  // Check for each color name in the text
  for (const colorName of Object.keys(COLOR_MAP)) {
    if (lowerText.includes(colorName.toLowerCase())) {
      return colorName
    }
  }

  return null
}
