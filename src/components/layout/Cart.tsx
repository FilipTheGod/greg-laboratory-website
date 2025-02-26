// src/components/layout/Cart.tsx
"use client"

import React from "react"
import { motion } from "framer-motion"

interface CartProps {
  isOpen: boolean
  onClose: () => void
}

const Cart: React.FC<CartProps> = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-laboratory-black bg-opacity-50 z-50"
          onClick={onClose}
        />
      )}

      {/* Cart Panel */}
      <motion.div
        className="fixed top-0 right-0 h-full w-full md:w-96 bg-laboratory-white z-50 shadow-lg"
        initial={{ x: "100%" }}
        animate={{ x: isOpen ? 0 : "100%" }}
        transition={{ duration: 0.3 }}
      >
        <div className="p-6 h-full flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-medium">CART</h2>
            <button onClick={onClose} className="text-laboratory-black">
              CLOSE
            </button>
          </div>

          <div className="flex-grow overflow-y-auto">
            {/* Cart items will go here */}
            <p>Your cart is empty</p>
          </div>

          <div className="pt-4 border-t border-laboratory-black/10">
            <div className="flex justify-between mb-4">
              <span>TOTAL</span>
              <span>$0.00</span>
            </div>
            <button
              className="w-full py-3 bg-laboratory-black text-laboratory-white"
              onClick={() => console.log("Checkout")}
            >
              CHECKOUT
            </button>
          </div>
        </div>
      </motion.div>
    </>
  )
}

export default Cart
