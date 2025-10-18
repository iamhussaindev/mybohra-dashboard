import { Calendar } from '@lib/helpers/Calendar'
import HijriDate from '@lib/helpers/HijriDate'
import { momentTime } from '@lib/utils'
import { IconCalendar, IconFolder, IconSearch, IconStar } from '@tabler/icons-react'
import { Miqaat } from '@type/miqaat'
import { Empty, Input, Modal } from 'antd'
import Fuse from 'fuse.js'
import { useState } from 'react'

interface AdminSearchCommandProps {
  setSelectedDate?: React.Dispatch<React.SetStateAction<HijriDate | undefined>>
  miqaats: Miqaat[]
  setOpen: (open: boolean) => void
  open: boolean
  setCalendar: (calendar: Calendar) => void
  onDateSelect?: (date: HijriDate) => void
}

export default function AdminSearchCommand({ setSelectedDate, miqaats, setOpen, open, setCalendar, onDateSelect }: AdminSearchCommandProps) {
  const [searchValue, setSearchValue] = useState('')

  const upcomingMiqaats = miqaats.filter(miqaat => {
    if (!miqaat.date || !miqaat.month) return false
    const hijriDate = new HijriDate(undefined, miqaat.month, miqaat.date)
    return hijriDate.toMoment().isAfter(momentTime()) && miqaat.important
  })

  const fuse = new Fuse(miqaats, {
    keys: ['name', 'date', 'description', 'location'],
    includeScore: true,
    threshold: 0.3,
  })

  const filteredMiqaats = searchValue
    ? fuse
        .search(searchValue)
        .map(result => result.item)
        .sort((a, b) => {
          return a.important !== b.important ? (a.important ? -1 : 1) : 0
        })
    : upcomingMiqaats.slice(0, 10)

  const handleSelect = (miqaat: Miqaat) => {
    if (!miqaat.date || !miqaat.month) return

    const date = new HijriDate(undefined, miqaat.month, miqaat.date)

    setOpen(false)
    setSearchValue('')
    setCalendar(new Calendar({ miqaats, month: date.month, year: date.year }))

    if (setSelectedDate) {
      setSelectedDate(date)
    }

    // Call the optional callback for additional actions
    if (onDateSelect) {
      onDateSelect(date)
    }
  }

  const handleClose = () => {
    setOpen(false)
    setSearchValue('')
  }

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      footer={null}
      width={800}
      centered
      className="search-modal"
      styles={{
        mask: {
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(8px)',
        },
        body: {
          padding: 0,
        },
      }}>
      <div className="bg-white rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <IconSearch className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Search Miqaats</h2>
              <p className="text-blue-100 text-sm">Find and navigate to specific events</p>
            </div>
          </div>
        </div>

        {/* Search Input */}
        <div className="p-6 border-b border-gray-100">
          <Input
            autoFocus
            size="large"
            placeholder="Search by name, location, or description..."
            prefix={<IconSearch className="h-4 w-4 text-gray-400" />}
            value={searchValue}
            onChange={e => setSearchValue(e.target.value)}
            className="h-12 text-base"
          />
        </div>

        {/* Content */}
        <div className="max-h-[500px] overflow-y-auto">
          {!searchValue && (
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <IconStar className="h-5 w-5 text-orange-500" />
                <h3 className="text-sm font-semibold text-gray-700">Upcoming Important Miqaats</h3>
              </div>
            </div>
          )}

          {filteredMiqaats.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {filteredMiqaats.map(miqaat => {
                if (!miqaat.date || !miqaat.month) return null
                const hijriDate = new HijriDate(undefined, miqaat.month, miqaat.date)

                return (
                  <div key={miqaat.id} onClick={() => handleSelect(miqaat)} className="group p-4 hover:bg-gray-50 cursor-pointer transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg flex items-center justify-center">
                          {miqaat.important ? <IconStar className="h-5 w-5 text-orange-500" /> : <IconCalendar className="h-5 w-5 text-blue-500" />}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">{miqaat.name}</div>
                          {miqaat.description && <div className="text-sm text-gray-600 mt-1 line-clamp-2">{miqaat.description}</div>}
                          {miqaat.location && (
                            <div className="flex items-center gap-1 mt-1">
                              <span className="text-xs text-gray-500">📍</span>
                              <span className="text-xs text-gray-500">{miqaat.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900 group-hover:text-blue-700">
                          {hijriDate.day} {hijriDate.monthFullName}
                        </div>
                        <div className="text-xs text-gray-500">{miqaat.important ? 'Important' : 'Regular'}</div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="p-12">
              <Empty
                image={<IconFolder className="mx-auto h-16 w-16 text-gray-300" />}
                description={
                  <div className="text-center">
                    <p className="text-gray-600 font-medium text-lg">No miqaats found</p>
                    {searchValue && <p className="text-sm text-gray-400 mt-2">Try searching with different keywords or check your spelling</p>}
                  </div>
                }
              />
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}
