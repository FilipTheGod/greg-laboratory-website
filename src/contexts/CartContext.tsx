// src/contexts/CartContext.tsx
"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import {
  createCart,
  fetchCart,
  addItemToCart,
  updateCartItem,
  removeCartItem,
} from "@/lib/shopify"

export interface CartItem {
  id: string
  title: string
  handle: string
  quantity: number
  variant: {
    id: string
    title: string
    price: string
    image: string
  }
}

interface CartContextType {
  isCartOpen: boolean
  cartItems: CartItem[]
  cartCount: number
  cartTotal: number
  checkoutUrl: string
  toggleCart: () => void
  addToCart: (item: CartItem) => void
  updateQuantity: (id: string, quantity: number) => void
  removeFromCart: (id: string) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [cartId, setCartId] = useState("")
  const [checkoutUrl, setCheckoutUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0)
  const cartTotal = cartItems.reduce(
    (total, item) => total + parseFloat(item.variant.price) * item.quantity,
    0
  )

  // Initialize cart
  useEffect(() => {
    const initializeCart = async () => {
      // Check if we already have a cart ID in localStorage
      const existingCartId = localStorage.getItem("cartId")
      const existingCartItems = localStorage.getItem("cartItems")

      if (existingCartId) {
        try {
          // Fetch the existing cart to make sure it's still valid
          const cart = await fetchCart(existingCartId)

          setCartId(existingCartId)
          // The webUrl will be the checkout URL
          setCheckoutUrl(cart.webUrl || "")

          // Restore cart items if they exist
          if (existingCartItems) {
            setCartItems(JSON.parse(existingCartItems))
          }
        } catch (error) {
          console.error("Error fetching existing cart:", error)
          // If there's an error (e.g., cart expired), create a new one
          const newCart = await createCart()
          setCartId(newCart.id)
          setCheckoutUrl(newCart.webUrl || "")
          localStorage.setItem("cartId", newCart.id)
        }
      } else {
        // No existing cart, create a new one
        try {
          const cart = await createCart()
          setCartId(cart.id)
          setCheckoutUrl(cart.webUrl || "")
          localStorage.setItem("cartId", cart.id)

          // Restore cart items if they exist
          if (existingCartItems) {
            const items = JSON.parse(existingCartItems) as CartItem[]
            setCartItems(items)

            // Add items to the new cart
            if (items.length > 0) {
              const lineItems = items.map((item) => ({
                variantId: item.variant.id,
                quantity: item.quantity,
              }))

              const updatedCart = await addItemToCart(cart.id, lineItems)
              setCheckoutUrl(updatedCart.webUrl || "")
            }
          }
        } catch (error) {
          console.error("Error initializing cart:", error)
        }
      }
    }

    initializeCart()
  }, [])

  // Update localStorage when cart items change
  useEffect(() => {
    if (cartItems.length > 0) {
      localStorage.setItem("cartItems", JSON.stringify(cartItems))
    } else {
      localStorage.removeItem("cartItems")
    }
  }, [cartItems])

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen)
  }

  const addToCart = async (newItem: CartItem) => {
    setIsLoading(true)

    // Check if item already exists in cart
    const existingItemIndex = cartItems.findIndex(
      (item) => item.variant.id === newItem.variant.id
    )

    let updatedCartItems: CartItem[]

    if (existingItemIndex >= 0) {
      // Update existing item quantity
      updatedCartItems = [...cartItems]
      updatedCartItems[existingItemIndex].quantity += newItem.quantity
    } else {
      // Add new item
      updatedCartItems = [...cartItems, newItem]
    }

    setCartItems(updatedCartItems)

    // Update Shopify cart
    try {
      await addItemToCart(cartId, [
        {
          variantId: newItem.variant.id,
          quantity: newItem.quantity,
        },
      ])
    } catch (error) {
      console.error("Error adding item to cart:", error)
    } finally {
      setIsLoading(false)
      setIsCartOpen(true) // Open cart when item is added
    }
  }

  const updateQuantity = async (id: string, quantity: number) => {
    setIsLoading(true)

    // Update local cart state
    const updatedCartItems = cartItems.map((item) =>
      item.variant.id === id ? { ...item, quantity } : item
    )

    setCartItems(updatedCartItems)

    // Update Shopify cart
    try {
      await updateCartItem(cartId, [
        {
          id,
          quantity,
        },
      ])
    } catch (error) {
      console.error("Error updating item quantity:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const removeFromCart = async (id: string) => {
    setIsLoading(true)

    // Remove from local cart state
    const updatedCartItems = cartItems.filter((item) => item.variant.id !== id)
    setCartItems(updatedCartItems)

    // Update Shopify cart
    try {
      await removeCartItem(cartId, [id])
    } catch (error) {
      console.error("Error removing item from cart:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <CartContext.Provider
      value={{
        isCartOpen,
        cartItems,
        cartCount,
        cartTotal,
        checkoutUrl,
        toggleCart,
        addToCart,
        updateQuantity,
        removeFromCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
