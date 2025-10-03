/* eslint-disable react/prop-types */
import { LibraryService } from '@lib/api/library'
import { IconFileText, IconFolder, IconMusic, IconTag, IconVideo } from '@tabler/icons-react'
import { AlbumEnum, CreateLibraryRequest, Library, UpdateLibraryRequest } from '@type/library'
import { Button, Divider, Form, Input, message, Modal, Select, Space, Tag } from 'antd'
import { useEffect, useState } from 'react'

interface LibraryFormProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  library?: Library | null
}

const LibraryForm = ({ open, onClose, onSuccess, library }: LibraryFormProps) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      if (library) {
        form.setFieldsValue({
          name: library.name,
          description: library.description,
          audio_url: library.audio_url,
          pdf_url: library.pdf_url,
          youtube_url: library.youtube_url,
          album: library.album,
          tags: library.tags || [],
          categories: library.categories || [],
        })
      } else {
        form.resetFields()
      }
    }
  }, [open, library, form])

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true)

      const formData = {
        ...values,
        tags: values.tags || [],
        categories: values.categories || [],
      }

      if (library) {
        await LibraryService.update(library.id, formData as UpdateLibraryRequest)
        message.success('Library updated successfully')
      } else {
        await LibraryService.create(formData as CreateLibraryRequest)
        message.success('Library created successfully')
      }

      onSuccess()
      onClose()
    } catch (error) {
      message.error(library ? 'Failed to update library' : 'Failed to create library')
      console.error('Submit error:', error)
    } finally {
      setLoading(false)
    }
  }

  const albumOptions = Object.values(AlbumEnum).map(album => ({
    label: album,
    value: album,
  }))

  return (
    <Modal
      title={library ? 'Edit Library Item' : 'Add New Library Item'}
      open={open}
      onCancel={onClose}
      width={800}
      destroyOnHidden
      footer={[
        <Button key="cancel" onClick={onClose} disabled={loading}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" loading={loading} onClick={() => form.submit()}>
          {library ? 'Update' : 'Create'}
        </Button>,
      ]}>
      <Form form={form} layout="vertical" onFinish={handleSubmit} className="mt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Please enter the name' }]}>
            <Input placeholder="Enter library item name" />
          </Form.Item>

          <Form.Item name="album" label="Album">
            <Select placeholder="Select album type" allowClear options={albumOptions} />
          </Form.Item>
        </div>

        <Form.Item name="description" label="Description">
          <Input.TextArea placeholder="Enter description" rows={3} />
        </Form.Item>

        <Divider>Media URLs</Divider>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Form.Item
            name="audio_url"
            label={
              <Space>
                <IconMusic className="h-4 w-4 text-blue-500" />
                Audio URL
              </Space>
            }>
            <Input placeholder="https://example.com/audio.mp3" />
          </Form.Item>

          <Form.Item
            name="pdf_url"
            label={
              <Space>
                <IconFileText className="h-4 w-4 text-red-500" />
                PDF URL
              </Space>
            }>
            <Input placeholder="https://example.com/document.pdf" />
          </Form.Item>

          <Form.Item
            name="youtube_url"
            label={
              <Space>
                <IconVideo className="h-4 w-4 text-red-600" />
                YouTube URL
              </Space>
            }>
            <Input placeholder="https://youtube.com/watch?v=..." />
          </Form.Item>
        </div>

        <Divider>Tags & Categories</Divider>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          <Form.Item
            name="tags"
            label={
              <Space>
                <IconTag className="h-4 w-4 text-green-500" />
                Tags
              </Space>
            }
            help="Add tags to categorize your library item">
            <Select
              mode="tags"
              placeholder="Type and press Enter to add tags"
              style={{ width: '100%' }}
              tagRender={props => {
                const { label, closable, onClose } = props as { label: string; closable: boolean; onClose: () => void }
                return (
                  <Tag color="blue" closable={closable} onClose={onClose} style={{ marginRight: 3 }}>
                    {label}
                  </Tag>
                )
              }}
            />
          </Form.Item>

          <Form.Item
            name="categories"
            label={
              <Space>
                <IconFolder className="h-4 w-4 text-purple-500" />
                Categories
              </Space>
            }
            help="Add categories to organize your library item">
            <Select
              mode="tags"
              placeholder="Type and press Enter to add categories"
              style={{ width: '100%' }}
              tokenSeparators={[',']}
              tagRender={props => {
                const { label, closable, onClose } = props as { label: string; closable: boolean; onClose: () => void }
                return (
                  <Tag color="purple" closable={closable} onClose={onClose} style={{ marginRight: 3 }}>
                    {label}
                  </Tag>
                )
              }}
            />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  )
}

export default LibraryForm
