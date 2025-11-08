'use client'

import AuthGuard from '@components/auth/AuthGuard'
import DashboardLayout from '@components/layout/DashboardLayout'
import { IconCalendar, IconChartBar, IconTrendingUp, IconUsers } from '@tabler/icons-react'
import { Card, Col, Row, Statistic } from 'antd'

function AnalyticsContent() {
  return (
    <DashboardLayout showSearch={false}>
      <div className="space-y-6 w-full p-4">
        {/* KPI Cards */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic title="Total Users" value={1234} prefix={<IconUsers className="h-5 w-5" />} valueStyle={{ color: '#3f8600' }} />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic title="Active Sessions" value={567} prefix={<IconTrendingUp className="h-5 w-5" />} valueStyle={{ color: '#1677ff' }} />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic title="Monthly Events" value={89} prefix={<IconCalendar className="h-5 w-5" />} valueStyle={{ color: '#cf1322' }} />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic title="Growth Rate" value={12.5} suffix="%" prefix={<IconChartBar className="h-5 w-5" />} valueStyle={{ color: '#722ed1' }} />
            </Card>
          </Col>
        </Row>

        {/* Charts Placeholder */}
        <Card title="Analytics Overview">
          <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
            <div className="text-center">
              <IconChartBar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics Dashboard</h3>
              <p className="text-gray-600 max-w-md">Detailed analytics charts and metrics will be displayed here. This includes user engagement, activity trends, and performance metrics.</p>
            </div>
          </div>
        </Card>

        {/* Additional Metrics */}
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title="User Activity">
              <div className="flex items-center justify-center h-48 bg-gray-50 rounded-lg">
                <p className="text-gray-500">User activity chart coming soon</p>
              </div>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="Popular Features">
              <div className="flex items-center justify-center h-48 bg-gray-50 rounded-lg">
                <p className="text-gray-500">Feature usage chart coming soon</p>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </DashboardLayout>
  )
}

export default function AnalyticsPage() {
  return (
    <AuthGuard>
      <AnalyticsContent />
    </AuthGuard>
  )
}
