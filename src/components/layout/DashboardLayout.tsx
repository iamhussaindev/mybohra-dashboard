'use client'

import { IconHome, IconMenu2, IconUsers } from '@tabler/icons-react'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import Sidebar from './Sidebar'

interface DashboardLayoutProps {
  children: React.ReactNode
  padding?: string
  showSearch?: boolean
  actions?: React.ReactNode[]
  onSearch?: (value: string) => void
  title?: string
  subtitle?: string
  icon?: React.ReactNode
}

export default function DashboardLayout({ children, padding, showSearch, actions, onSearch, title, subtitle, icon }: DashboardLayoutProps) {
  const [, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: IconHome },
    { name: 'Users', href: '/users', icon: IconUsers },
  ]

  const isActive = (href: string) => pathname === href

  return (
    <div className="min-h-screen bg-white flex relative">
      <div className="w-[250px] pt-0 pl-0 sticky top-0">
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Top header */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
          <div className="flex items-center justify-between h-14 px-4">
            <div className="flex items-center">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-400 hover:text-slate-600 mr-3">
                <IconMenu2 className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                {icon && <div className="flex items-center">{icon}</div>}
                <div>
                  <h1 className="text-lg font-semibold text-slate-800">{title || navigation.find(item => isActive(item.href))?.name || 'Dashboard'}</h1>
                  {subtitle && <p className="text-sm text-slate-600">{subtitle}</p>}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Search */}
              {showSearch && (
                <div className="hidden md:flex items-center bg-slate-50 rounded-lg px-3 py-1.5 min-w-64">
                  <svg className="w-4 h-4 text-slate-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    onChange={e => onSearch?.(e.target.value)}
                    type="text"
                    placeholder="Search..."
                    className="bg-transparent text-sm text-slate-600 placeholder-slate-400 focus:outline-none w-full"
                  />
                </div>
              )}
              {actions && actions}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main id="main-content" className={`min-h-[calc(100dvh-57px)] bg-slate-50 w-full max-h-[calc(100dvh-57px)] overflow-y-auto`} style={{ padding: padding }}>
          {children}
        </main>
      </div>
    </div>
  )
}
