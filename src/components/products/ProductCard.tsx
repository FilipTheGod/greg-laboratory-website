// src/components/products/ProductCard.tsx
import React, { useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { ShopifyProduct } from "@/lib/shopify"
import { formatPrice } from "@/utils/price" // Assuming you've created this

interface ProductCardProps {
  product: ShopifyProduct
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const videoRef = useRef<HTMLVideoElement>(null)

  // Extract price from the nested structure
  let price = "0.00"
  try {
    if (product.variants && product.variants[0] && product.variants[0].price) {
      // Handle both string and object formats for price
      if (typeof product.variants[0].price === "string") {
        price = parseFloat(product.variants[0].price).toFixed(2)
      } else if (
        typeof product.variants[0].price === "object" &&
        product.variants[0].price.amount
      ) {
        // Extract amount from the price object
        price = parseFloat(product.variants[0].price.amount).toFixed(2)
      }
    }
  } catch (err) {
    console.error(`Error parsing price for ${product.title}:`, err)
  }

  const category = product.productType

  // Check if the product has video media
  const hasVideo =
    product.media &&
    product.media.length > 0 &&
    product.media[0].mediaContentType === "VIDEO"

  // Get video URL if available
  const videoUrl = hasVideo && product.media?.[0]?.sources?.[0]?.url

  // Log media information for debugging
  console.log(`Product ${product.title} media info:`, {
    hasMedia: !!product.media,
    mediaCount: product.media?.length || 0,
    hasVideo,
    videoUrl,
    firstMediaType: product.media?.[0]?.mediaContentType,
  })

  // Initialize video element after component mounts
  useEffect(() => {
    if (videoRef.current && videoUrl) {
      // Force reload the video element to ensure it plays
      videoRef.current.load()
    }
  }, [videoUrl])

  return (
    <Link href={`/product/${product.handle}`} className="group">
      <div className="relative aspect-square overflow-hidden bg-laboratory-white mb-2">
        {hasVideo && videoUrl ? (
          // Video display with explicit controls for debugging
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
          // Image fallback if no video
          <Image
            src={product.images[0].src}
            alt={product.title}
            fill
            className="object-cover transition-transform group-hover:scale-105 duration-500"
            priority={true}
          />
        ) : (
          // Fallback for products without images
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
            {category}
          </h3>
          <h2 className="text-laboratory-black text-medium tracking-wide uppercase">
            {product.title}
          </h2>
        </div>
        <p className="text-laboratory-black text-medium tracking-wide">
          ${formatPrice(price)}
        </p>
      </div>
    </Link>
  )
}

export default ProductCard
