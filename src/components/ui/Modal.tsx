import React, { useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "./Button"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: "sm" | "md" | "lg" | "xl"
  showCloseButton?: boolean
  className?: string
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  showCloseButton = true,
  className = ""
}) => {
  // Закрытие по Escape
  useEffect((): (() => void) => {
    const handleEscape = (e: KeyboardEvent): void => {
      if (e.key === "Escape") {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = "unset"
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl"
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Modern backdrop with blur */}
      <div
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-all duration-300"
        onClick={onClose}
      />

      {/* Modal with modern styling */}
      <div
        className={`relative bg-white rounded-2xl shadow-2xl shadow-emerald-500/10 w-full mx-4 ${sizeClasses[size]} max-h-[90vh] overflow-hidden animate-slide-up border border-emerald-100/50 ${className}`}>
        {/* Header with emerald accent */}
        {(!!title || showCloseButton) && (
          <div className="flex items-center justify-between p-6 border-b border-emerald-100/60 bg-gradient-to-r from-emerald-50/30 to-green-50/30">
            {title && (
              <h2 className="text-xl font-bold bg-gradient-to-r from-emerald-700 to-emerald-600 bg-clip-text text-transparent">
                {title}
              </h2>
            )}
            {showCloseButton && (
              <Button
                variant="secondary"
                size="sm"
                onClick={onClose}
                className="!p-2 hover:!bg-emerald-50 hover:!border-emerald-200 hover:!text-emerald-700 transition-all duration-200">
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}

        {/* Content with enhanced styling */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)] relative">{children}</div>
      </div>
    </div>
  )
}
