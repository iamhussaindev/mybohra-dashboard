'use client'

import { useAuth } from '@hooks/useSupabase'
import { IconHome, IconLogout, IconMenu2, IconUsers, IconX } from '@tabler/icons-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, signOut } = useAuth()
  const pathname = usePathname()

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: IconHome },
    { name: 'Users', href: '/users', icon: IconUsers },
  ]

  const isActive = (href: string) => pathname === href

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
              <IconHome className="w-4 h-4 text-white" />
            </div>
            <span className="ml-3 text-lg font-semibold text-slate-800">MyBohra</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-slate-600 transition-colors">
            <IconX className="w-5 h-5" />
          </button>
        </div>

        <nav className="mt-6 px-4">
          <div className="space-y-1">
            {navigation.map(item => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group ${
                    isActive(item.href) ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                  onClick={() => setSidebarOpen(false)}>
                  <Icon className={`w-4 h-4 mr-3 ${isActive(item.href) ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                  {item.name}
                </Link>
              )
            })}
          </div>
        </nav>

        {/* User section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200 bg-slate-50/50">
          <div className="flex items-center mb-3">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-sm">
              <span className="text-white font-medium text-sm">{user?.email?.charAt(0).toUpperCase()}</span>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-slate-800 truncate">{user?.email}</p>
              <p className="text-xs text-slate-500">Administrator</p>
            </div>
          </div>
          <button onClick={signOut} className="flex items-center w-full px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-800 rounded-lg transition-all duration-200 group">
            <IconLogout className="w-4 h-4 mr-3 text-slate-400 group-hover:text-slate-600" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Top header */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
          <div className="flex items-center justify-between h-14 px-6">
            <div className="flex items-center">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-400 hover:text-slate-600 mr-3">
                <IconMenu2 className="w-5 h-5" />
              </button>
              <h1 className="text-lg font-semibold text-slate-800">{navigation.find(item => isActive(item.href))?.name || 'Dashboard'}</h1>
            </div>

            <div className="flex items-center space-x-3">
              {/* Search */}
              <div className="hidden md:flex items-center bg-slate-50 rounded-lg px-3 py-1.5 min-w-64">
                <svg className="w-4 h-4 text-slate-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input type="text" placeholder="Search..." className="bg-transparent text-sm text-slate-600 placeholder-slate-400 focus:outline-none w-full" />
              </div>

              {/* Notifications */}
              <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6v-6H4v6zM4 5h6V1H4v4zM15 7h5l-5-5v5z" />
                </svg>
              </button>

              {/* User menu */}
              <div className="flex items-center space-x-3 pl-3 border-l border-slate-200">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-slate-800">{user?.email}</p>
                  <p className="text-xs text-slate-500">Online</p>
                </div>
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-sm">
                  <span className="text-white font-medium text-sm">{user?.email?.charAt(0).toUpperCase()}</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="min-h-screen bg-slate-50 w-full">{children}</main>
      </div>
    </div>
  )
}
