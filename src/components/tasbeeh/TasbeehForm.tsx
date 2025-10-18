'use client'

import { TasbeehService } from '@lib/api/tasbeeh'
import { IconBook, IconMicrophone, IconPhoto, IconTag, IconX } from '@tabler/icons-react'
import { Tasbeeh, TasbeehType } from '@type/tasbeeh'
import { App, Button, Form, Input, Modal, Select } from 'antd'
import { useEffect, useState } from 'react'

interface TasbeehFormProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  editingTasbeeh?: Tasbeeh | null
}

export default function TasbeehForm({ open, onClose, onSuccess, editingTasbeeh }: TasbeehFormProps) {
  const appContext = App.useApp()
  const message = appContext?.message || { error: console.error, success: console.log, warning: console.warn }
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [tags, setTags] = useState<string[]>([])

  useEffect(() => {
    if (open) {
      if (editingTasbeeh) {
        form.setFieldsValue(editingTasbeeh)
        setTags(editingTasbeeh.tags || [])
      } else {
        form.resetFields()
        setTags([])
      }
    }
  }, [open, editingTasbeeh, form])

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true)

      const tasbeehData = {
        ...values,
        tags: tags,
        count: values.count || 0,
      }

      if (editingTasbeeh) {
        await TasbeehService.update(editingTasbeeh.id, tasbeehData)
        message.success('Tasbeeh updated successfully')
      } else {
        await TasbeehService.create(tasbeehData)
        message.success('Tasbeeh created successfully')
      }

      onSuccess()
      onClose()
    } catch (error) {
      console.error('Tasbeeh form error:', error)
      message.error(editingTasbeeh ? 'Failed to update tasbeeh' : 'Failed to create tasbeeh')
    } finally {
      setLoading(false)
    }
  }

  const handleAddTag = (tag: string) => {
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag])
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const tasbeehTypeOptions = Object.values(TasbeehType).map(type => ({
    value: type,
    label: type.charAt(0) + type.slice(1).toLowerCase(),
  }))

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={800}
      centered
      title={
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
            <IconBook className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{editingTasbeeh ? 'Edit Tasbeeh' : 'Add New Tasbeeh'}</h2>
            <p className="text-sm text-gray-500">Create or update dhikr entries with Arabic text and audio</p>
          </div>
        </div>
      }>
      <Form form={form} layout="vertical" onFinish={handleSubmit} className="space-y-4">
        {/* Name */}
        <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Please enter tasbeeh name' }]}>
          <Input placeholder="Enter tasbeeh name" />
        </Form.Item>

        {/* Type */}
        <Form.Item name="type" label="Type" rules={[{ required: true, message: 'Please select tasbeeh type' }]}>
          <Select placeholder="Select tasbeeh type" options={tasbeehTypeOptions} />
        </Form.Item>

        {/* English/Transliterated Text */}
        <Form.Item name="text" label="English/Transliterated Text">
          <Input.TextArea rows={3} placeholder="Enter English or transliterated text" />
        </Form.Item>

        {/* Arabic Text */}
        <Form.Item name="arabic_text" label="Arabic Text">
          <Input.TextArea rows={3} placeholder="Enter Arabic text" style={{ direction: 'rtl', textAlign: 'right' }} />
        </Form.Item>

        {/* Description */}
        <Form.Item name="description" label="Description">
          <Input.TextArea rows={2} placeholder="Enter description (optional)" />
        </Form.Item>

        {/* Count */}
        <Form.Item name="count" label="Default Count">
          <Input type="number" min={0} placeholder="Enter default count" />
        </Form.Item>

        {/* Image URL */}
        <Form.Item name="image" label="Image URL">
          <Input placeholder="Enter image URL" prefix={<IconPhoto className="h-4 w-4 text-gray-400" />} />
        </Form.Item>

        {/* Audio URL */}
        <Form.Item name="audio" label="Audio URL">
          <Input placeholder="Enter audio URL" prefix={<IconMicrophone className="h-4 w-4 text-gray-400" />} />
        </Form.Item>

        {/* Tags */}
        <Form.Item label="Tags">
          <div className="space-y-2">
            <Input
              placeholder="Add a tag and press Enter"
              onPressEnter={e => {
                const value = e.currentTarget.value.trim()
                if (value) {
                  handleAddTag(value)
                  e.currentTarget.value = ''
                }
              }}
              prefix={<IconTag className="h-4 w-4 text-gray-400" />}
            />
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <span key={index} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {tag}
                    <button type="button" onClick={() => handleRemoveTag(tag)} className="hover:text-blue-600">
                      <IconX className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </Form.Item>

        {/* Submit Button */}
        <div className="flex justify-end gap-3 pt-4">
          <Button onClick={onClose}>Cancel</Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            {editingTasbeeh ? 'Update Tasbeeh' : 'Create Tasbeeh'}
          </Button>
        </div>
      </Form>
    </Modal>
  )
}
