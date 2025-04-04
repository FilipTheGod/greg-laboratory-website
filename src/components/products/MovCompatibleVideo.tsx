// src/components/products/MovCompatibleVideo.tsx
"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { ShopifyProduct } from "@/lib/shopify"

interface MovCompatibleVideoProps {
  product: ShopifyProduct
  className?: string
  fallbackImageUrl?: string
}

const MovCompatibleVideo: React.FC<MovCompatibleVideoProps> = ({
  product,
  className = "w-full h-full object-cover",
  fallbackImageUrl,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [posterUrl, setPosterUrl] = useState<string | null>(null)
  const [showFallback, setShowFallback] = useState(false)
  const [videoLoaded, setVideoLoaded] = useState(false)

  // Get the fallback image - either the provided one or the first product image
  const fallbackImage =
    fallbackImageUrl ||
    (product.images && product.images.length > 0 ? product.images[0].src : null)

  useEffect(() => {
    // Reset states when product changes
    setShowFallback(false)
    setVideoLoaded(false)

    // Get video directly from product media
    const videoMedia = product.media?.find(
      (media) => media.mediaContentType === "VIDEO"
    )
    if (videoMedia && videoMedia.sources && videoMedia.sources.length > 0) {
      const source = videoMedia.sources[0]
      setVideoUrl(source.url)

      // Get poster image if available
      if (videoMedia.previewImage && videoMedia.previewImage.src) {
        setPosterUrl(videoMedia.previewImage.src)
      } else if (product.images && product.images.length > 0) {
        setPosterUrl(product.images[0].src)
      }
    } else {
      // No video found, show fallback
      setShowFallback(true)
    }
  }, [product])

  // Handle video loading
  const handleVideoCanPlay = () => {
    setVideoLoaded(true)
  }

  // Handle video errors
  const handleVideoError = () => {
    console.error(`Error loading video for product: ${product.handle}`)
    setShowFallback(true)
  }

  // If we're showing the fallback image
  if (showFallback || !videoUrl) {
    if (fallbackImage) {
      return (
        <Image
          src={fallbackImage}
          alt={product.title}
          fill
          className={className}
          priority
        />
      )
    }
    return null
  }

  return (
    <>
      {/* Loading state - show while video is loading */}
      {!videoLoaded && posterUrl && (
        <Image
          src={posterUrl}
          alt={product.title}
          fill
          className={className}
          priority
        />
      )}

      {/* Video element with multiple source formats for better compatibility */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        onCanPlay={handleVideoCanPlay}
        onError={handleVideoError}
        className={`${className} ${
          videoLoaded ? "opacity-100" : "opacity-0"
        } transition-opacity duration-300`}
        poster={posterUrl || undefined}
      >
        {/* Try MP4 format first */}
        <source src={videoUrl} type="video/mp4" />
        {/* Fallback to MOV format */}
        <source src={videoUrl} type="video/quicktime" />
        {/* Final fallback message */}
        Your browser does not support the video tag.
      </video>
    </>
  )
}

export default MovCompatibleVideo
