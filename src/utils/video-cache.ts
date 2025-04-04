// src/utils/video-cache.ts
/**
 * Utility functions for caching video data to avoid repeated API calls
 */

interface VideoCacheData {
  videoUrl: string | null
  previewImage: string | null
  timestamp: number
}

const CACHE_EXPIRY = 1000 * 60 * 60 // 1 hour cache expiry

/**
 * Get cached video data for a product
 * @param productHandle The product handle to look up
 */
export function getCachedVideoData(
  productHandle: string
): VideoCacheData | null {
  try {
    const cacheKey = `product_media_${productHandle}`
    const cachedData = localStorage.getItem(cacheKey)

    if (!cachedData) return null

    const parsedData = JSON.parse(cachedData) as VideoCacheData

    // Check if cache is expired
    if (Date.now() - parsedData.timestamp > CACHE_EXPIRY) {
      // Clear expired cache
      localStorage.removeItem(cacheKey)
      return null
    }

    return parsedData
  } catch (error) {
    console.error("Error retrieving cached video data:", error)
    return null
  }
}

/**
 * Save video data to cache
 * @param productHandle The product handle
 * @param videoUrl The video URL or null if no video
 * @param previewImage The preview image URL or null
 */
export function cacheVideoData(
  productHandle: string,
  videoUrl: string | null,
  previewImage: string | null
): void {
  try {
    const cacheKey = `product_media_${productHandle}`
    const cacheData: VideoCacheData = {
      videoUrl,
      previewImage,
      timestamp: Date.now(),
    }

    localStorage.setItem(cacheKey, JSON.stringify(cacheData))
  } catch (error) {
    console.error("Error caching video data:", error)
  }
}

/**
 * Clear all video cache data
 */
export function clearVideoCache(): void {
  try {
    const keysToRemove: string[] = []

    // Find all video cache keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith("product_media_")) {
        keysToRemove.push(key)
      }
    }

    // Remove them
    keysToRemove.forEach((key) => localStorage.removeItem(key))

    console.log(`Cleared ${keysToRemove.length} video cache entries`)
  } catch (error) {
    console.error("Error clearing video cache:", error)
  }
}
