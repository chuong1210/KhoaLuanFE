import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-[#FF6A00]/30 focus-visible:ring-offset-2 active:scale-[0.98]",
  {
    variants: {
      variant: {
        // Primary - Vivid Orange with gradient
        default:
          'bg-gradient-to-r from-[#FF6A00] to-[#FF8A33] text-white shadow-md hover:shadow-lg hover:from-[#E65100] hover:to-[#FF6A00] active:shadow-sm',
        // Destructive - Deep Orange for warnings/errors
        destructive:
          'bg-[#E65100] text-white shadow-md hover:bg-[#D35400] hover:shadow-lg active:bg-[#C44D00]',
        // Outline - Orange border
        outline:
          'border-2 border-[#FFB38A] bg-white text-[#FF6A00] shadow-sm hover:bg-[#FFF0E0] hover:border-[#FF8A33] hover:text-[#E65100]',
        // Secondary - Warm Orange subtle
        secondary:
          'bg-[#FFF0E0] text-[#E65100] hover:bg-[#FFB38A]/30 hover:text-[#D35400]',
        // Ghost - Transparent with orange hover
        ghost:
          'text-[#78716C] hover:bg-[#FFF0E0] hover:text-[#FF6A00]',
        // Link - Text link style
        link:
          'text-[#FF6A00] underline-offset-4 hover:underline hover:text-[#E65100]',
        // Gradient Sunrise - For hero/CTA
        sunrise:
          'bg-gradient-to-r from-[#FF6A00] via-[#FF8A33] to-[#FFB000] text-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]',
        // Gradient Sunset Violet - For special CTA
        sunset:
          'bg-gradient-to-r from-[#FF6A00] via-[#FF8A33] to-[#8E44AD] text-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]',
        // Soft - Very subtle background
        soft:
          'bg-[#FFF0E0]/50 text-[#E65100] hover:bg-[#FFF0E0] border border-[#FFB38A]/30',
        // Success variant
        success:
          'bg-emerald-500 text-white shadow-md hover:bg-emerald-600 hover:shadow-lg',
        // Warning variant
        warning:
          'bg-[#FFB000] text-black shadow-md hover:bg-[#E6A000] hover:shadow-lg',
      },
      size: {
        default: 'h-10 px-5 py-2.5',
        sm: 'h-9 rounded-lg gap-1.5 px-4 text-xs',
        lg: 'h-12 rounded-xl px-8 text-base',
        xl: 'h-14 rounded-2xl px-10 text-lg',
        icon: 'size-10 rounded-xl',
        'icon-sm': 'size-9 rounded-lg',
        'icon-lg': 'size-12 rounded-xl',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
