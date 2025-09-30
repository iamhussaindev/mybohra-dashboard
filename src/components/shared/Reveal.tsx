'use client'

import React, { useEffect, useState } from 'react'
import styles from './Reveal.module.scss'

const Reveal = ({
  children,
  delay = 0,
  speed = 'fast',
  translateY = 0,
  style = {},
  className = '',
}: {
  children: React.ReactNode
  delay?: number
  speed?: 'slow' | 'medium' | 'fast'
  translateY?: number | string
  style?: React.CSSProperties
  className?: string
}) => {
  const [isRevealed, setIsRevealed] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsRevealed(true)
    }, delay * 1000)

    return () => clearTimeout(timer)
  }, [delay])

  const getSpeedDuration = () => {
    switch (speed) {
      case 'fast':
        return '1s'
      case 'medium':
        return '2s'
      case 'slow':
        return '3s'
      default:
        return '2s'
    }
  }

  const getTranslateYValue = () => {
    if (typeof translateY === 'number') {
      return `${translateY}rem`
    } else if (typeof translateY === 'string') {
      return `var(--static-space-${translateY})`
    }
    return undefined
  }

  const translateValue = getTranslateYValue()

  const revealStyle: React.CSSProperties = {
    transitionDuration: getSpeedDuration(),
    transform: isRevealed ? 'translateY(0)' : `translateY(${translateValue})`,
    ...style,
  }

  return (
    <div className={`${styles.revealFx} ${isRevealed ? styles.revealed : styles.hidden} ${className || ''}`} style={revealStyle}>
      {children}
    </div>
  )
}

Reveal.displayName = 'Reveal'
export default Reveal
