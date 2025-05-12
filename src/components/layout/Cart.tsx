// src/components/layout/Cart.tsx
"use client"

import React from "react"
import { useCart } from "@/contexts/CartContext"
import Image from "next/image"
import { formatPrice, getPriceValue } from "@/utils/price"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

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

  // Handle quantity decrease
  const handleDecrementQuantity = (
    variantId: string,
    currentQuantity: number
  ) => {
    if (currentQuantity <= 1) {
      // If quantity is 1 or less, remove item completely
      removeFromCart(variantId)
    } else {
      // Otherwise decrease quantity by 1
      updateQuantity(variantId, currentQuantity - 1)
    }
  }

  return (
    <Sheet open={isCartOpen} onOpenChange={toggleCart}>
      <SheetContent
        side="right"
        className="p-0 bg-laboratory-white text-laboratory-black w-full sm:max-w-md"
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <SheetHeader className="px-4 py-4 border-b border-black/10 text-left">
            <SheetTitle className="text-xs tracking-wide">CART</SheetTitle>
          </SheetHeader>

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-center items-center py-6">
              <div className="w-5 h-5 border border-current border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          {/* Cart items */}
          <div className="flex-1 overflow-y-auto">
            {!isLoading && cartItems.length === 0 ? (
              <div className="p-4">
                <p className="text-xs tracking-normal">Your cart is empty</p>
              </div>
            ) : (
              <div className="p-4 space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.variant.id}
                    className="flex border-b border-black/10 pb-4"
                  >
                    {/* Product image */}
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

                    {/* Product details */}
                    <div className="ml-4 flex-1">
                      <div className="flex justify-between items-start">
                        <h3 className="text-xs tracking-wide">{item.title}</h3>
                        <button
                          onClick={() => removeFromCart(item.variant.id)}
                          className="text-xs opacity-70"
                          disabled={isLoading}
                        >
                          Remove
                        </button>
                      </div>

                      <p className="text-xs opacity-70 mt-1 tracking-normal">
                        {item.variant.title}
                      </p>

                      <p className="text-xs mt-1">
                        ${formatPrice(item.variant.price)}
                      </p>

                      {/* Quantity controls */}
                      <div className="flex justify-between items-center mt-2">
                        <div className="flex items-center border border-black/10">
                          <button
                            onClick={() =>
                              handleDecrementQuantity(
                                item.variant.id,
                                item.quantity
                              )
                            }
                            className="px-2 py-1 text-xs"
                            disabled={isLoading}
                          >
                            -
                          </button>
                          <span className="px-2 py-1 text-xs">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.variant.id, item.quantity + 1)
                            }
                            className="px-2 py-1 text-xs"
                            disabled={isLoading}
                          >
                            +
                          </button>
                        </div>

                        {/* Item total */}
                        <span className="text-xs">
                          $
                          {(
                            getPriceValue(item.variant.price) * item.quantity
                          ).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cart footer */}
          <div className="p-4 border-t border-black/10 mt-auto">
            <div className="flex justify-between mb-4">
              <span className="text-xs tracking-wide">TOTAL</span>
              <span className="text-xs tracking-wide">
                ${cartTotal.toFixed(2)}
              </span>
            </div>

            {/* Checkout button */}
            <button
              className="w-full py-3 border border-black text-xs tracking-wide hover:bg-black hover:text-white transition-colors disabled:opacity-50"
              onClick={handleCheckout}
              disabled={cartItems.length === 0 || !checkoutUrl || isLoading}
            >
              CHECKOUT
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default Cart
