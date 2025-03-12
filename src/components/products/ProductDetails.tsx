// src/components/products/ProductDetails.tsx
"use client"

import React, { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { useCart } from "@/contexts/CartContext"
import { ShopifyProduct, ShopifyProductVariant } from "@/lib/shopify"
import { formatPrice } from "@/utils/price"
import ProductMedia from "./ProductMedia"
import { getColorStyle } from "@/utils/colors"

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

interface ProductDetailsProps {
  product: ShopifyProduct
}

const ProductDetails: React.FC<ProductDetailsProps> = ({ product }) => {
  const [selectedSize, setSelectedSize] = useState("")
  const [selectedColor, setSelectedColor] = useState("")
  const [showingSizeGuide, setShowingSizeGuide] = useState(false)
  const [imagesLoaded, setImagesLoaded] = useState<boolean[]>([])
  const { addToCart, isLoading } = useCart()
  const productImagesRef = useRef<HTMLDivElement>(null)

  // Check if the product has video media
  const hasVideo =
    product.media?.some((media) => media.mediaContentType === "VIDEO") || false

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

  // Initialize the imagesLoaded state when the product changes
  useEffect(() => {
    if (product.images) {
      setImagesLoaded(new Array(product.images.length).fill(false))
    }
  }, [product.images])

  // Handle when an image is loaded
  const handleImageLoaded = (index: number) => {
    setImagesLoaded((prev) => {
      const newState = [...prev]
      newState[index] = true
      return newState
    })
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
      {/* Product Images - Left Side - Full column layout */}
      <div className="space-y-6" ref={productImagesRef}>
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
                onLoad={() => handleImageLoaded(index)}
              />
              {!imagesLoaded[index] && (
                <div className="absolute inset-0 flex items-center justify-center bg-laboratory-white">
                  <div className="w-6 h-6 border-2 border-laboratory-black/20 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
          ))}
      </div>

      {/* Product Info - Right Side - Fixed position while scrolling */}
      <div className="sticky top-24 self-start max-h-[calc(100vh-6rem)] overflow-y-auto pr-6">
        <div className="space-y-8">
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

          {/* Size Selection - No borders, hover underline */}
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
              <div className="mb-4 p-4">
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
                  className={`px-4 py-2 transition-all
                    ${
                      selectedSize === size
                        ? "bg-laboratory-black text-laboratory-white"
                        : "bg-transparent text-laboratory-black hover:underline"
                    } text-regular tracking-wide`}
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Color Selection - Using actual colors from metafields */}
          {availableColors.length > 0 && (
            <div>
              <h2 className="text-medium tracking-wide mb-3">COLOR</h2>
              <div className="flex flex-wrap gap-3">
                {availableColors.map((color) => {
                  const isAvailable =
                    !selectedSize ||
                    isVariantAvailable(selectedSize, color as string)

                  return (
                    <button
                      key={color}
                      className={`w-10 h-10 rounded-full relative transition-all ${
                        selectedColor === color
                          ? "ring-2 ring-laboratory-black ring-offset-2"
                          : ""
                      }`}
                      style={getColorStyle(color as string)}
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
                <p className="mt-2 text-regular tracking-wide">
                  {selectedColor}
                </p>
              )}
            </div>
          )}

          {/* Add to Cart Button - No border, hover underline */}
          <motion.button
            className="w-full py-3 bg-laboratory-black text-laboratory-white text-medium tracking-wide hover:bg-black disabled:opacity-50 relative transition-colors"
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

          {/* Product Description - No dividers */}
          <div className="mt-8 pt-8">
            <h2 className="text-medium tracking-wide mb-4">DESCRIPTION</h2>
            <div
              className="text-regular tracking-wide"
              dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
            />
          </div>

          {/* Product Attributes/Features - No dividers */}
          {productAttributes.length > 0 && (
            <div className="mt-8 pt-8">
              <h2 className="text-medium tracking-wide mb-4">
                PRODUCT FEATURES
              </h2>
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
    </div>
  )
}

export default ProductDetails
