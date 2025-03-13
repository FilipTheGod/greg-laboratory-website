// src/components/products/ProductCard.tsx
"use client"

import React, { useState } from "react"
import Link from "next/link"
import { ShopifyProduct } from "@/lib/shopify"
import { formatPrice } from "@/utils/price"
import ProductMedia from "./ProductMedia"
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

    // Always add to cart directly, regardless of colors
    addToCartWithSize(size)
  }

  // Add to cart with just size
  const addToCartWithSize = async (size: string) => {
    // Find the variant that matches the size
    // If there are color variants, take the first available one with this size
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
        await addToCart({
          id: product.id,
          title: product.title,
          handle: product.handle,
          quantity: 1,
          variant: {
            id: variant.id,
            title: variant.title,
            price: priceString,
            image: product.images[0].src,
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
          {/* Product image/video */}
          <div className="relative aspect-square overflow-hidden bg-laboratory-white">
            <div className="transition-transform duration-500 h-full w-full">
              <ProductMedia product={product} priority={false} />
            </div>
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
