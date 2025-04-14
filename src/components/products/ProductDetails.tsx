// src/components/products/ProductDetails.tsx
"use client"

import React, { useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { useCart } from "@/contexts/CartContext"
import { ShopifyProduct } from "@/lib/shopify"
import { formatPrice } from "@/utils/price"
import ProductColorVariants from "./ProductColorVariants"
import { useRelatedProducts } from "@/hooks/useRelatedProducts"
import ProductFeaturesSection from "./ProductFeaturesSection"
import MobileProductCarousel from "./MobileProductCarousel"

interface ProductDetailsProps {
  product: ShopifyProduct
}

const ProductDetails: React.FC<ProductDetailsProps> = ({ product }) => {
  const [selectedSize, setSelectedSize] = useState("")
  // At the top of the component:
  const [showDescription, setShowDescription] = useState(false)

  const { addToCart, isLoading, cartItems } = useCart()

  // Fetch related color variants
  const {
    colorVariants,
    currentColor,
    hasColorVariants,
    isLoading: isLoadingVariants,
  } = useRelatedProducts(product.handle)

  // Extract available sizes from variants
  const availableSizes = Array.from(
    new Set(
      product.variants.map((variant) => {
        const parts = variant.title.split(" / ")
        return parts[0]
      })
    )
  ).sort()

  // Handle add to cart
  const handleAddToCart = () => {
    if (!selectedSize) {
      alert("Please select a size")
      return
    }

    // Find the correct variant based on selected size
    const variant = product.variants.find(
      (v) => v.title === selectedSize || v.title.startsWith(`${selectedSize} /`)
    )

    if (!variant) {
      alert("Selected size is not available")
      return
    }

    // Check inventory if available
    if (variant.inventoryQuantity !== undefined) {
      const existingItem = cartItems.find(
        (item) => item.variant.id === variant.id
      )
      const currentQuantity = existingItem ? existingItem.quantity : 0

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

    // Add to cart
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
  }

  // Get available media items (ALL images only)
  const mediaItems = React.useMemo(() => {
    if (product.images && product.images.length > 0) {
      return product.images
    }
    return []
  }, [product.images])

  // Check size availability and inventory
  const getSizeAvailability = (
    size: string
  ): { available: boolean; inventoryQuantity?: number } => {
    const variantsWithSize = product.variants.filter(
      (variant) =>
        variant.title === size || variant.title.startsWith(`${size} /`)
    )

    if (variantsWithSize.length === 0) {
      return { available: false }
    }

    const anyUnavailable = variantsWithSize.some((v) => v.available === false)
    const firstVariant = variantsWithSize[0]

    return {
      available: !anyUnavailable,
      inventoryQuantity: firstVariant.inventoryQuantity,
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-6 px-4 md:px-16 product-details-container">
      {/* Mobile Carousel - Only visible on mobile */}
      <div className="md:hidden w-full mb-6">
        <MobileProductCarousel
          images={mediaItems}
          productTitle={product.title}
        />
      </div>

      {/* Desktop Layout - Product Media - Left Side (2/3 of screen) */}
      <div className="hidden md:block md:col-span-2 space-y-6 md:pl-12">
        {/* First Image */}
        <div className="relative aspect-square overflow-hidden bg-laboratory-white">
          {product.images && product.images.length > 0 ? (
            <Image
              src={product.images[0].src}
              alt={product.title}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-laboratory-black/5">
              <span className="text-laboratory-black/30 text-xs tracking-wide">
                No Media Available
              </span>
            </div>
          )}
        </div>

        {/* Remaining Images */}
        {mediaItems.slice(1).map((image, index) => (
          <div
            key={index}
            className="relative aspect-square overflow-hidden bg-laboratory-white"
          >
            <Image
              src={image.src}
              alt={image.altText || `${product.title} - view ${index + 2}`}
              fill
              className="object-cover"
              priority={index === 0}
            />
          </div>
        ))}
      </div>

      {/* Product Info - Right Side (1/3 of screen on desktop, full width on mobile) */}
      <div className="md:sticky md:top-24 self-start max-h-[calc(100vh-8rem)] pr-0 md:pr-4 overflow-y-auto">
        <div className="space-y-4 pl-1">
          <div>
            <p className="text-xs tracking-wide text-laboratory-black/70 uppercase mb-2">
              {product.productType}
            </p>
            <h1 className="text-sm tracking-wide uppercase mb-1">
              {product.title}
            </h1>
            <p className="text-xs tracking-wide mb-8">
              ${formatPrice(product.variants[0]?.price)}
            </p>
          </div>

          {/* Size Selection */}
          <div className="mb-4">
            <h2 className="text-xs tracking-wide mb-2">SELECT SIZE</h2>

            <div className="flex flex-wrap gap-3">
              {availableSizes.map((size) => {
                const { available, inventoryQuantity } =
                  getSizeAvailability(size)
                const isLowStock =
                  available &&
                  inventoryQuantity !== undefined &&
                  inventoryQuantity <= 3

                return (
                  <div key={size} className="flex flex-col items-start">
                    <button
                      className={`px-1 py-1 transition-all text-xs relative
              ${
                selectedSize === size
                  ? "text-laboratory-black underline"
                  : "text-laboratory-black/70 hover:underline"
              }
              ${!available ? "opacity-50 cursor-not-allowed" : ""}
              tracking-wide`}
                      onClick={() => available && setSelectedSize(size)}
                      disabled={!available}
                    >
                      {size}
                      {!available && (
                        <span className="absolute left-0 right-0 top-1/2 h-px bg-laboratory-black/50 transform rotate-45 -translate-y-1/2"></span>
                      )}
                    </button>
                    {isLowStock && (
                      <p className="text-xs text-red-500 mt-1">
                        Only {inventoryQuantity} left
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
          {!isLoadingVariants && hasColorVariants && (
            <ProductColorVariants
              currentColor={currentColor}
              colorVariants={colorVariants}
              className="mb-2" // Make it smaller with less vertical padding
            />
          )}

          {/* Add to Cart Button */}
          <div className="pt-6 pb-4">
            <motion.button
              className={`w-full py-3 text-sm tracking-wide transition-colors
      ${
        selectedSize
          ? "bg-laboratory-black text-laboratory-white"
          : "bg-laboratory-black/30 text-laboratory-white"
      }
      disabled:opacity-50`}
              onClick={handleAddToCart}
              whileTap={{ scale: 0.98 }}
              disabled={!selectedSize || isLoading}
            >
              {isLoading ? "ADDING..." : "ADD TO CART"}
            </motion.button>
          </div>

          {/* Product Details Section */}
          <div className="pt-4 border-t border-laboratory-black/10">
            <button
              className="flex items-center justify-between w-full text-xs tracking-wide py-2 group hover:underline"
              onClick={() => setShowDescription(!showDescription)}
            >
              <span>PRODUCT DETAILS</span>
              <span>{showDescription ? "−" : "+"}</span>
            </button>
            {showDescription && (
              <div className="py-2 text-xs tracking-wide product-description">
                <div
                  dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
                />
              </div>
            )}
          </div>

          {/* Product Features Section */}

          <ProductFeaturesSection product={product} />
        </div>
      </div>
    </div>
  )
}

export default ProductDetails
