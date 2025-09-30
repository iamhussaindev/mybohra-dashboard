'use client'

import DashboardLayout from '@components/layout/DashboardLayout'
import { useAuth } from '@hooks/useSupabase'
import { IconActivity, IconShield, IconTrendingUp, IconUsers } from '@tabler/icons-react'

function DashboardHome() {
  const { user } = useAuth()

  const stats = [
    {
      name: 'Total Users',
      value: '1,234',
      change: '+12%',
      changeType: 'positive',
      icon: IconUsers,
    },
    {
      name: 'Active Sessions',
      value: '89',
      change: '+5%',
      changeType: 'positive',
      icon: IconActivity,
    },
    {
      name: 'Growth Rate',
      value: '24.5%',
      change: '+2.1%',
      changeType: 'positive',
      icon: IconTrendingUp,
    },
    {
      name: 'Security Score',
      value: '98%',
      change: '+0.5%',
      changeType: 'positive',
      icon: IconShield,
    },
  ]

  const recentActivities = [
    {
      id: 1,
      type: 'user_created',
      message: 'New user John Doe was created',
      time: '2 minutes ago',
      user: 'Admin',
    },
    {
      id: 2,
      type: 'user_updated',
      message: 'User profile updated for Jane Smith',
      time: '15 minutes ago',
      user: 'Manager',
    },
    {
      id: 3,
      type: 'system',
      message: 'System backup completed successfully',
      time: '1 hour ago',
      user: 'System',
    },
    {
      id: 4,
      type: 'user_deleted',
      message: 'User account removed for inactive user',
      time: '2 hours ago',
      user: 'Admin',
    },
  ]

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 w-full max-w-none">
        {/* Welcome Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-800">Welcome back, {user?.email?.split('@')[0]}!</h2>
              <p className="text-slate-600 mt-1 text-sm">Here&apos;s what&apos;s happening with your dashboard today.</p>
            </div>
            <div className="hidden sm:block">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-sm">
                <span className="text-white text-lg font-semibold">{user?.email?.charAt(0).toUpperCase()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          {stats.map(stat => {
            const Icon = stat.icon
            return (
              <div key={stat.name} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">{stat.name}</p>
                    <p className="text-2xl font-bold text-slate-800 mt-1">{stat.value}</p>
                  </div>
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Icon className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <div className="mt-3 flex items-center">
                  <span className={`text-sm font-medium ${stat.changeType === 'positive' ? 'text-emerald-600' : 'text-red-600'}`}>{stat.change}</span>
                  <span className="text-sm text-slate-500 ml-2">from last month</span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="px-6 py-4 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-800">Recent Activity</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {recentActivities.map(activity => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div
                        className={`w-2 h-2 rounded-full mt-2 ${
                          activity.type === 'user_created' ? 'bg-emerald-400' : activity.type === 'user_updated' ? 'bg-blue-400' : activity.type === 'user_deleted' ? 'bg-red-400' : 'bg-slate-400'
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-800">{activity.message}</p>
                        <div className="flex items-center mt-1 space-x-2">
                          <span className="text-xs text-slate-500">{activity.time}</span>
                          <span className="text-xs text-slate-400">•</span>
                          <span className="text-xs text-slate-500">by {activity.user}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="px-6 py-4 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-800">Quick Actions</h3>
              </div>
              <div className="p-6">
                <div className="space-y-2">
                  <button className="w-full flex items-center px-4 py-3 text-left text-sm font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors duration-200 group">
                    <IconUsers className="w-4 h-4 mr-3 text-slate-400 group-hover:text-slate-600" />
                    Manage Users
                  </button>
                  <button className="w-full flex items-center px-4 py-3 text-left text-sm font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors duration-200 group">
                    <IconShield className="w-4 h-4 mr-3 text-slate-400 group-hover:text-slate-600" />
                    Security Settings
                  </button>
                  <button className="w-full flex items-center px-4 py-3 text-left text-sm font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors duration-200 group">
                    <IconActivity className="w-4 h-4 mr-3 text-slate-400 group-hover:text-slate-600" />
                    View Analytics
                  </button>
                </div>
              </div>
            </div>

            {/* System Status */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="px-6 py-4 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-800">System Status</h3>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Database</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">Online</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">API Services</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">Online</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Authentication</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">Online</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default DashboardHome
