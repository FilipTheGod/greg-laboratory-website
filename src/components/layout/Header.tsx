// src/components/layout/Header.tsx
"use client"

import React, { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useCart } from "@/contexts/CartContext"
import Cart from "./Cart"

const Header: React.FC = () => {
  const { toggleCart, cartCount } = useCart()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-50 py-4 px-6 flex justify-between items-center">
        <Link href="/" className="flex items-center">
          {/* Use a consistent format for width/height as numbers */}
          <Image
            src="/images/Logo1.png"
            alt="GREG LABORATORY"
            width={150}
            height={30}
            className="object-contain"
          />
        </Link>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-laboratory-black text-xs tracking-wide"
        >
          {mobileMenuOpen ? "CLOSE" : "MENU"}
        </button>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <Link
            href="https://www.instagram.com/greglaboratory/?hl=en"
            className="text-laboratory-black hover:opacity-70 transition text-xs tracking-wide"
          >
            INSTAGRAM
          </Link>
          <Link
            href="/consultancy"
            className="text-laboratory-black text-xs tracking-wide hover:opacity-70 transition"
          >
            CONSULTANCY DIVISION
          </Link>

          <button
            onClick={toggleCart}
            className="text-laboratory-black text-xs tracking-wide hover:opacity-70 transition"
          >
            CART ({cartCount})
          </button>
        </div>

        <Cart />
      </header>

      {/* Mobile Navigation - Fixed at bottom */}
      {mobileMenuOpen && (
        <div className="fixed bottom-0 left-0 right-0  p-4 z-40 md:hidden">
          <div className="flex justify-between items-center">
            <Link
              href="https://www.instagram.com/greglaboratory/?hl=en"
              className="text-laboratory-black hover:opacity-70 transition text-xs tracking-wide"
              onClick={() => setMobileMenuOpen(false)}
            >
              INSTAGRAM
            </Link>
            <Link
              href="/consultancy"
              className="text-laboratory-black text-xs tracking-wide hover:opacity-70 transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              CONSULTANCY
            </Link>
            <button
              onClick={() => {
                toggleCart()
                setMobileMenuOpen(false)
              }}
              className="text-laboratory-black text-xs tracking-wide hover:opacity-70 transition"
            >
              CART ({cartCount})
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default Header
