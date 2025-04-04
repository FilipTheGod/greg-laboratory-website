// src/components/debug/InlineVideoDebugger.tsx
"use client"

import React, { useState, useEffect } from "react"
import { ShopifyProduct } from "@/lib/shopify"

interface InlineVideoDebuggerProps {
  product: ShopifyProduct
}

const InlineVideoDebugger: React.FC<InlineVideoDebuggerProps> = ({
  product,
}) => {
  const [videoDetails, setVideoDetails] = useState<{
    hasVideo: boolean
    videoUrl: string | null
    previewUrl: string | null
    error: string | null
  }>({
    hasVideo: false,
    videoUrl: null,
    previewUrl: null,
    error: null,
  })

  useEffect(() => {
    // Check for video media directly from the product
    const videoMedia = product.media?.find(
      (media) => media.mediaContentType === "VIDEO"
    )

    if (videoMedia) {
      setVideoDetails({
        hasVideo: true,
        videoUrl: videoMedia.sources?.[0]?.url || null,
        previewUrl: videoMedia.previewImage?.src || null,
        error: null,
      })
    } else {
      setVideoDetails((prev) => ({
        ...prev,
        hasVideo: false,
        error: "No video found in product media",
      }))
    }
  }, [product])

  // Direct test of video playback
  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const videoEl = e.currentTarget
    setVideoDetails((prev) => ({
      ...prev,
      error: `Video error: ${videoEl.error?.message || "Unknown error"}`,
    }))
  }

  return (
    <div className="bg-gray-100 p-3 rounded-md mb-4 font-mono text-xs">
      <h3 className="font-bold mb-2">Video Debug</h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="font-semibold mb-1">Video Information:</h4>
          <div className="bg-white p-2 rounded">
            <p>Has Video: {videoDetails.hasVideo ? "Yes" : "No"}</p>
            {videoDetails.videoUrl && (
              <p className="truncate">
                URL:{" "}
                <span className="text-blue-600">{videoDetails.videoUrl}</span>
              </p>
            )}
            {videoDetails.error && (
              <p className="text-red-500">Error: {videoDetails.error}</p>
            )}
          </div>
        </div>

        <div>
          {videoDetails.videoUrl && (
            <div>
              <h4 className="font-semibold mb-1">Video Test:</h4>
              <div className="bg-black rounded overflow-hidden">
                <video
                  src={videoDetails.videoUrl}
                  poster={videoDetails.previewUrl || undefined}
                  controls
                  className="w-full h-32 object-contain"
                  onError={handleVideoError}
                >
                  Your browser doesn&apos;t support HTML5 video.
                </video>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 flex space-x-2">
        <button
          onClick={() => {
            const cacheKey = `product_media_${product.handle}`
            localStorage.removeItem(cacheKey)
            alert(`Cache cleared for ${product.handle}`)
            window.location.reload()
          }}
          className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
        >
          Clear Cache & Reload
        </button>

        <button
          onClick={() => {
            if (videoDetails.videoUrl) {
              window.open(videoDetails.videoUrl, "_blank")
            }
          }}
          disabled={!videoDetails.videoUrl}
          className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600 disabled:opacity-50"
        >
          Open Video URL
        </button>
      </div>
    </div>
  )
}

export default InlineVideoDebugger
