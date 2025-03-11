// src/components/products/ProductDetails.tsx
"use client"

import React, { useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { useCart } from "@/contexts/CartContext"
import { ShopifyProduct, ShopifyProductVariant } from "@/lib/shopify"
import { formatPrice } from "@/utils/price"
import ProductMedia from "./ProductMedia"

// SVG Component for product attributes
const ProductFeatureIcon: React.FC = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 2L5 12H19L12 2Z" stroke="currentColor" strokeWidth="1.5" />
    <path
      d="M7 16C7 18.7614 9.23858 21 12 21C14.7614 21 17 18.7614 17 16"
      stroke="currentColor"
      strokeWidth="1.5"
    />
  </svg>
)

// Enhanced color map with more realistic colors and contrast borders
const colorMap: Record<string, { bg: string; border: string }> = {
  Black: { bg: "#000000", border: "#333333" },
  White: { bg: "#FFFFFF", border: "#CCCCCC" },
  Cream: { bg: "#FFFDD0", border: "#E6E4BC" },
  Navy: { bg: "#000080", border: "#000066" },
  Olive: { bg: "#808000", border: "#606000" },
  Grey: { bg: "#808080", border: "#666666" },
  Khaki: { bg: "#C3B091", border: "#B0A080" },
  Tan: { bg: "#D2B48C", border: "#BEA27E" },
  Brown: { bg: "#A52A2A", border: "#8B2323" },
  Natural: { bg: "#F5F5DC", border: "#E1E1CB" },
  Green: { bg: "#008000", border: "#006600" },
  Blue: { bg: "#0000FF", border: "#0000CC" },
  Red: { bg: "#FF0000", border: "#CC0000" },
  Pink: { bg: "#FFC0CB", border: "#E6B6C1" },
}

interface ProductDetailsProps {
  product: ShopifyProduct
}

