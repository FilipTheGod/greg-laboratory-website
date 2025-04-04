// src/components/products/ProductDetailMedia.tsx
"use client"

import React from "react"
import Image from "next/image"
import { ShopifyProduct } from "@/lib/shopify"

interface ProductDetailMediaProps {
  product: ShopifyProduct
  priority?: boolean
  className?: string
}

/**
 * ProductDetailMedia component that only shows images (no videos)
 * For use on product detail pages
 */
const ProductDetailMedia: React.FC<ProductDetailMediaProps> = ({
  product,
  priority = true,
  className = "w-full h-full object-cover",
}) => {
  // Simply show the first product image
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
        No Image
      </span>
    </div>
  )
}

export default ProductDetailMedia
