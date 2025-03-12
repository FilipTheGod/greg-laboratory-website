// src/components/cart/CartNotifications.tsx
"use client"

import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useCart } from "@/contexts/CartContext"

const CartNotifications: React.FC = () => {
  const { notifications, removeNotification } = useCart()

  return (
    <div className="fixed bottom-5 right-5 z-50 space-y-2 max-w-md">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: 50, scale: 0.3 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.5 }}
            className={`
              shadow-md rounded px-4 py-3 flex items-center
              ${
                notification.type === "success"
                  ? "bg-laboratory-black text-laboratory-white"
                  : "bg-red-500 text-white"
              }
            `}
          >
            <div className="flex-1 text-xs tracking-wide">
              {notification.message}
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="ml-3 text-xs opacity-70 hover:opacity-100"
            >
              ✕
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

export default CartNotifications
