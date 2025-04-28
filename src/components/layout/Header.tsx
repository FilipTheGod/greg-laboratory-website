// src/components/layout/Header.tsx
"use client"

import React from "react"
import Link from "next/link"
import Image from "next/image"
import { useCart } from "@/contexts/CartContext"
import Cart from "./Cart"
import { usePathname } from "next/navigation"
import ProductFilter from "../products/ProductFilter"
import MobileMenuSheet from "./MobileMenuSheet"

const Header: React.FC = () => {
  const { toggleCart, cartCount } = useCart()
  const pathname = usePathname()

  // Check if we're on the home page
  const isHomePage =
    pathname === "/" ||
    pathname.startsWith("/STANDARD") ||
    pathname.startsWith("/TECHNICAL") ||
    pathname.startsWith("/LABORATORY") ||
    pathname.startsWith("/COLLABORATIVE") ||
    pathname.startsWith("/FIELD")

  const handleFilterChange = (category: string | number) => {
    // This function will be used for all filter instances
    console.log("Filter changed:", category)
  }

  return (
    <>
      {/* Desktop Header */}
      <header className="sticky top-0 z-50 bg-laboratory-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            {/* Mobile Menu Button - Left Side */}
            <div className="flex md:hidden items-center">
              <MobileMenuSheet onFilterChange={handleFilterChange} />
            </div>

            {/* Logo - Desktop aligned to left */}
            <div className="hidden md:flex w-48 pl-8">
              <Link href="/" className="block">
                <Image
                  src="/images/GregLab_LOGO.png"
                  alt="GREG LABORATORY"
                  width={100}
                  height={25}
                  className="object-contain"
                />
              </Link>
            </div>

            {/* Mobile Logo - Centered */}
            <div className="flex justify-center md:hidden pl-8 flex-1">
              <Link href="/">
                <Image
                  src="/images/Logo_Mobile.png"
                  alt="GREG LABORATORY"
                  width={40}
                  height={25}
                  className="object-contain"
                />
              </Link>
            </div>

            {/* Desktop Navigation - Pushed to right */}
            <div className="hidden md:flex items-center justify-end space-x-8 pr-8">
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
                className="text-black text-xs tracking-wide p-2 rounded"
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

      {/* Cart Component */}
      <Cart />
    </>
  )
}

export default Header
