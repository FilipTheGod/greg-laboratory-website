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

/**
 * ProductMedia component that shows videos from local public folder
 * Falls back to product images if video isn't available
 */
const ProductMedia: React.FC<ProductMediaProps> = ({
  product,
  priority = false,
  className = "w-full h-full object-cover",
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [videoError, setVideoError] = useState(false)
  const [videoLoaded, setVideoLoaded] = useState(false)

  // Try to find a matching video for this product
  useEffect(() => {
    // Reset states
    setVideoError(false)
    setVideoLoaded(false)

    // Try to map product handle to a video filename
    // For simplicity, we look for exact matches first
    const possibleVideoNames = [
      // Check for simple pattern match
      `/video/${product.handle}.mp4`,
      // Try alternative formats based on your naming pattern
      `/video/Greg Laboratory ${product.handle.toUpperCase()}.mp4`,
      `/video/Greg Laboratory PC-${product.handle.toUpperCase()}.mp4`,
      `/video/Greg Laboratory ${product.productType} ${product.handle.split('-').pop()}.mp4`,
      // Generic fallback for product type
      `/video/${product.productType.replace(/\s+/g, '-').toLowerCase()}.mp4`
    ]

    // Set the first video name as our attempt
    setVideoUrl(possibleVideoNames[0])
    console.log(`Trying video: ${possibleVideoNames[0]} for product ${product.handle}`)
  }, [product.handle, product.productType])

  // Handle video loading and errors
  const handleVideoCanPlay = () => {
    setVideoLoaded(true)
    console.log(`Video loaded for ${product.handle}`)
  }

  const handleVideoError = () => {
    console.log(`Video error for ${product.handle} - falling back to image`)
    setVideoError(true)
  }

  // If video failed to load or we don't have a URL, fall back to image
  if (videoError || !videoUrl) {
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
      {!videoLoaded && product.images && product.images.length > 0 && (
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
        autoPlay
        loop
        muted
        playsInline
        className={`${className} ${videoLoaded ? "opacity-100" : "opacity-0"} transition-opacity duration-300`}
        poster={product.images && product.images.length > 0 ? product.images[0].src : undefined}
        onCanPlay={handleVideoCanPlay}
        onError={handleVideoError}
      >
        <source src={videoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </>
  )
}

export default ProductMedia