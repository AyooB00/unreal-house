import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

const cardVariants = cva(
  'relative overflow-hidden rounded-lg transition-all duration-300',
  {
    variants: {
      variant: {
        default: [
          'bg-gray-900/80 backdrop-blur-md',
          'border border-white/10',
          'shadow-[0_4px_20px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)]'
        ]
      }
    },
    defaultVariants: {
      variant: 'default'
    }
  }
)

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cardVariants({ variant, className })}
        {...props}
      />
    )
  }
)

Card.displayName = 'Card'

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={`px-6 py-4 ${className}`}
      {...props}
    />
  )
)

CardContent.displayName = 'CardContent'