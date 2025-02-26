// src/components/layout/Header.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import Cart from './Cart';

const Header: React.FC = () => {
  const { toggleCart, cartCount } = useCart();

  return (
    <header className="sticky top-0 z-50 bg-laboratory-white py-4 px-6 flex justify-between items-center border-b border-laboratory-black/10">
      <Link href="/" className="flex items-center">
        <svg width="120" height="24" viewBox="0 0 120 24">
          {/* We'll add the SVG logo content later */}
          <text x="0" y="20" className="text-laboratory-black tracking-wide">GREG LABORATORY</text>
        </svg>
      </Link>

      <div className="flex items-center space-x-8">
        <button
          onClick={toggleCart}
          className="text-laboratory-black text-medium tracking-wide hover:opacity-70 transition"
        >
          CART ({cartCount})
        </button>
        <Link
          href="/consultancy"
          className="text-laboratory-black text-medium tracking-wide hover:opacity-70 transition"
        >
          CONSULTANCY DIVISION
        </Link>
      </div>

      <Cart />
    </header>
  );
};

export default Header;