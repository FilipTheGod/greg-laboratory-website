// src/app/product/[handle]/page.tsx
import { getProductByHandle } from "@/lib/shopify"
import ProductDetails from "@/components/products/ProductDetails"
import { notFound } from "next/navigation"

export default async function ProductPage({
  params,
}: {
  params: { handle: string }
}) {
  // Add console log for debugging
  console.log("Product page params:", params)

  if (!params.handle) {
    console.log("No handle provided")
    notFound()
  }

  try {
    const product = await getProductByHandle(params.handle)

    console.log(
      "Retrieved product:",
      product ? `${product.title} (found)` : "null (not found)"
    )

    if (!product) {
      notFound()
    }

    return <ProductDetails product={product} />
  } catch (error) {
    console.error("Error fetching product:", error)
    notFound()
  }
}
