'use client'

import { MazaarService } from '@lib/api/mazaar'
import { DaiDuatService } from '@lib/api/daiDuat'
import { MusafirkhanaService } from '@lib/api/musafirkhana'
import { Mazaar } from '@type/mazaar'
import { Button, Form, Input, InputNumber, Select, Space, message } from 'antd'
import { useEffect, useState } from 'react'

interface MazaarFormProps {
  mazaar?: Mazaar | null
  onSuccess: () => void
  onCancel: () => void
}

export default function MazaarForm({ mazaar, onSuccess, onCancel }: MazaarFormProps) {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [daiDuatOptions, setDaiDuatOptions] = useState<{ label: string; value: string }[]>([])
  const [musafirkhanaOptions, setMusafirkhanaOptions] = useState<{ label: string; value: string }[]>([])

  useEffect(() => {
    loadOptions()
    if (mazaar) {
      // Load relations for editing
      MazaarService.getWithRelations(mazaar.id).then(data => {
        if (data) {
          form.setFieldsValue({
            ...mazaar,
            dai_duat_ids: data.dai_duat?.map(d => d.id) || [],
            musafirkhana_ids: data.musafirkhana?.map(m => m.id) || [],
          })
        }
      })
    } else {
      form.resetFields()
    }
  }, [mazaar, form])

  const loadOptions = async () => {
    try {
      const [daiDuat, musafirkhana] = await Promise.all([DaiDuatService.getAll(), MusafirkhanaService.getAll()])
      setDaiDuatOptions(daiDuat.map(d => ({ label: d.name, value: d.id })))
      setMusafirkhanaOptions(musafirkhana.map(m => ({ label: m.name, value: m.id })))
    } catch (error) {
      console.error('Failed to load options:', error)
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)

      if (mazaar) {
        await MazaarService.update(mazaar.id, values)
        message.success('Mazaar updated successfully')
      } else {
        await MazaarService.create(values)
        message.success('Mazaar created successfully')
      }

      onSuccess()
    } catch (error: any) {
      if (error.errorFields) {
        // Form validation errors
        return
      }
      console.error('Mazaar form error:', error)
      message.error(mazaar ? 'Failed to update mazaar' : 'Failed to create mazaar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form form={form} layout="vertical" className="mt-4">
      <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Please enter mazaar name' }]}>
        <Input placeholder="Enter mazaar name" />
      </Form.Item>

      <div className="grid grid-cols-2 gap-4">
        <Form.Item name="lat" label="Latitude">
          <InputNumber placeholder="Latitude" style={{ width: '100%' }} step={0.000001} />
        </Form.Item>
        <Form.Item name="lng" label="Longitude">
          <InputNumber placeholder="Longitude" style={{ width: '100%' }} step={0.000001} />
        </Form.Item>
      </div>

      <Form.Item name="contact" label="Contact">
        <Input placeholder="Contact number" />
      </Form.Item>

      <Form.Item name="photos" label="Photos (URLs)">
        <Select mode="tags" placeholder="Add photo URLs" tokenSeparators={[',']} />
      </Form.Item>

      <Form.Item name="dai_duat_ids" label="Related Dai Duat">
        <Select mode="multiple" placeholder="Select dai duat" options={daiDuatOptions} />
      </Form.Item>

      <Form.Item name="musafirkhana_ids" label="Related Musafirkhana">
        <Select mode="multiple" placeholder="Select musafirkhana" options={musafirkhanaOptions} />
      </Form.Item>

      <Form.Item>
        <Space className="w-full justify-end">
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="primary" onClick={handleSubmit} loading={loading}>
            {mazaar ? 'Update' : 'Create'}
          </Button>
        </Space>
      </Form.Item>
    </Form>
  )
}

