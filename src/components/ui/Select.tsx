import { forwardRef } from "react"
import { ChevronDown } from "lucide-react"

interface SelectOption {
  value: string
  label: string
  color?: string
  icon?: string
}

interface SelectProps {
  options: SelectOption[]
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
  error?: string
  label?: string
  className?: string
  name?: string
  id?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>((props, ref) => {
  const {
    options,
    value,
    onChange,
    placeholder = "Выберите опцию",
    disabled = false,
    error,
    label,
    className = "",
    name,
    id
  } = props
  const selectId = id ?? name

  const baseClasses =
    "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors appearance-none bg-white"
  const errorClasses = error ? "border-red-500 focus:ring-red-500" : "border-gray-300"
  const disabledClasses = disabled ? "bg-gray-100 cursor-not-allowed" : ""

  const selectClasses = `${baseClasses} ${errorClasses} ${disabledClasses} ${className}`

  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          name={name}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={disabled}
          className={selectClasses}>
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
})
