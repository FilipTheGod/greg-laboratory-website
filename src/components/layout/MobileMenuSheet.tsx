// src/components/layout/MobileMenuSheet.tsx
"use client"

import React from "react"
import Link from "next/link"
import Image from "next/image"
import ProductFilter from "../products/ProductFilter"
import { usePathname } from "next/navigation"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet"

interface MobileMenuSheetProps {
  onFilterChange?: (category: string | number) => void
}

const MobileMenuSheet: React.FC<MobileMenuSheetProps> = ({
  onFilterChange,
}) => {
  const pathname = usePathname()

  // Check if we're on the home page
  const isHomePage =
    pathname === "/" ||
    pathname.startsWith("/STANDARD") ||
    pathname.startsWith("/TECHNICAL") ||
    pathname.startsWith("/LABORATORY") ||
    pathname.startsWith("/COLLABORATIVE") ||
    pathname.startsWith("/FIELD")

  const handleFilterSelection = (category: string | number) => {
    if (onFilterChange) {
      onFilterChange(category)
    }
  }

  return (
    <Sheet>
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
          {/* Header with logo and close button */}
          <div className="flex justify-between items-center p-4 border-b border-laboratory-black/10">
            <Link href="/">
              <Image
                src="/images/GregLab_LOGO.png"
                alt="GREG LABORATORY"
                width={100}
                height={25}
                className="object-contain"
              />
            </Link>
            <SheetClose className="text-black text-xs tracking-wide ml-auto"/>
          </div>

          {/* Navigation Links */}
          <div className="p-4 border-b border-laboratory-black/10">
            <div className="flex items-center space-x-8">
              <Link
                href="https://www.instagram.com/greglaboratory/?hl=en"
                className="text-black hover:opacity-70 transition text-xs tracking-wide"
              >
                INSTAGRAM
              </Link>
              <Link
                href="/consultancy"
                className="text-black text-xs tracking-wide hover:opacity-70 transition"
              >
                CONSULTANCY
              </Link>
            </div>
          </div>

          {/* Product categories - only show on home page */}
          {isHomePage && (
            <div className="pt-2 px-4 flex-1 overflow-y-auto">
              <ProductFilter onFilterChange={handleFilterSelection} />
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default MobileMenuSheet
