// src/components/layout/Footer.tsx
import React from "react"

const Footer: React.FC = () => {
  return (
    <footer className="py-8 px-6 border-t border-laboratory-black/10">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <div className="mb-4 md:mb-0">
          <p>© {new Date().getFullYear()} GREG LABORATORY</p>
        </div>
        <div className="flex space-x-6">
          <a
            href="#"
            className="text-laboratory-black hover:opacity-70 transition"
          >
            INSTAGRAM
          </a>
          <a
            href="#"
            className="text-laboratory-black hover:opacity-70 transition"
          >
            TERMS
          </a>
          <a
            href="#"
            className="text-laboratory-black hover:opacity-70 transition"
          >
            PRIVACY
          </a>
        </div>
      </div>
    </footer>
  )
}

export default Footer
