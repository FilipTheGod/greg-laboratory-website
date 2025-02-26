// src/components/products/ProductCard.tsx
import React from "react"
import Link from "next/link"

interface ProductCardProps {
  id: string
  title: string
  price: number
  videoUrl: string
  category: string
}

const ProductCard: React.FC<ProductCardProps> = ({
  id,
  title,
  price,
  videoUrl,
  category,
}) => {
  return (
    <Link href={`/product/${id}`} className="group">
      <div className="relative aspect-square overflow-hidden bg-laboratory-white mb-2">
        <video
          className="w-full h-full object-cover"
          src={videoUrl}
          autoPlay
          muted
          loop
          playsInline
        />
      </div>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-sm text-laboratory-black/70">{category}</h3>
          <h2 className="text-laboratory-black">{title}</h2>
        </div>
        <p className="text-laboratory-black">${price}</p>
      </div>
    </Link>
  )
}

export default ProductCard
