import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-lg font-medium text-gray-700 mb-2 break-keep">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full px-5 py-4 text-lg border-2 rounded-xl transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
            'placeholder:text-gray-400',
            error
              ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
              : 'border-gray-300',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-2 text-base text-red-600">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
