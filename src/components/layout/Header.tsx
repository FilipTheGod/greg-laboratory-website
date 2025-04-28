// src/components/layout/Header.tsx
"use client"

import React, { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useCart } from "@/contexts/CartContext"
import Cart from "./Cart"
import { motion, AnimatePresence } from "framer-motion"
import { usePathname } from "next/navigation"
import ProductFilter from "../products/ProductFilter"

const Header: React.FC = () => {
  const { toggleCart, cartCount } = useCart()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  // Check if we're on the home page
  const isHomePage = pathname === "/" ||
    pathname.startsWith("/STANDARD") ||
    pathname.startsWith("/TECHNICAL") ||
    pathname.startsWith("/LABORATORY") ||
    pathname.startsWith("/COLLABORATIVE") ||
    pathname.startsWith("/FIELD")

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const handleFilterChange = (category: string | number) => {
    // This function will be used for all filter instances
    console.log("Filter changed:", category)
    // Close the menu if in mobile view
    if (window.innerWidth < 768) {
      toggleMenu()
    }
  }

  return (
    <>
      {/* Desktop Header */}
      <header className="sticky top-0 z-50  ">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            {/* Mobile Hamburger Menu - Left Side */}
            <div className="flex md:hidden items-center">
              <button
                onClick={toggleMenu}
                className="p-2  text-black rounded mr-4"
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
            </div>

            {/* Logo - Desktop */}
            <div className="flex-1 text-center md:text-left">
              <Link href="/" className="hidden md:inline-block">
                <Image
                  src="/images/GregLab_LOGO.png"
                  alt="GREG LABORATORY"
                  width={120}
                  height={30}
                  className="object-contain"
                />
              </Link>

              {/* Logo - Mobile */}
              <Link href="/" className="inline-block md:hidden">
                <Image
                  src="/images/Logo_Mobile.png"
                  alt="GREG LABORATORY"
                  width={100}
                  height={25}
                  className="object-contain"
                />
              </Link>
            </div>

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

            {/* Mobile Cart Button */}
            <div className="md:hidden">
              <button
                onClick={toggleCart}
                className="text-black text-xs tracking-wide  p-2 rounded"
              >
                CART ({cartCount})
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Desktop Categories - Sticky Sidebar - Only show on home page */}
      {isHomePage && (
        <div className="hidden md:block fixed left-0 top-24 h-screen w-48 pl-8 pt-4 z-40">
          <ProductFilter onFilterChange={handleFilterChange} />
        </div>
      )}

      {/* Mobile Menu Panel */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Overlay */}
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-20 z-40 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleMenu}
            />

            {/* Full Screen Menu */}
            <motion.div
              className="fixed inset-0 bg-laboratory-white z-50 md:hidden"
              initial={{ x: "-100%" }}
              animate={{ x: "0%" }}
              exit={{ x: "-100%" }}
              transition={{ ease: "easeOut", duration: 0.3 }}
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex justify-between items-center p-4 ">
                  <Link href="/" onClick={toggleMenu}>
                    <Image
                      src="/images/Logo_Mobile.png"
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

                {/* Navigation Links */}
                <div className="p-4 ">
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

                {/* Mobile Filter - only shown on home page */}
                {isHomePage && (
                  <div className="p-4 flex-1 overflow-y-auto">
                    <ProductFilter onFilterChange={handleFilterChange} />
                  </div>
                )}
              </div>
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