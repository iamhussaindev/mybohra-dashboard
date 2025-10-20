'use client'

import { DailyDuaService } from '@lib/api/dailyDua'
import { LibraryService } from '@lib/api/library'
import { MiqaatService } from '@lib/api/miqaat'
import { Calendar, CalendarDay } from '@lib/helpers/Calendar'
import HijriDate from '@lib/helpers/HijriDate'
import { IconCalendar, IconCheck, IconGripVertical, IconSearch, IconX } from '@tabler/icons-react'
import { DailyDuaWithLibrary } from '@type/dailyDua'
import { Library } from '@type/library'
import { Miqaat, MiqaatTypeEnum } from '@type/miqaat'
import { App, Badge, Button, Checkbox, Input, Select, Spin, Tag, Tooltip } from 'antd'
import clsx from 'clsx'
import { useEffect, useState } from 'react'

const { Option } = Select

// Miqaat type colors
const MIQAAT_COLORS = {
  [MiqaatTypeEnum.URS]: { bg: 'bg-purple-500', border: 'border-purple-500', label: 'Urs', color: '#9333ea' },
  [MiqaatTypeEnum.MILAD]: { bg: 'bg-green-500', border: 'border-green-500', label: 'Milad', color: '#22c55e' },
  [MiqaatTypeEnum.WASHEQ]: { bg: 'bg-pink-500', border: 'border-pink-500', label: 'Washeq', color: '#ec4899' },
  [MiqaatTypeEnum.PEHLI_RAAT]: { bg: 'bg-indigo-500', border: 'border-indigo-500', label: 'Pehli Raat', color: '#6366f1' },
  [MiqaatTypeEnum.SHAHADAT]: { bg: 'bg-red-500', border: 'border-red-500', label: 'Shahadat', color: '#ef4444' },
  [MiqaatTypeEnum.ASHARA]: { bg: 'bg-orange-500', border: 'border-orange-500', label: 'Ashara', color: '#f97316' },
  [MiqaatTypeEnum.IMPORTANT_NIGHT]: { bg: 'bg-amber-500', border: 'border-amber-500', label: 'Important Night', color: '#f59e0b' },
  [MiqaatTypeEnum.EID]: { bg: 'bg-emerald-500', border: 'border-emerald-500', label: 'Eid', color: '#10b981' },
  [MiqaatTypeEnum.OTHER]: { bg: 'bg-gray-400', border: 'border-gray-400', label: 'Other', color: '#9ca3af' },
}

const getMiqaatColor = (miqaat: Miqaat) => {
  if (miqaat.important) {
    return { bg: 'bg-red-600', border: 'border-red-600', color: '#dc2626' }
  }
  return MIQAAT_COLORS[miqaat.type || MiqaatTypeEnum.OTHER] || MIQAAT_COLORS[MiqaatTypeEnum.OTHER]
}

