import { SelectHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils/cn'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: SelectOption[]
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-lg font-medium text-gray-700 mb-2 break-keep">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={cn(
            'w-full px-5 py-4 text-lg border-2 rounded-xl transition-colors appearance-none bg-white',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
            error
              ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
              : 'border-gray-300',
            className
          )}
          {...props}
        >
          <option value="">선택하세요</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="mt-2 text-base text-red-600">{error}</p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'
