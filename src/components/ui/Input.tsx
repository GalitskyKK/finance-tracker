import { forwardRef } from "react"

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  type?: "text" | "email" | "password" | "number" | "date" | "tel"
  error?: string
  label?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  const {
    type = "text",
    placeholder,
    value,
    onChange,
    onBlur,
    name,
    id,
    disabled = false,
    required = false,
    error,
    label,
    className = "",
    min,
    max,
    step
  } = props
  const inputId = id || name

  const baseClasses =
    "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
  const errorClasses = error ? "border-red-500 focus:ring-red-500" : "border-gray-300"
  const disabledClasses = disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"

  const inputClasses = `${baseClasses} ${errorClasses} ${disabledClasses} ${className}`

  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        ref={ref}
        type={type}
        id={inputId}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        required={required}
        min={min}
        max={max}
        step={step}
        className={inputClasses}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
})
