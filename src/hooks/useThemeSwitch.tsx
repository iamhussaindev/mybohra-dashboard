'use client'

import { flushSync } from 'react-dom'
import { useEffect, useState } from 'react'
export const useLightDark = () => {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  useEffect(() => {
    const theme = localStorage.getItem('theme')
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
      setTheme('dark')
    } else {
      document.documentElement.classList.remove('dark')
      setTheme('light')
    }
  }, [])

  const toggleTheme = () => {
    const html = document.documentElement
    const isDark = html.classList.contains('dark')

    // change this to use the mouse position
    const x = window.innerWidth / 2
    const y = window.innerHeight / 2
    const maxRadius = Math.hypot(window.innerWidth, window.innerHeight)

    const transition = document.startViewTransition(() => {
      flushSync(() => {
        if (isDark) {
          html.classList.remove('dark')
          html.classList.add('light')
          html.style.colorScheme = 'light'
          localStorage.setItem('theme', 'light')
          setTheme('light')
        } else {
          html.classList.remove('light')
          html.classList.add('dark')
          html.style.colorScheme = 'dark'
          localStorage.setItem('theme', 'dark')
          setTheme('dark')
        }
      })
    })

    transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${maxRadius}px at ${x}px ${y}px)`],
        },
        {
          duration: 600,
          easing: 'ease-in-out',
          pseudoElement: '::view-transition-new(root)',
        }
      )
    })
  }

  return { toggleTheme, theme }
}
