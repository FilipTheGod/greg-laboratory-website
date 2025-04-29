// src/components/products/ProductFilter.tsx
"use client"

import React, { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useHeader } from "@/contexts/HeaderContext"

type ProductCategory =
  | "STANDARD SERIES"
  | "TECHNICAL SERIES"
  | "LABORATORY EQUIPMENT SERIES"
  | "COLLABORATIVE PROTOCOL SERIES"
  | "FIELD STUDY SERIES"
  | "ALL"

// Define a map for display names (shorter versions)
// For longer names, use '\n' to indicate a line break
const displayNames: Record<ProductCategory, string> = {
  ALL: "ALL",
  "STANDARD SERIES": "STANDARD",
  "TECHNICAL SERIES": "TECHNICAL",
  "LABORATORY EQUIPMENT SERIES": "LABORATORY\nEQUIPMENT",
  "COLLABORATIVE PROTOCOL SERIES": "COLLABORATIVE\nPROTOCOL",
  "FIELD STUDY SERIES": "FIELD STUDY",
}

interface ProductFilterProps {
  onFilterChange: (category: ProductCategory) => void
}

const ProductFilter: React.FC<ProductFilterProps> = ({ onFilterChange }) => {
  const pathname = usePathname()
  const router = useRouter()
  const { filterResetKey } = useHeader()

  // Determine active category from pathname or default to ALL
  const getInitialCategory = React.useCallback((): ProductCategory => {
    if (pathname === "/") return "ALL"
    if (pathname.includes("STANDARD")) return "STANDARD SERIES"
    if (pathname.includes("TECHNICAL")) return "TECHNICAL SERIES"
    if (pathname.includes("LABORATORY")) return "LABORATORY EQUIPMENT SERIES"
    if (pathname.includes("COLLABORATIVE"))
      return "COLLABORATIVE PROTOCOL SERIES"
    if (pathname.includes("FIELD")) return "FIELD STUDY SERIES"
    return "ALL"
  }, [pathname])

  const [activeCategory, setActiveCategory] = useState<ProductCategory>(
    getInitialCategory()
  )

  // Update active category when pathname changes
  useEffect(() => {
    setActiveCategory(getInitialCategory())
  }, [pathname, getInitialCategory])

  // Reset to ALL when triggered by headerContext (logo click)
  useEffect(() => {
    if (filterResetKey > 0) {
      setActiveCategory("ALL")

      // Create a global event to make filter changes affect ProductGrid
      const filterEvent = new CustomEvent("productFilterChange", {
        detail: { category: "ALL" },
      })
      window.dispatchEvent(filterEvent)

      // Update URL if needed
      if (pathname !== "/") {
        router.push("/")
      }
    }
  }, [filterResetKey, router, pathname])

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
    const filterEvent = new CustomEvent("productFilterChange", {
      detail: { category },
    })
    window.dispatchEvent(filterEvent)

    onFilterChange(category)
  }

  return (
    <div className="sticky top-24 z-40 pr-2">
      <div className="flex flex-col">
        {categories.map((category) => {
          // Check if the display name has a line break
          const displayName = displayNames[category]
          const hasLineBreak = displayName.includes("\n")
          const nameLines = hasLineBreak
            ? displayName.split("\n")
            : [displayName]

          return (
            <button
              key={category}
              onClick={() => handleCategoryClick(category)}
              className={`text-left text-[20px] hover:opacity-70 transition mb-5 whitespace-nowrap ${
                activeCategory === category ? "font-medium" : "opacity-70"
              }`}
            >
              {nameLines.map((line, index) => (
                <React.Fragment key={index}>
                  {line}
                  {index < nameLines.length - 1 && <br />}
                </React.Fragment>
              ))}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default ProductFilter
