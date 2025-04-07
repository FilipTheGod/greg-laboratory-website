// src/hooks/useVideoLoader.ts
import { useState, useEffect } from "react"
import { ShopifyProduct } from "@/lib/shopify"
import { getAllPossibleVideoUrls } from "@/utils/video-utils"

interface VideoLoaderResult {
  videoUrl: string | null
  isLoading: boolean
  error: boolean
  videoReady: boolean
  setVideoReady: (ready: boolean) => void
  setError: (hasError: boolean) => void
  setIsLoading: (loading: boolean) => void
}

/**
 * Custom hook for loading product videos with fallbacks
 */
export function useVideoLoader(product: ShopifyProduct): VideoLoaderResult {
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)
  const [videoReady, setVideoReady] = useState(false)
  const [attemptedUrls, setAttemptedUrls] = useState<string[]>([])

  useEffect(() => {
    // Reset state for new product
    setIsLoading(true)
    setError(false)
    setVideoReady(false)
    setAttemptedUrls([])

    // Get all possible video URLs to try
    const possibleUrls = getAllPossibleVideoUrls(product)

    if (possibleUrls.length === 0) {
      setIsLoading(false)
      setError(true)
      return
    }

    // Try the first URL
    setVideoUrl(possibleUrls[0])
    setAttemptedUrls([possibleUrls[0]])

    // We'll handle video loading/errors in the component using onCanPlay and onError events
  }, [product])

  // Function to try the next URL
  const tryNextUrl = () => {
    const possibleUrls = getAllPossibleVideoUrls(product)
    const nextUrl = possibleUrls.find((url) => !attemptedUrls.includes(url))

    if (nextUrl) {
      console.log(`Trying next video URL: ${nextUrl}`)
      setVideoUrl(nextUrl)
      setAttemptedUrls((prev) => [...prev, nextUrl])
    } else {
      console.log("No more video URLs to try")
      setError(true)
      setIsLoading(false)
    }
  }

  return {
    videoUrl,
    isLoading,
    error,
    videoReady,
    setVideoReady: (ready: boolean) => setVideoReady(ready),
    setError: (hasError: boolean) => {
      setError(hasError)
      if (hasError) {
        tryNextUrl()
      }
    },
    setIsLoading: (loading: boolean) => setIsLoading(loading),
  }
}
