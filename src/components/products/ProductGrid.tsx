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
  const typeMap: Record<string, ProductCategory> = {
    "Standard Series": "STANDARD SERIES",
    "Technical Series": "TECHNICAL SERIES",
    "Laboratory Equipment": "LABORATORY EQUIPMENT SERIES",
    "Collaborative Protocol": "COLLABORATIVE PROTOCOL SERIES",
    "Field Study": "FIELD STUDY SERIES",
  }

  return typeMap[productType] || "STANDARD SERIES"
}

const ProductGrid: React.FC<ProductGridProps> = ({ initialProducts }) => {
  console.log(`ProductGrid received ${initialProducts.length} products`)

  const [filteredCategory, setFilteredCategory] =
    useState<ProductCategory>("ALL")
  const [products, setProducts] = useState<ShopifyProduct[]>(initialProducts)

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
        console.error("Invalid product entry:", product)
        return false
      }

      if (!product.id || !product.title || !product.variants) {
        console.error("Product missing required fields:", product)
        return false
      }

      return true
    })

    console.log(
      `Filtered ${
        initialProducts.length - validProducts.length
      } invalid products`
    )
    setProducts(validProducts)
  }, [initialProducts])

  const filteredProducts =
    filteredCategory === "ALL"
      ? products
      : products.filter(
          (product) =>
            mapProductTypeToCategory(product.productType) === filteredCategory
        )

  console.log(`Displaying ${filteredProducts.length} products after filtering`)

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 p-6">
      <div className="md:col-span-1">
        <ProductFilter onFilterChange={setFilteredCategory} />
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
