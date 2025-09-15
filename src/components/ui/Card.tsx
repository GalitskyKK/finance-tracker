import React from "react"

interface CardProps {
  children: React.ReactNode
  className?: string
  padding?: "sm" | "md" | "lg"
  shadow?: "sm" | "md" | "lg" | "none"
  rounded?: "sm" | "md" | "lg" | "xl"
}

export const Card: React.FC<CardProps> = ({
  children,
  className = "",
  padding = "md",
  shadow = "md",
  rounded = "lg"
}) => {
  const paddingClasses = {
    sm: "p-4",
    md: "p-6",
    lg: "p-8"
  }

  const shadowClasses = {
    sm: "shadow-sm",
    md: "shadow-md",
    lg: "shadow-lg",
    none: "shadow-none"
  }

  const roundedClasses = {
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl"
  }

  const classes = `bg-card border border-border hover:border-border-light transition-all duration-200 hover:shadow-lg ${paddingClasses[padding]} ${shadowClasses[shadow]} ${roundedClasses[rounded]} ${className}`

  return <div className={classes}>{children}</div>
}

interface CardHeaderProps {
  children: React.ReactNode
  className?: string
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className = "" }) => {
  return <div className={`mb-4 ${className}`}>{children}</div>
}

interface CardTitleProps {
  children: React.ReactNode
  className?: string
}

export const CardTitle: React.FC<CardTitleProps> = ({ children, className = "" }) => {
  return <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>{children}</h3>
}

interface CardContentProps {
  children: React.ReactNode
  className?: string
}

export const CardContent: React.FC<CardContentProps> = ({ children, className = "" }) => {
  return <div className={className}>{children}</div>
}
