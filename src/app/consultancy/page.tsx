// src/app/consultancy/page.tsx
"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

export default function Consultancy() {
  const [showContactForm, setShowContactForm] = useState(false)
  const [message, setMessage] = useState("")
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  // Client list data
  const clientListLeft = [
    "CLIENTS",
    "NETFLIX",
    "ETHEREAL",
    "ARCHETYPE",
    "ELIZABETH",
    "KUZYK",
    "SAM",
    "LIEPKE",
    "INTIMA",
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate submission
    setTimeout(() => {
      setIsSubmitting(false)
      setSubmitted(true)
      setMessage("")

      // Reset the form after showing success message
      setTimeout(() => {
        setShowContactForm(false)
        setSubmitted(false)
      }, 3000)
    }, 1000)
  }

  return (
    <div className="min-h-[100vh] relative overflow-hidden">
      {/* Left column of clients */}
      <div className="absolute left-8 top-0 pt-10 text-sm md:text-lg lg:text-2xl font-normal tracking-wide">
        {clientListLeft.map((client, index) => (
          <div key={`left-${index}`} className="mb-1 md:mb-1">
            {client}
          </div>
        ))}
      </div>

      {/* Central content */}
      <div className="flex items-center justify-center min-h-screen px-20 md:px-24 lg:px-36">
        <div className="w-full max-w-6xl mx-auto text-center">
          <h1 className="text-xl md:text-2xl lg:text-3xl tracking-wide leading-relaxed">
            GREG LABORATORY SPECIALIZES IN TECHNICAL DESIGN CONSULTATION,
            PATTERN DEVELOPMENT, AND CONSTRUCTION METHODOLOGY. WE OFFER BOTH{" "}
            <a
              href="mailto:info@greglaboratory.com"
              className="underline transition-colors duration-300 hover:text-laboratory-black/60"
            >
              COLLABORATIONS
            </a>{" "}
            AND{" "}
            <button
              onClick={() => setShowContactForm(true)}
              className="underline transition-colors duration-300 hover:text-laboratory-black/60"
            >
              CONSULTANCY
            </button>{" "}
            SERVICES FOR SELECTED PARTNERS AND CLIENTS SEEKING ELEVATED
            TECHNICAL SOLUTIONS.
          </h1>
        </div>
      </div>

      {/* Contact Form Modal */}
      <AnimatePresence>
        {showContactForm && (
          <motion.div
            className="fixed inset-0 bg-laboratory-black/40 flex items-center justify-center z-50 px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowContactForm(false)}
          >
            <motion.div
              className="bg-laboratory-white p-8 max-w-md w-full"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {submitted ? (
                <div className="text-center py-8">
                  <h3 className="text-medium tracking-wide mb-4">
                    THANK YOU
                  </h3>
                  <p className="text-regular tracking-wide">
                    WE WILL GET BACK TO YOU AS SOON AS POSSIBLE.
                  </p>
                </div>
              ) : (
                <>
                  <h2 className="text-medium tracking-wide mb-6 text-center">CONSULTANCY REQUEST</h2>
                  <p className="text-regular tracking-wide mb-6 text-center">
                    SUBMIT YOUR MESSAGE BELOW AND WE&apos;LL GET BACK TO YOU AS QUICKLY AS POSSIBLE.
                  </p>

                  <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                      <label htmlFor="email" className="block text-regular tracking-wide mb-2">
                        EMAIL
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-2 border border-laboratory-black/20 bg-transparent text-regular tracking-wide"
                        required
                      />
                    </div>

                    <div className="mb-6">
                      <label htmlFor="message" className="block text-regular tracking-wide mb-2">
                        MESSAGE
                      </label>
                      <textarea
                        id="message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full p-2 border border-laboratory-black/20 bg-transparent text-regular tracking-wide h-32"
                        required
                      />
                    </div>

                    <div className="flex justify-between items-center">
                      <button
                        type="button"
                        onClick={() => setShowContactForm(false)}
                        className="text-regular tracking-wide hover:underline"
                      >
                        CLOSE
                      </button>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="py-2 px-6 bg-laboratory-black text-laboratory-white text-regular tracking-wide disabled:opacity-70"
                      >
                        {isSubmitting ? "SENDING..." : "SUBMIT"}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
