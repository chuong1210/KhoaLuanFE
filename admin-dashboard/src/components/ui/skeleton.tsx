'use client'

import { cn } from '@/lib/utils'

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-orange-peach/30', className)}
      {...props}
    />
  )
}

export { Skeleton }
