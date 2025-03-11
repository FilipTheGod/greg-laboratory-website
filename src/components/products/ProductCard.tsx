// src/components/products/ProductCard.tsx
import React from "react"
import Link from "next/link"
import { ShopifyProduct } from "@/lib/shopify"
import { formatPrice } from "@/utils/price"
import ProductMedia from "./ProductMedia"

interface ProductCardProps {
  product: ShopifyProduct
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <Link href={`/product/${product.handle}`} className="group">
      <div className="relative aspect-square overflow-hidden bg-laboratory-white mb-2">
        <div className="transition-transform group-hover:scale-105 duration-500 h-full w-full">
          <ProductMedia product={product} priority={true} />
        </div>
      </div>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-laboratory-black/70 text-regular tracking-wide uppercase">
            {product.productType}
          </h3>
          <h2 className="text-laboratory-black text-medium tracking-wide uppercase">
            {product.title}
          </h2>
        </div>
        <p className="text-laboratory-black text-medium tracking-wide">
          ${formatPrice(product.variants[0]?.price)}
        </p>
      </div>
    </Link>
  )
}

export default ProductCard
