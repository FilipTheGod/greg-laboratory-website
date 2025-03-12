// src/components/products/ProductCard.tsx
"use client"

import React, { useState } from "react"
import Link from "next/link"
import { ShopifyProduct } from "@/lib/shopify"
import { formatPrice } from "@/utils/price"
import ProductMedia from "./ProductMedia"

interface ProductCardProps {
  product: ShopifyProduct
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false)

  // Extract available sizes from variants
  const availableSizes = Array.from(
    new Set(
      product.variants.map((variant) => {
        const parts = variant.title.split(" / ")
        return parts[0]
      })
    )
  ).sort()

  // Check if a size is in stock
  const isSizeAvailable = (size: string) => {
    return product.variants.some(
      (variant) =>
        variant.title.startsWith(size) &&
        (variant.available === undefined || variant.available === true)
    )
  }

  return (
    <Link
      href={`/product/${product.handle}`}
      className="group block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex flex-col">
        {/* Product image/video */}
        <div className="relative aspect-square overflow-hidden bg-laboratory-white">
          <div className="transition-transform group-hover:scale-105 duration-500 h-full w-full">
            <ProductMedia product={product} priority={true} />
          </div>
        </div>

        {/* Product info shown only on hover */}
        {isHovered && (
          <div className="mt-2">
            {/* Price */}
            <p className="text-laboratory-black text-xs tracking-wide text-center ">
              ${formatPrice(product.variants[0]?.price)}
            </p>

            {/* Sizes */}
            <div className="flex justify-center space-x-1">
              {availableSizes.map((size) => {
                const isAvailable = isSizeAvailable(size)
                return (
                  <div
                    key={size}
                    className={`relative flex items-center justify-center text-xs w-8 h-8
                      ${
                        isAvailable
                          ? "text-laboratory-black"
                          : "text-laboratory-black/40"
                      }`}
                  >
                    {size}
                    {!isAvailable && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-6 h-px bg-laboratory-black/40 transform rotate-45"></div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </Link>
  )
}

export default ProductCard
