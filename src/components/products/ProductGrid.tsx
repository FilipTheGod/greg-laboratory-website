// src/components/products/ProductGrid.tsx
"use client"

import React, { useState, useEffect } from "react"
import ProductCard from "./ProductCard"
import { ShopifyProduct } from "@/lib/shopify"

interface ProductGridProps {
  initialProducts: ShopifyProduct[]
}

type ProductCategory =
  | "ALL"
  | "STANDARD"
  | "TECHNICAL"
  | "LABORATORY EQUIPMENT"
  | "COLLABORATIVE PROTOCOL"
  | "FIELD STUDY"

// Helper to map Shopify product types to our categories
const mapProductTypeToCategory = (productType: string): ProductCategory => {
  // Normalize the product type by converting to uppercase and replacing spaces
  const normalizedType = productType.toUpperCase().replace(/\s+/g, " ").trim()

  // Map of normalized types to categories
  const typeMap: Record<string, ProductCategory> = {
    "STANDARD SERIES": "STANDARD",
    "TECHNICAL SERIES": "TECHNICAL",
    "LABORATORY EQUIPMENT": "LABORATORY EQUIPMENT",
    "LABORATORY EQUIPMENT SERIES": "LABORATORY EQUIPMENT",
    "COLLABORATIVE PROTOCOL": "COLLABORATIVE PROTOCOL",
    "COLLABORATIVE PROTOCOL SERIES": "COLLABORATIVE PROTOCOL",
    "FIELD STUDY": "FIELD STUDY",
    "FIELD SERIES": "FIELD STUDY",
    "FIELD STUDY SERIES": "FIELD STUDY",
  }

  return typeMap[normalizedType] || "ALL"
}

const ProductGrid: React.FC<ProductGridProps> = ({ initialProducts }) => {
  const [filteredCategory, setFilteredCategory] =
    useState<ProductCategory>("ALL")
  const [products, setProducts] = useState<ShopifyProduct[]>(initialProducts)

  // Categories - shown on mobile only (desktop is handled by the Header component)
  const categories: ProductCategory[] = [
    "ALL",
    "STANDARD",
    "TECHNICAL",
    "LABORATORY EQUIPMENT",
    "COLLABORATIVE PROTOCOL",
    "FIELD STUDY",
  ]

  // Effect to handle any potential issues with initialProducts
  useEffect(() => {
    if (!Array.isArray(initialProducts)) {
      console.error("initialProducts is not an array:", initialProducts)
      setProducts([])
      return
    }

    // Validate product data
    const validProducts = initialProducts.filter((product) => {
      if (!product || typeof product !== "object") {
        console.error("Invalid product object:", product)
        return false
      }

      if (!product.id || !product.title || !product.variants) {
        console.error("Product missing required fields:", product)
        return false
      }

      return true
    })

    setProducts(validProducts)
  }, [initialProducts])

  // Filter products based on category
  const filteredProducts = React.useMemo(() => {
    if (filteredCategory === "ALL") {
      return products
    } else {
      return products.filter((product) => {
        const category = mapProductTypeToCategory(product.productType)
        return category === filteredCategory
      })
    }
  }, [products, filteredCategory])

  // Category handling function
  const handleCategoryClick = (category: ProductCategory) => {
    setFilteredCategory(category)
  }

  return (
    <div className="container mx-auto px-4 md:pl-48 pt-8">
      {/* Mobile Categories - only visible on mobile */}
      <div className="md:hidden flex flex-col space-y-4 mb-8">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => handleCategoryClick(category)}
            className={`text-left text-xs tracking-wide ${
              filteredCategory === category ? "opacity-100" : "opacity-70"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-xs tracking-wide opacity-70">
            No products found in this category.
          </p>
        </div>
      )}
    </div>
  )
}

export default ProductGrid
