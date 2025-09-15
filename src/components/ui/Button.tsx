import React from "react"

interface ButtonProps {
  variant: "primary" | "secondary" | "danger" | "success" | "warning"
  size?: "sm" | "md" | "lg"
  disabled?: boolean
  loading?: boolean
  onClick?: () => void
  type?: "button" | "submit" | "reset"
  children: React.ReactNode
  className?: string
}

export const Button: React.FC<ButtonProps> = ({
  variant,
  size = "md",
  disabled = false,
  loading = false,
  onClick,
  type = "button",
  children,
  className = ""
}) => {
  const baseClasses =
    "font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"

  const variantClasses = {
    primary:
      "bg-primary hover:bg-primary-hover text-white focus:ring-emerald-500 shadow-sm hover:shadow-md transition-all duration-200",
    secondary:
      "bg-gray-100 hover:bg-gray-200 text-gray-700 focus:ring-gray-500 border border-gray-200 hover:border-gray-300 transition-all duration-200",
    danger:
      "bg-danger hover:bg-red-600 text-white focus:ring-red-500 shadow-sm hover:shadow-md transition-all duration-200",
    success:
      "bg-success hover:bg-emerald-600 text-white focus:ring-emerald-500 shadow-sm hover:shadow-md transition-all duration-200",
    warning:
      "bg-warning hover:bg-amber-600 text-white focus:ring-amber-500 shadow-sm hover:shadow-md transition-all duration-200"
  }

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg"
  }

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`

  return (
    <button type={type} className={classes} onClick={onClick} disabled={disabled || loading}>
      {loading ? (
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          Загрузка...
        </div>
      ) : (
        children
      )}
    </button>
  )
}
