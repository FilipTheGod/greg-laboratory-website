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

const ProductGrid: React.FC<ProductGridProps> = ({ initialProducts }) => {
  const [filteredCategory, setFilteredCategory] =
    useState<ProductCategory>("ALL")
  const [products, setProducts] = useState<ShopifyProduct[]>(initialProducts)

  // Effect to handle any potential issues with initialProducts
  useEffect(() => {
    if (!Array.isArray(initialProducts)) {
      setProducts([])
      return
    }

    // Validate product data
    const validProducts = initialProducts.filter((product) => {
      if (!product || typeof product !== "object") {
        return false
      }

      if (!product.id || !product.title || !product.variants) {
        return false
      }

      return true
    })

    setProducts(validProducts)
  }, [initialProducts])

  // Filter products based on category
  const filteredProducts = React.useMemo(() => {
    return filteredCategory === "ALL"
      ? products
      : products.filter(
          (product) =>
            mapProductTypeToCategory(product.productType) === filteredCategory
        )
  }, [products, filteredCategory])

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-6 p-6">
      <div className="md:col-span-1">
        <ProductFilter onFilterChange={setFilteredCategory} />
      </div>

      <div className="md:col-span-4">
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-14">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-laboratory-black/70 text-xs">
              No products found in this category.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductGrid
