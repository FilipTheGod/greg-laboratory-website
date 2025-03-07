// src/components/products/ProductDetails.tsx
"use client"

import React, { useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { useCart } from "@/contexts/CartContext"
import { ShopifyProduct } from "@/lib/shopify"

// SVG Components for product attributes
const WaterRepellentIcon: React.FC = () => (
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

const BreathableIcon: React.FC = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 2V6M12 22V18M4 12H2M6.31 6.31L4.8 4.8M17.69 6.31L19.2 4.8M6.31 17.69L4.8 19.2M17.69 17.69L19.2 19.2M22 12H20M12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20Z"
      stroke="currentColor"
      strokeWidth="1.5"
    />
  </svg>
)

const StretchIcon: React.FC = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M4 9H20M4 15H20M9 4V20M15 4V20"
      stroke="currentColor"
      strokeWidth="1.5"
    />
  </svg>
)

const DurableIcon: React.FC = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path
      d="M12 6V12L16 14"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
)

const LightweightIcon: React.FC = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 4V2M4 12H2M6.31 6.31L4.8 4.8M17.69 6.31L19.2 4.8M12 20V22M20 12H22M17.69 17.69L19.2 19.2M6.31 17.69L4.8 19.2M12 17C14.7614 17 17 14.7614 17 12C17 9.23858 14.7614 7 12 7C9.23858 7 7 9.23858 7 12C7 14.7614 9.23858 17 12 17Z"
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

  // Extract available sizes from variants
  const availableSizes = Array.from(
    new Set(
      product.variants.map((variant) => {
        const parts = variant.title.split(" / ")
        return parts[0]
      })
    )
  )

  // Extract available colors from variants
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
    if (!selectedSize || !selectedColor) {
      alert("Please select both a size and color")
      return
    }

    // Find the correct variant ID based on size and color
    const variant = product.variants.find(
      (v) => v.title === `${selectedSize} / ${selectedColor}`
    )

    if (!variant) {
      alert("Selected combination is not available")
      return
    }

    // Add to cart via context
    addToCart({
      id: product.id,
      title: product.title,
      handle: product.handle,
      quantity: 1,
      variant: {
        id: variant.id,
        title: variant.title,
        price: variant.price,
        image: product.images[0].src,
      },
    })
  }

  // Define the product attributes based on the series or product type
  const getProductAttributes = () => {
    const baseAttributes = [
      {
        name: "Water Repellent",
        icon: <WaterRepellentIcon />,
        description: "Resists moisture and light rain",
      },
      {
        name: "Breathable",
        icon: <BreathableIcon />,
        description: "Allows air circulation for comfort",
      },
      {
        name: "2-Way Stretch",
        icon: <StretchIcon />,
        description: "Flexible movement in multiple directions",
      },
    ]

    // Add additional attributes based on product type
    if (product.productType === "Technical Series") {
      baseAttributes.push({
        name: "Durable",
        icon: <DurableIcon />,
        description: "Built for extended wear and use",
      })
    }

    if (product.productType === "Field Study Series") {
      baseAttributes.push({
        name: "Lightweight",
        icon: <LightweightIcon />,
        description: "Minimal weight for comfortable wear",
      })
    }

    return baseAttributes
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
          {product.images && product.images.length > 0 && (
            <Image
              src={product.images[currentImageIndex].src}
              alt={`${product.title} - view ${currentImageIndex + 1}`}
              fill
              className="object-cover"
              priority
            />
          )}
        </div>

        {product.images && product.images.length > 1 && (
          <div className="grid grid-cols-4 gap-2">
            {product.images.map((image, index) => (
              <button
                key={index}
                className={`relative aspect-square overflow-hidden border ${
                  index === currentImageIndex
                    ? "border-laboratory-black"
                    : "border-transparent"
                }`}
                onClick={() => setCurrentImageIndex(index)}
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
        )}
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
            ${parseFloat(product.variants[0].price).toFixed(2)}
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
        <div>
          <h2 className="text-medium tracking-wide mb-3">COLOR</h2>
          <div className="flex flex-wrap gap-3">
            {availableColors.map((color) => {
              const colorStyle = getColorStyle(color as string)
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
                  disabled={
                    selectedSize &&
                    !isVariantAvailable(selectedSize, color as string)
                  }
                >
                  {selectedSize &&
                    !isVariantAvailable(selectedSize, color as string) && (
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

        {/* Add to Cart Button with loading state */}
        <motion.button
          className="w-full py-3 bg-laboratory-black text-laboratory-white text-medium tracking-wide disabled:opacity-50 relative"
          onClick={handleAddToCart}
          whileTap={{ scale: 0.95 }}
          disabled={!selectedSize || !selectedColor || isLoading}
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
      </div>
    </div>
  )
}

export default ProductDetails
