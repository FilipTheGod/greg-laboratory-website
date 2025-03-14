// src/components/products/ProductDetails.tsx - Updated version
"use client"

import React, { useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { useCart } from "@/contexts/CartContext"
import { ShopifyProduct } from "@/lib/shopify"
import { formatPrice } from "@/utils/price"
import ProductMedia from "./ProductMedia"
import ProductColorVariants from "./ProductColorVariants"
import { useRelatedProducts } from "@/hooks/useRelatedProducts"
import ProductFeatureIcon, {
  FeatureType,
  featureDisplayNames,
  featureDescriptions,
} from "./ProductFeatureIcon"

interface ProductDetailsProps {
  product: ShopifyProduct
}

const ProductDetails: React.FC<ProductDetailsProps> = ({ product }) => {
  const [selectedSize, setSelectedSize] = useState("")
  const [showingSizeGuide, setShowingSizeGuide] = useState(false)
  const [showDescription, setShowDescription] = useState(false)
  const [showFeatures, setShowFeatures] = useState(false)
  const { addToCart, isLoading, cartItems } = useCart()

  // Fetch related color variants
  const {
    colorVariants,
    currentColor,
    hasColorVariants,
    isLoading: isLoadingVariants,
  } = useRelatedProducts(product.handle)

  // Check if the product has video media
  const hasVideo =
    product.media?.some((media) => media.mediaContentType === "VIDEO") || false

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

    // Since we now handle colors as separate products,
    // we only need to find the variant by size
    const variant = product.variants.find(
      (v) => v.title === selectedSize || v.title.startsWith(`${selectedSize} /`)
    )

    if (!variant) {
      alert("Selected size is not available")
      return
    }

    // Check inventory limits
    if (variant.inventoryQuantity !== undefined) {
      // Get current quantity in cart for this variant
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

    // Add to cart via context
    addToCart({
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
  }

  // In ProductDetails.tsx
  const getProductFeatures = () => {
    if (!product.metafields?.features?.value) {
      return []
    }

    // Ensure value is parsed if it's a string
    let featuresArray: string[]
    if (typeof product.metafields.features.value === "string") {
      try {
        featuresArray = JSON.parse(product.metafields.features.value)
      } catch (e) {
        console.error("Error parsing features:", e)
        return []
      }
    } else {
      featuresArray = product.metafields.features.value
    }

    return featuresArray
      .filter((feature): feature is FeatureType =>
        Object.keys(featureDisplayNames).includes(feature)
      )
      .map((featureType) => ({
        name: featureDisplayNames[featureType],
        featureType: featureType,
        description: featureDescriptions[featureType],
      }))
  }
  const productFeatures = getProductFeatures()

  // Check if a specific size is available and get its inventory level
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

    // Check if any variant is marked as unavailable
    const anyUnavailable = variantsWithSize.some((v) => v.available === false)

    // Get inventory quantity if available
    const firstVariant = variantsWithSize[0]
    const inventoryQuantity =
      firstVariant.inventoryQuantity !== undefined
        ? firstVariant.inventoryQuantity
        : undefined

    return {
      available: !anyUnavailable,
      inventoryQuantity,
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-6 px-16">
      {/* Product Images - Left Side - Now 2/3 of screen */}
      <div className="md:col-span-2 space-y-6 md:pl-12">
        {/* Video (if available) */}
        {hasVideo && (
          <div className="relative aspect-square overflow-hidden bg-laboratory-white">
            <ProductMedia product={product} priority={true} />
          </div>
        )}

        {/* Images in a single column */}
        {product.images &&
          product.images.length > 0 &&
          product.images.map((image, index) => (
            <div
              key={index}
              className="relative aspect-square overflow-hidden bg-laboratory-white"
            >
              <Image
                src={image.src}
                alt={`${product.title} - view ${index + 1}`}
                fill
                className="object-cover"
                priority={index === 0}
              />
            </div>
          ))}
      </div>

      {/* Product Info - Right Side - Fixed position while scrolling - Now 1/3 of screen */}
      <div className="sticky top-24 self-start max-h-[calc(100vh-8rem)] pr-4">
        <div className="space-y-4">
          <div>
            <p className="text-xs tracking-wide text-laboratory-black/70 uppercase mb-1">
              {product.productType}
            </p>
            <h1 className="text-sm tracking-wide uppercase mb-2">
              {product.title}
            </h1>
            <p className="text-xs tracking-wide mb-4">
              ${formatPrice(product.variants[0]?.price)}
            </p>
          </div>

          {/* Size Selection - No borders, hover underline */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xs tracking-wide">SIZE</h2>
              <button
                className="text-xs tracking-wide underline"
                onClick={() => setShowingSizeGuide(!showingSizeGuide)}
              >
                Size Guide
              </button>
            </div>

            {showingSizeGuide && (
              <div className="mb-3 p-3 border border-laboratory-black/10">
                <h3 className="text-xs tracking-wide mb-2">Size Guide</h3>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-laboratory-black/10">
                      <th className="text-left py-2">Size</th>
                      <th className="text-left py-2">Chest (in)</th>
                      <th className="text-left py-2">Waist (in)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-laboratory-black/5">
                      <td className="py-1">S</td>
                      <td className="py-1">38-40</td>
                      <td className="py-1">30-32</td>
                    </tr>
                    <tr className="border-b border-laboratory-black/5">
                      <td className="py-1">M</td>
                      <td className="py-1">40-42</td>
                      <td className="py-1">32-34</td>
                    </tr>
                    <tr className="border-b border-laboratory-black/5">
                      <td className="py-1">L</td>
                      <td className="py-1">42-44</td>
                      <td className="py-1">34-36</td>
                    </tr>
                    <tr>
                      <td className="py-1">XL</td>
                      <td className="py-1">44-46</td>
                      <td className="py-1">36-38</td>
                    </tr>
                  </tbody>
                </table>
              </div>
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

          {/* Color Variants - Shows other color options for the same base SKU */}
          {!isLoadingVariants && hasColorVariants && (
            <ProductColorVariants
              currentColor={currentColor}
              colorVariants={colorVariants}
              className="mb-4"
            />
          )}

          {/* Add to Cart Button */}
          <div className="pt-6 pb-4">
            <motion.button
              className={`w-full py-2 text-xs tracking-wide transition-colors ${
                selectedSize
                  ? "text-laboratory-black"
                  : "text-laboratory-black/50"
              } hover:underline disabled:opacity-50`}
              onClick={handleAddToCart}
              whileTap={{ scale: 0.98 }}
              disabled={!selectedSize || isLoading}
            >
              {isLoading ? "ADDING..." : "SELECT YOUR SIZE"}
            </motion.button>
          </div>

          {/* Collapsible Description Section */}
          <div className="pt-4">
            <button
              className="flex items-center justify-between w-full text-xs tracking-wide pt-3 pb-1 group hover:underline"
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

          {/* Collapsible Product Features Section */}
          {/* Collapsible Product Features Section */}
          {productFeatures.length > 0 && (
            <div className="mt-2">
              <button
                className="flex items-center justify-between w-full text-xs tracking-wide pt-1 pb-1 group hover:underline"
                onClick={() => setShowFeatures(!showFeatures)}
              >
                <span>PRODUCT FEATURES</span>
                <span>{showFeatures ? "−" : "+"}</span>
              </button>
              {showFeatures && (
                <div className="py-2">
                  <div className="grid grid-cols-1 gap-3">
                    {productFeatures.map((feature, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <ProductFeatureIcon
                          featureType={feature.featureType as FeatureType}
                          size={24}
                        />
                        <div>
                          <h3 className="text-xs tracking-wide font-medium">
                            {feature.name}
                          </h3>
                          <p className="text-xs tracking-wide text-laboratory-black/70">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductDetails
