// src/app/admin/features/page.tsx
"use client"

import React, { useState } from "react"
import {
  FeatureType,
  featureDisplayNames,
  featureDescriptions,
} from "@/components/products/ProductFeatureIcon"
import ProductFeatureIcon from "@/components/products/ProductFeatureIcon"

export default function FeaturesAdminPage() {
  const [productHandle, setProductHandle] = useState("")
  const [selectedFeatures, setSelectedFeatures] = useState<FeatureType[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const [productTitle, setProductTitle] = useState("")

  // Available features array
  const availableFeatures: FeatureType[] = [
    "WATER_REPELLENT",
    "BREATHABLE",
    "STRETCH",
    "LIGHT_WEIGHT",
    "QUICK_DRY",
    "ANTI_PILLING",
    "EASY_CARE",
    "ANTISTATIC_THREAD",
    "KEEP_WARM",
    "COTTON_TOUCH",
    "UV_CUT",
    "WASHABLE",
    "ECO",
    "WATER_PROOF",
    "WATER_ABSORPTION",
  ]

  // Load product data when handle changes
  const loadProduct = async () => {
    if (!productHandle.trim()) return

    setLoading(true)
    setMessage("")
    setStatus("idle")

    try {
      // Call the API to get product features
      const response = await fetch(`/api/products/${productHandle}/features`)

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Product not found: ${productHandle}`)
        }
        throw new Error(`Error loading product: ${response.statusText}`)
      }

      const data = await response.json()

      // Set the product title if available
      setProductTitle(data.title || productHandle)

      // Set the selected features
      setSelectedFeatures(data.features || [])
      setMessage(`Loaded features for ${data.title || productHandle}`)
      setStatus("success")
    } catch (error) {
      console.error("Error loading product:", error)
      setProductTitle("")
      setSelectedFeatures([])
      setMessage(
        error instanceof Error ? error.message : "Failed to load product"
      )
      setStatus("error")
    } finally {
      setLoading(false)
    }
  }

  // Toggle a feature selection
  const toggleFeature = (feature: FeatureType) => {
    setSelectedFeatures((prev) =>
      prev.includes(feature)
        ? prev.filter((f) => f !== feature)
        : [...prev, feature]
    )
  }

  // Save selected features
  const saveFeatures = async () => {
    if (!productHandle) {
      setMessage("No product loaded")
      setStatus("error")
      return
    }

    setLoading(true)
    setMessage("")
    setStatus("idle")

    try {
      // Call the API to save product features
      const response = await fetch(`/api/products/${productHandle}/features`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ features: selectedFeatures }),
      })

      if (!response.ok) {
        throw new Error(`Failed to save features: ${response.statusText}`)
      }

      setMessage(
        `Features saved successfully for ${productTitle || productHandle}`
      )
      setStatus("success")
    } catch (error) {
      console.error("Error saving features:", error)
      setMessage(
        error instanceof Error ? error.message : "Failed to save features"
      )
      setStatus("error")
    } finally {
      setLoading(false)
    }
  }

  // Clear all selected features
  const clearFeatures = () => {
    setSelectedFeatures([])
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl mb-4">Product Features Admin</h1>

      {/* Product selector */}
      <div className="mb-6">
        <label
          htmlFor="productHandle"
          className="block mb-2 text-sm font-medium"
        >
          Product Handle
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            id="productHandle"
            value={productHandle}
            onChange={(e) => setProductHandle(e.target.value)}
            placeholder="e.g., black-field-jacket"
            className="flex-1 p-2 border border-laboratory-black/20 rounded text-sm"
          />
          <button
            onClick={loadProduct}
            disabled={!productHandle.trim() || loading}
            className="px-4 py-2 bg-laboratory-black text-laboratory-white text-xs rounded disabled:opacity-50"
          >
            {loading ? "Loading..." : "Load Product"}
          </button>
        </div>
      </div>

      {/* Status message */}
      {message && (
        <div
          className={`p-4 mb-4 text-xs rounded ${
            status === "error"
              ? "bg-red-100 text-red-700"
              : status === "success"
              ? "bg-green-100 text-green-700"
              : "bg-blue-100 text-blue-700"
          }`}
        >
          {message}
        </div>
      )}

      {/* Product info */}
      {productTitle && (
        <div className="mb-6 p-4 border border-laboratory-black/10 rounded">
          <h2 className="text-sm mb-2">{productTitle}</h2>
          <p className="text-xs text-laboratory-black/70">
            Handle: {productHandle}
          </p>
        </div>
      )}

      {/* Feature selector */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg">Product Features</h2>
          <button
            onClick={clearFeatures}
            disabled={loading || selectedFeatures.length === 0}
            className="text-xs text-red-600 underline disabled:opacity-50"
          >
            Clear All
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 border border-laboratory-black/10 rounded p-4">
          {availableFeatures.map((feature) => (
            <div
              key={feature}
              className="flex items-start space-x-2 p-2 border border-laboratory-black/5 rounded"
            >
              <input
                type="checkbox"
                id={feature}
                checked={selectedFeatures.includes(feature)}
                onChange={() => toggleFeature(feature)}
                className="h-4 w-4 mt-1"
                disabled={loading}
              />
              <div>
                <label
                  htmlFor={feature}
                  className="text-xs font-medium flex items-center gap-2"
                >
                  <ProductFeatureIcon featureType={feature} size={16} />
                  {featureDisplayNames[feature]}
                </label>
                <p className="text-xs text-laboratory-black/70 mt-1">
                  {featureDescriptions[feature]}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected features summary */}
      {selectedFeatures.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm mb-2">
            Selected Features ({selectedFeatures.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {selectedFeatures.map((feature) => (
              <div
                key={feature}
                className="text-xs bg-laboratory-black/5 px-2 py-1 rounded flex items-center gap-1"
              >
                <ProductFeatureIcon featureType={feature} size={12} />
                {featureDisplayNames[feature]}
                <button
                  onClick={() => toggleFeature(feature)}
                  className="ml-1 text-laboratory-black/50 hover:text-laboratory-black"
                  disabled={loading}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Save button */}
      <button
        onClick={saveFeatures}
        disabled={loading || !productHandle}
        className="px-4 py-2 bg-laboratory-black text-laboratory-white text-xs rounded disabled:opacity-50"
      >
        {loading ? "Saving..." : "Save Features"}
      </button>
    </div>
  )
}
