// src/app/product/[id]/page.tsx
import { getProductByHandle } from "@/lib/shopify"
import ProductDetails from "@/components/products/ProductDetails"
import { notFound } from "next/navigation"

export default async function ProductPage({
  params,
}: {
  params: { id: string }
}) {
  // Add console log for debugging
  console.log("Product page params:", params)

  if (!params.id) {
    console.log("No ID provided")
    notFound()
  }

  try {
    // Use params.id instead of params.handle
    const product = await getProductByHandle(params.id)

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
