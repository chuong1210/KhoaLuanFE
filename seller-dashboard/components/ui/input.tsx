import * as React from 'react'

import { cn } from '@/lib/utils'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // Base styles
        'h-10 w-full min-w-0 rounded-xl border bg-white px-4 py-2 text-sm text-[#1C1917] shadow-sm transition-all duration-200 outline-none',
        // Border & ring
        'border-[#FFB38A]/40 focus:border-[#FF6A00] focus:ring-2 focus:ring-[#FF6A00]/20',
        // Placeholder
        'placeholder:text-[#A8A29E]',
        // Selection
        'selection:bg-[#FF6A00] selection:text-white',
        // File input styles
        'file:inline-flex file:h-8 file:border-0 file:bg-[#FFF0E0] file:text-sm file:font-medium file:text-[#E65100] file:mr-4 file:px-4 file:rounded-lg file:cursor-pointer file:transition-colors file:hover:bg-[#FFB38A]/30',
        // Hover state
        'hover:border-[#FFB38A]',
        // Disabled state
        'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[#FFF0E0]/50',
        // Invalid state
        'aria-invalid:border-[#E65100] aria-invalid:ring-[#E65100]/20',
        // Dark mode
        'dark:bg-[#292524] dark:border-[#44403C] dark:text-[#FAFAF5] dark:placeholder:text-[#78716C] dark:focus:border-[#FF8A33] dark:focus:ring-[#FF8A33]/20',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
