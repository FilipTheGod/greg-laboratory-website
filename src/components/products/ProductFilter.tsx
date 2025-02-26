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
    <div className="sticky top-24 pr-8">
      <button
        onClick={() => handleCategoryClick("ALL")}
        className={`block mb-4 text-left hover:opacity-70 transition ${
          activeCategory === "ALL" ? "font-medium" : "opacity-70"
        }`}
      >
        ALL
      </button>
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => handleCategoryClick(category)}
          className={`block mb-4 text-left hover:opacity-70 transition ${
            activeCategory === category ? "font-medium" : "opacity-70"
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  )
}

export default ProductFilter
