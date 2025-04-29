// src/app/product/[id]/page.tsx
import { getProductByHandle } from "@/lib/shopify"
import ProductDetails from "@/components/products/ProductDetails"
import { notFound } from "next/navigation"

interface ProductPageProps {
  params: Promise<{ id: string }> | { id: string }
}

export default async function ProductPage(props: ProductPageProps) {
  try {
    // Ensure params is awaited before using its properties
    const resolvedParams =
      props.params instanceof Promise ? await props.params : props.params
    const id = resolvedParams.id
    // console.log("Product id:", id)

    if (!id) {
      // console.log("No ID provided")
      notFound()
    }

    const product = await getProductByHandle(id)

    // console.log(
    //   "Retrieved product:",
    //   product ? `${product.title} (found)` : "null (not found)"
    // )

    if (!product) {
      notFound()
    }

    return (
      <div className="bg-[#f6f6f6] min-h-screen">
        <ProductDetails product={product} />
      </div>
    )
  } catch (error) {
    console.error("Error fetching product:", error)
    notFound()
  }
}
