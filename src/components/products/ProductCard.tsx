// src/components/products/ProductCard.tsx
import React from "react"
import Link from "next/link"
import Image from "next/image"
import { ShopifyProduct } from "@/lib/shopify"

interface ProductCardProps {
  product: ShopifyProduct
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const price = parseFloat(product.variants[0].price).toFixed(2)
  const category = product.productType

  return (
    <Link href={`/product/${product.handle}`} className="group">
      <div className="relative aspect-square overflow-hidden bg-laboratory-white mb-2">
        {product.images && product.images.length > 0 ? (
          <Image
            src={product.images[0].src}
            alt={product.title}
            fill
            className="object-cover transition-transform group-hover:scale-105 duration-500"
          />
        ) : (
          // Fallback for products without images
          <div className="w-full h-full flex items-center justify-center bg-laboratory-black/5">
            <span className="text-laboratory-black/30 text-medium tracking-wide">
              No Image
            </span>
          </div>
        )}
      </div>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-laboratory-black/70 text-regular tracking-wide uppercase">
            {category}
          </h3>
          <h2 className="text-laboratory-black text-medium tracking-wide uppercase">
            {product.title}
          </h2>
        </div>
        <p className="text-laboratory-black text-medium tracking-wide">
          ${price}
        </p>
      </div>
    </Link>
  )
}

export default ProductCard
