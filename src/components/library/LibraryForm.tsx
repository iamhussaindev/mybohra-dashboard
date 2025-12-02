import { LibraryService } from '@lib/api/library'
import { IconFileText, IconMusic, IconTag, IconVideo } from '@tabler/icons-react'
import { AlbumEnum, CreateLibraryRequest, Library, UpdateLibraryRequest } from '@type/library'
import { Button, Card, Col, Divider, Form, Input, Modal, Row, Select, Space, Tag, Typography, message } from 'antd'
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
  const { Title, Text } = Typography

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

  if (!open) {
    return null
  }

  return (
    <Modal open={open} onCancel={onClose} width={760} destroyOnClose maskClosable={false} footer={null} bodyStyle={{ padding: 0 }}>
      <div style={{ padding: 24 }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Space direction="vertical" size={4} style={{ width: '100%' }}>
              <Title level={4} style={{ margin: 0 }}>
                {library ? 'Edit Library Item' : 'Add New Library Item'}
              </Title>
              <Text type="secondary">{library ? 'Update the metadata and media references below.' : 'Provide the details for the new library entry.'}</Text>
            </Space>
          </div>

          <Form form={form} layout="vertical" onFinish={handleSubmit} requiredMark={false}>
            <Card size="small" bodyStyle={{ padding: 16 }} bordered={false} style={{ background: '#fafafa' }}>
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item name="name" label="Title" rules={[{ required: true, message: 'Please enter the name' }]}>
                    <Input placeholder="Enter library item title" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="album" label="Album or Collection">
                    <Select placeholder="Select album type" allowClear options={albumOptions} />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item name="description" label="Description">
                <Input.TextArea placeholder="Add a short description" rows={3} />
              </Form.Item>
            </Card>

            <Card
              size="small"
              title={
                <Space>
                  <IconMusic className="h-4 w-4 text-blue-500" />
                  <span>Media links</span>
                </Space>
              }
              bodyStyle={{ padding: 16 }}
              style={{ background: '#fff' }}>
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item name="audio_url" label="Audio URL">
                    <Input placeholder="https://example.com/audio.mp3" prefix={<IconMusic className="text-blue-500" size={16} />} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="pdf_url" label="PDF URL">
                    <Input placeholder="https://example.com/document.pdf" prefix={<IconFileText className="text-red-500" size={16} />} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="youtube_url" label="YouTube URL">
                    <Input placeholder="https://youtube.com/watch?v=..." prefix={<IconVideo className="text-red-600" size={16} />} />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            <Card
              size="small"
              title={
                <Space>
                  <IconTag className="h-4 w-4 text-green-500" />
                  <span>Tags & categories</span>
                </Space>
              }
              bodyStyle={{ padding: 16 }}>
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item name="tags" label="Tags" extra="Use chips to keep similar entries grouped.">
                    <ChipInput placeholder="Type tag and press Enter" color="blue" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="categories" label="Categories" extra="Describe the hierarchy or theme.">
                    <ChipInput placeholder="Type category and press Enter" color="purple" />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            <Divider style={{ margin: '16px 0 8px' }} />
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button type="primary" loading={loading} onClick={() => form.submit()}>
                {library ? 'Update library' : 'Create library'}
              </Button>
            </Space>
          </Form>
        </Space>
      </div>
    </Modal>
  )
}

interface ChipInputProps {
  value?: string[]
  onChange?: (value: string[]) => void
  placeholder?: string
  color?: string
}

const ChipInput = ({ value = [], onChange, placeholder, color = 'blue' }: ChipInputProps) => {
  const [inputValue, setInputValue] = useState('')

  const addValue = () => {
    const next = inputValue.trim()
    if (!next || value.includes(next)) {
      setInputValue('')
      return
    }
    onChange?.([...value, next])
    setInputValue('')
  }

  const removeValue = (chip: string) => {
    onChange?.(value.filter(item => item !== chip))
  }

  return (
    <Space direction="vertical" size={8} style={{ width: '100%' }}>
      <Space size={[8, 8]} wrap>
        {value.map(chip => (
          <Tag key={chip} color={color} closable onClose={() => removeValue(chip)}>
            {chip}
          </Tag>
        ))}
      </Space>
      <Input
        size="small"
        value={inputValue}
        placeholder={placeholder}
        onChange={e => setInputValue(e.target.value)}
        onPressEnter={addValue}
        onBlur={() => {
          if (!inputValue.trim()) return
          addValue()
        }}
      />
    </Space>
  )
}

export default LibraryForm
