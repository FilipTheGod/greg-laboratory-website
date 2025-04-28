// src/components/layout/Header.tsx
"use client"

import React, { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useCart } from "@/contexts/CartContext"
import Cart from "./Cart"
import { motion, AnimatePresence } from "framer-motion"
import { usePathname } from "next/navigation"

const Header: React.FC = () => {
  const { toggleCart, cartCount } = useCart()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  // Check if we're on the home page
  const isHomePage =
    pathname === "/" ||
    pathname === "/ALL" ||
    pathname === "/STANDARD" ||
    pathname === "/TECHNICAL" ||
    pathname === "/LABORATORY%20EQUIPMENT" ||
    pathname === "/COLLABORATIVE%20PROTOCOL" ||
    pathname === "/FIELD%20STUDY"

  // Product categories
  const categories = [
    "ALL",
    "STANDARD",
    "TECHNICAL",
    "LABORATORY EQUIPMENT",
    "COLLABORATIVE PROTOCOL",
    "FIELD STUDY",
  ]

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <>
      {/* Desktop Header */}
      <header className="sticky top-0 z-50  border-black/10">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <Link href="/" className="block">
              <Image
                src="/images/GregLab_LOGO.png"
                alt="GREG LABORATORY"
                width={120}
                height={30}
                className="object-contain"
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
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
              <button
                onClick={toggleCart}
                className="text-black text-xs tracking-wide hover:opacity-70 transition"
              >
                CART ({cartCount})
              </button>
            </div>

            {/* Mobile Navigation Button */}
            <div className="flex md:hidden items-center space-x-4">
              <button
                onClick={toggleMenu}
                className="text-black"
                aria-label="Menu"
              >
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
              <button
                onClick={toggleCart}
                className="text-black text-xs tracking-wide"
              >
                CART ({cartCount})
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Desktop Categories - Sticky Sidebar - Only show on home page */}
      {isHomePage && (
        <div className="hidden md:block fixed left-0 top-24 h-screen w-48 pl-8 pt-4 z-40 bg-transparent">
          <div className="flex flex-col space-y-3">
            {categories.map((category, index) => (
              <Link
                key={index}
                href={
                  category === "ALL"
                    ? "/"
                    : `/${category.replace(/\s+/g, "%20")}`
                }
                className="text-xs tracking-wide hover:opacity-70 transition"
              >
                {category}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Mobile Menu Panel */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Overlay - half-transparent background */}
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-20 z-40 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleMenu}
            />

            {/* Sliding Panel */}
            <motion.div
              className="fixed left-0 top-0 h-full w-3/4 max-w-sm z-50 md:hidden"
              initial={{ x: "-100%" }}
              animate={{ x: "0%" }}
              exit={{ x: "-100%" }}
              transition={{ ease: "easeOut", duration: 0.3 }}
            >
              <div className="flex justify-between items-center p-4 border-b border-black/10">
                <Link href="/" onClick={toggleMenu}>
                  <Image
                    src="/images/GregLab_LOGO.png"
                    alt="GREG LABORATORY"
                    width={100}
                    height={25}
                    className="object-contain"
                  />
                </Link>
                <button
                  onClick={toggleMenu}
                  className="text-black text-xs tracking-wide"
                >
                  CLOSE
                </button>
              </div>

              <div className="p-4 border-b border-black/10">
                <div className="flex items-center space-x-8">
                  <Link
                    href="https://www.instagram.com/greglaboratory/?hl=en"
                    className="text-black hover:opacity-70 transition text-xs tracking-wide"
                    onClick={toggleMenu}
                  >
                    INSTAGRAM
                  </Link>
                  <Link
                    href="/consultancy"
                    className="text-black text-xs tracking-wide hover:opacity-70 transition"
                    onClick={toggleMenu}
                  >
                    CONSULTANCY
                  </Link>
                </div>
              </div>

              {/* Only show categories on relevant pages */}
              {isHomePage && (
                <div className="p-4">
                  <div className="flex flex-col space-y-6">
                    {categories.map((category, index) => (
                      <Link
                        key={index}
                        href={
                          category === "ALL"
                            ? "/"
                            : `/${category.replace(/\s+/g, "%20")}`
                        }
                        className="text-xs tracking-wide hover:opacity-70 transition"
                        onClick={toggleMenu}
                      >
                        {category}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Cart Component */}
      <Cart />
    </>
  )
}

export default Header
