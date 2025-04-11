// src/components/layout/Header.tsx
"use client"

import React from "react"
import Link from "next/link"
import Image from "next/image"
import { useCart } from "@/contexts/CartContext"
import Cart from "./Cart"

const Header: React.FC = () => {
  const { toggleCart, cartCount } = useCart()

  return (
    <>
      <header className="sticky top-0 z-50 py-4 px-6">
        {/* Desktop Navigation */}
        <div className="hidden md:flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <Image
              src="/images/Logo1.png"
              alt="GREG LABORATORY"
              width={150}
              height={30}
              className="object-contain"
            />
          </Link>

          <div className="flex items-center space-x-8">
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
        </div>

        {/* Mobile centered logo */}
        <div className="md:hidden flex justify-center">
          <Link href="/" className="flex items-center">
            <Image
              src="/images/GregLab_LOGO.png"
              alt="GREG LABORATORY"
              width={120}
              height={24}
              className="object-contain"
            />
          </Link>
        </div>

        <Cart />
      </header>

      {/* Mobile bottom navigation - always visible */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden py-12 px-8">
        <div className="flex justify-between items-center">
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
            CONSULTANCY
          </Link>
          <button
            onClick={toggleCart}
            className="text-laboratory-black text-xs tracking-wide hover:opacity-70 transition"
          >
            CART({cartCount})
          </button>
        </div>
      </div>
    </>
  )
}

export default Header