// src/contexts/HeaderContext.tsx
"use client"

import React, { createContext, useContext, useState } from "react"

interface HeaderContextType {
  resetFilters: () => void
  triggerFilterReset: () => void
  filterResetKey: number
}

const HeaderContext = createContext<HeaderContextType | undefined>(undefined)

export const HeaderProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [filterResetKey, setFilterResetKey] = useState(0)

  const resetFilters = () => {
    // Called by the logo click handlers
    setFilterResetKey((prev) => prev + 1)
  }

  const triggerFilterReset = () => {
    // Use this to trigger a filter reset programmatically
    resetFilters()
  }

  return (
    <HeaderContext.Provider
      value={{
        resetFilters,
        triggerFilterReset,
        filterResetKey,
      }}
    >
      {children}
    </HeaderContext.Provider>
  )
}

export const useHeader = () => {
  const context = useContext(HeaderContext)
  if (context === undefined) {
    throw new Error("useHeader must be used within a HeaderProvider")
  }
  return context
}