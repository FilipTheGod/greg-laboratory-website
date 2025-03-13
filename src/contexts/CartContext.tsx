// src/contexts/CartContext.tsx - Fixed TypeScript error
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

      try {
        let activeCheckout: CheckoutType | null = null
        let activeCheckoutId = existingCheckoutId || ""

        if (existingCheckoutId) {
          // Fetch the existing checkout to make sure it's still valid
          try {
            const fetchedCheckout = await fetchCheckout(existingCheckoutId)
            activeCheckout = fetchedCheckout as CheckoutType

            // If checkout is completed, create a new one
            if (activeCheckout.completedAt) {
              const newCheckoutResponse = await createCheckout()
              const newCheckout = newCheckoutResponse as CheckoutType
              activeCheckoutId = newCheckout.id
              activeCheckout = newCheckout

              if (activeCheckoutId) {
                localStorage.setItem("checkoutId", activeCheckoutId)
              }

              // Clear cart if checkout was completed
              setCartItems([])
              localStorage.removeItem("cartItems")
            }
          } catch (checkoutError) {
            console.log(
              "Error with existing checkout, creating new one:",
              checkoutError
            )
            // If there's an error (e.g., checkout expired), create a new one
            const newCheckoutResponse = await createCheckout()
            const newCheckout = newCheckoutResponse as CheckoutType
            activeCheckoutId = newCheckout.id
            activeCheckout = newCheckout

            if (activeCheckoutId) {
              localStorage.setItem("checkoutId", activeCheckoutId)
            }
          }
        } else {
          // No existing checkout, create a new one
          const newCheckoutResponse = await createCheckout()
          const newCheckout = newCheckoutResponse as CheckoutType
          activeCheckoutId = newCheckout.id
          activeCheckout = newCheckout

          if (activeCheckoutId) {
            localStorage.setItem("checkoutId", activeCheckoutId)
          }
        }

        setCheckoutId(activeCheckoutId)

        if (activeCheckout) {
          setCheckoutUrl(activeCheckout.webUrl)
        }

        // Restore cart items if they exist
        if (existingCartItems) {
          let parsedItems = JSON.parse(existingCartItems) as CartItem[]

          // If we have a new checkout, we need to re-add all items to get new lineItemIds
          if (!existingCheckoutId || activeCheckoutId !== existingCheckoutId) {
            if (parsedItems.length > 0) {
              const lineItems = parsedItems.map((item) => ({
                variantId: item.variant.id,
                quantity: item.quantity,
              }))

              if (activeCheckoutId) {
                const updatedCheckoutResponse = await addItemToCheckout(
                  activeCheckoutId,
                  lineItems
                )

                const updatedCheckout = updatedCheckoutResponse as CheckoutType

                // Update cart items with new lineItemIds
                if (
                  updatedCheckout.lineItems &&
                  updatedCheckout.lineItems.length > 0
                ) {
                  parsedItems = parsedItems.map((item, index) => ({
                    ...item,
                    lineItemId:
                      updatedCheckout.lineItems &&
                      index < updatedCheckout.lineItems.length
                        ? updatedCheckout.lineItems[index].id
                        : undefined,
                  }))
                }

                setCheckoutUrl(updatedCheckout.webUrl)
              }
            }
          } else if (activeCheckout && activeCheckout.lineItems) {
            // Match existing lineItemIds with our cart items if using existing checkout
            parsedItems = parsedItems.map((item) => {
              const lineItem = activeCheckout.lineItems?.find(
                (li: CheckoutItem) => li.variant.id === item.variant.id
              )
              return {
                ...item,
                lineItemId: lineItem ? lineItem.id : undefined,
              }
            })
          }

          setCartItems(parsedItems)
          localStorage.setItem("cartItems", JSON.stringify(parsedItems))
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
