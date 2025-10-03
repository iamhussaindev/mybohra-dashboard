import clsx from 'clsx'
import React from 'react'

interface GridProps {
  children: React.ReactNode
  className?: string
  cols?: number
}

const Grid: React.FC<GridProps> = ({ children, className, cols = 3 }) => {
  return (
    <div role="list" className={clsx(`grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-${cols}`, className)}>
      {children}
    </div>
  )
}

export default Grid
