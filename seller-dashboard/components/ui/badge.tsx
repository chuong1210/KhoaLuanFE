import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-lg border px-2.5 py-0.5 text-xs font-semibold w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1.5 [&>svg]:pointer-events-none transition-all duration-200 overflow-hidden',
  {
    variants: {
      variant: {
        // Default - Orange Vivid
        default:
          'border-transparent bg-[#FF6A00] text-white [a&]:hover:bg-[#E65100]',
        // Secondary - Warm Orange background
        secondary:
          'border-transparent bg-[#FFF0E0] text-[#E65100] [a&]:hover:bg-[#FFB38A]/30',
        // Destructive - Deep Orange for errors
        destructive:
          'border-transparent bg-[#E65100] text-white [a&]:hover:bg-[#D35400]',
        // Outline - Orange border
        outline:
          'border-[#FFB38A] text-[#FF6A00] bg-white [a&]:hover:bg-[#FFF0E0] [a&]:hover:text-[#E65100]',
        // Success
        success:
          'border-transparent bg-emerald-100 text-emerald-700 [a&]:hover:bg-emerald-200',
        // Warning - Amber
        warning:
          'border-transparent bg-[#FFB000]/20 text-[#B37800] [a&]:hover:bg-[#FFB000]/30',
        // Info - Soft blue
        info:
          'border-transparent bg-blue-100 text-blue-700 [a&]:hover:bg-blue-200',
        // Gradient Sunrise
        sunrise:
          'border-transparent text-white [a&]:hover:opacity-90',
        // Soft - Very subtle
        soft:
          'border-[#FFB38A]/20 bg-[#FFF0E0]/50 text-[#78716C]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

function Badge({
  className,
  variant,
  asChild = false,
  style,
  ...props
}: React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'span'

  // Add gradient background for sunrise variant
  const gradientStyle = variant === 'sunrise'
    ? { background: 'linear-gradient(135deg, #FF6A00 0%, #FFB000 100%)', ...style }
    : style

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      style={gradientStyle}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
