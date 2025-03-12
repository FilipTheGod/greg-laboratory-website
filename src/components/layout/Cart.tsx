// src/components/layout/Cart.tsx
"use client"

import React from "react"
import { motion } from "framer-motion"
import { useCart } from "@/contexts/CartContext"
import Image from "next/image"
import { formatPrice, getPriceValue } from "@/utils/price"

const Cart: React.FC = () => {
  const {
    isCartOpen,
    toggleCart,
    cartItems,
    cartTotal,
    updateQuantity,
    removeFromCart,
    checkoutUrl,
    isLoading,
  } = useCart()

  const handleCheckout = () => {
    if (checkoutUrl) {
      window.location.href = checkoutUrl
    }
  }

  return (
    <>
      {/* Overlay */}
      {isCartOpen && (
        <div
          className="fixed inset-0 bg-laboratory-black bg-opacity-50 z-50"
          onClick={toggleCart}
        />
      )}

      {/* Cart Panel */}
      <motion.div
        className="fixed top-0 right-0 h-full w-full md:w-96 bg-laboratory-white z-50 shadow-lg"
        initial={{ x: "100%" }}
        animate={{ x: isCartOpen ? 0 : "100%" }}
        transition={{ duration: 0.3 }}
      >
        <div className="p-6 h-full flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xs tracking-wide">CART</h2>
            <button onClick={toggleCart} className="text-xs tracking-wide">
              CLOSE
            </button>
          </div>

          {isLoading && (
            <div className="flex justify-center items-center py-4">
              <div className="w-6 h-6 border-2 border-laboratory-black border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-2 text-xs">Loading...</span>
            </div>
          )}

          <div className="flex-grow overflow-y-auto">
            {!isLoading && cartItems.length === 0 ? (
              <p className="text-xs tracking-wide">Your cart is empty</p>
            ) : (
              <ul className="space-y-6">
                {cartItems.map((item) => (
                  <li
                    key={item.variant.id}
                    className="flex border-b border-laboratory-black/10 pb-4"
                  >
                    <div className="w-20 h-20 relative flex-shrink-0">
                      {item.variant.image && (
                        <Image
                          src={item.variant.image}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="ml-4 flex-grow">
                      <div className="flex justify-between">
                        <h3 className="text-xs tracking-wide">{item.title}</h3>
                        <button
                          onClick={() => removeFromCart(item.variant.id)}
                          className="text-laboratory-black/70 text-xs tracking-wide"
                          disabled={isLoading}
                        >
                          Remove
                        </button>
                      </div>
                      <p className="text-laboratory-black/70 text-xs tracking-wide">
                        {item.variant.title}
                      </p>
                      <p className="text-xs tracking-wide">
                        ${formatPrice(item.variant.price)}
                      </p>

                      <div className="mt-2 flex justify-between items-center">
                        <div className="flex items-center border border-laboratory-black/20">
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.variant.id,
                                Math.max(1, item.quantity - 1)
                              )
                            }
                            className="px-2 py-1 text-laboratory-black text-xs tracking-wide"
                            disabled={isLoading}
                          >
                            -
                          </button>
                          <span className="px-2 py-1 text-laboratory-black text-xs tracking-wide">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.variant.id, item.quantity + 1)
                            }
                            className="px-2 py-1 text-laboratory-black text-xs tracking-wide"
                            disabled={isLoading}
                          >
                            +
                          </button>
                        </div>
                        <span className="text-xs tracking-wide">
                          $
                          {(
                            getPriceValue(item.variant.price) * item.quantity
                          ).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="pt-4 border-t border-laboratory-black/10">
            <div className="flex justify-between mb-4">
              <span className="text-xs tracking-wide">TOTAL</span>
              <span className="text-xs tracking-wide">
                ${cartTotal.toFixed(2)}
              </span>
            </div>
            <button
              className="w-full py-3 bg-laboratory-black text-laboratory-white text-xs tracking-wide disabled:opacity-50"
              onClick={handleCheckout}
              disabled={cartItems.length === 0 || !checkoutUrl || isLoading}
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
