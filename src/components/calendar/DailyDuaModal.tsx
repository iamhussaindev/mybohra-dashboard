'use client'

import { DailyDuaService } from '@lib/api/dailyDua'
import { LibraryService } from '@lib/api/library'
import HijriDate from '@lib/helpers/HijriDate'
import { IconBook, IconNotes, IconSearch, IconX } from '@tabler/icons-react'
import { DailyDuaWithLibrary } from '@type/dailyDua'
import { Library } from '@type/library'
import { App, Button, Empty, Input, Modal, Select, Spin } from 'antd'
import { useEffect, useState } from 'react'

interface DailyDuaModalProps {
  open: boolean
  onClose: () => void
  date: HijriDate
  onSuccess: () => void
}

export default function DailyDuaModal({ open, onClose, date, onSuccess }: DailyDuaModalProps) {
  const appContext = App.useApp()
  const message = appContext?.message || { error: console.error, success: console.log, warning: console.warn }
  const [libraries, setLibraries] = useState<Library[]>([])
  const [dailyDuas, setDailyDuas] = useState<DailyDuaWithLibrary[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedLibraryId, setSelectedLibraryId] = useState<number | null>(null)
  const [note, setNote] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (open && date) {
      loadData()
    }
  }, [open, date])

  const loadData = async () => {
    try {
      setLoading(true)
      // Load all libraries
      const allLibraries = await LibraryService.getAll()
      setLibraries(allLibraries)

      // Load existing daily duas for this date
      const duas = await DailyDuaService.getByDateMonth(date.day, date.month)
      setDailyDuas(duas)
    } catch (error) {
      message.error('Failed to load data')
      console.error('Load data error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async () => {
    if (!selectedLibraryId) {
      message.warning('Please select a library item')
      return
    }

    try {
      // Check if already exists
      const exists = await DailyDuaService.checkExists(selectedLibraryId, date.day, date.month)
      if (exists) {
        message.warning('This library item is already assigned to this date')
        return
      }

      await DailyDuaService.create({
        library_id: selectedLibraryId,
        date: date.day,
        month: date.month,
        note: note || undefined,
      })

      message.success('Daily dua added successfully')
      setSelectedLibraryId(null)
      setNote('')
      setSearchQuery('')
      loadData()
      onSuccess()
    } catch (error) {
      message.error('Failed to add daily dua')
      console.error('Add daily dua error:', error)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await DailyDuaService.delete(id)
      message.success('Daily dua removed successfully')
      loadData()
      onSuccess()
    } catch (error) {
      message.error('Failed to remove daily dua')
      console.error('Delete daily dua error:', error)
    }
  }

  const filteredLibraries = searchQuery
    ? libraries.filter(lib => lib.name.toLowerCase().includes(searchQuery.toLowerCase()) || lib.description?.toLowerCase().includes(searchQuery.toLowerCase()))
    : libraries

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={900}
      centered
      title={
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
            <IconBook className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Daily Duas for {date.day} {date.monthFullName} {date.year}
            </h2>
            <p className="text-sm text-gray-500">{date.toGregorian().toLocaleDateString()}</p>
          </div>
        </div>
      }>
      <div className="space-y-6">
        {/* Existing Daily Duas */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <IconBook className="h-4 w-4" />
            Assigned Library Items ({dailyDuas.length})
          </h3>
          {loading ? (
            <div className="flex justify-center py-8">
              <Spin />
            </div>
          ) : dailyDuas.length > 0 ? (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {dailyDuas.map(dua => (
                <div key={dua.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{dua.library?.name}</div>
                    {dua.library?.description && <div className="text-sm text-gray-600 mt-1">{dua.library.description}</div>}
                    {dua.note && (
                      <div className="flex items-center gap-1 mt-1">
                        <IconNotes className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-500">{dua.note}</span>
                      </div>
                    )}
                    {dua.library?.album && <div className="text-xs text-blue-600 mt-1 font-medium">{dua.library.album}</div>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button type="text" danger size="small" icon={<IconX className="h-4 w-4" />} onClick={() => handleDelete(dua.id)} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Empty description="No library items assigned to this date yet" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          )}
        </div>

        {/* Add New Daily Dua */}
        <div className="border-t pt-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Add Library Item</h3>
          <div className="space-y-3">
            {/* Search and Select Library */}
            <div>
              <label className="text-xs text-gray-600 mb-1 block">Search Library</label>
              <Input
                prefix={<IconSearch className="h-4 w-4 text-gray-400" />}
                placeholder="Search by name or description..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                allowClear
              />
            </div>

            <div>
              <label className="text-xs text-gray-600 mb-1 block">Select Library Item</label>
              <Select
                showSearch
                style={{ width: '100%' }}
                placeholder="Select a library item"
                value={selectedLibraryId}
                onChange={setSelectedLibraryId}
                filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                options={filteredLibraries.map(lib => ({
                  value: lib.id,
                  label: lib.name,
                  description: lib.description,
                }))}
                optionRender={option => (
                  <div>
                    <div className="font-medium">{option.label}</div>
                    {option.data.description && <div className="text-xs text-gray-500">{option.data.description}</div>}
                  </div>
                )}
              />
            </div>

            {/* Note */}
            <div>
              <label className="text-xs text-gray-600 mb-1 block">Note (Optional)</label>
              <Input.TextArea rows={2} placeholder="Add any note about this assignment..." value={note} onChange={e => setNote(e.target.value)} />
            </div>

            {/* Add Button */}
            <Button type="primary" block onClick={handleAdd} disabled={!selectedLibraryId} icon={<IconBook className="h-4 w-4" />}>
              Add to Date
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
