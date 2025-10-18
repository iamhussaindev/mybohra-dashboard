'use client'

import AuthGuard from '@components/auth/AuthGuard'
import DashboardLayout from '@components/layout/DashboardLayout'
import { IconBell, IconPalette, IconShield, IconUser } from '@tabler/icons-react'
import { Button, Card, Divider, Form, Input, Select, Space, Switch, Tabs } from 'antd'
import { useState } from 'react'

const { Option } = Select

function SettingsContent() {
  const [loading, setLoading] = useState(false)
  const [profileForm] = Form.useForm()
  const [preferencesForm] = Form.useForm()

  const handleSaveProfile = async (values: any) => {
    setLoading(true)
    try {
      console.log('Saving profile:', values)
      // TODO: Implement profile save logic
      await new Promise(resolve => setTimeout(resolve, 1000))
    } catch (error) {
      console.error('Failed to save profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSavePreferences = async (values: any) => {
    setLoading(true)
    try {
      console.log('Saving preferences:', values)
      // TODO: Implement preferences save logic
      await new Promise(resolve => setTimeout(resolve, 1000))
    } catch (error) {
      console.error('Failed to save preferences:', error)
    } finally {
      setLoading(false)
    }
  }

  const tabItems = [
    {
      key: 'profile',
      label: (
        <Space>
          <IconUser className="h-4 w-4" />
          <span>Profile</span>
        </Space>
      ),
      children: (
        <Card>
          <Form
            form={profileForm}
            layout="vertical"
            onFinish={handleSaveProfile}
            initialValues={{
              name: 'Admin User',
              email: 'admin@mybohra.com',
              phone: '+1234567890',
            }}>
            <Form.Item label="Full Name" name="name" rules={[{ required: true }]}>
              <Input size="large" />
            </Form.Item>

            <Form.Item label="Email Address" name="email" rules={[{ required: true, type: 'email' }]}>
              <Input size="large" />
            </Form.Item>

            <Form.Item label="Phone Number" name="phone">
              <Input size="large" />
            </Form.Item>

            <Form.Item label="Bio" name="bio">
              <Input.TextArea rows={4} placeholder="Tell us about yourself" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} size="large">
                Save Profile
              </Button>
            </Form.Item>
          </Form>
        </Card>
      ),
    },
    {
      key: 'preferences',
      label: (
        <Space>
          <IconPalette className="h-4 w-4" />
          <span>Preferences</span>
        </Space>
      ),
      children: (
        <Card>
          <Form
            form={preferencesForm}
            layout="vertical"
            onFinish={handleSavePreferences}
            initialValues={{
              theme: 'light',
              language: 'en',
              emailNotifications: true,
              pushNotifications: true,
            }}>
            <Form.Item label="Theme" name="theme">
              <Select size="large">
                <Option value="light">Light</Option>
                <Option value="dark">Dark</Option>
                <Option value="auto">Auto (System)</Option>
              </Select>
            </Form.Item>

            <Form.Item label="Language" name="language">
              <Select size="large">
                <Option value="en">English</Option>
                <Option value="ar">Arabic</Option>
                <Option value="ur">Urdu</Option>
              </Select>
            </Form.Item>

            <Divider />

            <Form.Item label="Email Notifications" name="emailNotifications" valuePropName="checked">
              <Switch />
            </Form.Item>

            <Form.Item label="Push Notifications" name="pushNotifications" valuePropName="checked">
              <Switch />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} size="large">
                Save Preferences
              </Button>
            </Form.Item>
          </Form>
        </Card>
      ),
    },
    {
      key: 'security',
      label: (
        <Space>
          <IconShield className="h-4 w-4" />
          <span>Security</span>
        </Space>
      ),
      children: (
        <Card>
          <Space direction="vertical" className="w-full" size="large">
            <div>
              <h3 className="text-lg font-semibold mb-2">Change Password</h3>
              <Form layout="vertical">
                <Form.Item label="Current Password" name="currentPassword">
                  <Input.Password size="large" />
                </Form.Item>
                <Form.Item label="New Password" name="newPassword">
                  <Input.Password size="large" />
                </Form.Item>
                <Form.Item label="Confirm New Password" name="confirmPassword">
                  <Input.Password size="large" />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" size="large">
                    Update Password
                  </Button>
                </Form.Item>
              </Form>
            </div>

            <Divider />

            <div>
              <h3 className="text-lg font-semibold mb-2">Two-Factor Authentication</h3>
              <p className="text-gray-600 mb-4">Add an extra layer of security to your account by enabling two-factor authentication.</p>
              <Button>Enable 2FA</Button>
            </div>

            <Divider />

            <div>
              <h3 className="text-lg font-semibold mb-2">Active Sessions</h3>
              <p className="text-gray-600 mb-4">Manage your active sessions across different devices.</p>
              <Button>View Sessions</Button>
            </div>
          </Space>
        </Card>
      ),
    },
    {
      key: 'notifications',
      label: (
        <Space>
          <IconBell className="h-4 w-4" />
          <span>Notifications</span>
        </Space>
      ),
      children: (
        <Card>
          <Space direction="vertical" className="w-full" size="middle">
            <div className="flex justify-between items-center py-2">
              <div>
                <h4 className="font-medium">New User Registration</h4>
                <p className="text-sm text-gray-600">Get notified when a new user registers</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Divider className="my-0" />
            <div className="flex justify-between items-center py-2">
              <div>
                <h4 className="font-medium">Miqaat Reminders</h4>
                <p className="text-sm text-gray-600">Receive reminders for upcoming miqaats</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Divider className="my-0" />
            <div className="flex justify-between items-center py-2">
              <div>
                <h4 className="font-medium">System Updates</h4>
                <p className="text-sm text-gray-600">Get notified about system updates and maintenance</p>
              </div>
              <Switch />
            </div>
            <Divider className="my-0" />
            <div className="flex justify-between items-center py-2">
              <div>
                <h4 className="font-medium">Weekly Reports</h4>
                <p className="text-sm text-gray-600">Receive weekly analytics and activity reports</p>
              </div>
              <Switch defaultChecked />
            </div>
          </Space>
        </Card>
      ),
    },
  ]

  return (
    <DashboardLayout showSearch={false}>
      <div className="space-y-6 w-full max-w-4xl">
        <Tabs defaultActiveKey="profile" items={tabItems} />
      </div>
    </DashboardLayout>
  )
}

export default function SettingsPage() {
  return (
    <AuthGuard>
      <SettingsContent />
    </AuthGuard>
  )
}
