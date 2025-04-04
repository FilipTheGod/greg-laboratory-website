// src/utils/directVideoFetcher.ts
/**
 * This utility provides direct Shopify video fetching capabilities
 * when the standard Storefront API doesn't return media properly
 */

import { ShopifyProduct } from "@/lib/shopify"

interface VideoInfo {
  url: string | null
  previewImageUrl: string | null
  mediaId: string | null
  mimeType: string | null
}

/**
 * Tries to construct video information from product handle
 * using a standardized Shopify CDN pattern
 */
export const getShopifyVideoByPattern = async (
  productHandle: string
): Promise<VideoInfo> => {
  // Convert product handle to potential video ID format
  // Note: We don't actually need to use the ID in the current implementation
  // but keeping the logic for future reference

  // Construct potential video URLs
  const potentialVideoFormats = [
    `.mp4?v=0`,
    `-HD-720p-1.6Mbps.mp4?v=0`,
    `-HD-1080p-3.8Mbps.mp4?v=0`,
    `-HD-720p-1.6Mbps-3913547.mp4?v=0`, // Pattern seen in your screenshot
  ]

  // Return a standardized info object for compatibility
  return {
    url: `//greglaboratory.com/cdn/shop/videos/c/vp/${productHandle}/${productHandle}${potentialVideoFormats[2]}`,
    previewImageUrl: `//greglaboratory.com/cdn/shop/files/preview_images/${productHandle}.thumbnail.0000000000_1100x.jpg?v=1733237045`,
    mediaId: null,
    mimeType: "video/mp4",
  }
}

/**
 * Fallback method to manually construct video URLs based on product handle
 * when the Shopify Storefront API doesn't provide media data
 */
export const getVideoUrlsForProduct = async (
  product: ShopifyProduct
): Promise<VideoInfo> => {
  // Check if the product has media data already
  if (product.media && product.media.length > 0) {
    const videoMedia = product.media.find((m) => m.mediaContentType === "VIDEO")
    if (videoMedia && videoMedia.sources && videoMedia.sources.length > 0) {
      return {
        url: videoMedia.sources[0].url,
        previewImageUrl: videoMedia.previewImage?.src || null,
        mediaId: videoMedia.id,
        mimeType: videoMedia.sources[0].mimeType || "video/mp4",
      }
    }
  }

  // If no media found in product, try using pattern matching
  return getShopifyVideoByPattern(product.handle)
}
