// src/components/layout/MobileMenu.tsx
"use client"

import React from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"

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

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
  isHomePage: boolean
}

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose, isHomePage }) => {
  const categories: ProductCategory[] = [
    "ALL",
    "STANDARD SERIES",
    "TECHNICAL SERIES",
    "LABORATORY EQUIPMENT SERIES",
    "COLLABORATIVE PROTOCOL SERIES",
    "FIELD STUDY SERIES",
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay - half-transparent background */}
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-20 z-40 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Full Screen Menu Panel */}
          <motion.div
            className="fixed inset-0 bg-white z-50 md:hidden"
            initial={{ x: "-100%" }}
            animate={{ x: "0%" }}
            exit={{ x: "-100%" }}
            transition={{ ease: "easeOut", duration: 0.3 }}
          >
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-black/10">
              <Link href="/" onClick={onClose}>
                <Image
                  src="/images/GregLab_LOGO.png"
                  alt="GREG LABORATORY"
                  width={100}
                  height={25}
                  className="object-contain"
                />
              </Link>
              <button
                onClick={onClose}
                className="text-black text-xs tracking-wide"
              >
                CLOSE
              </button>
            </div>

            {/* Navigation Links */}
            <div className="p-4 border-b border-black/10">
              <div className="flex items-center space-x-8">
                <Link
                  href="https://www.instagram.com/greglaboratory/?hl=en"
                  className="text-black hover:opacity-70 transition text-xs tracking-wide"
                  onClick={onClose}
                >
                  INSTAGRAM
                </Link>
                <Link
                  href="/consultancy"
                  className="text-black text-xs tracking-wide hover:opacity-70 transition"
                  onClick={onClose}
                >
                  CONSULTANCY
                </Link>
              </div>
            </div>

            {/* Categories - only shown on home page */}
            {isHomePage && (
              <div className="p-4 flex-1 overflow-y-auto">
                <div className="flex flex-col space-y-6">
                  {categories.map((category) => (
                    <Link
                      key={category}
                      href={category === "ALL" ? "/" : `/${displayNames[category].replace(/\s+/g, '%20')}`}
                      className="text-xs tracking-wide hover:opacity-70 transition"
                      onClick={onClose}
                    >
                      {displayNames[category]}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default MobileMenu