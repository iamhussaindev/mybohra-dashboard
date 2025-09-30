'use client'

import { useCustomCursor } from '@hooks/useCustomCursor'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const Cursor = () => {
  const { cursor } = useCustomCursor()
  return (
    <div className="fixed top-0 left-0 w-full h-full mix-blend-difference pointer-events-none z-[9999]">
      <div ref={cursor} className="cursor"></div>
    </div>
  )
}

export default Cursor
