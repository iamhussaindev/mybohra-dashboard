import { LibraryService } from '@lib/api/library'
import { MiqaatService } from '@lib/api/miqaat'
import { IconExternalLink, IconFileText, IconMusic, IconPlus, IconTrash, IconVideo } from '@tabler/icons-react'
import { AlbumEnum, Library } from '@type/library'
import { Miqaat } from '@type/miqaat'
import { Button, message, Modal, Popconfirm, Select, Space, Table, Tag } from 'antd'
import { useEffect, useState } from 'react'

interface MiqaatLibrariesModalProps {
  open: boolean
  onClose: () => void
  miqaat: Miqaat | null
}

const MiqaatLibrariesModal = ({ open, onClose, miqaat }: MiqaatLibrariesModalProps) => {
  const [libraries, setLibraries] = useState<Library[]>([])
  const [availableLibraries, setAvailableLibraries] = useState<Library[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedLibrary, setSelectedLibrary] = useState<number | null>(null)

  useEffect(() => {
    if (open && miqaat) {
      loadData()
    }
  }, [open, miqaat])

  const loadData = async () => {
    if (!miqaat) return

    try {
      setLoading(true)

      // Load all libraries
      const allLibraries = await LibraryService.getAll()
      setAvailableLibraries(allLibraries)

      // Load associations for this miqaat
      const miqaatAssociations = await MiqaatService.getLibraryAssociations(miqaat.id)

      // Get associated libraries
      const associatedLibraryIds = miqaatAssociations.map(a => a.library_id)
      const associatedLibraries = allLibraries.filter(l => associatedLibraryIds.includes(l.id))
      setLibraries(associatedLibraries)
    } catch (error) {
      message.error('Failed to load libraries')
      console.error('Load libraries error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddAssociation = async () => {
    if (!selectedLibrary || !miqaat) return

    try {
      await MiqaatService.addLibraryAssociation(miqaat.id, selectedLibrary)
      message.success('Library associated successfully')
      loadData()
      setSelectedLibrary(null)
    } catch (error) {
      message.error('Failed to associate library')
      console.error('Add association error:', error)
    }
  }

  const handleRemoveAssociation = async (libraryId: number) => {
    if (!miqaat) return

    try {
      await MiqaatService.removeLibraryAssociation(miqaat.id, libraryId)
      message.success('Association removed successfully')
      loadData()
    } catch (error) {
      message.error('Failed to remove association')
      console.error('Remove association error:', error)
    }
  }

  const getAlbumColor = (album?: AlbumEnum) => {
    const colors: Record<string, string> = {
      MADEH: 'blue',
      NOHA: 'red',
      SALAAM: 'green',
      ILTEJA: 'purple',
      QURAN: 'gold',
      DUA: 'orange',
      MUNAJAAT: 'cyan',
      MANQABAT: 'magenta',
      NAAT: 'lime',
      RASA: 'volcano',
      QASIDA: 'geekblue',
    }
    return colors[album || ''] || 'default'
  }

  const getUrlIcon = (url?: string, type: 'audio' | 'pdf' | 'youtube' = 'audio') => {
    if (!url) return null

    const icons = {
      audio: <IconMusic className="h-4 w-4 text-blue-500" />,
      pdf: <IconFileText className="h-4 w-4 text-red-500" />,
      youtube: <IconVideo className="h-4 w-4 text-red-600" />,
    }

    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center">
        {icons[type]}
        <IconExternalLink className="h-3 w-3 ml-1" />
      </a>
    )
  }

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Library) => (
        <div>
          <div className="font-medium text-gray-900">{text}</div>
          {record.description && <div className="text-sm text-gray-500 mt-1">{record.description}</div>}
        </div>
      ),
    },
    {
      title: 'Album',
      dataIndex: 'album',
      key: 'album',
      render: (album: AlbumEnum) => (album ? <Tag color={getAlbumColor(album)}>{album}</Tag> : '-'),
    },
    {
      title: 'Media',
      key: 'media',
      render: (record: Library) => (
        <Space>
          {getUrlIcon(record.audio_url, 'audio')}
          {getUrlIcon(record.pdf_url, 'pdf')}
          {getUrlIcon(record.youtube_url, 'youtube')}
        </Space>
      ),
    },
    {
      title: 'Tags',
      dataIndex: 'tags',
      key: 'tags',
      render: (tags: string[]) => (
        <div className="flex flex-wrap gap-1">
          {tags?.slice(0, 2).map((tag, index) => (
            <Tag key={index}>{tag}</Tag>
          ))}
          {tags && tags.length > 2 && <Tag>+{tags.length - 2}</Tag>}
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: Library) => (
        <Popconfirm title="Are you sure you want to remove this association?" onConfirm={() => handleRemoveAssociation(record.id)} okText="Yes" cancelText="No">
          <Button type="link" size="small" danger icon={<IconTrash className="h-4 w-4" />}>
            Remove
          </Button>
        </Popconfirm>
      ),
    },
  ]

  const availableOptions = availableLibraries
    .filter(l => !libraries.some(associated => associated.id === l.id))
    .map(library => ({
      label: library.name,
      value: library.id,
    }))

  return (
    <Modal
      title={`Libraries for "${miqaat?.name}"`}
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Add Library Association</label>
              <Select
                placeholder="Select a library to associate"
                value={selectedLibrary}
                onChange={setSelectedLibrary}
                options={availableOptions}
                className="w-full"
                showSearch
                filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
              />
            </div>
            <Button type="primary" icon={<IconPlus className="h-4 w-4" />} onClick={handleAddAssociation} disabled={!selectedLibrary}>
              Add
            </Button>
          </div>
        </div>

        {/* Associated Libraries Table */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">Associated Libraries ({libraries.length})</h3>
          <Table
            columns={columns}
            dataSource={libraries}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 5,
              showSizeChanger: false,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} libraries`,
            }}
          />
        </div>
      </div>
    </Modal>
  )
}

export default MiqaatLibrariesModal
