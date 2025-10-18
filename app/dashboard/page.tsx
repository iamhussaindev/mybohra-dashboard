'use client'

import AuthGuard from '@components/auth/AuthGuard'
import DataCard from '@components/dashboard/DataCard'
import KPICard from '@components/dashboard/KPICard'
import DashboardLayout from '@components/layout/DashboardLayout'
import Grid from '@components/ui/atoms/Grid'
import { IconBookmark, IconCalendar, IconChartBar, IconDeviceMobile, IconFolder, IconListTree, IconMapPin, IconPlane, IconUsers } from '@tabler/icons-react'
import { DataKeyEnum } from '../../src/types/data'

function DashboardHome() {
  const analyticsSummary = {
    totalActions: 11762,
    uniqueDevices: 5,
    uniqueUsers: 4,
    locations: 814,
  }

  const tasbeehData = {
    tasbeeh: [
      { id: 1, name: 'Tasbeeh 1' },
      { id: 2, name: 'Tasbeeh 2' },
      { id: 3, name: 'Tasbeeh 3' },
    ],
  }

  const mediaData = {
    medias: [
      { id: 1, name: 'Media 1' },
      { id: 2, name: 'Media 2' },
      { id: 3, name: 'Media 3' },
    ],
  }

  const miqaatsData = {
    miqaats: [
      { id: 1, name: 'Miqaat 1' },
      { id: 2, name: 'Miqaat 2' },
      { id: 3, name: 'Miqaat 3' },
    ],
  }

  return (
    <DashboardLayout padding="32px">
      {/* KPI Cards */}
      <div className="mb-8 space-y-4">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Key Performance Indicators</h2>
        <Grid className="md:grid-cols-2 lg:grid-cols-5">
          <KPICard title="Total Actions" value={analyticsSummary?.totalActions || 0} icon={IconChartBar} color="bg-blue-500" subtitle="User interactions tracked" />
          <KPICard title="Unique Devices" value={analyticsSummary?.uniqueDevices || 0} icon={IconDeviceMobile} color="bg-green-500" subtitle="Active devices" />
          <KPICard title="Unique Users" value={analyticsSummary?.uniqueUsers || 0} icon={IconUsers} color="bg-purple-500" subtitle="Registered users" />
          <KPICard title="Locations" value={analyticsSummary?.locations || 0} icon={IconPlane} color="bg-orange-500" subtitle="Available locations" />
        </Grid>
      </div>

      {/* Content Statistics */}
      <div className="mb-8">
        <h2 className="text-lg font-medium text-gray-800 mb-4">Content Statistics</h2>
        <Grid className="md:grid-cols-2 lg:grid-cols-5">
          <KPICard title="Tasbeeh Items" value={tasbeehData?.tasbeeh?.length || 0} icon={IconListTree} color="bg-indigo-500" subtitle="Available tasbeeh" />
          <KPICard title="Media Files" value={mediaData?.medias?.length || 0} icon={IconFolder} color="bg-pink-500" subtitle="Audio/video content" />
          <KPICard title="Miqaats" value={miqaatsData?.miqaats?.length || 0} icon={IconCalendar} color="bg-teal-500" subtitle="Religious events" />
          <KPICard title="Actions Registered" value={analyticsSummary?.totalActions || 0} icon={IconChartBar} color="bg-red-500" subtitle="Total user actions" />
        </Grid>
      </div>

      {/* App Data Management */}
      <div className="mb-8">
        <h2 className="text-lg font-medium text-gray-800 mb-4">App Data Management</h2>
        <Grid className="md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <DataCard dataKey={DataKeyEnum.QIYAM} title="Current Qiyam" description="Aqa maula current location" icon={IconMapPin} color="bg-blue-500" />
          <DataCard dataKey={DataKeyEnum.MIQAAT} title="Miqaat List Version" description="Last updated miqaat version" icon={IconCalendar} color="bg-green-500" />
          <DataCard dataKey={DataKeyEnum.LOCATION} title="Location List Version" description="Last updated location version" icon={IconPlane} color="bg-purple-500" />
          <DataCard dataKey={DataKeyEnum.TASBEEH} title="Tasbeeh List Version" description="Last updated tasbeeh version" icon={IconListTree} color="bg-orange-500" />
          <DataCard dataKey={DataKeyEnum.DUA_LIST} title="Dua List Version" description="Last updated dua version" icon={IconBookmark} color="bg-teal-500" />
        </Grid>
      </div>
    </DashboardLayout>
  )
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardHome />
    </AuthGuard>
  )
}
