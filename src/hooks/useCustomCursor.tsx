'use client'

import gsap from 'gsap'
import { ScrambleTextPlugin } from 'gsap/all'
import { useEffect, useRef } from 'react'

gsap.registerPlugin(ScrambleTextPlugin)

export const useCustomCursor = () => {
  const cursor = useRef<HTMLDivElement>(null)

  const scramble = (event: React.MouseEvent<HTMLElement>) => {
    const target = event.target as HTMLElement
    if (!gsap.isTweening(target) && window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
      gsap.to(target, {
        duration: 0.8,
        ease: 'sine.in',
        scrambleText: {
          text: target.innerText,
          speed: 2,
          chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
        },
      })
    }
  }

  const mouseMove = (e: MouseEvent) => {
    gsap.set([cursor.current], { opacity: 1 })
    const cursorPosition = {
      left: e.clientX,
      top: e.clientY,
    }

    let mouseInTarget = false
    let mouseOnScramble = false

    const targetElements = document.querySelectorAll('.target')
    const scrambleElements = document.querySelectorAll('[data-mouse-target]')
    scrambleElements.forEach(scrambleEle => {
      const rect = scrambleEle.getBoundingClientRect()
      if (cursorPosition.left >= rect.left && cursorPosition.left <= rect.right && cursorPosition.top >= rect.top && cursorPosition.top <= rect.bottom) {
        mouseOnScramble = true
      }
    })
    targetElements.forEach(targetEle => {
      const rect = targetEle.getBoundingClientRect()

      const triggerDistance = rect.width

      // Get position of target instance from its center point
      const targetPosition = {
        left: rect.left + rect.width / 2,
        top: rect.top + rect.width / 2,
      }

      // Get distance between target instance and mouse (adj & opp)
      const distance = {
        adj: targetPosition.left - cursorPosition.left,
        opp: targetPosition.top - cursorPosition.top,
      }

      // We'll get the hypotenuse and use it tp define the trigger
      // area.

      // With the adj and opp we can use Pythogoras Theorum to
      // calculate the length of the hypotenuse a2 + b2 = c2
      // sqaretroot of c2 = hyp
      const hypotenuse = Math.sqrt(distance.adj * distance.adj + distance.opp * distance.opp)

      // get angle from length of adj and opp
      const angle = Math.atan2(distance.adj, distance.opp)

      // Define the trigger area - inside
      if (hypotenuse < triggerDistance) {
        // grow cursor
        gsap.to('.cursor, .cursor-tail', {
          left: targetPosition.left - (Math.sin(angle) * hypotenuse) / 6,
          top: targetPosition.top - (Math.cos(angle) * hypotenuse) / 6,
          height: targetEle.clientHeight,
          width: targetEle.clientWidth,
          duration: 0.3,
        })

        mouseInTarget = true
      }
    })

    if (cursor.current) {
      if (mouseOnScramble) {
        cursor.current.classList.add('big')
      } else {
        cursor.current.classList.remove('big')
      }
    }

    // when mouse is on scramble text, make the cursor bigger

    if (!mouseInTarget) {
      gsap.to('.cursor', {
        left: cursorPosition.left,
        top: cursorPosition.top,
        height: '12px',
        width: '12px',
        duration: 0,
      })
    }
  }

  useEffect(() => {
    const scrambleText = gsap.utils.toArray('[data-scramble]') as HTMLElement[]
    scrambleText.forEach((target: HTMLElement) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      target.addEventListener('pointerover', (event: any) => {
        return scramble(event)
      })
    })
    document.addEventListener('mousemove', mouseMove)
  }, [])

  return { cursor }
}
