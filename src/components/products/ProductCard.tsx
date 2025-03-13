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
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
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

  // Extract available colors from variants if they exist
  const availableColors = Array.from(
    new Set(
      product.variants
        .map((variant) => {
          const parts = variant.title.split(" / ")
          return parts.length > 1 ? parts[1] : null
        })
        .filter(Boolean)
    )
  )

  // Check if a size is in stock (and with specific color if needed)
  const isSizeAvailable = (size: string, color?: string | null) => {
    if (color) {
      return product.variants.some(
        (variant) =>
          variant.title === `${size} / ${color}` &&
          (variant.available === undefined || variant.available === true)
      )
    }
    return product.variants.some(
      (variant) =>
        variant.title.startsWith(size) &&
        (variant.available === undefined || variant.available === true)
    )
  }

  // Handle size click
  const handleSizeClick = (e: React.MouseEvent, size: string) => {
    e.preventDefault() // Prevent navigation to product page
    e.stopPropagation() // Prevent event bubbling

    if (!isSizeAvailable(size)) return // Don't do anything if size is not available

    // If there are no colors, add to cart directly
    if (availableColors.length === 0) {
      addToCartWithSize(size)
    } else {
      // If there are colors, set the selected size and wait for color selection
      setSelectedSize(size)
    }
  }

  // Handle color click
  const handleColorClick = (e: React.MouseEvent, color: string) => {
    e.preventDefault() // Prevent navigation to product page
    e.stopPropagation() // Prevent event bubbling

    if (selectedSize && isSizeAvailable(selectedSize, color)) {
      setSelectedColor(color)
      addToCartWithSizeAndColor(selectedSize, color)
    }
  }

  // Add to cart with just size
  const addToCartWithSize = async (size: string) => {
    setIsAddingToCart(true)

    // Find the variant that matches the size
    const variant = product.variants.find(
      (v) =>
        v.title === size && (v.available === undefined || v.available === true)
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
          setIsAddingToCart(false)
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

        // Show brief visual feedback
        setTimeout(() => {
          setSelectedSize(null)
          setIsAddingToCart(false)
        }, 1000)
      } catch (error) {
        console.error("Error adding to cart:", error)
        setIsAddingToCart(false)
      }
    }
  }

  // Add to cart with size and color
  const addToCartWithSizeAndColor = async (size: string, color: string) => {
    setIsAddingToCart(true)

    // Find the variant that matches both size and color
    const variant = product.variants.find(
      (v) =>
        v.title === `${size} / ${color}` &&
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
            } items of this size/color are available in stock${
              currentQuantity > 0
                ? ` and you already have ${currentQuantity} in your cart`
                : ""
            }.`
          )
          setIsAddingToCart(false)
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

        // Show brief visual feedback
        setTimeout(() => {
          setSelectedSize(null)
          setSelectedColor(null)
          setIsAddingToCart(false)
        }, 1000)
      } catch (error) {
        console.error("Error adding to cart:", error)
        setIsAddingToCart(false)
      }
    }
  }

  return (
    <div
      className="group block relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false)
        setSelectedSize(null)
        setSelectedColor(null)
      }}
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
        className={`flex justify-center space-x-1 transition-opacity ${
          isHovered ? "opacity-100" : "opacity-0"
        } h-4 mt-0.5`}
      >
        {availableSizes.map((size) => {
          const isAvailable = isSizeAvailable(size, selectedColor || undefined)
          const isSelected = selectedSize === size

          return (
            <button
              key={size}
              onClick={(e) => handleSizeClick(e, size)}
              className={`
                relative flex items-center justify-center text-xs w-8 h-8 transition-all
                ${
                  isSelected
                    ? "bg-laboratory-black text-laboratory-white"
                    : "bg-transparent"
                }
                ${
                  isAvailable
                    ? "text-laboratory-black hover:bg-laboratory-black/10 cursor-pointer"
                    : "text-laboratory-black/40 cursor-not-allowed"
                }
              `}
              disabled={!isAvailable || isAddingToCart}
            >
              {size}
              {!isAvailable && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-6 h-px bg-laboratory-black/40 transform rotate-45"></div>
                </div>
              )}
              {isAddingToCart && isSelected && (
                <div className="absolute inset-0 flex items-center justify-center bg-laboratory-black">
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Only show color selection after size is selected and only if there are colors */}
      {selectedSize && availableColors.length > 0 && (
        <div className="flex justify-center mt-3 space-x-2 transition-opacity opacity-100">
          {availableColors.map((color) => {
            const colorString = color as string
            const isAvailable = isSizeAvailable(selectedSize, colorString)

            return (
              <button
                key={colorString}
                onClick={(e) => handleColorClick(e, colorString)}
                className={`
                  px-2 py-1 text-xs
                  ${
                    isAvailable
                      ? " hover:bg-laboratory-black hover:text-laboratory-white"
                      : " text-laboratory-black/40 cursor-not-allowed"
                  }
                `}
                disabled={!isAvailable || isAddingToCart}
              >
                {colorString}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default ProductCard
