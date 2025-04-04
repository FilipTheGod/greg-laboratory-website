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
  const [videoLoaded, setVideoLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Find video media in the product
  const videoMedia = product.media?.find(
    (media) => media.mediaContentType === "VIDEO"
  )

  // Set up video URL and preview image on component mount or when product changes
  useEffect(() => {
    // Reset states
    setVideoError(false)
    setVideoLoaded(false)
    setIsLoading(true)

    // Check for video in the product
    if (videoMedia && videoMedia.sources && videoMedia.sources.length > 0) {
      // Get the source URL
      const sourceUrl = videoMedia.sources[0].url
      setVideoUrl(sourceUrl)

      // Get the preview image if available
      if (videoMedia.previewImage && videoMedia.previewImage.src) {
        setPreviewImage(videoMedia.previewImage.src)
      } else if (product.images && product.images.length > 0) {
        // Use first product image as fallback preview
        setPreviewImage(product.images[0].src)
      }
    } else {
      // If no video found, mark as error to fall back to image
      setVideoError(true)
    }

    setIsLoading(false)
  }, [product.id, videoMedia, product.images])

  // Listen for video load events once URL is set
  useEffect(() => {
    const video = videoRef.current
    if (!video || !videoUrl) return

    const handleCanPlay = () => {
      setVideoLoaded(true)
    }

    const handleError = () => {
      console.error(`Video error for ${product.handle}:`, video.error)
      setVideoError(true)
    }

    video.addEventListener("canplay", handleCanPlay)
    video.addEventListener("error", handleError)

    // Try to manually load the video
    video.load()

    return () => {
      video.removeEventListener("canplay", handleCanPlay)
      video.removeEventListener("error", handleError)
    }
  }, [videoUrl, product.handle])

  // Show image if video has error, is loading, or no video available
  if (videoError || isLoading || !videoUrl) {
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

    // No images available
    return (
      <div className="w-full h-full flex items-center justify-center bg-laboratory-black/5">
        <span className="text-laboratory-black/30 text-xs tracking-wide">
          No Media
        </span>
      </div>
    )
  }

  // If we have a video URL and no errors, display the video
  return (
    <>
      {/* Show preview image while video loads */}
      {!videoLoaded && previewImage && (
        <Image
          src={previewImage}
          alt={product.title}
          fill
          className={className}
          priority={priority}
        />
      )}

      {/* The actual video element with multiple source formats */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className={`${className} ${
          videoLoaded ? "opacity-100" : "opacity-0"
        } transition-opacity duration-300`}
        poster={previewImage || undefined}
      >
        {/* MP4 source - widely supported */}
        <source src={videoUrl} type="video/mp4" />
        {/* MOV/QuickTime source */}
        <source src={videoUrl} type="video/quicktime" />
        {/* Generic video source */}
        <source src={videoUrl} />
        Your browser does not support the video tag.
      </video>
    </>
  )
}

export default ProductMedia
