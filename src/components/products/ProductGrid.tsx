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
  // Additional logging
  console.log(`Mapping product type: "${productType}"`)

  // Normalize the product type by converting to uppercase and replacing spaces
  const normalizedType = productType.toUpperCase().replace(/\s+/g, " ").trim()
  console.log(`Normalized to: "${normalizedType}"`)

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

  const mappedCategory = typeMap[normalizedType] || "STANDARD SERIES"
  console.log(`Mapped to category: "${mappedCategory}"`)
  return mappedCategory
}

const ProductGrid: React.FC<ProductGridProps> = ({ initialProducts }) => {
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
        console.error("Invalid product object:", product)
        return false
      }

      if (!product.id || !product.title || !product.variants) {
        console.error("Product missing required fields:", product)
        return false
      }

      return true
    })

    console.log(
      `Setting ${validProducts.length} valid products from ${initialProducts.length} initial products`
    )
    setProducts(validProducts)
  }, [initialProducts])

  // Filter products based on category
  const filteredProducts = React.useMemo(() => {
    console.log("Filter category:", filteredCategory)
    console.log("All Products:", products.length)

    let result: ShopifyProduct[] = []

    if (filteredCategory === "ALL") {
      result = products
    } else {
      result = products.filter((product) => {
        const category = mapProductTypeToCategory(product.productType)
        console.log(
          `Product ${product.title}: Type=${
            product.productType
          }, Category=${category}, Match=${category === filteredCategory}`
        )
        return category === filteredCategory
      })
    }

    console.log("Filtered Products:", result.length)
    return result
  }, [products, filteredCategory])

 // In src/components/products/ProductGrid.tsx
return (
  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-6">
    <div className="md:col-span-1">
      <ProductFilter onFilterChange={setFilteredCategory} />
    </div>

    <div className="md:col-span-4">
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-10 product-grid">
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
