import * as React from 'react'

import { cn } from '@/lib/utils'

function Card({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card"
      className={cn(
        'bg-white text-[#1C1917] flex flex-col gap-6 rounded-2xl border border-[#FFB38A]/20 py-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-[#FFB38A]/40',
        className,
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        '@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6 [.border-b]:border-[#FFB38A]/20',
        className,
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-title"
      className={cn('leading-none font-semibold text-[#1C1917] text-lg', className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-description"
      className={cn('text-[#78716C] text-sm', className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        'col-start-2 row-span-2 row-start-1 self-start justify-self-end',
        className,
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-content"
      className={cn('px-6', className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-footer"
      className={cn('flex items-center px-6 [.border-t]:pt-6 [.border-t]:border-[#FFB38A]/20', className)}
      {...props}
    />
  )
}

// Additional card variants for dashboard
function StatCard({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="stat-card"
      className={cn(
        'bg-white rounded-2xl border border-[#FFB38A]/20 p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-[#FFB38A]/40 hover:-translate-y-1 group',
        className,
      )}
      {...props}
    />
  )
}

function GradientCard({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="gradient-card"
      className={cn(
        'rounded-2xl p-6 shadow-lg text-white relative overflow-hidden',
        className,
      )}
      style={{
        background: 'linear-gradient(135deg, #FF6A00 0%, #E65100 100%)',
      }}
      {...props}
    />
  )
}

function FeatureCard({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="feature-card"
      className={cn(
        'bg-gradient-to-br from-[#FFF0E0] to-white rounded-2xl border border-[#FFB38A]/30 p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-[#FF8A33]/40',
        className,
      )}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
  StatCard,
  GradientCard,
  FeatureCard,
}
