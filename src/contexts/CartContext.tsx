// src/contexts/CartContext.tsx
"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import {
  createCheckout,
  fetchCheckout,
  addItemToCheckout,
  updateCheckoutItem,
  removeCheckoutItem,
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
  isLoading: boolean
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
  const [checkoutId, setCheckoutId] = useState("")
  const [checkoutUrl, setCheckoutUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0)
  const cartTotal = cartItems.reduce(
    (total, item) => total + parseFloat(item.variant.price) * item.quantity,
    0
  )

  // Initialize checkout
  useEffect(() => {
    const initializeCheckout = async () => {
      setIsLoading(true)
      // Check if we already have a checkout ID in localStorage
      const existingCheckoutId = localStorage.getItem("checkoutId")
      const existingCartItems = localStorage.getItem("cartItems")

      if (existingCheckoutId) {
        try {
          // Fetch the existing checkout to make sure it's still valid
          const checkout = await fetchCheckout(existingCheckoutId)

          // If checkout is completed, create a new one
          if (checkout.completedAt) {
            const newCheckout = await createCheckout()
            setCheckoutId(newCheckout.id)
            setCheckoutUrl(newCheckout.webUrl)
            localStorage.setItem("checkoutId", newCheckout.id)

            // Clear cart if checkout was completed
            setCartItems([])
            localStorage.removeItem("cartItems")
          } else {
            setCheckoutId(existingCheckoutId)
            setCheckoutUrl(checkout.webUrl)

            // Restore cart items if they exist
            if (existingCartItems) {
              setCartItems(JSON.parse(existingCartItems))
            }
          }
        } catch (error) {
          console.error("Error fetching existing checkout:", error)
          // If there's an error (e.g., checkout expired), create a new one
          const newCheckout = await createCheckout()
          setCheckoutId(newCheckout.id)
          setCheckoutUrl(newCheckout.webUrl)
          localStorage.setItem("checkoutId", newCheckout.id)
        }
      } else {
        // No existing checkout, create a new one
        try {
          const checkout = await createCheckout()
          setCheckoutId(checkout.id)
          setCheckoutUrl(checkout.webUrl)
          localStorage.setItem("checkoutId", checkout.id)

          // Restore cart items if they exist
          if (existingCartItems) {
            const items = JSON.parse(existingCartItems) as CartItem[]
            setCartItems(items)

            // Add items to the new checkout
            if (items.length > 0) {
              const lineItems = items.map((item) => ({
                variantId: item.variant.id,
                quantity: item.quantity,
              }))

              const updatedCheckout = await addItemToCheckout(
                checkout.id,
                lineItems
              )
              setCheckoutUrl(updatedCheckout.webUrl)
            }
          }
        } catch (error) {
          console.error("Error initializing checkout:", error)
        }
      }
      setIsLoading(false)
    }

    initializeCheckout()
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

    // Update Shopify checkout
    try {
      await addItemToCheckout(checkoutId, [
        {
          variantId: newItem.variant.id,
          quantity: newItem.quantity,
        },
      ])
    } catch (error) {
      console.error("Error adding item to checkout:", error)
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

    // Update Shopify checkout
    try {
      await updateCheckoutItem(checkoutId, [
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

    // If cart is empty after removal, clear localStorage
    if (updatedCartItems.length === 0) {
      localStorage.removeItem("cartItems")
    }

    // Update Shopify checkout
    try {
      await removeCheckoutItem(checkoutId, [id])
    } catch (error) {
      console.error("Error removing item from checkout:", error)
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
        isLoading,
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
