'use client'

import AuthGuard from '@components/auth/AuthGuard'
import DashboardLayout from '@components/layout/DashboardLayout'
import { IconBell, IconSend } from '@tabler/icons-react'
import { Button, Card, Form, Input, Radio, Select, Space, Switch } from 'antd'
import { useState } from 'react'

const { TextArea } = Input
const { Option } = Select

function SendNotificationContent() {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [sendToAll, setSendToAll] = useState(false)

  const handleSendNotification = async (values: any) => {
    setLoading(true)
    try {
      console.log('Sending notification:', values)
      // TODO: Implement notification sending logic
      await new Promise(resolve => setTimeout(resolve, 1000))
      form.resetFields()
      // Show success message
    } catch (error) {
      console.error('Failed to send notification:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout showSearch={false}>
      <div className="space-y-6 w-full max-w-3xl">
        <Card
          title={
            <Space>
              <IconBell className="h-6 w-6" />
              <span>Send Push Notification</span>
            </Space>
          }>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSendNotification}
            initialValues={{
              priority: 'normal',
              sendToAll: false,
            }}>
            {/* Recipient Selection */}
            <Form.Item label="Send To" name="sendToAll" valuePropName="checked">
              <Switch checkedChildren="All Users" unCheckedChildren="Select Users" onChange={setSendToAll} />
            </Form.Item>

            {!sendToAll && (
              <Form.Item label="Select Recipients" name="recipients" rules={[{ required: !sendToAll, message: 'Please select recipients' }]}>
                <Select mode="multiple" placeholder="Select users to send notification" style={{ width: '100%' }}>
                  <Option value="user1">User 1 (user1@example.com)</Option>
                  <Option value="user2">User 2 (user2@example.com)</Option>
                  <Option value="user3">User 3 (user3@example.com)</Option>
                </Select>
              </Form.Item>
            )}

            {/* Notification Title */}
            <Form.Item label="Notification Title" name="title" rules={[{ required: true, message: 'Please enter notification title' }]}>
              <Input placeholder="Enter notification title" size="large" />
            </Form.Item>

            {/* Notification Message */}
            <Form.Item label="Message" name="message" rules={[{ required: true, message: 'Please enter notification message' }]}>
              <TextArea rows={4} placeholder="Enter your notification message" showCount maxLength={500} />
            </Form.Item>

            {/* Priority */}
            <Form.Item label="Priority" name="priority">
              <Radio.Group>
                <Radio.Button value="low">Low</Radio.Button>
                <Radio.Button value="normal">Normal</Radio.Button>
                <Radio.Button value="high">High</Radio.Button>
              </Radio.Group>
            </Form.Item>

            {/* Action URL (Optional) */}
            <Form.Item label="Action URL (Optional)" name="actionUrl" help="Users will be redirected here when they tap the notification">
              <Input placeholder="https://example.com/page" />
            </Form.Item>

            {/* Submit Button */}
            <Form.Item>
              <Button type="primary" htmlType="submit" icon={<IconSend className="h-4 w-4" />} size="large" loading={loading} className="w-full bg-blue-600 hover:bg-blue-700">
                Send Notification
              </Button>
            </Form.Item>
          </Form>
        </Card>

        {/* Notification History */}
        <Card title="Recent Notifications">
          <div className="flex items-center justify-center h-32 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No notifications sent yet</p>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default function SendNotificationPage() {
  return (
    <AuthGuard>
      <SendNotificationContent />
    </AuthGuard>
  )
}
