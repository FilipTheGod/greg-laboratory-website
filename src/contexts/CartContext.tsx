// src/contexts/CartContext.tsx
"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { getPriceValue } from "@/utils/price"
import {
  createCheckout,
  fetchCheckout,
  addItemToCheckout,
  updateCheckoutItem,
  removeCheckoutItem,
} from "@/lib/shopify"

// Define Checkout type
interface CheckoutItem {
  id: string
  variant: {
    id: string
  }
  quantity: number
}

interface Checkout {
  id: string
  webUrl: string
  completedAt?: string
  lineItems?: CheckoutItem[]
}

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

interface Notification {
  id: string
  message: string
  type: "success" | "error"
  timeout: number
}

interface CartContextType {
  isCartOpen: boolean
  cartItems: CartItem[]
  cartCount: number
  cartTotal: number
  checkoutUrl: string
  isLoading: boolean
  notifications: Notification[]
  toggleCart: () => void
  addToCart: (item: CartItem) => Promise<void>
  updateQuantity: (id: string, quantity: number) => Promise<void>
  removeFromCart: (id: string) => Promise<void>
  removeNotification: (id: string) => void
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
  const [notifications, setNotifications] = useState<Notification[]>([])

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0)
  const cartTotal = cartItems.reduce(
    (total, item) => total + getPriceValue(item.variant.price) * item.quantity,
    0
  )

  // Add notification
  const addNotification = (
    message: string,
    type: "success" | "error" = "success",
    timeout = 3000
  ) => {
    const id = Date.now().toString()
    const newNotification = { id, message, type, timeout }
    setNotifications((prev) => [...prev, newNotification])

    // Auto-remove notification after timeout
    setTimeout(() => {
      removeNotification(id)
    }, timeout)

    return id
  }

  // Remove notification
  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

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
          const checkout = (await fetchCheckout(existingCheckoutId)) as Checkout

          // If checkout is completed, create a new one
          if (checkout.completedAt) {
            const newCheckout = (await createCheckout()) as Checkout
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
          const newCheckout = (await createCheckout()) as Checkout
          setCheckoutId(newCheckout.id)
          setCheckoutUrl(newCheckout.webUrl)
          localStorage.setItem("checkoutId", newCheckout.id)
        }
      } else {
        // No existing checkout, create a new one
        try {
          const checkout = (await createCheckout()) as Checkout
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

              const updatedCheckout = (await addItemToCheckout(
                checkout.id,
                lineItems
              )) as Checkout
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

    try {
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
      await addItemToCheckout(checkoutId, [
        {
          variantId: newItem.variant.id,
          quantity: newItem.quantity,
        },
      ])

      // Add success notification
      const itemName = newItem.title
      const itemVariant = newItem.variant.title
      addNotification(`Added ${itemName} (${itemVariant}) to cart`, "success")

      // Don't automatically open cart for quick add
      // setIsCartOpen(true)
    } catch (error) {
      console.error("Error adding item to checkout:", error)
      addNotification("Failed to add item to cart", "error")
    } finally {
      setIsLoading(false)
    }
  }

  const updateQuantity = async (id: string, quantity: number) => {
    setIsLoading(true)

    try {
      // Update local cart state
      const updatedCartItems = cartItems.map((item) =>
        item.variant.id === id ? { ...item, quantity } : item
      )

      setCartItems(updatedCartItems)

      // Update Shopify checkout
      await updateCheckoutItem(checkoutId, [
        {
          id,
          quantity,
        },
      ])

      // Add success notification
      const updatedItem = cartItems.find((item) => item.variant.id === id)
      if (updatedItem) {
        addNotification(
          `Updated ${updatedItem.title} quantity to ${quantity}`,
          "success"
        )
      }
    } catch (error) {
      console.error("Error updating item quantity:", error)
      addNotification("Failed to update item quantity", "error")
    } finally {
      setIsLoading(false)
    }
  }

  const removeFromCart = async (id: string) => {
    setIsLoading(true)

    try {
      // Find the item being removed for notification
      const removedItem = cartItems.find((item) => item.variant.id === id)

      // Remove from local cart state
      const updatedCartItems = cartItems.filter(
        (item) => item.variant.id !== id
      )
      setCartItems(updatedCartItems)

      // If cart is empty after removal, clear localStorage
      if (updatedCartItems.length === 0) {
        localStorage.removeItem("cartItems")
      }

      // Update Shopify checkout
      await removeCheckoutItem(checkoutId, [id])

      // Add success notification
      if (removedItem) {
        addNotification(`Removed ${removedItem.title} from cart`, "success")
      }
    } catch (error) {
      console.error("Error removing item from checkout:", error)
      addNotification("Failed to remove item from cart", "error")
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
        notifications,
        toggleCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        removeNotification,
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
