'use client'

import { ToggleTheme } from '@components/ui/atoms/ToggleTheme'
import { IconHome, IconMoon, IconSun, IconUsers } from '@tabler/icons-react'
import { cn } from '@utils/index'
import { useLenis } from 'lenis/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'
import AuthNav from './AuthNav'

export default function Header() {
  const navRef = useRef<HTMLElement>(null)
  const logoRef = useRef<HTMLParagraphElement>(null)
  const maxOriginalWidth = 1280 // Adjust based on your design
  const minWidth = 700

  const pathname = usePathname()

  const lenis = useLenis(({ scroll }) => {
    if (navRef.current) {
      // Let's scale width reduction based on scroll (up to 1000px scroll for example)

      // update should reduce to 600px when scrolled is 300px;

      const shrinkFactor = Math.min((scroll * 3) / minWidth, 1) // value between 0 and 1

      const newWidth = maxOriginalWidth - (maxOriginalWidth - minWidth) * shrinkFactor
      navRef.current.style.maxWidth = `${newWidth}px`
      if (logoRef.current) {
        // logoRef.current.style.opacity = `${1 - shrinkFactor * 1.5}`;
        // reduce logo width to 0%
        // logoRef.current.style.width = `${100 - shrinkFactor * 100}%`;
      }

      if (shrinkFactor > 0) {
        navRef.current.style.backgroundColor = `var(--backdrop)`
        const maxBlur = 12
        const blur = Math.min(shrinkFactor * 20, maxBlur)
        navRef.current.style.backdropFilter = `blur(${blur}px)`

        if (newWidth <= minWidth) {
          navRef.current.style.borderColor = 'var(--bg-700)'
          navRef.current.style.border = '1px solid var(--bg-700)'
        } else {
          // navRef.current.style.border = "none";
        }
      } else {
        navRef.current.style.backgroundColor = 'transparent'
        navRef.current.style.backdropFilter = 'none'
        navRef.current.style.border = 'none'
      }
    }
  })

  useEffect(() => {
    lenis?.scrollTo(0, {
      immediate: false,
    })
  }, [lenis, pathname])

  useEffect(() => {
    lenis?.scrollTo(0, {
      immediate: true,
    })
  }, [lenis])

  const menuItems = [
    {
      label: 'Dashboard',
      icon: <IconHome size={18} />,
      href: '/dashboard',
    },
    {
      label: 'Users',
      icon: <IconUsers size={18} />,
      href: '/users',
    },
  ]

  return (
    <>
      <div className="w-full block md:hidden z-10 fixed bottom-0 border-t border-[var(--bg-700)] left-0 right-0 bg-[var(--bg-800)]/80 backdrop-blur-sm p-4">
        <ul className="flex justify-around items-center gap-6 m-0 p-0">
          {menuItems.map(item => {
            const isActive = pathname.split('/')[1] === item.href.split('/')[1]
            return (
              <li key={item.label} className={cn('flex flex-col items-center gap-1', isActive ? 'text-[var(--highlight)]' : 'text-[var(--text-secondary)]')}>
                {item.icon}
                <Link className={`flex w-full group items-center gap-2 text-xs font-medium ${isActive ? 'text-[var(--highlight)]' : 'text-[var(--text-secondary)]'}`} href={item.href}>
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
      <nav className="flex w-full items-center sticky top-0 py-4 justify-between px-8 md:hidden z-10">
        <div className="flex w-28 items-center">
          <img src="/images/icon.png" alt="logo" className="w-8 h-8 mr-4 rounded-full" />
        </div>

        <div className="flex w-28 items-center justify-end space-x-2">
          <AuthNav />
          <ToggleTheme
            renderIcon={theme => {
              return theme === 'dark' ? <IconSun className="w-4 h-4" /> : <IconMoon className="w-4 h-4" />
            }}
            className="cursor-pointer text-dark bg-[var(--bg-800)] rounded-full p-2 border-1 border-[var(--bg-700)]"
          />
        </div>
      </nav>
      <header
        data-aos="fade-down"
        data-aos-delay="200"
        data-aos-easing="ease-in-sine"
        data-aos-once="true"
        data-aos-duration="300"
        className="hidden md:block sticky container mx-auto pointer-events-none left-0 right-0 top-0 z-50 w-full px-0 py-4">
        <nav
          ref={navRef}
          aria-label="Global"
          className="hidden md:flex outline-none h-[48px] max-w-8xl mx-auto pointer-events-auto w-full items-center justify-between gap-6 rounded-full px-8 py-2 md:px-2 md:py-1 transition-colors sm:pr-4">
          <div className="flex w-28 items-center">
            <img src="/images/icon.png" alt="logo" className="w-8 h-8 mr-4 rounded-full" />
          </div>

          <div className="w-full items-center justify-center flex">
            <ul className="flex items-center gap-6 m-0 p-0">
              {menuItems.map(item => {
                const isActive = pathname.split('/')[1] === item.href.split('/')[1]
                return (
                  <li key={item.label}>
                    <Link
                      className={`flex items-center gap-2 text-sm font-medium hover:text-[var(--text-primary)] ${isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}
                      href={item.href}>
                      {isActive ? <span className="h-[6px] w-[6px] inline-block bg-[var(--highlight)] rounded-full"></span> : null}
                      {item.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>

          <div className="flex w-28 items-center justify-end space-x-2">
            <AuthNav />
            <ToggleTheme
              renderIcon={theme => {
                return theme === 'dark' ? <IconSun className="w-5 h-5" /> : <IconMoon className="w-5 h-5" />
              }}
              className="text-dark cursor-pointer p-2"
            />
          </div>
        </nav>
      </header>
    </>
  )
}
