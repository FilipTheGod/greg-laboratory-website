// src/components/layout/MobileMenuSheet.tsx
"use client"

import React, { useState } from "react"
import Link from "next/link"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

// Remove empty interface and replace with a proper type or remove if unused
const MobileMenuSheet: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)

  const handleLinkClick = () => {
    // Close the sheet when a link is clicked
    setIsOpen(false)
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
              <a
                href="mailto:info@greglaboratory.com"
                className="text-black hover:opacity-70 transition text-sm tracking-wide"
                onClick={handleLinkClick}
              >
                CONTACT
              </a>
              <Link
                href="https://www.instagram.com/greglaboratory/?hl=en"
                className="text-black hover:opacity-70 transition text-sm tracking-wide"
                onClick={handleLinkClick}
              >
                INSTAGRAM
              </Link>
            </div>
          </div>

          {/* Filter code will be re-enabled in the future */}
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default MobileMenuSheet
