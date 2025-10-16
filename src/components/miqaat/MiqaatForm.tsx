import { MiqaatService } from '@lib/api/miqaat'
import { IconCalendar, IconClock, IconMapPin, IconMoon, IconStar, IconSun } from '@tabler/icons-react'
import { CreateMiqaatRequest, Miqaat, MiqaatTypeEnum, PhaseEnum, UpdateMiqaatRequest } from '@type/miqaat'
import { Button, Divider, Form, Input, InputNumber, message, Modal, Select, Space, Switch } from 'antd'
import { useEffect, useState } from 'react'

interface MiqaatFormProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  miqaat?: Miqaat | null
}

const MiqaatForm = ({ open, onClose, onSuccess, miqaat }: MiqaatFormProps) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      if (miqaat) {
        form.setFieldsValue({
          name: miqaat.name,
          description: miqaat.description,
          date: miqaat.date,
          month: miqaat.month,
          location: miqaat.location,
          type: miqaat.type,
          date_night: miqaat.date_night,
          month_night: miqaat.month_night,
          priority: miqaat.priority,
          important: miqaat.important,
          phase: miqaat.phase,
        })
      } else {
        form.resetFields()
        form.setFieldsValue({ phase: PhaseEnum.DAY })
      }
    }
  }, [open, miqaat, form])

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true)

      if (miqaat) {
        await MiqaatService.update(miqaat.id, values as UpdateMiqaatRequest)
        message.success('Miqaat updated successfully')
      } else {
        await MiqaatService.create(values as CreateMiqaatRequest)
        message.success('Miqaat created successfully')
      }

      onSuccess()
      onClose()
    } catch (error) {
      message.error(miqaat ? 'Failed to update miqaat' : 'Failed to create miqaat')
      console.error('Submit error:', error)
    } finally {
      setLoading(false)
    }
  }

  const typeOptions = Object.values(MiqaatTypeEnum).map(type => ({
    label: type.replace(/_/g, ' '),
    value: type,
  }))

  const monthOptions = [
    { label: 'Muharram', value: 1 },
    { label: 'Safar', value: 2 },
    { label: "Rabi' al-Awwal", value: 3 },
    { label: "Rabi' al-Thani", value: 4 },
    { label: 'Jumada al-Awwal', value: 5 },
    { label: 'Jumada al-Thani', value: 6 },
    { label: 'Rajab', value: 7 },
    { label: "Sha'ban", value: 8 },
    { label: 'Ramadan', value: 9 },
    { label: 'Shawwal', value: 10 },
    { label: "Dhu al-Qi'dah", value: 11 },
    { label: 'Dhu al-Hijjah', value: 12 },
  ]

  const dayOptions = Array.from({ length: 31 }, (_, i) => ({
    label: (i + 1).toString(),
    value: i + 1,
  }))

  return (
    <Modal
      title={miqaat ? 'Edit Miqaat' : 'Add New Miqaat'}
      open={open}
      onCancel={onClose}
      width={800}
      destroyOnHidden
      footer={[
        <Button key="cancel" onClick={onClose} disabled={loading}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" loading={loading} onClick={() => form.submit()}>
          {miqaat ? 'Update' : 'Create'}
        </Button>,
      ]}>
      <Form form={form} layout="vertical" onFinish={handleSubmit} className="mt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Please enter the miqaat name' }]}>
            <Input placeholder="Enter miqaat name" />
          </Form.Item>

          <Form.Item name="type" label="Type">
            <Select placeholder="Select miqaat type" allowClear options={typeOptions} />
          </Form.Item>
        </div>

        <Form.Item name="description" label="Description">
          <Input.TextArea placeholder="Enter description" rows={3} />
        </Form.Item>

        <Divider>Date Information</Divider>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <IconCalendar className="h-4 w-4 inline mr-1" />
              Day Date
            </label>
            <div className="grid grid-cols-2 gap-2">
              <Form.Item name="date" noStyle>
                <Select placeholder="Day" allowClear options={dayOptions} />
              </Form.Item>
              <Form.Item name="month" noStyle>
                <Select placeholder="Month" allowClear options={monthOptions} />
              </Form.Item>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <IconMoon className="h-4 w-4 inline mr-1" />
              Night Date
            </label>
            <div className="grid grid-cols-2 gap-2">
              <Form.Item name="date_night" noStyle>
                <Select placeholder="Day" allowClear options={dayOptions} />
              </Form.Item>
              <Form.Item name="month_night" noStyle>
                <Select placeholder="Month" allowClear options={monthOptions} />
              </Form.Item>
            </div>
          </div>
        </div>

        <Divider>Additional Information</Divider>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          <Form.Item
            name="location"
            label={
              <Space>
                <IconMapPin className="h-4 w-4 text-blue-500" />
                Location
              </Space>
            }>
            <Input placeholder="Enter location" />
          </Form.Item>

          <Form.Item
            name="priority"
            style={{ width: '100%' }}
            label={
              <Space>
                <IconClock className="h-4 w-4 text-orange-500" />
                Priority
              </Space>
            }>
            <InputNumber placeholder="Enter priority (0-100)" min={0} max={100} style={{ width: '100%' }} />
          </Form.Item>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          <Form.Item
            name="phase"
            label={
              <Space>
                <IconSun className="h-4 w-4 text-yellow-500" />
                Phase
              </Space>
            }>
            <Select
              placeholder="Select phase"
              options={[
                { label: 'Day', value: PhaseEnum.DAY },
                { label: 'Night', value: PhaseEnum.NIGHT },
              ]}
            />
          </Form.Item>

          <Form.Item
            name="important"
            label={
              <Space>
                <IconStar className="h-4 w-4 text-yellow-500" />
                Important
              </Space>
            }
            valuePropName="checked">
            <Switch />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  )
}

export default MiqaatForm
