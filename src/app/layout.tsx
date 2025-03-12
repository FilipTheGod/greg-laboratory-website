// src/app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/contexts/CartContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CartNotifications from '@/components/cart/CartNotifications';

export const metadata: Metadata = {
  title: 'GREG LABORATORY',
  description: 'Contemporary functional menswear brand',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-laboratory-white text-laboratory-black">
        <CartProvider>
          <Header />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
          <CartNotifications />
        </CartProvider>
      </body>
    </html>
  );
}