const AssignDuasInterface = () => {
  const appContext = App.useApp()
  const message = appContext?.message || { error: console.error, success: console.log, warning: console.warn }

  // Library state
  const [libraries, setLibraries] = useState<Library[]>([])
  const [filteredLibraries, setFilteredLibraries] = useState<Library[]>([])
  const [selectedLibraryIds, setSelectedLibraryIds] = useState<Set<number>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [loadingLibraries, setLoadingLibraries] = useState(false)

  // Calendar state
  const [calendar, setCalendar] = useState<Calendar>()
  const [miqaats, setMiqaats] = useState<Miqaat[]>([])
  const [dailyDuas, setDailyDuas] = useState<DailyDuaWithLibrary[]>([])
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set())
  const [loadingCalendar, setLoadingCalendar] = useState(false)
  const [currentHijriDate, setCurrentHijriDate] = useState<HijriDate>(new HijriDate())
  const [today] = useState<HijriDate>(new HijriDate())

  // Drag state
  const [draggedLibraries, setDraggedLibraries] = useState<Library[]>([])
  const [dropTargetDate, setDropTargetDate] = useState<string | null>(null)

  // Load data
  useEffect(() => {
    loadLibraries()
    loadCalendarData()
  }, [])

  // Filter libraries based on search
  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      const filtered = libraries.filter(
        lib =>
          lib.name.toLowerCase().includes(query) ||
          lib.description?.toLowerCase().includes(query) ||
          lib.album?.toLowerCase().includes(query) ||
          lib.tags?.some(tag => tag.toLowerCase().includes(query))
      )
      setFilteredLibraries(filtered)
    } else {
      setFilteredLibraries(libraries)
    }
  }, [searchQuery, libraries])

  const loadLibraries = async () => {
    try {
      setLoadingLibraries(true)
      const data = await LibraryService.getAll()
      setLibraries(data)
      setFilteredLibraries(data)
    } catch (error) {
      console.error('Failed to load libraries:', error)
      message.error('Failed to load libraries')
    } finally {
      setLoadingLibraries(false)
    }
  }

  const loadCalendarData = async (hijriDate?: HijriDate) => {
    try {
      setLoadingCalendar(true)
      const [miqaatsData, dailyDuasData] = await Promise.all([MiqaatService.getAll(), DailyDuaService.getAllWithLibrary().catch(() => [])])
      setMiqaats(miqaatsData)
      setDailyDuas(dailyDuasData)

      const dateToUse = hijriDate || currentHijriDate
      const cal = new Calendar({
        year: dateToUse.year,
        month: dateToUse.month,
        miqaats: miqaatsData ?? [],
        dailyDuas: dailyDuasData ?? [],
      })
      setCalendar(cal)
      setCurrentHijriDate(dateToUse)
    } catch (error) {
      console.error('Failed to load calendar:', error)
      message.error('Failed to load calendar')
    } finally {
      setLoadingCalendar(false)
    }
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    const currentMonth = currentHijriDate.month
    const currentYear = currentHijriDate.year

    let newMonth = currentMonth
    let newYear = currentYear

    if (direction === 'next') {
      if (currentMonth === 12) {
        newMonth = 1
        newYear = currentYear + 1
      } else {
        newMonth = currentMonth + 1
      }
    } else {
      if (currentMonth === 1) {
        newMonth = 12
        newYear = currentYear - 1
      } else {
        newMonth = currentMonth - 1
      }
    }

    const newDate = new HijriDate(newYear, newMonth, 1)
    setCurrentHijriDate(newDate)

    const newCal = new Calendar({
      year: newYear,
      month: newMonth,
      miqaats,
      dailyDuas,
    })
    setCalendar(newCal)
  }

  const jumpToMonth = (month: number, year: number) => {
    const newDate = new HijriDate(year, month, 1)
    setCurrentHijriDate(newDate)

    const newCal = new Calendar({
      year: year,
      month: month,
      miqaats,
      dailyDuas,
    })
    setCalendar(newCal)
  }

  const jumpToToday = () => {
    const today = new HijriDate()
    setCurrentHijriDate(today)

    const newCal = new Calendar({
      year: today.year,
      month: today.month,
      miqaats,
      dailyDuas,
    })
    setCalendar(newCal)
  }

  // Library selection
  const toggleLibrarySelection = (libraryId: number) => {
    const newSelection = new Set(selectedLibraryIds)
    if (newSelection.has(libraryId)) {
      newSelection.delete(libraryId)
    } else {
      newSelection.add(libraryId)
    }
    setSelectedLibraryIds(newSelection)
  }

  const selectAllLibraries = () => {
    if (selectedLibraryIds.size === filteredLibraries.length) {
      setSelectedLibraryIds(new Set())
    } else {
      setSelectedLibraryIds(new Set(filteredLibraries.map(lib => lib.id)))
    }
  }

  // Date selection
  const toggleDateSelection = (dateKey: string) => {
    const newSelection = new Set(selectedDates)
    if (newSelection.has(dateKey)) {
      newSelection.delete(dateKey)
    } else {
      newSelection.add(dateKey)
    }
    setSelectedDates(newSelection)
  }

  const clearDateSelection = () => {
    setSelectedDates(new Set())
  }

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, library: Library) => {
    // If the dragged library is selected, drag all selected libraries
    if (selectedLibraryIds.has(library.id)) {
      const selectedLibs = libraries.filter(lib => selectedLibraryIds.has(lib.id))
      setDraggedLibraries(selectedLibs)
      e.dataTransfer.effectAllowed = 'copy'
      e.dataTransfer.setData('text/plain', JSON.stringify(selectedLibs.map(l => l.id)))
    } else {
      // Just drag this one library
      setDraggedLibraries([library])
      e.dataTransfer.effectAllowed = 'copy'
      e.dataTransfer.setData('text/plain', JSON.stringify([library.id]))
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }

  const handleDragEnter = (dateKey: string) => {
    setDropTargetDate(dateKey)
  }

  const handleDragLeave = () => {
    setDropTargetDate(null)
  }

  const handleDrop = async (e: React.DragEvent, day: CalendarDay) => {
    e.preventDefault()
    setDropTargetDate(null)

    if (!day.date || day.filler) return

    // Determine target dates
    const targetDates: HijriDate[] = []
    if (selectedDates.size > 0) {
      // Use all selected dates
      selectedDates.forEach(dateKey => {
        const [dateStr, monthStr, yearStr] = dateKey.split('-')
        const date = new HijriDate(parseInt(yearStr), parseInt(monthStr), parseInt(dateStr))
        targetDates.push(date)
      })
    } else {
      // Use only the dropped date
      targetDates.push(day.date)
    }

    // Assign libraries to all target dates
    try {
      let successCount = 0
      let skipCount = 0

      for (const library of draggedLibraries) {
        for (const date of targetDates) {
          try {
            // Check if already exists
            const exists = await DailyDuaService.checkExists(library.id, date.day, date.month)
            if (exists) {
              skipCount++
              continue
            }

            await DailyDuaService.create({
              library_id: library.id,
              date: date.day,
              month: date.month,
            })
            successCount++
          } catch (error) {
            console.error('Failed to assign dua:', error)
          }
        }
      }

      if (successCount > 0) {
        message.success(`Assigned ${draggedLibraries.length} dua(s) to ${targetDates.length} date(s)`)
        await loadCalendarData()
      }
      if (skipCount > 0) {
        message.info(`${skipCount} assignment(s) skipped (already exists)`)
      }

      // Clear selections after successful drop
      setSelectedLibraryIds(new Set())
      setSelectedDates(new Set())
    } catch (error) {
      console.error('Failed to assign duas:', error)
      message.error('Failed to assign duas')
    }

    setDraggedLibraries([])
  }

  const getDateKey = (day: CalendarDay) => {
    return `${day.date?.day}-${day.date?.month}-${day.date?.year}`
  }

  return (
    <div className="flex h-full">
      {/* Left Panel - Library List (30%) */}
      <div className="w-[30%] flex flex-col bg-white border-r border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <IconSearch className="h-5 w-5" />
              Library Items
              {selectedLibraryIds.size > 0 && <Badge count={selectedLibraryIds.size} className="ml-2" />}
            </h2>
            <Button size="small" onClick={selectAllLibraries} type={selectedLibraryIds.size === filteredLibraries.length ? 'primary' : 'default'}>
              {selectedLibraryIds.size === filteredLibraries.length ? 'Deselect All' : 'Select All'}
            </Button>
          </div>
          <Input placeholder="Search libraries..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} prefix={<IconSearch className="h-4 w-4 text-gray-400" />} allowClear />
        </div>

        {/* Library List */}
        <div className="flex-1 overflow-y-auto">
          {loadingLibraries ? (
            <div className="flex items-center justify-center h-32">
              <Spin />
            </div>
          ) : filteredLibraries.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-gray-500">No libraries found</div>
          ) : (
            <div className="space-y-0">
              {filteredLibraries.map(library => (
                <div
                  key={library.id}
                  draggable={true}
                  onDragStart={e => handleDragStart(e, library)}
                  className={clsx(
                    'flex items-center gap-2 p-3 border-b transition-all cursor-move hover:shadow-md',
                    selectedLibraryIds.has(library.id) ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-200 hover:border-blue-200'
                  )}
                  onClick={() => toggleLibrarySelection(library.id)}>
                  <Checkbox checked={selectedLibraryIds.has(library.id)} />
                  <IconGripVertical className="h-4 w-4 text-gray-400" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-gray-900 truncate">{library.name}</div>
                    {library.album && (
                      <Tag color="blue" className="text-xs mt-1">
                        {library.album}
                      </Tag>
                    )}
                  </div>
                  {library.audio_url && <span className="text-xs text-green-600">🎵</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Calendar (70%) */}
      <div className="w-[70%] flex flex-col bg-white border-r border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <IconCalendar className="h-5 w-5" />
              {currentHijriDate.monthFullName} {currentHijriDate.year}
              {selectedDates.size > 0 && <Badge count={selectedDates.size} className="ml-2" />}
            </h2>
            <div className="flex gap-2">
              {selectedDates.size > 0 && (
                <Button size="small" icon={<IconX className="h-4 w-4" />} onClick={clearDateSelection}>
                  Clear Selection
                </Button>
              )}
              <Button size="small" onClick={() => navigateMonth('prev')}>
                ← Previous
              </Button>
              <Button size="small" type="primary" onClick={jumpToToday}>
                Today
              </Button>
              <Button size="small" onClick={() => navigateMonth('next')}>
                Next →
              </Button>
            </div>
          </div>

          {/* Month/Year Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600">Jump to:</span>
            <Select size="small" value={currentHijriDate.month} onChange={month => jumpToMonth(month, currentHijriDate.year)} className="w-32" showSearch>
              <Option value={1}>Muharram</Option>
              <Option value={2}>Safar</Option>
              <Option value={3}>Rabi al-Awwal</Option>
              <Option value={4}>Rabi al-Thani</Option>
              <Option value={5}>Jumada al-Awwal</Option>
              <Option value={6}>Jumada al-Thani</Option>
              <Option value={7}>Rajab</Option>
              <Option value={8}>Shaban</Option>
              <Option value={9}>Ramadan</Option>
              <Option value={10}>Shawwal</Option>
              <Option value={11}>Dhu al-Qidah</Option>
              <Option value={12}>Dhu al-Hijjah</Option>
            </Select>
            <Select size="small" value={currentHijriDate.year} onChange={year => jumpToMonth(currentHijriDate.month, year)} className="w-24" showSearch>
              {Array.from({ length: 10 }, (_, i) => {
                const year = currentHijriDate.year - 2 + i
                return (
                  <Option key={year} value={year}>
                    {year}
                  </Option>
                )
              })}
            </Select>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {loadingCalendar ? (
            <div className="flex items-center justify-center h-full">
              <Spin size="large" />
            </div>
          ) : (
            <div>
              {/* Week headers */}
              <div className="grid grid-cols-7 mb-2">
                {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
                  <div key={day} className="text-center text-xs font-semibold text-gray-600 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar days */}
              <div className="space-y-2">
                {calendar?.getWeeks().map((week, weekIndex) => (
                  <div key={weekIndex} className="grid grid-cols-7 gap-2">
                    {week.map((day, dayIndex) => {
                      const dateKey = getDateKey(day)
                      const isSelected = selectedDates.has(dateKey)
                      const isDropTarget = dropTargetDate === dateKey
                      const duaCount = day.dailyDuas?.length || 0
                      const miqaatCount = day.miqaats?.length || 0
                      const isToday = !day.filler && day.date?.day === today.day && day.date?.month === today.month && day.date?.year === today.year

                      return (
                        <div
                          key={dayIndex}
                          onClick={() => !day.filler && toggleDateSelection(dateKey)}
                          onDragOver={handleDragOver}
                          onDragEnter={() => handleDragEnter(dateKey)}
                          onDragLeave={handleDragLeave}
                          onDrop={e => handleDrop(e, day)}
                          className={clsx(
                            'relative min-h-[80px] p-2 rounded-lg border-2 transition-all',
                            day.filler ? 'bg-gray-50 border-gray-100 cursor-default' : 'cursor-pointer hover:shadow-md',
                            isToday && !isSelected && !isDropTarget && 'bg-yellow-50 border-yellow-400 ring-1 ring-yellow-300',
                            isSelected && 'bg-blue-50 border-blue-400 ring-2 ring-blue-200',
                            isDropTarget && 'bg-green-50 border-green-400 ring-2 ring-green-300',
                            !isSelected && !isDropTarget && !isToday && !day.filler && 'border-gray-200 hover:border-blue-300'
                          )}>
                          {/* Date */}
                          {!day.filler && (
                            <>
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-1">
                                  <span className={clsx('text-sm font-semibold', isToday ? 'text-yellow-700' : 'text-gray-900')}>{day.date?.toArabic()}</span>
                                  {isToday && <span className="text-xs bg-yellow-500 text-white px-1.5 py-0.5 rounded-full font-medium">Today</span>}
                                </div>
                                {isSelected && <IconCheck className="h-4 w-4 text-blue-600" />}
                              </div>
                              <div className={clsx('text-xs mb-2', isToday ? 'text-yellow-600 font-medium' : 'text-gray-500')}>{day.gregorian.format('D MMM')}</div>

                              {/* Miqaat Indicators */}
                              {miqaatCount > 0 && (
                                <div className="flex flex-wrap gap-1 mb-2">
                                  {day.miqaats?.slice(0, 4).map((miqaat, idx) => {
                                    const colorConfig = getMiqaatColor(miqaat)
                                    return (
                                      <Tooltip key={idx} title={miqaat.name}>
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colorConfig.color }} />
                                      </Tooltip>
                                    )
                                  })}
                                  {miqaatCount > 4 && <span className="text-xs text-gray-500 ml-1">+{miqaatCount - 4}</span>}
                                </div>
                              )}

                              {/* Duas */}
                              {duaCount > 0 && (
                                <div className="space-y-1">
                                  {day.dailyDuas?.slice(0, 2).map((dua, idx) => (
                                    <div key={idx} className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded truncate">
                                      📖 {dua.library?.name}
                                    </div>
                                  ))}
                                  {duaCount > 2 && <div className="text-xs text-gray-600 pl-2">+{duaCount - 2} more</div>}
                                </div>
                              )}

                              {/* Drop indicator */}
                              {isDropTarget && (
                                <div className="absolute inset-0 bg-green-100 bg-opacity-50 rounded-lg flex items-center justify-center">
                                  <span className="text-green-700 font-semibold text-sm">Drop here</span>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Miqaat Legend */}
        <div className="p-3 border-t border-gray-200 bg-gray-50">
          <p className="text-xs font-semibold text-gray-700 mb-2">Legend:</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-600 rounded-full"></div>
              <span className="text-xs text-gray-600">Important</span>
            </div>
            {Object.entries(MIQAAT_COLORS).map(([key, value]) => (
              <div key={key} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: value.color }}></div>
                <span className="text-xs text-gray-600">{value.label}</span>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-xs text-gray-600">Has Duas</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AssignDuasInterface