const ProductDetails: React.FC<ProductDetailsProps> = ({ product }) => {
  const [selectedSize, setSelectedSize] = useState("")
  const [selectedColor, setSelectedColor] = useState("")
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showingSizeGuide, setShowingSizeGuide] = useState(false)

  const { addToCart, isLoading } = useCart()

  // Extract available sizes and colors from variants
  const availableSizes = Array.from(
    new Set(
      product.variants.map((variant) => {
        const parts = variant.title.split(" / ")
        return parts[0]
      })
    )
  ).sort()

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

  // Check if the product has video media
  const hasVideo =
    product.media?.some((media) => media.mediaContentType === "VIDEO") || false

  // Find the video media if it exists
  const productVideoMedia = product.media?.find(
    (media) => media.mediaContentType === "VIDEO"
  )

  // Get color styling for visualization
  const getColorStyle = (
    colorName: string
  ): { backgroundColor: string; borderColor: string } => {
    const colorInfo = colorMap[colorName] || {
      bg: "#CCCCCC",
      border: "#AAAAAA",
    }
    return {
      backgroundColor: colorInfo.bg,
      borderColor: colorInfo.border,
    }
  }

  // Handle add to cart
  const handleAddToCart = () => {
    if (!selectedSize || (availableColors.length > 0 && !selectedColor)) {
      alert("Please select all required options")
      return
    }

    // Find the correct variant ID based on size and color
    let variant: ShopifyProductVariant | undefined

    if (availableColors.length > 0) {
      // If we have colors available, find by size and color
      variant = product.variants.find(
        (v) => v.title === `${selectedSize} / ${selectedColor}`
      )
    } else {
      // If we only have sizes
      variant = product.variants.find((v) => v.title === selectedSize)
    }

    if (!variant) {
      alert("Selected combination is not available")
      return
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

  // Define the product attributes based on metafields or fall back to product type
  const getProductAttributes = () => {
    const attributes = []

    attributes.push({
      name: "Water Repellent",
      icon: <ProductFeatureIcon />,
      description: "Resists moisture and light rain",
    })

    attributes.push({
      name: "Breathable",
      icon: <ProductFeatureIcon />,
      description: "Allows air circulation for comfort",
    })

    attributes.push({
      name: "2-Way Stretch",
      icon: <ProductFeatureIcon />,
      description: "Flexible movement in multiple directions",
    })

    if (product.productType === "Technical Series") {
      attributes.push({
        name: "Durable",
        icon: <ProductFeatureIcon />,
        description: "Built for extended wear and use",
      })
    }

    if (product.productType === "Field Study Series") {
      attributes.push({
        name: "Lightweight",
        icon: <ProductFeatureIcon />,
        description: "Minimal weight for comfortable wear",
      })
    }

    return attributes
  }

  const productAttributes = getProductAttributes()

  // Check if a specific variant combination is available
  const isVariantAvailable = (size: string, color: string) => {
    return product.variants.some(
      (variant) =>
        variant.title === `${size} / ${color}` && variant.available !== false
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
      {/* Product Images - Left Side */}
      <div className="space-y-4">
        <div className="relative aspect-square overflow-hidden bg-laboratory-white">
          {currentImageIndex === 0 && hasVideo ? (
            // Show video if it's the first media item and a video
            <ProductMedia product={product} priority={true} />
          ) : product.images && product.images.length > 0 ? (
            // Show image based on current index, accounting for video offset
            <Image
              src={
                product.images[
                  hasVideo
                    ? Math.max(0, currentImageIndex - 1)
                    : currentImageIndex
                ]?.src || ""
              }
              alt={`${product.title} - view ${currentImageIndex + 1}`}
              fill
              className="object-cover"
              priority
            />
          ) : (
            // Fallback for no media
            <div className="w-full h-full flex items-center justify-center bg-laboratory-black/5">
              <span className="text-laboratory-black/30 text-medium tracking-wide">
                No Media Available
              </span>
            </div>
          )}
        </div>

        {/* Media thumbnails */}
        <div className="grid grid-cols-5 gap-2">
          {/* Video thumbnail (if available) */}
          {hasVideo && productVideoMedia?.previewImage && (
            <button
              className={`relative aspect-square overflow-hidden border ${
                currentImageIndex === 0
                  ? "border-laboratory-black"
                  : "border-transparent"
              }`}
              onClick={() => setCurrentImageIndex(0)}
            >
              {productVideoMedia.previewImage.src ? (
                <Image
                  src={productVideoMedia.previewImage.src}
                  alt="Video thumbnail"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-laboratory-black/10">
                  <span className="text-laboratory-white text-xs">VIDEO</span>
                </div>
              )}
            </button>
          )}

          {/* Image thumbnails */}
          {product.images &&
            product.images.length > 0 &&
            product.images.map((image, index) => (
              <button
                key={image.src}
                className={`relative aspect-square overflow-hidden border ${
                  currentImageIndex === (hasVideo ? index + 1 : index)
                    ? "border-laboratory-black"
                    : "border-transparent"
                }`}
                onClick={() =>
                  setCurrentImageIndex(hasVideo ? index + 1 : index)
                }
              >
                <Image
                  src={image.src}
                  alt={`${product.title} - thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
        </div>
      </div>

      {/* Product Info - Right Side */}
      <div className="sticky top-24 self-start space-y-8 max-h-screen overflow-y-auto pr-4">
        <div>
          <h3 className="text-laboratory-black/70 text-medium tracking-wide uppercase mb-1">
            {product.productType}
          </h3>
          <h1 className="text-title tracking-wide uppercase mb-2">
            {product.title}
          </h1>
          <p className="text-medium tracking-wide mb-6">
            ${formatPrice(product.variants[0]?.price)}
          </p>
        </div>

        {/* Size Selection */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-medium tracking-wide">SIZE</h2>
            <button
              className="text-regular tracking-wide underline"
              onClick={() => setShowingSizeGuide(!showingSizeGuide)}
            >
              Size Guide
            </button>
          </div>

          {showingSizeGuide && (
            <div className="mb-4 p-4 border border-laboratory-black/10">
              <h3 className="text-medium tracking-wide mb-2">Size Guide</h3>
              <table className="w-full text-regular">
                <thead>
                  <tr className="border-b border-laboratory-black/10">
                    <th className="text-left py-2">Size</th>
                    <th className="text-left py-2">Chest (in)</th>
                    <th className="text-left py-2">Waist (in)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-laboratory-black/5">
                    <td className="py-2">S</td>
                    <td className="py-2">38-40</td>
                    <td className="py-2">30-32</td>
                  </tr>
                  <tr className="border-b border-laboratory-black/5">
                    <td className="py-2">M</td>
                    <td className="py-2">40-42</td>
                    <td className="py-2">32-34</td>
                  </tr>
                  <tr className="border-b border-laboratory-black/5">
                    <td className="py-2">L</td>
                    <td className="py-2">42-44</td>
                    <td className="py-2">34-36</td>
                  </tr>
                  <tr>
                    <td className="py-2">XL</td>
                    <td className="py-2">44-46</td>
                    <td className="py-2">36-38</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {availableSizes.map((size) => (
              <button
                key={size}
                className={`px-4 py-2 border ${
                  selectedSize === size
                    ? "border-laboratory-black bg-laboratory-black text-laboratory-white"
                    : "border-laboratory-black/30 hover:border-laboratory-black"
                } text-regular tracking-wide`}
                onClick={() => setSelectedSize(size)}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Color Selection with enhanced colored circles */}
        {availableColors.length > 0 && (
          <div>
            <h2 className="text-medium tracking-wide mb-3">COLOR</h2>
            <div className="flex flex-wrap gap-3">
              {availableColors.map((color) => {
                const colorStyle = getColorStyle(color as string)
                const isAvailable =
                  !selectedSize ||
                  isVariantAvailable(selectedSize, color as string)

                return (
                  <button
                    key={color}
                    className={`w-10 h-10 rounded-full relative ${
                      selectedColor === color
                        ? "ring-2 ring-laboratory-black ring-offset-2"
                        : ""
                    }`}
                    style={{
                      backgroundColor: colorStyle.backgroundColor,
                      borderColor: colorStyle.borderColor,
                      border: "1px solid",
                    }}
                    onClick={() => setSelectedColor(color as string)}
                    aria-label={`Color: ${color}`}
                    disabled={!isAvailable}
                  >
                    {!isAvailable && (
                      <div className="absolute inset-0 bg-laboratory-black opacity-50 rounded-full flex items-center justify-center">
                        <div className="w-8 h-0.5 bg-white transform rotate-45"></div>
                        <div className="w-8 h-0.5 bg-white transform -rotate-45 absolute"></div>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
            {selectedColor && (
              <p className="mt-2 text-regular tracking-wide">{selectedColor}</p>
            )}
          </div>
        )}

        {/* Add to Cart Button with loading state */}
        <motion.button
          className="w-full py-3 bg-laboratory-black text-laboratory-white text-medium tracking-wide disabled:opacity-50 relative"
          onClick={handleAddToCart}
          whileTap={{ scale: 0.95 }}
          disabled={
            !selectedSize ||
            (availableColors.length > 0 && !selectedColor) ||
            isLoading
          }
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <span className="w-4 h-4 border-2 border-laboratory-white border-t-transparent rounded-full animate-spin mr-2"></span>
              ADDING...
            </span>
          ) : (
            "ADD TO CART"
          )}
        </motion.button>

        {/* Product Description */}
        <div className="mt-8 pt-8 border-t border-laboratory-black/10">
          <h2 className="text-medium tracking-wide mb-4">DESCRIPTION</h2>
          <div
            className="text-regular tracking-wide"
            dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
          />
        </div>

        {/* Product Attributes/Features with SVG Icons */}
        {productAttributes.length > 0 && (
          <div className="mt-8 pt-8 border-t border-laboratory-black/10">
            <h2 className="text-medium tracking-wide mb-4">PRODUCT FEATURES</h2>
            <div className="grid grid-cols-2 gap-4">
              {productAttributes.map((attr, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="text-laboratory-black">{attr.icon}</div>
                  <div>
                    <h3 className="text-regular tracking-wide font-medium">
                      {attr.name}
                    </h3>
                    <p className="text-regular tracking-wide text-laboratory-black/70">
                      {attr.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductDetails
