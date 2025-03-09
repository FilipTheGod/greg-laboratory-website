// src/app/product/[handle]/page.tsx
import { getProductByHandle } from "@/lib/shopify"
import ProductDetails from "@/components/products/ProductDetails"
import { notFound } from "next/navigation"

export default async function ProductPage({
  params,
}: {
  params: { handle: string }
}) {
  if (!params.handle) {
    notFound()
  }

  const product = await getProductByHandle(params.handle)

  if (!product) {
    notFound()
  }

  return <ProductDetails product={product} />
}