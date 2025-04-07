// src/utils/video-utils.ts
import { ShopifyProduct } from "@/lib/shopify"

/**
 * Map of product handles to video filenames
 * Add entries here as you add more videos to the public/video folder
 */
const VIDEO_MAPPING: Record<string, string> = {
  // Format is 'product-handle': 'video-filename.mp4'
  // Examples based on your video folder:
  "jacket-2": "Greg Jacket 2.0.mp4",
  jacket: "Greg Jacket.mp4",
  "pc-fs-t24": "Greg Laboratory PC-FS-T24.mp4",
  "ss-ls24": "Greg Laboratory PC-SS-LS24.mp4",
  "ss-p23": "Greg Laboratory PC-SS-P23.mp4",
  "quarter-zip": "Greg Laboratory Quarter Zip Crew.mp4",
  "ts-q24": "PC-TS-Q24 Quarter Zip.mp4",

  // Add more mappings as needed
}

/**
 * Get the video URL for a product
 *
 * @param product The Shopify product
 * @returns The URL to the video file or null if no video exists
 */
export function getProductVideoUrl(product: ShopifyProduct): string | null {
  // First check if we have a direct mapping
  if (VIDEO_MAPPING[product.handle]) {
    return `/video/${VIDEO_MAPPING[product.handle]}`
  }

  // Try to find a partial match by looping through the keys
  const partialMatch = Object.keys(VIDEO_MAPPING).find(
    (key) => product.handle.includes(key) || key.includes(product.handle)
  )

  if (partialMatch) {
    return `/video/${VIDEO_MAPPING[partialMatch]}`
  }

  // If no matches in our mapping, try some default patterns
  const productTypeSlug = product.productType.toLowerCase().replace(/\s+/g, "-")
  const possiblePatterns = [
    `/video/${product.handle}.mp4`,
    `/video/Greg Laboratory ${product.handle.toUpperCase()}.mp4`,
    `/video/Greg Laboratory PC-${product.handle.toUpperCase()}.mp4`,
    `/video/${productTypeSlug}.mp4`,
  ]

  // Return the first pattern as a fallback attempt
  return possiblePatterns[0]
}

/**
 * Gets all possible video URLs to try for a product
 * Useful for debugging or advanced video loading logic
 *
 * @param product The Shopify product
 * @returns Array of possible video URLs to try
 */
export function getAllPossibleVideoUrls(product: ShopifyProduct): string[] {
  const urls: string[] = []

  // Add direct mapping if exists
  if (VIDEO_MAPPING[product.handle]) {
    urls.push(`/video/${VIDEO_MAPPING[product.handle]}`)
  }

  // Add fallback patterns
  const productTypeSlug = product.productType.toLowerCase().replace(/\s+/g, "-")
  urls.push(
    `/video/${product.handle}.mp4`,
    `/video/Greg Laboratory ${product.handle.toUpperCase()}.mp4`,
    `/video/Greg Laboratory PC-${product.handle.toUpperCase()}.mp4`,
    `/video/${productTypeSlug}.mp4`
  )

  return urls
}
