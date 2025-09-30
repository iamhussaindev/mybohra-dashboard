'use client'

import { IconArrowUp } from '@tabler/icons-react'
import { cn } from '@utils/index'
import { useLenis } from 'lenis/react'
import { useState } from 'react'

const ScrollButton = () => {
  const [isVisible, setIsVisible] = useState(false)
  useLenis(({ scroll }) => {
    if (scroll > 200) {
      setIsVisible(true)
    } else {
      setIsVisible(false)
    }
  })

  return (
    <div className="fixed bottom-10 right-10 z-50 hidden md:block">
      <button
        className={cn('fixed bottom-10 bg-highlight rounded-full p-2 cursor-pointer shadow-lg right-10 z-50 transition-all duration-1000', isVisible ? 'bottom-10' : '-bottom-10')}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        <span className="text-white">
          <IconArrowUp className="w-6 h-6" />
        </span>
      </button>
    </div>
  )
}

export default ScrollButton
