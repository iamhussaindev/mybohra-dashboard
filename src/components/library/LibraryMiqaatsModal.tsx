import { MiqaatService } from '@lib/api/miqaat'
import { IconCalendar, IconMoon, IconPlus, IconStar, IconSun, IconTrash } from '@tabler/icons-react'
import { Library } from '@type/library'
import { Miqaat, MiqaatLibraryAssociation, MiqaatTypeEnum, PhaseEnum } from '@type/miqaat'
import { Badge, Button, message, Modal, Popconfirm, Select, Table, Tag } from 'antd'
import { useEffect, useState } from 'react'

interface LibraryMiqaatsModalProps {
  open: boolean
  onClose: () => void
  library: Library | null
}

const LibraryMiqaatsModal = ({ open, onClose, library }: LibraryMiqaatsModalProps) => {
  const [miqaats, setMiqaats] = useState<Miqaat[]>([])
  const [, setAssociations] = useState<MiqaatLibraryAssociation[]>([])
  const [availableMiqaats, setAvailableMiqaats] = useState<Miqaat[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedMiqaat, setSelectedMiqaat] = useState<number | null>(null)

  useEffect(() => {
    if (open && library) {
      loadData()
    }
  }, [open, library])

  const loadData = async () => {
    if (!library) return

    try {
      setLoading(true)

      // Load all miqaats
      const allMiqaats = await MiqaatService.getAll()
      setAvailableMiqaats(allMiqaats)

      // Load associations for this library
      const libraryAssociations = await MiqaatService.getLibraryAssociations(library.id)
      setAssociations(libraryAssociations)

      // Get associated miqaats
      const associatedMiqaatIds = libraryAssociations.map(a => a.miqaat_id)
      const associatedMiqaats = allMiqaats.filter(m => associatedMiqaatIds.includes(m.id))
      setMiqaats(associatedMiqaats)
    } catch (error) {
      message.error('Failed to load miqaats')
      console.error('Load miqaats error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddAssociation = async () => {
    if (!selectedMiqaat || !library) return

    try {
      await MiqaatService.addLibraryAssociation(library.id, selectedMiqaat)
      message.success('Miqaat associated successfully')
      loadData()
      setSelectedMiqaat(null)
    } catch (error) {
      message.error('Failed to associate miqaat')
      console.error('Add association error:', error)
    }
  }

  const handleRemoveAssociation = async (miqaatId: number) => {
    if (!library) return

    try {
      await MiqaatService.removeLibraryAssociation(library.id, miqaatId)
      message.success('Association removed successfully')
      loadData()
    } catch (error) {
      message.error('Failed to remove association')
      console.error('Remove association error:', error)
    }
  }

  const getTypeColor = (type?: MiqaatTypeEnum) => {
    const colors: Record<string, string> = {
      URS: 'red',
      MILAD: 'green',
      WASHEQ: 'blue',
      PEHLI_RAAT: 'purple',
      SHAHADAT: 'red',
      ASHARA: 'orange',
      IMPORTANT_NIGHT: 'gold',
      EID: 'cyan',
      OTHER: 'default',
    }
    return colors[type || ''] || 'default'
  }

  const formatDate = (date?: number, month?: number) => {
    if (!date || !month) return '-'
    return `${date}/${month}`
  }

  const getPhaseIcon = (phase: PhaseEnum) => {
    return phase === PhaseEnum.DAY ? <IconSun className="h-4 w-4 text-yellow-500" /> : <IconMoon className="h-4 w-4 text-blue-500" />
  }

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Miqaat) => (
        <div className="flex items-center gap-2">
          <div>
            <div className="font-medium text-gray-900 flex items-center gap-2">
              {text}
              {record.important && <IconStar className="h-4 w-4 text-yellow-500" />}
            </div>
            {record.description && <div className="text-sm text-gray-500 mt-1">{record.description}</div>}
          </div>
        </div>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: MiqaatTypeEnum) => (type ? <Tag color={getTypeColor(type)}>{type}</Tag> : '-'),
    },
    {
      title: 'Date',
      key: 'date',
      render: (record: Miqaat) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-sm">
            <IconCalendar className="h-3 w-3 text-gray-400" />
            {formatDate(record.date, record.month)}
          </div>
          {record.date_night && record.month_night && (
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <IconMoon className="h-3 w-3 text-gray-400" />
              {formatDate(record.date_night, record.month_night)}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Phase',
      dataIndex: 'phase',
      key: 'phase',
      render: (phase: PhaseEnum) => (
        <div className="flex items-center gap-1">
          {getPhaseIcon(phase)}
          <span className="text-sm">{phase}</span>
        </div>
      ),
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority?: number) => (priority ? <Badge count={priority} color="blue" /> : '-'),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: Miqaat) => (
        <Popconfirm title="Are you sure you want to remove this association?" onConfirm={() => handleRemoveAssociation(record.id)} okText="Yes" cancelText="No">
          <Button type="link" size="small" danger icon={<IconTrash className="h-4 w-4" />}>
            Remove
          </Button>
        </Popconfirm>
      ),
    },
  ]

  const availableOptions = availableMiqaats
    .filter(m => !miqaats.some(associated => associated.id === m.id))
    .map(miqaat => ({
      label: miqaat.name,
      value: miqaat.id,
    }))

  return (
    <Modal
      title={`Miqaats for "${library?.name}"`}
      open={open}
      onCancel={onClose}
      width={1000}
      destroyOnHidden
      footer={[
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
      ]}>
      <div className="space-y-4">
        {/* Add Association */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Add Miqaat Association</label>
              <Select
                placeholder="Select a miqaat to associate"
                value={selectedMiqaat}
                onChange={setSelectedMiqaat}
                options={availableOptions}
                className="w-full"
                showSearch
                filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
              />
            </div>
            <Button type="primary" icon={<IconPlus className="h-4 w-4" />} onClick={handleAddAssociation} disabled={!selectedMiqaat}>
              Add
            </Button>
          </div>
        </div>

        {/* Associated Miqaats Table */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">Associated Miqaats ({miqaats.length})</h3>
          <Table
            columns={columns}
            dataSource={miqaats}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 5,
              showSizeChanger: false,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} miqaats`,
            }}
          />
        </div>
      </div>
    </Modal>
  )
}

export default LibraryMiqaatsModal
