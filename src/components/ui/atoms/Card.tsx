import clsx from 'clsx'
import React from 'react'

interface CardProps {
  title?: string
  description?: string
  children?: React.ReactNode
  className?: string
  variant?: 'default' | 'outlined' | 'shadow'
}

const Card: React.FC<CardProps> = ({ title, description, children, className, variant = 'default' }) => {
  const baseClasses = 'p-6 rounded-lg'
  const variantClasses = clsx({
    'bg-white shadow': variant === 'default',
    'bg-white border border-gray-200': variant === 'outlined',
    'bg-white shadow-lg': variant === 'shadow',
  })

  return (
    <div className={clsx(baseClasses, variantClasses, className)}>
      {title ? <h2 className="text-lg font-semibold text-gray-900">{title}</h2> : null}
      {description ? <p className="text-gray-700">{description}</p> : null}
      {children && <div className={clsx(title && description ? 'mt-4' : '')}>{children}</div>}
    </div>
  )
}

export default Card
