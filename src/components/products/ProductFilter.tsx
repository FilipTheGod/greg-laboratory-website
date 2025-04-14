// src/components/products/ProductFilter.tsx
"use client"

import React, { useState } from "react"

type ProductCategory =
  | "STANDARD SERIES"
  | "TECHNICAL SERIES"
  | "LABORATORY EQUIPMENT SERIES"
  | "COLLABORATIVE PROTOCOL SERIES"
  | "FIELD STUDY SERIES"
  | "ALL"

interface ProductFilterProps {
  onFilterChange: (category: ProductCategory) => void
}

const ProductFilter: React.FC<ProductFilterProps> = ({ onFilterChange }) => {
  const [activeCategory, setActiveCategory] = useState<ProductCategory>("ALL")

  const categories: ProductCategory[] = [
    "STANDARD SERIES",
    "TECHNICAL SERIES",
    "LABORATORY EQUIPMENT SERIES",
    "COLLABORATIVE PROTOCOL SERIES",
    "FIELD STUDY SERIES",
  ]

  const handleCategoryClick = (category: ProductCategory) => {
    setActiveCategory(category)
    onFilterChange(category)
  }

  return (
    <div className="sticky top-24 z-50 pr-2">
      <div className="flex flex-col">
        <button
          onClick={() => handleCategoryClick("ALL")}
          className={`text-left text-[10px] hover:opacity-70 transition mb-3 ${
            activeCategory === "ALL" ? "font-medium" : "opacity-70"
          }`}
        >
          ALL
        </button>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => handleCategoryClick(category)}
            className={`text-left text-[10px] hover:opacity-70 transition mb-3 whitespace-nowrap ${
              activeCategory === category ? "font-medium" : "opacity-70"
            }`}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  )
}

export default ProductFilter
