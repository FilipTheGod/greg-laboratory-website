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

// Define interface for the media edge from API
interface MediaEdge {
  node: {
    id: string
    mediaContentType: string
    sources?: {
      format: string
      mimeType: string
      url: string
    }[]
    preview?: {
      image?: {
        url: string
      }
    }
  }
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

  // Check if product has video media in Shopify data
  const hasMediaData = product.media && product.media.length > 0
  const videoMedia =
    hasMediaData && product.media
      ? product.media.find((media) => media.mediaContentType === "VIDEO")
      : null
  const firstVideoSource = videoMedia?.sources?.[0]?.url || null

  useEffect(() => {
    // If we already have video data from Shopify, use it
    if (firstVideoSource) {
      setVideoUrl(firstVideoSource)
      setPreviewImage(videoMedia?.previewImage?.src || null)
      setIsLoading(false)
      return
    }

    // Otherwise, fetch from our API endpoint
    const fetchMedia = async () => {
      if (!product.handle) {
        setIsLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/products/media/${product.handle}`)
        if (response.ok) {
          const data = await response.json()
          const productData = data.data?.productByHandle

          if (productData?.media?.edges) {
            const videoEdge = productData.media.edges.find(
              (edge: MediaEdge) => edge.node.mediaContentType === "VIDEO"
            )

            if (videoEdge?.node?.sources?.[0]?.url) {
              setVideoUrl(videoEdge.node.sources[0].url)
              if (videoEdge.node.preview?.image?.url) {
                setPreviewImage(videoEdge.node.preview.image.url)
              }
            }
          }
        }
      } catch (_) {
        // Handle error silently - no need to log
      } finally {
        setIsLoading(false)
      }
    }

    fetchMedia()
  }, [product.handle, firstVideoSource, videoMedia])

  const handleVideoError = () => {
    setVideoError(true)
  }

  // If video is available and hasn't errored, show video
  if ((videoUrl || firstVideoSource) && !videoError && !isLoading) {
    return (
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className={className}
        poster={previewImage || undefined}
        onError={handleVideoError}
      >
        {(videoUrl || firstVideoSource) && (
          <source src={videoUrl || firstVideoSource || ""} type="video/mp4" />
        )}
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
      <span className="text-laboratory-black/30 text-medium tracking-wide">
        No Image
      </span>
    </div>
  )
}

export default ProductMedia
