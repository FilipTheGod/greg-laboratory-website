// src/components/ui/Button.tsx
import React from "react"

interface ButtonProps {
  children: React.ReactNode
  type?: "button" | "submit" | "reset"
  variant?: "primary" | "secondary" | "outline"
  onClick?: () => void
  disabled?: boolean
  className?: string
  fullWidth?: boolean
}

const Button: React.FC<ButtonProps> = ({
  children,
  type = "button",
  variant = "primary",
  onClick,
  disabled = false,
  className = "",
  fullWidth = false,
}) => {
  const baseStyles = "py-3 px-6 transition-colors text-medium tracking-wide"

  const variantStyles = {
    primary: "bg-laboratory-black text-laboratory-white hover:opacity-90",
    secondary:
      "bg-laboratory-white text-laboratory-black border border-laboratory-black hover:bg-laboratory-black/5",
    outline:
      "bg-transparent text-laboratory-black border border-laboratory-black/50 hover:border-laboratory-black",
  }

  const widthStyle = fullWidth ? "w-full" : ""

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles[variant]} ${widthStyle} ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      } ${className}`}
    >
      {children}
    </button>
  )
}

export default Button
