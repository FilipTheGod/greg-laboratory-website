// src/components/layout/MobileMenuSheet.tsx
"use client"

import React, { useState } from "react"
import Link from "next/link"
import ProductFilter from "../products/ProductFilter"
import { usePathname } from "next/navigation"
import { useHeader } from "@/contexts/HeaderContext"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

interface MobileMenuSheetProps {
  onFilterChange?: (category: string | number) => void
}

const MobileMenuSheet: React.FC<MobileMenuSheetProps> = ({
  onFilterChange,
}) => {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const { resetFilters } = useHeader()

  const handleFilterSelection = (category: string | number) => {
    if (onFilterChange) {
      onFilterChange(category)
    }
    // Close the sheet after filter selection
    setIsOpen(false)
  }

  const handleLinkClick = () => {
    // Close the sheet when a link is clicked
    setIsOpen(false)
  }

  // Separate handler for logo click to reset filters
  const handleLogoClick = (e: React.MouseEvent) => {
    // First close the sheet
    handleLinkClick()

    // Only reset filters if we're already on the home page
    if (pathname === "/") {
      e.preventDefault()
      resetFilters()
    }
  }

  // Prevent direct state manipulation from affecting filters
  const handleSheetOpenChange = (open: boolean) => {
    setIsOpen(open)
  }

  return (
    <Sheet open={isOpen} onOpenChange={handleSheetOpenChange}>
      <SheetTrigger asChild>
        <button className="p-2 text-black rounded" aria-label="Menu">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="p-0 w-full sm:max-w-xs bg-laboratory-white text-laboratory-black"
      >
        <SheetHeader className="px-4 pt-4 text-left">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col h-full">
          {/* Navigation Links */}
          <div className="p-4 pt-10 ">
            <div className="flex items-center font-semibold space-x-4">
              <Link
                href="/"
                className="text-black hover:opacity-70 transition text-sm tracking-wide"
                onClick={handleLogoClick}
              >
                HOME
              </Link>
              <Link
                href="https://www.instagram.com/greglaboratory/?hl=en"
                className="text-black hover:opacity-70 transition text-sm tracking-wide"
                onClick={handleLinkClick}
              >
                INSTAGRAM
              </Link>
              {/* Consultancy link removed */}
            </div>
          </div>

          {/* Product categories - show on all pages, not just homepage */}
          <div className="pt-2 px-4 flex-1 overflow-y-auto">
            <ProductFilter onFilterChange={handleFilterSelection} />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default MobileMenuSheet
