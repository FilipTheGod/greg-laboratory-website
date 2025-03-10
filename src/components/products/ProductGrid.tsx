// src/components/products/ProductGrid.tsx
"use client"

import React, { useState, useEffect } from "react"
import ProductCard from "./ProductCard"
import ProductFilter from "./ProductFilter"
import { ShopifyProduct } from "@/lib/shopify"

interface ProductGridProps {
  initialProducts: ShopifyProduct[]
}

type ProductCategory =
  | "STANDARD SERIES"
  | "TECHNICAL SERIES"
  | "LABORATORY EQUIPMENT SERIES"
  | "COLLABORATIVE PROTOCOL SERIES"
  | "FIELD STUDY SERIES"
  | "ALL"

// Helper to map Shopify product types to our categories
const mapProductTypeToCategory = (productType: string): ProductCategory => {
  // Normalize the product type by converting to uppercase and replacing spaces
  const normalizedType = productType.toUpperCase().replace(/\s+/g, " ").trim()

  // Map of normalized types to categories
  const typeMap: Record<string, ProductCategory> = {
    "STANDARD SERIES": "STANDARD SERIES",
    "TECHNICAL SERIES": "TECHNICAL SERIES",
    "LABORATORY EQUIPMENT": "LABORATORY EQUIPMENT SERIES",
    "LABORATORY EQUIPMENT SERIES": "LABORATORY EQUIPMENT SERIES",
    "COLLABORATIVE PROTOCOL": "COLLABORATIVE PROTOCOL SERIES",
    "COLLABORATIVE PROTOCOL SERIES": "COLLABORATIVE PROTOCOL SERIES",
    "FIELD STUDY": "FIELD STUDY SERIES",
    "FIELD SERIES": "FIELD STUDY SERIES",
    "FIELD STUDY SERIES": "FIELD STUDY SERIES",
  }

  return typeMap[normalizedType] || "STANDARD SERIES"
}

// Helper to check if a product has video media
const hasVideoMedia = (product: ShopifyProduct): boolean => {
  return !!(
    product.media &&
    product.media.length > 0 &&
    product.media.some((media) => media.mediaContentType === "VIDEO")
  )
}

const ProductGrid: React.FC<ProductGridProps> = ({ initialProducts }) => {
  console.log(`ProductGrid received ${initialProducts.length} products`)

  const [filteredCategory, setFilteredCategory] =
    useState<ProductCategory>("ALL")
  const [products, setProducts] = useState<ShopifyProduct[]>(initialProducts)
  const [videoProductsCount, setVideoProductsCount] = useState(0)

  // Effect to handle any potential issues with initialProducts and identify video products
  useEffect(() => {
    if (!Array.isArray(initialProducts)) {
      console.error("initialProducts is not an array:", initialProducts)
      setProducts([])
      return
    }

    // Validate product data
    const validProducts = initialProducts.filter((product) => {
      if (!product || typeof product !== "object") {
        console.error("Invalid product entry:", product)
        return false
      }

      if (!product.id || !product.title || !product.variants) {
        console.error("Product missing required fields:", product)
        return false
      }

      return true
    })

    // Count products with video
    const productsWithVideo = validProducts.filter(hasVideoMedia)
    setVideoProductsCount(productsWithVideo.length)
    console.log(`Found ${productsWithVideo.length} products with video media`)

    // Prioritize products with video by sorting them first
    const sortedProducts = [...validProducts].sort((a, b) => {
      const aHasVideo = hasVideoMedia(a)
      const bHasVideo = hasVideoMedia(b)

      if (aHasVideo && !bHasVideo) return -1
      if (!aHasVideo && bHasVideo) return 1
      return 0
    })

    setProducts(sortedProducts)
  }, [initialProducts])

  // Filter products based on category
  const filteredProducts = React.useMemo(() => {
    const filtered =
      filteredCategory === "ALL"
        ? products
        : products.filter(
            (product) =>
              mapProductTypeToCategory(product.productType) === filteredCategory
          )

    console.log(
      `Displaying ${filtered.length} products after filtering (category: ${filteredCategory})`
    )
    return filtered
  }, [products, filteredCategory])

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 p-6">
      <div className="md:col-span-1">
        <ProductFilter onFilterChange={setFilteredCategory} />

        {/* Video products debug info - only in development */}
        {process.env.NODE_ENV === "development" && (
          <div className="mt-8 p-4 bg-gray-100 text-sm">
            <p className="font-medium mb-2">Development Info:</p>
            <p>Products with video: {videoProductsCount}</p>
            <p>Current filter: {filteredCategory}</p>
            <p>Showing: {filteredProducts.length} products</p>
          </div>
        )}
      </div>

      <div className="md:col-span-3">
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-laboratory-black/70">
              No products found in this category.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductGrid
