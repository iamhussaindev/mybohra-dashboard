'use client'

import { DaiDuatService } from '@lib/api/daiDuat'
import { DaiDuat } from '@type/mazaar'
import { Button, Form, Input, InputNumber, Select, Space, message } from 'antd'
import { useEffect, useState } from 'react'

interface DaiDuatFormProps {
  daiDuat?: DaiDuat | null
  onSuccess: () => void
  onCancel: () => void
}

export default function DaiDuatForm({ daiDuat, onSuccess, onCancel }: DaiDuatFormProps) {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (daiDuat) {
      form.setFieldsValue(daiDuat)
    } else {
      form.resetFields()
    }
  }, [daiDuat, form])

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)

      if (daiDuat) {
        await DaiDuatService.update(daiDuat.id, values)
        message.success('Dai Duat updated successfully')
      } else {
        await DaiDuatService.create(values)
        message.success('Dai Duat created successfully')
      }

      onSuccess()
    } catch (error: any) {
      if (error.errorFields) {
        return
      }
      console.error('Dai Duat form error:', error)
      message.error(daiDuat ? 'Failed to update dai duat' : 'Failed to create dai duat')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form form={form} layout="vertical" className="mt-4">
      <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Please enter name' }]}>
        <Input placeholder="Enter name" />
      </Form.Item>

      <div className="grid grid-cols-2 gap-4">
        <Form.Item name="city" label="City">
          <Input placeholder="City" />
        </Form.Item>
        <Form.Item name="area" label="Area">
          <Input placeholder="Area" />
        </Form.Item>
      </div>

      <Form.Item name="history" label="History">
        <Input.TextArea rows={4} placeholder="Enter history" />
      </Form.Item>

      <div className="grid grid-cols-2 gap-4">
        <Form.Item name="year" label="Year">
          <InputNumber placeholder="Year" style={{ width: '100%' }} min={0} />
        </Form.Item>
        <Form.Item name="rank" label="Rank">
          <InputNumber placeholder="Rank" style={{ width: '100%' }} min={0} />
        </Form.Item>
      </div>

      <Form.Item name="photos" label="Photos (URLs)">
        <Select mode="tags" placeholder="Add photo URLs" tokenSeparators={[',']} />
      </Form.Item>

      <Form.Item>
        <Space className="w-full justify-end">
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="primary" onClick={handleSubmit} loading={loading}>
            {daiDuat ? 'Update' : 'Create'}
          </Button>
        </Space>
      </Form.Item>
    </Form>
  )
}

