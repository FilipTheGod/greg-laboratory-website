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
        {/* SVG Logo */}
        <svg
          width="120"
          height="24"
          viewBox="0 0 362.666 362.666"
          fill="currentColor"
          className="text-laboratory-black"
        >
          <g>
            <path d="M339.106,205.998c-1.586-39.295-18.655-75.978-48.109-103.354c-29.585-27.498-68.534-42.642-109.674-42.642
              s-80.09,15.144-109.675,42.642c-29.619,27.531-46.715,64.473-48.135,104.02c-0.192,5.339,3.847,9.886,9.171,10.325
              c5.32,0.436,10.054-3.384,10.739-8.682c2.2-16.992,19.023-29.805,39.132-29.805c21.715,0,39.383,15.028,39.383,33.5
              c0,5.523,4.478,10,10,10c5.523,0,10-4.477,10-10c0-15.534,12.496-28.629,29.385-32.403v140.268
              c0,12.571-10.229,22.799-22.801,22.799c-12.57,0-22.797-10.228-22.797-22.799c0-5.523-4.478-10-10-10c-5.522,0-10,4.477-10,10
              c0,23.599,19.198,42.799,42.797,42.799c23.601,0,42.801-19.2,42.801-42.799V179.6c16.889,3.774,29.384,16.869,29.384,32.402
              c0,5.523,4.477,10,10,10s10-4.477,10-10c0-18.472,17.668-33.5,39.384-33.5c20.109,0,36.932,12.813,39.131,29.805
              c0.65,5.021,4.932,8.716,9.908,8.716c0.058,0,0.115,0,0.173-0.001c5.456-0.077,9.856-4.524,9.856-9.999
              C339.159,206.677,339.142,206.335,339.106,205.998z"/>
          </g>
          <text x="140" y="20" className="text-laboratory-black tracking-wide" style={{ fontSize: '14px', fontFamily: 'sans-serif', letterSpacing: '0.25em' }}>GREG LABORATORY</text>
        </svg>
      </Link>

      <div className="flex items-center space-x-8">
        {/* Swapped order: Consultancy Division on left, Cart on right */}
        <Link
          href="/consultancy"
          className="text-laboratory-black text-medium tracking-wide hover:opacity-70 transition"
        >
          CONSULTANCY DIVISION
        </Link>

        <button
          onClick={toggleCart}
          className="text-laboratory-black text-medium tracking-wide hover:opacity-70 transition"
        >
          CART ({cartCount})
        </button>
      </div>

      <Cart />
    </header>
  );
};

export default Header;