// src/components/products/ProductFilter.tsx
"use client"

import React, { useState, useEffect } from "react"
import {  usePathname } from "next/navigation"

type ProductCategory =
  | "STANDARD SERIES"
  | "TECHNICAL SERIES"
  | "LABORATORY EQUIPMENT SERIES"
  | "COLLABORATIVE PROTOCOL SERIES"
  | "FIELD STUDY SERIES"
  | "ALL"

// Define a map for display names (shorter versions)
const displayNames: Record<ProductCategory, string> = {
  "ALL": "ALL",
  "STANDARD SERIES": "STANDARD",
  "TECHNICAL SERIES": "TECHNICAL",
  "LABORATORY EQUIPMENT SERIES": "LABORATORY EQUIPMENT",
  "COLLABORATIVE PROTOCOL SERIES": "COLLABORATIVE PROTOCOL",
  "FIELD STUDY SERIES": "FIELD STUDY",
}

interface ProductFilterProps {
  onFilterChange: (category: ProductCategory) => void
}

const ProductFilter: React.FC<ProductFilterProps> = ({ onFilterChange }) => {

  const pathname = usePathname()

  // Determine active category from pathname or default to ALL
  const getInitialCategory = React.useCallback((): ProductCategory => {
    if (pathname === "/") return "ALL"
    if (pathname.includes("STANDARD")) return "STANDARD SERIES"
    if (pathname.includes("TECHNICAL")) return "TECHNICAL SERIES"
    if (pathname.includes("LABORATORY")) return "LABORATORY EQUIPMENT SERIES"
    if (pathname.includes("COLLABORATIVE")) return "COLLABORATIVE PROTOCOL SERIES"
    if (pathname.includes("FIELD")) return "FIELD STUDY SERIES"
    return "ALL"
  }, [pathname])

  const [activeCategory, setActiveCategory] = useState<ProductCategory>(getInitialCategory())

  // Update active category when pathname changes
  useEffect(() => {
    setActiveCategory(getInitialCategory())
  }, [getInitialCategory])

  const categories: ProductCategory[] = [
    "ALL",
    "STANDARD SERIES",
    "TECHNICAL SERIES",
    "LABORATORY EQUIPMENT SERIES",
    "COLLABORATIVE PROTOCOL SERIES",
    "FIELD STUDY SERIES",
  ]

  const handleCategoryClick = (category: ProductCategory) => {
    setActiveCategory(category)

    // Create a global event to make filter changes affect ProductGrid
    const filterEvent = new CustomEvent('productFilterChange', {
      detail: { category }
    })
    window.dispatchEvent(filterEvent)

    onFilterChange(category)
  }

  return (
    <div className="sticky top-24 z-40 pr-2">
      <div className="flex flex-col">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => handleCategoryClick(category)}
            className={`text-left text-[10px] hover:opacity-70 transition mb-3 whitespace-nowrap ${
              activeCategory === category ? "font-medium" : "opacity-70"
            }`}
          >
            {displayNames[category]}
          </button>
        ))}
      </div>
    </div>
  )
}

export default ProductFilter