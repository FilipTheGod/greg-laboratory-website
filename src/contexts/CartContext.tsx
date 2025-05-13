// src/contexts/CartContext.tsx - Update checkout URL check
"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { getPriceValue } from "@/utils/price"
import {
  createCheckout,
  // Remove the unused fetchCheckout import
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

interface CheckoutType {
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
  lineItemId?: string // Add this field to store the checkout line item ID
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
  clearCart: () => void // Add this method to clear the cart
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

  // Method to clear the cart completely
  const clearCart = () => {
    setCartItems([])
    localStorage.removeItem("cartItems")
    // Don't remove checkoutId, as we want to maintain the empty checkout
  }

  // Initialize checkout - Use layout effect to prevent hydration issues
  useEffect(() => {
    // This function now runs only on the client
    const initializeCheckout = async () => {
      setIsLoading(true)

      try {
        // Create a new checkout
        const newCheckoutResponse = await createCheckout()
        const newCheckout = newCheckoutResponse as CheckoutType
        const activeCheckoutId = newCheckout.id

        // Save the new checkout ID
        localStorage.setItem("checkoutId", activeCheckoutId)
        setCheckoutId(activeCheckoutId)
        setCheckoutUrl(newCheckout.webUrl)

        // Get cart items from localStorage
        const existingCartItems = localStorage.getItem("cartItems")

        // If there are cart items, restore them
        if (existingCartItems) {
          const parsedItems = JSON.parse(existingCartItems) as CartItem[]

          // If items exist in cart, add them to the new checkout
          if (parsedItems.length > 0) {
            const lineItems = parsedItems.map((item) => ({
              variantId: item.variant.id,
              quantity: item.quantity,
            }))

            // Add items to the new checkout
            const updatedCheckoutResponse = await addItemToCheckout(
              activeCheckoutId,
              lineItems
            )

            const updatedCheckout = updatedCheckoutResponse as CheckoutType

            // Update checkout URL with items added
            setCheckoutUrl(updatedCheckout.webUrl)

            // Update cart items with new line item IDs
            if (updatedCheckout.lineItems && updatedCheckout.lineItems.length > 0) {
              const updatedCartItems = parsedItems.map((item, index) => ({
                ...item,
                lineItemId:
                  updatedCheckout.lineItems &&
                  index < updatedCheckout.lineItems.length
                    ? updatedCheckout.lineItems[index].id
                    : undefined,
              }))

              setCartItems(updatedCartItems)
              localStorage.setItem("cartItems", JSON.stringify(updatedCartItems))
            } else {
              setCartItems(parsedItems)
            }
          }
        } else {
          // No cart items in localStorage, start with empty cart
          setCartItems([])
        }
      } catch (error) {
        console.error("Error initializing checkout:", error)

        // Fallback to create a new checkout
        try {
          const checkoutResponse = await createCheckout()
          const checkout = checkoutResponse as CheckoutType
          setCheckoutId(checkout.id)
          setCheckoutUrl(checkout.webUrl)
          localStorage.setItem("checkoutId", checkout.id)
        } catch (fallbackError) {
          console.error("Critical error creating checkout:", fallbackError)
        }
      } finally {
        setIsLoading(false)
      }
    }

    // Only run on the client side
    initializeCheckout()
  }, [])

  // Check URL for completed checkout - client side only
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Define this function inside useEffect to avoid SSR issues
      const checkForCompletedCheckout = () => {
        const urlParams = new URLSearchParams(window.location.search);
        const checkoutCompleted = urlParams.get('checkout_completed');

        if (checkoutCompleted === 'true' ||
            window.location.href.includes('checkout.shopify') ||
            window.location.href.includes('thank_you')) {
          // Clear the cart if checkout was completed
          clearCart();
        }
      };

      // Run the check
      checkForCompletedCheckout();
    }
  }, []);

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

      // Add to Shopify checkout
      const responseData = await addItemToCheckout(checkoutId, [
        {
          variantId: newItem.variant.id,
          quantity: newItem.quantity,
        },
      ])

      const response = responseData as CheckoutType

      // Get line item ID from response - FIX HERE
      const addedLineItemId =
        response.lineItems && response.lineItems.length > 0
          ? response.lineItems[response.lineItems.length - 1].id
          : undefined

      // Update the checkout URL in case it changed
      setCheckoutUrl(response.webUrl)

      // With the new line item ID, update our cart state
      let updatedCartItems: CartItem[]

      if (existingItemIndex >= 0) {
        // Update existing item quantity
        updatedCartItems = [...cartItems]
        updatedCartItems[existingItemIndex].quantity += newItem.quantity

        // If we didn't have a lineItemId before, update it now
        if (
          !updatedCartItems[existingItemIndex].lineItemId &&
          addedLineItemId
        ) {
          updatedCartItems[existingItemIndex].lineItemId = addedLineItemId
        }
      } else {
        // Add new item with the lineItemId
        updatedCartItems = [
          ...cartItems,
          {
            ...newItem,
            lineItemId: addedLineItemId,
          },
        ]
      }

      setCartItems(updatedCartItems)

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

  const updateQuantity = async (
    variantId: string,
    quantity: number,
    maxInventory?: number
  ) => {
    setIsLoading(true)

    try {
      // Find the cart item and check if it has a lineItemId
      const itemToUpdate = cartItems.find(
        (item) => item.variant.id === variantId
      )

      if (!itemToUpdate) {
        throw new Error("Item not found in cart")
      }

      // Ensure we have a lineItemId to work with
      if (!itemToUpdate.lineItemId) {
        throw new Error("Missing line item ID for cart item")
      }

      // Check inventory limits if provided
      if (maxInventory !== undefined && quantity > maxInventory) {
        addNotification(
          `Sorry, only ${maxInventory} items available in stock.`,
          "error"
        )
        quantity = maxInventory // Limit to available inventory
      }

      // Update Shopify checkout using the lineItemId
      const responseData = await updateCheckoutItem(checkoutId, [
        {
          id: itemToUpdate.lineItemId,
          quantity,
        },
      ])

      const response = responseData as CheckoutType

      // Update the checkout URL in case it changed
      setCheckoutUrl(response.webUrl)

      // Update local cart state
      const updatedCartItems = cartItems.map((item) =>
        item.variant.id === variantId ? { ...item, quantity } : item
      )

      setCartItems(updatedCartItems)

      // Add success notification
      addNotification(
        `Updated ${itemToUpdate.title} quantity to ${quantity}`,
        "success"
      )
    } catch (error) {
      console.error("Error updating item quantity:", error)
      addNotification("Failed to update item quantity", "error")
    } finally {
      setIsLoading(false)
    }
  }

  const removeFromCart = async (variantId: string) => {
    setIsLoading(true)

    try {
      // Find the cart item with its lineItemId
      const itemToRemove = cartItems.find(
        (item) => item.variant.id === variantId
      )

      if (!itemToRemove) {
        throw new Error("Item not found in cart")
      }

      // Ensure we have a lineItemId to work with
      if (!itemToRemove.lineItemId) {
        throw new Error("Missing line item ID for cart item")
      }

      // Remove from Shopify checkout using the lineItemId
      const responseData = await removeCheckoutItem(checkoutId, [
        itemToRemove.lineItemId,
      ])

      const response = responseData as CheckoutType

      // Update the checkout URL in case it changed
      setCheckoutUrl(response.webUrl)

      // Remove from local cart state
      const updatedCartItems = cartItems.filter(
        (item) => item.variant.id !== variantId
      )
      setCartItems(updatedCartItems)

      // If cart is empty after removal, clear localStorage
      if (updatedCartItems.length === 0) {
        localStorage.removeItem("cartItems")
      }

      // Add success notification
      addNotification(`Removed ${itemToRemove.title} from cart`, "success")
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
        clearCart,
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