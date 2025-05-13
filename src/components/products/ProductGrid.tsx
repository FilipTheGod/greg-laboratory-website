// src/components/products/ProductGrid.tsx
"use client"

import React, { useState, useEffect } from "react"
import ProductCard from "./ProductCard"
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

// Custom event interface for type safety
interface ProductFilterEvent extends CustomEvent {
  detail: {
    category: ProductCategory
  }
}

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

  return typeMap[normalizedType] || "ALL"
}

const ProductGrid: React.FC<ProductGridProps> = ({ initialProducts }) => {
  const [filteredCategory, setFilteredCategory] =
    useState<ProductCategory>("ALL")
  const [products, setProducts] = useState<ShopifyProduct[]>(initialProducts)

  // Listen for filter events from any ProductFilter component
  useEffect(() => {
    const handleFilterChange = (event: Event) => {
      // Type cast to our custom event type
      const filterEvent = event as ProductFilterEvent
      if (filterEvent.detail && filterEvent.detail.category) {
        setFilteredCategory(filterEvent.detail.category)
      }
    }

    window.addEventListener("productFilterChange", handleFilterChange)

    return () => {
      window.removeEventListener("productFilterChange", handleFilterChange)
    }
  }, [])

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

  return (
    <div className="container mx-auto px-4 md:pl-80">
      {/* Product Grid - Now with 3 columns layout */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 h-[50vh] flex items-center justify-center">
          <p className="text-sm md:text-base tracking-wide opacity-70">COMING SOON</p>
        </div>
      )}
    </div>
  )
}

export default ProductGrid