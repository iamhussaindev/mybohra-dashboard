import { cn } from '@utils/index'
import React from 'react'

export const Section = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return <section className={cn('max-w-7xl mx-auto w-full px-8 md:px-0 pt-12 md:pt-24 pb-12 md:pb-24', className)}>{children}</section>
}
