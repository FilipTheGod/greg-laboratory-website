// src/components/debug/VideoDebugger.tsx
"use client"

import React, { useEffect, useState } from "react"
import { ShopifyProduct } from "@/lib/shopify"

interface VideoDebuggerProps {
  product: ShopifyProduct
}

const VideoDebugger: React.FC<VideoDebuggerProps> = ({ product }) => {
  interface DebugInfo {
    productHandle?: string
    hasMedia?: boolean
    mediaCount?: number
    mediaTypes?: string[]
    hasVideoMedia?: boolean
    videoMediaId?: string
    videoSources?: { url: string }[]
    videoHasPreviewImage?: boolean
    firstVideoSource?: string | null
    cache?: string | Record<string, unknown>
  }

  const [debugInfo, setDebugInfo] = useState<DebugInfo>({})
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  interface ApiResponse {
    error?: string
    [key: string]: unknown
  }

  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null)

  useEffect(() => {
    // Collect debug info
    const info: DebugInfo = {
      productHandle: product.handle,
      hasMedia: Boolean(product.media && product.media.length > 0),
      mediaCount: product.media?.length || 0,
      mediaTypes: product.media?.map((m) => m.mediaContentType) || [],
      hasVideoMedia:
        product.media?.some((m) => m.mediaContentType === "VIDEO") || false,
    }

    // If product has video media, add details
    const videoMedia = product.media?.find(
      (m) => m.mediaContentType === "VIDEO"
    )
    if (videoMedia) {
      info.videoMediaId = videoMedia.id
      info.videoSources = videoMedia.sources || []
      info.videoHasPreviewImage = Boolean(videoMedia.previewImage)
      info.firstVideoSource = videoMedia.sources?.[0]?.url || null
      setVideoUrl(videoMedia.sources?.[0]?.url || null)
    }

    setDebugInfo(info)

    // Try to fetch from API
    const fetchMediaFromApi = async () => {
      try {
        const response = await fetch(`/api/products/media/${product.handle}`)
        const data = await response.json()
        setApiResponse(data)
      } catch (error) {
        console.error("Error fetching media from API:", error)
        setApiResponse({ error: String(error) })
      }
    }

    fetchMediaFromApi()
  }, [product])

  // Check localStorage cache
  useEffect(() => {
    try {
      const cacheKey = `product_media_${product.handle}`
      const cached = localStorage.getItem(cacheKey)

      if (cached) {
        const parsedCache = JSON.parse(cached)
        setDebugInfo((prev) => ({
          ...prev,
          cache: parsedCache,
        }))
      } else {
        setDebugInfo((prev) => ({
          ...prev,
          cache: "No cache found",
        }))
      }
    } catch (error) {
      console.error("Error checking cache:", error)
    }
  }, [product.handle])

  return (
    <div className="bg-gray-100 p-4 rounded-lg mb-4 text-xs">
      <h3 className="font-bold mb-2">Video Debug Info</h3>

      <div className="mb-4">
        <h4 className="font-semibold mb-1">Product Media Info:</h4>
        <pre className="bg-white p-2 rounded overflow-auto max-h-60">
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      </div>

      {videoUrl && (
        <div className="mb-4">
          <h4 className="font-semibold mb-1">Video Test:</h4>
          <div className="aspect-video bg-black relative">
            <video
              src={videoUrl}
              controls
              className="w-full h-full"
              onError={(e) => console.error("Video error:", e)}
            >
              Your browser doesn&apos;t support HTML5 video.
            </video>
          </div>
          <div className="mt-1 bg-white p-2 rounded overflow-auto">
            <code className="text-xs break-all">{videoUrl}</code>
          </div>
        </div>
      )}

      <div className="mb-4">
        <h4 className="font-semibold mb-1">API Response:</h4>
        <pre className="bg-white p-2 rounded overflow-auto max-h-60">
          {JSON.stringify(apiResponse, null, 2)}
        </pre>
      </div>

      <div>
        <button
          onClick={() => {
            const cacheKey = `product_media_${product.handle}`
            localStorage.removeItem(cacheKey)
            alert(`Cache cleared for ${product.handle}`)
            window.location.reload()
          }}
          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-xs"
        >
          Clear Cache & Reload
        </button>
      </div>
    </div>
  )
}

export default VideoDebugger
