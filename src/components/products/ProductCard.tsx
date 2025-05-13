// src/components/products/ProductCard.tsx - Updated low stock indicator
"use client"

import React, { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ShopifyProduct } from "@/lib/shopify"
import { formatPrice } from "@/utils/price"
import { useCart } from "@/contexts/CartContext"
import EnhancedVideoPlayer from "../video/EnhancedVideoPlayer"

interface ProductCardProps {
  product: ShopifyProduct
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [, setIsHovered] = useState(false)
  const { addToCart, cartItems } = useCart()

  // Extract available sizes from variants
  const availableSizes = Array.from(
    new Set(
      product.variants.map((variant) => {
        const parts = variant.title.split(" / ")
        return parts[0]
      })
    )
  ).sort()

  // Get video sources from media if available
  const videoMedia = product.media?.find((m) => m.mediaContentType === "VIDEO")

  // Get preview image
  const previewImage =
    videoMedia?.previewImage?.src ||
    (product.images && product.images.length > 0 ? product.images[0].src : null)

  // Check if a size is available (regardless of color)
  const isSizeAvailable = (size: string) => {
    return product.variants.some(
      (variant) =>
        (variant.title === size || variant.title.startsWith(`${size} /`)) &&
        (variant.available === undefined || variant.available === true)
    )
  }

  // Get inventory quantity for a size
  const getSizeInventory = (size: string): number | undefined => {
    const variant = product.variants.find(
      (v) =>
        (v.title === size || v.title.startsWith(`${size} /`)) &&
        (v.available === undefined || v.available === true)
    )
    return variant?.inventoryQuantity
  }

  // Handle size click - add to cart directly regardless of color
  const handleSizeClick = (e: React.MouseEvent, size: string) => {
    e.preventDefault() // Prevent navigation to product page
    e.stopPropagation() // Prevent event bubbling

    if (!isSizeAvailable(size)) return // Don't do anything if size is not available

    // Find the variant that matches the size
    const variant = product.variants.find(
      (v) =>
        (v.title === size || v.title.startsWith(`${size} /`)) &&
        (v.available === undefined || v.available === true)
    )

    if (variant) {
      // Check inventory limits
      if (variant.inventoryQuantity !== undefined) {
        // Get current quantity in cart
        const existingItem = cartItems.find(
          (item) => item.variant.id === variant.id
        )
        const currentQuantity = existingItem ? existingItem.quantity : 0

        // Check if adding one more would exceed inventory
        if (currentQuantity + 1 > variant.inventoryQuantity) {
          alert(
            `Sorry, only ${
              variant.inventoryQuantity
            } items of this size are available in stock${
              currentQuantity > 0
                ? ` and you already have ${currentQuantity} in your cart`
                : ""
            }.`
          )
          return
        }
      }

      // Convert price to string if needed
      const priceString =
        typeof variant.price === "string" ? variant.price : variant.price.amount

      try {
        addToCart({
          id: product.id,
          title: product.title,
          handle: product.handle,
          quantity: 1,
          variant: {
            id: variant.id,
            title: variant.title,
            price: priceString,
            image: product.images[0]?.src || "",
          },
        })
      } catch (error) {
        console.error("Error adding to cart:", error)
      }
    }
  }

  return (
    <div
      className="group block relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/product/${product.handle}`} className="block">
        <div className="flex flex-col">
          {/* Product media (video or image) using EnhancedVideoPlayer */}
          <div className="relative aspect-square overflow-hidden cursor-pointer">
            {videoMedia?.sources ? (
              <EnhancedVideoPlayer
                sources={videoMedia.sources}
                poster={previewImage || undefined}
                className="h-full w-full"
                alt={product.title}
                fallbackImageUrl={
                  product.images && product.images.length > 0
                    ? product.images[0].src
                    : undefined
                }
                showPlayButton={false}
                // Set this to false to allow clicks to pass through to the parent Link
                preventClickPropagation={false}
              />
            ) : product.images && product.images.length > 0 ? (
              <Image
                src={product.images[0].src}
                alt={product.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-laboratory-black/5">
                <span className="text-laboratory-black/30 text-xs tracking-wide">
                  No Image
                </span>
              </div>
            )}
          </div>

          {/* Price - Always visible on mobile, only on hover for desktop */}
          <div className="mt-3">
            <div
              className={`text-laboratory-black md:text-xs text-sm tracking-wide text-center transition-opacity md:opacity-0 md:group-hover:opacity-100`}
            >
              ${formatPrice(product.variants[0]?.price)}
            </div>
          </div>
        </div>
      </Link>

      {/* Sizes - Always visible on mobile, only on hover for desktop */}
      <div
        className={`flex justify-center space-x-4 md:space-x-3 transition-opacity mt-3 mb-4 md:mb-0 md:mt-2 md:opacity-0 md:group-hover:opacity-100`}
      >
        {availableSizes.map((size) => {
          const isAvailable = isSizeAvailable(size)
          const inventory = getSizeInventory(size)
          const isLowStock = isAvailable && inventory !== undefined && inventory <= 3

          return (
            <div key={size} className="flex flex-col items-center">
              <button
                onClick={(e) => handleSizeClick(e, size)}
                className={`
                  md:text-xs text-sm transition-all relative
                  ${
                    isAvailable
                      ? "text-laboratory-black hover:underline cursor-pointer"
                      : "text-laboratory-black/40 cursor-not-allowed"
                  }
                `}
                disabled={!isAvailable}
              >
                {size}
                {!isAvailable && (
                  <span className="absolute left-0 right-0 top-1/2 h-px bg-laboratory-black/40 transform rotate-45 -translate-y-1/2"></span>
                )}
              </button>

              {/* Low stock indicator - just the number in red */}
              {isLowStock && (
                <p className="text-[10px] text-red-500 mt-1">
                  {inventory}
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ProductCard