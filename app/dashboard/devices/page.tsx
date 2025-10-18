'use client'

import AuthGuard from '@components/auth/AuthGuard'
import DashboardLayout from '@components/layout/DashboardLayout'
import { IconDeviceDesktop, IconDeviceMobile, IconDeviceTablet } from '@tabler/icons-react'
import { Button, Card, Empty, Space, Table, Tag } from 'antd'
import type { ColumnsType } from 'antd/es/table'

interface DeviceData {
  key: string
  deviceName: string
  deviceType: string
  platform: string
  lastActive: string
  status: 'active' | 'inactive'
}

const columns: ColumnsType<DeviceData> = [
  {
    title: 'Device Name',
    dataIndex: 'deviceName',
    key: 'deviceName',
    render: (text, record) => (
      <Space>
        {record.deviceType === 'mobile' && <IconDeviceMobile className="h-5 w-5 text-gray-600" />}
        {record.deviceType === 'desktop' && <IconDeviceDesktop className="h-5 w-5 text-gray-600" />}
        {record.deviceType === 'tablet' && <IconDeviceTablet className="h-5 w-5 text-gray-600" />}
        <span>{text}</span>
      </Space>
    ),
  },
  {
    title: 'Platform',
    dataIndex: 'platform',
    key: 'platform',
  },
  {
    title: 'Last Active',
    dataIndex: 'lastActive',
    key: 'lastActive',
  },
  {
    title: 'Status',
    key: 'status',
    dataIndex: 'status',
    render: status => <Tag color={status === 'active' ? 'green' : 'default'}>{status.toUpperCase()}</Tag>,
  },
  {
    title: 'Actions',
    key: 'actions',
    render: () => (
      <Space>
        <Button type="link" size="small">
          View Details
        </Button>
        <Button type="link" danger size="small">
          Revoke Access
        </Button>
      </Space>
    ),
  },
]

const mockData: DeviceData[] = []

function DevicesContent() {
  return (
    <DashboardLayout showSearch={true}>
      <div className="space-y-6 w-full">
        <Card>
          {mockData.length === 0 ? (
            <Empty
              image={<IconDeviceMobile className="h-16 w-16 text-gray-400 mx-auto" />}
              description={
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Registered Devices</h3>
                  <p className="text-gray-600 max-w-md mx-auto">Manage user devices, track sessions, and control access. Devices will appear here once users log in from different platforms.</p>
                </div>
              }
            />
          ) : (
            <Table columns={columns} dataSource={mockData} pagination={{ pageSize: 10 }} />
          )}
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default function DevicesPage() {
  return (
    <AuthGuard>
      <DevicesContent />
    </AuthGuard>
  )
}
