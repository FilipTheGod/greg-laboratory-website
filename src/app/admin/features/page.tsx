// src/app/admin/features/page.tsx
"use client"

import React, { useState, useEffect } from "react"
import {
  FeatureType,
  featureDisplayNames,
} from "@/components/products/ProductFeatureIcon"

export default function FeaturesAdminPage() {
  const [availableFeatures, setAvailableFeatures] = useState<FeatureType[]>([])
  const [selectedFeatures, setSelectedFeatures] = useState<FeatureType[]>([])
  const [productHandle, setProductHandle] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  // Fetch available features
  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        const response = await fetch("/api/products/metafields")
        const data = await response.json()
        setAvailableFeatures(data.features)
      } catch (error) {
        console.error("Error fetching features:", error)
        setMessage("Error loading features. Please try again.")
      }
    }

    fetchFeatures()
  }, [])

  // Fetch product features when handle is provided
  useEffect(() => {
    if (!productHandle) return

    const fetchProductFeatures = async () => {
      setLoading(true)
      setMessage("")

      try {
        const response = await fetch(`/api/products/${productHandle}/features`)

        if (response.ok) {
          const data = await response.json()
          setSelectedFeatures(data.features || [])
          setMessage(`Loaded features for ${productHandle}`)
        } else if (response.status === 404) {
          setSelectedFeatures([])
          setMessage(`Product not found: ${productHandle}`)
        } else {
          setMessage(`Error: ${response.statusText}`)
        }
      } catch (error) {
        console.error("Error fetching product features:", error)
        setMessage("Error loading product features. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchProductFeatures()
  }, [productHandle])

  // Toggle feature selection
  const toggleFeature = (feature: FeatureType) => {
    if (selectedFeatures.includes(feature)) {
      setSelectedFeatures(selectedFeatures.filter((f) => f !== feature))
    } else {
      setSelectedFeatures([...selectedFeatures, feature])
    }
  }

  // Save selected features to product
  const saveFeatures = async () => {
    if (!productHandle) {
      setMessage("Please enter a product handle first")
      return
    }

    setLoading(true)
    setMessage("")

    try {
      const response = await fetch(`/api/products/${productHandle}/features`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ features: selectedFeatures }),
      })

      if (response.ok) {
        setMessage("Features saved successfully!")
      } else {
        const errorData = await response.json()
        setMessage(`Error: ${errorData.error || response.statusText}`)
      }
    } catch (error) {
      console.error("Error saving features:", error)
      setMessage("Error saving features. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl mb-4">Product Features Admin</h1>

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
            placeholder="e.g., field-jacket-black"
            className="flex-1 p-2 border border-gray-300 rounded text-sm"
          />
          <button
            onClick={() => setProductHandle(productHandle.trim())}
            disabled={!productHandle.trim() || loading}
            className="px-4 py-2 bg-blue-600 text-white rounded text-sm disabled:opacity-50"
          >
            Load Product
          </button>
        </div>
      </div>

      {message && (
        <div
          className={`p-4 mb-4 rounded ${
            message.includes("Error")
              ? "bg-red-100 text-red-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {message}
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-lg mb-2">Select Features</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {availableFeatures.map((feature) => (
            <div key={feature} className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={feature}
                checked={selectedFeatures.includes(feature)}
                onChange={() => toggleFeature(feature)}
                className="h-4 w-4"
              />
              <label htmlFor={feature} className="text-sm">
                {featureDisplayNames[feature] || feature}
              </label>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={saveFeatures}
        disabled={loading || !productHandle}
        className="px-4 py-2 bg-green-600 text-white rounded text-sm disabled:opacity-50"
      >
        {loading ? "Saving..." : "Save Features"}
      </button>

      <div className="mt-8">
        <h2 className="text-lg mb-2">Feature List for Reference</h2>
        <table className="min-w-full border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 text-left border-b">Feature ID</th>
              <th className="py-2 px-4 text-left border-b">Display Name</th>
            </tr>
          </thead>
          <tbody>
            {availableFeatures.map((feature) => (
              <tr key={feature} className="border-b">
                <td className="py-2 px-4 font-mono text-xs">{feature}</td>
                <td className="py-2 px-4">{featureDisplayNames[feature]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
