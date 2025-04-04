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
  const [fallbackToImage, setFallbackToImage] = useState(false)

  // Determine if we should try to show a video based on known pattern
  useEffect(() => {
    // Reset states when product changes
    setVideoError(false)
    setVideoLoaded(false)
    setFallbackToImage(false)

    // First, try to get video data from the Shopify API if it exists
    const videoMedia = product.media?.find(
      (media) => media.mediaContentType === "VIDEO"
    )

    if (videoMedia && videoMedia.sources && videoMedia.sources.length > 0) {
      // Use the video data from Shopify API
      setVideoUrl(videoMedia.sources[0].url)
      setPreviewImage(videoMedia.previewImage?.src || null)
      console.log(
        `Using Shopify API video for ${product.handle}:`,
        videoMedia.sources[0].url
      )
    } else {
      // If no video in the API, use the direct URL pattern based on your screenshot
      try {
        // Construct the URL based on pattern from your screenshot
        const constructedUrl = `https://greglaboratory.com/cdn/shop/videos/c/vp/${product.handle}/${product.handle}-HD-720p-1.6Mbps-3913547.mp4?v=0`
        const previewUrl = `https://greglaboratory.com/cdn/shop/files/preview_images/${product.handle}.thumbnail.0000000000_1100x.jpg?v=1733237045`

        setVideoUrl(constructedUrl)
        setPreviewImage(previewUrl)
        console.log(
          `Using pattern-matched video for ${product.handle}:`,
          constructedUrl
        )
      } catch (error) {
        console.error(
          `Error generating video URL for product ${product.handle}:`,
          error
        )
        setFallbackToImage(true)
      }
    }
  }, [product])

  // Handle video load events
  useEffect(() => {
    if (!videoRef.current || !videoUrl) return

    const handleCanPlay = () => {
      setVideoLoaded(true)
      console.log(`Video loaded successfully for ${product.handle}`)
    }

    const handleError = (e: ErrorEvent) => {
      console.error(`Video load error for ${product.handle}:`, e)
      setVideoError(true)
      setFallbackToImage(true)
    }

    const videoElement = videoRef.current
    videoElement.addEventListener("canplay", handleCanPlay)
    videoElement.addEventListener("error", handleError as EventListener)

    // Force reload the video to try with the new source
    try {
      videoElement.load()
    } catch (e) {
      console.error("Error reloading video:", e)
    }

    return () => {
      videoElement.removeEventListener("canplay", handleCanPlay)
      videoElement.removeEventListener("error", handleError as EventListener)
    }
  }, [videoUrl, product.handle])

  // If we have an error or should fall back to an image
  if (videoError || fallbackToImage || !videoUrl) {
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

    // Fallback if no images (shouldn't happen)
    return (
      <div className="w-full h-full flex items-center justify-center bg-laboratory-black/5">
        <span className="text-laboratory-black/30 text-xs tracking-wide">
          No Media
        </span>
      </div>
    )
  }

  // If we have a video URL, try to show the video
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

      {/* Video element with multiple sources for better compatibility */}
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
        onError={() => {
          console.error(`Video error occurred for ${product.handle}`)
          setVideoError(true)
          setFallbackToImage(true)
        }}
      >
        {/* Add both MP4 and MOV sources for compatibility */}
        <source src={videoUrl} type="video/mp4" />
        <source src={videoUrl} type="video/quicktime" />
        Your browser does not support the video tag.
      </video>
    </>
  )
}

export default ProductMedia
