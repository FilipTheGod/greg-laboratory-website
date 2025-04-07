// src/components/products/EnhancedProductMedia.tsx
"use client"

import React, { useRef } from "react"
import Image from "next/image"
import { ShopifyProduct } from "@/lib/shopify"
import { useVideoLoader } from "@/hooks/useVideoLoader"

interface EnhancedProductMediaProps {
  product: ShopifyProduct
  priority?: boolean
  className?: string
  showControls?: boolean
}

/**
 * Enhanced ProductMedia component with advanced video loading and fallbacks
 */
const EnhancedProductMedia: React.FC<EnhancedProductMediaProps> = ({
  product,
  priority = false,
  className = "w-full h-full object-cover",
  showControls = false,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const { videoUrl, videoReady, error, setVideoReady, setError } =
    useVideoLoader(product)

  // Handle video loading and errors
  const handleVideoCanPlay = () => {
    setVideoReady(true)
    console.log(`Video loaded successfully for ${product.handle}`)
  }

  const handleVideoError = () => {
    console.error(`Video error for ${product.handle}`)
    setError(true)
  }

  // If video failed to load or we don't have a URL, fall back to image
  if (error || !videoUrl) {
    // Show first product image as fallback
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

    // Fallback for no images
    return (
      <div className="w-full h-full flex items-center justify-center bg-laboratory-black/5">
        <span className="text-laboratory-black/30 text-xs tracking-wide">
          No Media
        </span>
      </div>
    )
  }

  // Return video with image fallback while loading
  return (
    <>
      {/* Show image while video is loading */}
      {!videoReady && product.images && product.images.length > 0 && (
        <Image
          src={product.images[0].src}
          alt={product.title}
          fill
          className={className}
          priority={priority}
        />
      )}

      {/* Video element */}
      <video
        ref={videoRef}
        autoPlay={!showControls}
        loop
        muted
        playsInline
        controls={showControls}
        className={`${className} ${
          videoReady ? "opacity-100" : "opacity-0"
        } transition-opacity duration-300`}
        poster={
          product.images && product.images.length > 0
            ? product.images[0].src
            : undefined
        }
        onCanPlay={handleVideoCanPlay}
        onError={handleVideoError}
      >
        <source src={videoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </>
  )
}

export default EnhancedProductMedia
