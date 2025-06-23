import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

const buttonVariants = cva(
  'relative inline-flex items-center justify-center font-mono font-medium text-sm uppercase tracking-wider transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden',
  {
    variants: {
      variant: {
        primary: [
          'bg-gradient-to-r from-purple-500 to-cyan-500 text-white',
          'hover:shadow-[0_4px_20px_rgba(139,0,255,0.4),0_0_40px_rgba(0,245,255,0.2)]',
          'hover:-translate-y-0.5',
          'before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent',
          'before:-translate-x-full before:transition-transform before:duration-500',
          'hover:before:translate-x-full'
        ],
        secondary: [
          'bg-transparent text-cyan-400 border border-cyan-400',
          'hover:bg-cyan-400/10 hover:shadow-[0_0_20px_rgba(0,245,255,0.4),inset_0_0_20px_rgba(0,245,255,0.1)]'
        ],
        ghost: [
          'bg-transparent text-gray-400',
          'hover:text-white hover:bg-white/5'
        ],
        danger: [
          'bg-red-500/20 text-red-400 border border-red-500/50',
          'hover:bg-red-500/30 hover:border-red-400 hover:shadow-[0_0_20px_rgba(255,0,110,0.4)]'
        ]
      },
      size: {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base'
      }
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md'
    }
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean
  leftIcon?: React.ReactNode
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    isLoading,
    leftIcon,
    children,
    disabled,
    ...props 
  }, ref) => {
    return (
      <button
        ref={ref}
        className={buttonVariants({ variant, size, className })}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <svg
            className="animate-spin h-4 w-4 mr-2"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : leftIcon ? (
          <span className="mr-2">{leftIcon}</span>
        ) : null}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'