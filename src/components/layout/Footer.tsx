// src/components/layout/Footer.tsx
import React from "react"

const Footer: React.FC = () => {
  return (
    <footer className="py-8 px-6">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <div className="mb-4 md:mb-0">
          <p className="text-xs tracking-wide">
            © {new Date().getFullYear()} GREG LABORATORY
          </p>
        </div>
        <div className="flex space-x-6">
          <a
            href="#"
            className="text-laboratory-black hover:opacity-70 transition text-xs tracking-wide"
          >
            INSTAGRAM
          </a>
          <a
            href="#"
            className="text-laboratory-black hover:opacity-70 transition text-xs tracking-wide"
          >
            TERMS
          </a>
          <a
            href="#"
            className="text-laboratory-black hover:opacity-70 transition text-xs tracking-wide"
          >
            PRIVACY
          </a>
        </div>
      </div>
    </footer>
  )
}

export default Footer
