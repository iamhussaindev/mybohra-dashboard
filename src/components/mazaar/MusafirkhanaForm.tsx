'use client'

import { MusafirkhanaService } from '@lib/api/musafirkhana'
import { Musafirkhana } from '@type/mazaar'
import { Button, Form, Input, InputNumber, Select, Space, message } from 'antd'
import { useEffect, useState } from 'react'

interface MusafirkhanaFormProps {
  musafirkhana?: Musafirkhana | null
  onSuccess: () => void
  onCancel: () => void
}

export default function MusafirkhanaForm({ musafirkhana, onSuccess, onCancel }: MusafirkhanaFormProps) {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (musafirkhana) {
      form.setFieldsValue(musafirkhana)
    } else {
      form.resetFields()
    }
  }, [musafirkhana, form])

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)

      if (musafirkhana) {
        await MusafirkhanaService.update(musafirkhana.id, values)
        message.success('Musafirkhana updated successfully')
      } else {
        await MusafirkhanaService.create(values)
        message.success('Musafirkhana created successfully')
      }

      onSuccess()
    } catch (error: any) {
      if (error.errorFields) {
        return
      }
      console.error('Musafirkhana form error:', error)
      message.error(musafirkhana ? 'Failed to update musafirkhana' : 'Failed to create musafirkhana')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form form={form} layout="vertical" className="mt-4">
      <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Please enter name' }]}>
        <Input placeholder="Enter musafirkhana name" />
      </Form.Item>

      <Form.Item name="city" label="City">
        <Input placeholder="City" />
      </Form.Item>

      <div className="grid grid-cols-2 gap-4">
        <Form.Item name="lat" label="Latitude">
          <InputNumber placeholder="Latitude" style={{ width: '100%' }} step={0.000001} />
        </Form.Item>
        <Form.Item name="lng" label="Longitude">
          <InputNumber placeholder="Longitude" style={{ width: '100%' }} step={0.000001} />
        </Form.Item>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Form.Item name="contact1" label="Contact 1">
          <Input placeholder="Contact number 1" />
        </Form.Item>
        <Form.Item name="contact2" label="Contact 2">
          <Input placeholder="Contact number 2" />
        </Form.Item>
      </div>

      <Form.Item name="contact_person_name" label="Contact Person Name">
        <Input placeholder="Contact person name" />
      </Form.Item>

      <Form.Item name="map_link" label="Map Link">
        <Input placeholder="Google Maps or other map link" />
      </Form.Item>

      <Form.Item name="total_rooms" label="Total Rooms">
        <InputNumber placeholder="Total number of rooms" style={{ width: '100%' }} min={0} />
      </Form.Item>

      <Form.Item name="photos" label="Photos (URLs)">
        <Select mode="tags" placeholder="Add photo URLs" tokenSeparators={[',']} />
      </Form.Item>

      <Form.Item>
        <Space className="w-full justify-end">
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="primary" onClick={handleSubmit} loading={loading}>
            {musafirkhana ? 'Update' : 'Create'}
          </Button>
        </Space>
      </Form.Item>
    </Form>
  )
}

