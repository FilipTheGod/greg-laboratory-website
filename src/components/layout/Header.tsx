// src/components/layout/Header.tsx
"use client"

import React from "react"
import Link from "next/link"
import { useCart } from "@/contexts/CartContext"
import Cart from "./Cart"

const Header: React.FC = () => {
  const { toggleCart, cartCount } = useCart()

  return (
    <header className="sticky top-0 z-50 py-4 px-6 flex justify-between items-center">
      <Link href="/" className="flex items-center">
        {/* Simple text logo to avoid hydration issues */}
        <div className="text-laboratory-black text-sm tracking-wide font-medium">
          GREG LABORATORY
        </div>
      </Link>

      <div className="flex items-center space-x-4">
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
  )
}

export default Header
