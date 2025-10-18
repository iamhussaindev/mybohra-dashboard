'use client'

import AuthGuard from '@components/auth/AuthGuard'
import DashboardLayout from '@components/layout/DashboardLayout'
import { IconBuildingStore, IconChartPie, IconCoin, IconReceipt } from '@tabler/icons-react'
import { Button, Card, Col, Empty, Row, Statistic } from 'antd'

function BusinessContent() {
  return (
    <DashboardLayout showSearch={false}>
      <div className="space-y-6 w-full">
        {/* Business KPIs */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic title="Total Revenue" value={0} prefix="$" suffix="USD" valueStyle={{ color: '#3f8600' }} />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic title="Active Subscriptions" value={0} prefix={<IconBuildingStore className="h-5 w-5" />} valueStyle={{ color: '#1677ff' }} />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic title="Transactions" value={0} prefix={<IconReceipt className="h-5 w-5" />} />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic title="Conversion Rate" value={0} suffix="%" prefix={<IconCoin className="h-5 w-5" />} />
            </Card>
          </Col>
        </Row>

        {/* Main Business Content */}
        <Card>
          <Empty
            image={<IconChartPie className="h-16 w-16 text-gray-400 mx-auto" />}
            description={
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Business Dashboard</h3>
                <p className="text-gray-600 max-w-md mx-auto mb-4">Track your business metrics, revenue, subscriptions, and customer analytics. Connect your payment processor to get started.</p>
              </div>
            }>
            <Button type="primary">Configure Business Settings</Button>
          </Empty>
        </Card>

        {/* Additional Business Sections */}
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title="Recent Transactions">
              <div className="flex items-center justify-center h-48 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No transactions yet</p>
              </div>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="Revenue Trends">
              <div className="flex items-center justify-center h-48 bg-gray-50 rounded-lg">
                <p className="text-gray-500">Revenue chart coming soon</p>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </DashboardLayout>
  )
}

export default function BusinessPage() {
  return (
    <AuthGuard>
      <BusinessContent />
    </AuthGuard>
  )
}
