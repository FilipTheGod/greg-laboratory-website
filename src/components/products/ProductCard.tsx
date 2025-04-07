// src/components/products/ProductCard.tsx
"use client"

import React, { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ShopifyProduct } from "@/lib/shopify"
import { formatPrice } from "@/utils/price"
import { useCart } from "@/contexts/CartContext"

interface ProductCardProps {
  product: ShopifyProduct
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false)
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

  // Check if media includes a video
  const hasVideo = product.media?.some((m) => m.mediaContentType === "VIDEO")
  const videoMedia = product.media?.find((m) => m.mediaContentType === "VIDEO")
  const videoUrl = videoMedia?.sources?.[0]?.url
  const videoPreviewImage = videoMedia?.previewImage?.src

  // Check if a size is in stock (regardless of color)
  const isSizeAvailable = (size: string) => {
    return product.variants.some(
      (variant) =>
        (variant.title === size || variant.title.startsWith(`${size} /`)) &&
        (variant.available === undefined || variant.available === true)
    )
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
          {/* Product media (video or image) */}
          <div className="relative aspect-square overflow-hidden bg-laboratory-white">
            {hasVideo && videoUrl ? (
              <video
                autoPlay
                loop
                muted
                playsInline
                className="h-full w-full object-cover"
                poster={
                  videoPreviewImage || product.images[0]?.src || undefined
                }
              >
                <source src={videoUrl} type="video/mp4" />
              </video>
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
          <div>
            {/* Price - always visible but only shows when hovered */}
            <div
              className={`text-laboratory-black text-xs tracking-wide text-center transition-opacity ${
                isHovered ? "opacity-100" : "opacity-0"
              } h-4 mt-1`}
            >
              ${formatPrice(product.variants[0]?.price)}
            </div>
          </div>
        </div>
      </Link>

      {/* Sizes - always present in the DOM but only visible when hovered */}
      <div
        className={`flex justify-center space-x-3 transition-opacity ${
          isHovered ? "opacity-100" : "opacity-0"
        } h-4 mt-2`}
      >
        {availableSizes.map((size) => {
          const isAvailable = isSizeAvailable(size)

          return (
            <button
              key={size}
              onClick={(e) => handleSizeClick(e, size)}
              className={`
                text-xs transition-all relative
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
          )
        })}
      </div>
    </div>
  )
}

export default ProductCard
