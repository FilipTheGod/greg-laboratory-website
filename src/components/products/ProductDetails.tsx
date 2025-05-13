// src/components/products/ProductDetails.tsx - Fixed ESLint errors
"use client"

import React, { useState } from "react"
import Image from "next/image"
import { useCart } from "@/contexts/CartContext"
import { ShopifyProduct } from "@/lib/shopify"
import { formatPrice } from "@/utils/price"
import ProductColorVariants from "./ProductColorVariants"
import { useRelatedProducts } from "@/hooks/useRelatedProducts"
import MobileProductCarousel from "./MobileProductCarousel"
import ProductDetailsAccordion from "./ProductDetailsAccordion"
import ProductSizeGuide from "./ProductSizeGuide" // We'll create this component next

interface ProductDetailsProps {
  product: ShopifyProduct
}

// Special helper function to force color variants for specific products
const shouldForceColorVariants = (handle: string): boolean => {
  return (
    handle.toUpperCase().includes('PC-SS-J25') || // Jackets
    handle.toUpperCase().includes('PC-SS-P23')    // Pants
  );
};

const ProductDetails: React.FC<ProductDetailsProps> = ({ product }) => {
  const [selectedSize, setSelectedSize] = useState("")
  const [showSizeGuide, setShowSizeGuide] = useState(false)

  const { addToCart, isLoading, cartItems } = useCart()

  // Force hasColorVariants for special product types
  const forceColorVariants = shouldForceColorVariants(product.handle);

  // Fetch related color variants
  const {
    colorVariants,
    currentColor,
    isLoading: isLoadingVariants,
  } = useRelatedProducts(product.handle)

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

  // Extract available sizes from variants
  const availableSizes = Array.from(
    new Set(
      product.variants.map((variant) => {
        const parts = variant.title.split(" / ")
        return parts[0]
      })
    )
  ).sort()

  // Toggle size guide visibility
  const toggleSizeGuide = () => {
    setShowSizeGuide(!showSizeGuide)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-6 px-4 md:pr-16 md:pl-0 product-details-container bg-[#fcfffc]">
      {/* Mobile Carousel - Only visible on mobile */}
      <div className="md:hidden w-full mb-6">
        <MobileProductCarousel
          images={mediaItems}
          productTitle={product.title}
        />
      </div>

      {/* Desktop Layout - Product Media - Left Side (2/3 of screen) */}
      <div className="hidden md:block md:col-span-2 md:pl-0">
        {/* First Image */}
        <div className="relative aspect-square overflow-hidden bg-[#fcfffc] w-full">
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
            className="relative aspect-square overflow-hidden bg-laboratory-white w-full"
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
            {/* Reduced space between series and name */}
            <p className="text-xs tracking-wide text-laboratory-black/70 uppercase mb-1">
              {product.productType}
            </p>
            <h1 className="product-title uppercase mb-1">{product.title}</h1>
            <p className="text-xs tracking-wide mb-8">
              ${formatPrice(product.variants[0]?.price)}
            </p>
          </div>

          {/* Size Selection */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xs tracking-wide">SELECT SIZE</h2>
              <button
                onClick={toggleSizeGuide}
                className="text-xs tracking-wide underline"
              >
                Size Guide
              </button>
            </div>

            {/* Size Guide Modal */}
            {showSizeGuide && (
              <ProductSizeGuide
                productHandle={product.handle}
                onClose={toggleSizeGuide}
              />
            )}

            <div className="flex flex-wrap gap-3">
              {availableSizes.map((size) => {
                const { available, inventoryQuantity } =
                  getSizeAvailability(size)
                const isLowStock =
                  available &&
                  inventoryQuantity !== undefined &&
                  inventoryQuantity <= 3

                return (
                  <div key={size} className="flex flex-col items-center">
                    <button
                      className={`px-3 py-1 transition-all text-xs relative tracking-wide
                        ${
                          selectedSize === size
                            ? "text-laboratory-black underline"
                            : available
                            ? "text-laboratory-black/70 hover:underline"
                            : "text-laboratory-black/40 cursor-not-allowed"
                        }`}
                      onClick={() => available && setSelectedSize(size)}
                      disabled={!available}
                    >
                      {size}
                      {!available && (
                        <span className="absolute left-0 right-0 top-1/2 h-px bg-laboratory-black/40 transform rotate-45 -translate-y-1/2"></span>
                      )}
                    </button>
                    {isLowStock && (
                      <p className="text-[10px] text-red-500 mt-1">
                        {inventoryQuantity}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Always display for force color variants, otherwise check if loaded and has variants */}
          {(!isLoadingVariants || forceColorVariants) && (
            <ProductColorVariants
              currentColor={currentColor}
              colorVariants={colorVariants}
              className="mb-2"
            />
          )}

          {/* Add to Cart Button */}
          <div className="pt-6 pb-4">
            <button
              className={`w-full py-3 text-sm tracking-wide transition-colors add-to-cart-button
                ${
                  selectedSize
                    ? "add-to-cart-button--enabled bg-laboratory-black text-laboratory-white"
                    : "add-to-cart-button--disabled bg-laboratory-black/40 text-laboratory-white"
                }
                disabled:opacity-50`}
              onClick={handleAddToCart}
              disabled={!selectedSize || isLoading}
            >
              {isLoading ? "ADDING..." : "ADD TO CART"}
            </button>
          </div>

          {/* Product Accordion Sections */}
          <ProductDetailsAccordion product={product} />
        </div>
      </div>
    </div>
  )
}

export default ProductDetails