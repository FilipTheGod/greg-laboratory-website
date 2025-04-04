// src/components/products/ProductMedia.tsx
"use client"

import React, { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { ShopifyProduct } from "@/lib/shopify"

interface ProductMediaProps {
  product: ShopifyProduct
  priority?: boolean
  className?: string
}

const ProductMedia: React.FC<ProductMediaProps> = ({
  product,
  priority = false,
  className = "w-full h-full object-cover",
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [videoError, setVideoError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [apiAttempted, setApiAttempted] = useState(false)

  // Check if product has video media in Shopify data
  const hasMediaData = product.media && product.media.length > 0
  const videoMedia = hasMediaData
    ? product.media?.find((media) => media.mediaContentType === "VIDEO")
    : null
  const firstVideoSource = videoMedia?.sources?.[0]?.url || null
  const videoPreviewImage = videoMedia?.previewImage?.src || null

  useEffect(() => {
    // Clear error state on new product
    setVideoError(false)

    // If we already have video data from Shopify, use it
    if (firstVideoSource) {
      setVideoUrl(firstVideoSource)
      setPreviewImage(videoPreviewImage)
      setIsLoading(false)
      return
    }

    // Otherwise, fetch from our API endpoint - but only attempt once
    const fetchMedia = async () => {
      if (!product.handle || apiAttempted) {
        setIsLoading(false)
        return
      }

      setApiAttempted(true)

      try {
        // Check if media exists in local storage first to avoid unnecessary API calls
        const cacheKey = `product_media_${product.handle}`
        const cached = localStorage.getItem(cacheKey)

        if (cached) {
          try {
            const parsedCache = JSON.parse(cached)
            if (parsedCache.videoUrl) {
              setVideoUrl(parsedCache.videoUrl)
              setPreviewImage(parsedCache.previewImage || null)
            }
          } catch (e) {
            console.error("Error parsing cached video data:", e)
            // Continue with API call if cache parsing fails
          }
          setIsLoading(false)
          return
        }

        const response = await fetch(`/api/products/media/${product.handle}`)
        if (response.ok) {
          const data = await response.json()
          const productData = data.data?.productByHandle

          if (productData?.media?.edges) {
            const videoEdge = productData.media.edges.find(
              (edge: { node: { mediaContentType: string } }) =>
                edge.node.mediaContentType === "VIDEO"
            )

            if (videoEdge?.node?.sources?.[0]?.url) {
              const newVideoUrl = videoEdge.node.sources[0].url
              const newPreviewImage = videoEdge.node.preview?.image?.url || null

              setVideoUrl(newVideoUrl)
              setPreviewImage(newPreviewImage)

              // Cache the results to avoid future API calls
              localStorage.setItem(
                cacheKey,
                JSON.stringify({
                  videoUrl: newVideoUrl,
                  previewImage: newPreviewImage,
                  timestamp: Date.now(),
                })
              )
            } else {
              // Cache the negative result as well
              localStorage.setItem(
                cacheKey,
                JSON.stringify({
                  videoUrl: null,
                  previewImage: null,
                  timestamp: Date.now(),
                })
              )
            }
          }
        } else {
          // Cache negative results to avoid repeated calls
          localStorage.setItem(
            cacheKey,
            JSON.stringify({
              videoUrl: null,
              previewImage: null,
              timestamp: Date.now(),
            })
          )

          // Silently handle 404 errors - just skip video loading
          if (response.status === 404) {
            console.log(
              `No video media found for ${product.handle} - using image fallback`
            )
          }
        }
      } catch (error) {
        // Handle error silently
        console.error("Error fetching media:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMedia()
  }, [
    product.handle,
    firstVideoSource,
    videoMedia,
    apiAttempted,
    videoPreviewImage,
  ])

  const handleVideoError = () => {
    console.error(`Video error for product ${product.handle}`)
    setVideoError(true)
  }

  // If video is available and hasn't errored, show video
  if ((videoUrl || firstVideoSource) && !videoError && !isLoading) {
    const sourceUrl = videoUrl || firstVideoSource
    const posterImage = previewImage || videoPreviewImage

    return (
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className={className}
        poster={posterImage || undefined}
        onError={handleVideoError}
      >
        <source src={sourceUrl || undefined} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    )
  }

  // Fallback to first image
  if (product.images && product.images.length > 0) {
    return (
      <Image
        src={product.images[0].src}
        alt={product.title}
        fill
        className={className}
        priority={priority}
      />
    )
  }

  // Fallback if no images
  return (
    <div className="w-full h-full flex items-center justify-center bg-laboratory-black/5">
      <span className="text-laboratory-black/30 text-xs tracking-wide">
        No Image
      </span>
    </div>
  )
}

export default ProductMedia
