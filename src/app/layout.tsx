// src/app/layout.tsx
import type { Metadata } from "next"
import "./font-fix.css" // Import the font fix before globals.css
import "./globals.css"
import { CartProvider } from "@/contexts/CartContext"
import { HeaderProvider } from "@/contexts/HeaderContext"
import Header from "@/components/layout/Header"
import CartNotifications from "@/components/cart/CartNotifications"

export const metadata: Metadata = {
  title: "GREG LABORATORY",
  description: "Contemporary functional menswear brand",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-laboratory-white text-laboratory-black">
        <HeaderProvider>
          <CartProvider>
            <Header />
            <main className="flex-grow">{children}</main>
            <CartNotifications />
          </CartProvider>
        </HeaderProvider>
      </body>
    </html>
  )
}
