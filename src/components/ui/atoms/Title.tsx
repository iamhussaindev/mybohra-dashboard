import { cn } from '@utils/index'
import React from 'react'

export const Title = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return <h1 className={cn('text-4xl md:text-5xl mb-0 text-[var(--text-primary)] font-semibold text-pretty', className)}>{children}</h1>
}

export default Title
