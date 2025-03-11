// src/components/products/ProductCard.tsx
import React, { useEffect, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ShopifyProduct } from "@/lib/shopify"
import { formatPrice } from "@/utils/price"

interface ProductCardProps {
  product: ShopifyProduct
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [, setVideoLoaded] = useState(false)
  const [videoError, setVideoError] = useState(false)

  // Check if the product has video media
  const hasVideo =
    product.media?.some((media) => media.mediaContentType === "VIDEO") || false

  // Get video URL if available
  const videoMedia = product.media?.find(
    (media) => media.mediaContentType === "VIDEO"
  )
  const videoUrl = videoMedia?.sources?.[0]?.url

  // Handle video events
  const handleVideoLoad = () => {
    setVideoLoaded(true)
  }

  const handleVideoError = () => {
    console.error(`Video error for product ${product.title}`)
    setVideoError(true)
  }

  // Initialize video element after component mounts
  useEffect(() => {
    if (videoRef.current && videoUrl) {
      // Set up event handlers for debugging
      videoRef.current.onloadeddata = handleVideoLoad
      videoRef.current.onerror = handleVideoError

      // Force reload the video element to ensure it plays
      videoRef.current.load()
    }
  }, [videoUrl, handleVideoError])

  return (
    <Link href={`/product/${product.handle}`} className="group">
      <div className="relative aspect-square overflow-hidden bg-laboratory-white mb-2">
        {hasVideo && videoUrl && !videoError ? (
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"
          >
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ) : product.images && product.images.length > 0 ? (
          <Image
            src={product.images[0].src}
            alt={product.title}
            fill
            className="object-cover transition-transform group-hover:scale-105 duration-500"
            priority={true}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-laboratory-black/5">
            <span className="text-laboratory-black/30 text-medium tracking-wide">
              No Image
            </span>
          </div>
        )}
      </div>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-laboratory-black/70 text-regular tracking-wide uppercase">
            {product.productType}
          </h3>
          <h2 className="text-laboratory-black text-medium tracking-wide uppercase">
            {product.title}
          </h2>
        </div>
        <p className="text-laboratory-black text-medium tracking-wide">
          ${formatPrice(product.variants[0]?.price)}
        </p>
      </div>
    </Link>
  )
}

export default ProductCard
