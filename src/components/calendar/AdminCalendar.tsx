'use client'

import AdminCalendarHeader from '@components/calendar/AdminCalendarHeader'
import AdminCalendarToolbar from '@components/calendar/AdminCalendarToolbar'
import AdminSearchCommand from '@components/calendar/AdminSearchCommand'
import DailyDuaModal from '@components/calendar/DailyDuaModal'
import LibraryDetailModal from '@components/library/LibraryDetailModal'
import { DailyDuaService } from '@lib/api/dailyDua'
import { MiqaatService } from '@lib/api/miqaat'
import { Calendar, CalendarDay } from '@lib/helpers/Calendar'
import HijriDate from '@lib/helpers/HijriDate'
import { DailyDuaWithLibrary } from '@type/dailyDua'
import { Library } from '@type/library'
import { Miqaat } from '@type/miqaat'
import { App } from 'antd'
import clsx from 'clsx'
import { Key, useEffect, useState } from 'react'

const WeekView = ({
  week,
  onDateClick,
  onMiqaatClick,
  onManageDailyDuas,
  onDuaClick,
  selectedDates,
  multiSelectMode,
  shiftSelectStart,
}: {
  onDateClick: (day: CalendarDay, event: React.MouseEvent) => void
  onMiqaatClick: (day: CalendarDay) => void
  onManageDailyDuas: (day: CalendarDay, event: React.MouseEvent) => void
  onDuaClick: (library: Library, event: React.MouseEvent) => void
  selectedDates: Set<string>
  multiSelectMode: boolean
  shiftSelectStart: string | null
  week: CalendarDay[]
}) => {
  return (
    <div className="grid grid-cols-7 border-b border-gray-100">
      {week.map((day, index) => {
        const dateKey = `${day.date?.day}-${day.date?.month}-${day.date?.year}`
        const isSelected = selectedDates.has(dateKey)
        const isShiftSelectStart = shiftSelectStart === dateKey
        const isToday = day.isToday

        console.log(day)

        return (
          <div
            onClick={e => {
              if (e.detail === 2) {
                // Double click to view miqaats
                onMiqaatClick(day)
              } else {
                // Single click for date selection
                onDateClick(day, e)
              }
            }}
            key={index}
            className={clsx(
              'relative h-32 p-3 border-r border-gray-100 last:border-r-0 cursor-pointer transition-all duration-200 hover:bg-gray-50 group',
              day.filler && 'bg-gray-25',
              isSelected && 'bg-blue-50 border-blue-200',
              multiSelectMode && 'hover:bg-blue-25'
            )}>
            {/* Today indicator */}
            {isToday && (
              <div className="absolute top-2 left-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-xs font-semibold text-white">{day.date?.toArabic()}</span>
              </div>
            )}

            {/* Regular date */}
            {!isToday && <div className={clsx('text-sm font-medium mb-2', day.filler ? 'text-gray-300' : 'text-gray-700 group-hover:text-gray-900')}>{day.date?.toArabic()}</div>}

            {/* Gregorian date */}
            {!day.filler && <div className="text-xs text-gray-500 mb-3">{day.gregorian.format('D')}</div>}

            {/* Miqaats */}
            {day.hasMiqaats && !day.filler && (
              <div className="space-y-1">
                {day.miqaats?.slice(0, 2).map((miqaat: any, miqaatIndex: Key | null | undefined) => (
                  <div
                    key={miqaatIndex}
                    onClick={e => {
                      e.stopPropagation()
                      onMiqaatClick(day)
                    }}
                    className={clsx(
                      'text-xs px-2 py-1 rounded-full truncate cursor-pointer transition-colors',
                      miqaat.important ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                    )}>
                    {miqaat.name}
                  </div>
                ))}
                {day.miqaats && day.miqaats.length > 2 && <div className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">+{day.miqaats.length - 2} more</div>}
              </div>
            )}

            {/* Daily Duas */}
            {day.hasDailyDuas && !day.filler && (
              <div className="space-y-1 mt-1">
                {day.dailyDuas?.slice(0, 1).map((dua: any, duaIndex: Key | null | undefined) => (
                  <div
                    key={duaIndex}
                    onClick={e => {
                      e.stopPropagation()
                      if (dua.library) {
                        onDuaClick(dua.library, e)
                      }
                    }}
                    className="text-xs px-2 py-1 rounded-full truncate cursor-pointer transition-colors bg-green-100 text-green-700 hover:bg-green-200">
                    📖 {dua.library?.name}
                  </div>
                ))}
                {day.dailyDuas && day.dailyDuas.length > 1 && (
                  <div
                    onClick={e => {
                      e.stopPropagation()
                      onManageDailyDuas(day, e)
                    }}
                    className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                    +{day.dailyDuas.length - 1} more duas
                  </div>
                )}
              </div>
            )}

            {/* Manage Daily Duas button (shown on hover if no daily duas) */}
            {!day.hasDailyDuas && !day.filler && (
              <div
                className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={e => {
                  e.stopPropagation()
                  onManageDailyDuas(day, e)
                }}>
                <div className="text-xs bg-green-500 text-white px-2 py-1 rounded-full hover:bg-green-600 cursor-pointer">+ Dua</div>
              </div>
            )}

            {/* Shift select indicator */}
            {isShiftSelectStart && <div className="absolute inset-0 border-2 border-green-500 bg-opacity-50 rounded"></div>}
          </div>
        )
      })}
    </div>
  )
}

const weekDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

const AdminCalendar = () => {
  const appContext = App.useApp()
  const message = appContext?.message || { error: console.error, success: console.log, warning: console.warn }
  const modal = appContext?.modal
  const [calendar, setCalendar] = useState<Calendar>()
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set())
  const [multiSelectMode, setMultiSelectMode] = useState(false)
  const [shiftSelectStart, setShiftSelectStart] = useState<string | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)

  const [miqaats, setMiqaats] = useState<Miqaat[]>([])
  const [dailyDuas, setDailyDuas] = useState<DailyDuaWithLibrary[]>([])
  const [dailyDuaModalOpen, setDailyDuaModalOpen] = useState(false)
  const [selectedDateForDua, setSelectedDateForDua] = useState<HijriDate | null>(null)
  const [libraryModalOpen, setLibraryModalOpen] = useState(false)
  const [selectedLibrary, setSelectedLibrary] = useState<Library | null>(null)

  // Load miqaats and daily duas
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      console.log('Starting to load data...')

      // Load miqaats first
      const miqaatsData = await MiqaatService.getAll()
      console.log('Loaded miqaats:', miqaatsData.length, miqaatsData)
      setMiqaats(miqaatsData)

      // Try to load daily duas, but don't fail if table doesn't exist
      try {
        const dailyDuasData = await DailyDuaService.getAllWithLibrary()
        console.log('Loaded dailyDuas:', dailyDuasData.length, dailyDuasData)
        setDailyDuas(dailyDuasData)
      } catch (duaError) {
        console.warn('Daily duas table might not exist yet:', duaError)
        setDailyDuas([])
      }
    } catch (error) {
      console.error('Failed to load data:', error)
      message.error('Failed to load data')
    }
  }

  useEffect(() => {
    // Always create calendar, even with empty data
    console.log('Creating calendar with miqaats:', miqaats.length, 'dailyDuas:', dailyDuas.length)
    const calendar = new Calendar({ miqaats: miqaats ?? [], dailyDuas: dailyDuas ?? [] })
    console.log('Calendar created:', calendar)

    // Debug: Check a few days to see if they have events
    const weeks = calendar.getWeeks()
    if (weeks.length > 0) {
      const firstWeek = weeks[0]
      firstWeek.forEach(day => {
        if (!day.filler) {
          console.log(`Day ${day.date?.day}: hasMiqaats=${day.hasMiqaats}, hasDailyDuas=${day.hasDailyDuas}, miqaats=${day.miqaats?.length}, dailyDuas=${day.dailyDuas?.length}`)
        }
      })
    }

    setCalendar(calendar)
  }, [miqaats, dailyDuas])

  // Handle ESC key to exit multiselect mode
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && multiSelectMode) {
        setMultiSelectMode(false)
        setSelectedDates(new Set())
        setShiftSelectStart(null)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [multiSelectMode])

  const handleDateClick = (day: CalendarDay, event: React.MouseEvent) => {
    if (day.filler) return

    const dateKey = `${day.date?.day}-${day.date?.month}-${day.date?.year}`

    // Auto-enter multiselect mode if shift is pressed
    if (event.shiftKey && !multiSelectMode) {
      setMultiSelectMode(true)
      // Set the first clicked date as the shift-select start point
      setShiftSelectStart(dateKey)
      setSelectedDates(new Set([dateKey]))
      return
    }

    if (event.shiftKey && shiftSelectStart) {
      // Handle shift-select range - select the range from start to current
      const newSelectedDates = new Set(selectedDates)

      // Parse the start and current dates
      const [startDay, startMonth, startYear] = shiftSelectStart.split('-').map(Number)
      const [currentDay, currentMonth, currentYear] = dateKey.split('-').map(Number)

      // Create HijriDate objects for comparison
      const startHijri = new HijriDate(startYear, startMonth, startDay)
      const currentHijri = new HijriDate(currentYear, currentMonth, currentDay)

      // Find all dates between start and current (inclusive)
      const startAJD = startHijri.toAJD()
      const currentAJD = currentHijri.toAJD()
      const minAJD = Math.min(startAJD, currentAJD)
      const maxAJD = Math.max(startAJD, currentAJD)

      // Add all dates in the range by iterating through calendar days
      const startGregorian = new Date(Math.round((minAJD - 2440588) * 86400000))
      const endGregorian = new Date(Math.round((maxAJD - 2440588) * 86400000))

      for (let d = new Date(startGregorian); d <= endGregorian; d.setDate(d.getDate() + 1)) {
        const hijriDate = new HijriDate().fromGregorian(d)
        const rangeKey = `${hijriDate.day}-${hijriDate.month}-${hijriDate.year}`
        newSelectedDates.add(rangeKey)
      }

      setSelectedDates(newSelectedDates)
    } else {
      // Single date selection or toggle
      const newSelectedDates = new Set(selectedDates)
      if (multiSelectMode) {
        // In multiselect mode, toggle the date
        if (newSelectedDates.has(dateKey)) {
          newSelectedDates.delete(dateKey)
        } else {
          newSelectedDates.add(dateKey)
        }
        setShiftSelectStart(dateKey)
      } else {
        // Single selection mode - show the miqaats for this date
        setSelectedDates(new Set([dateKey]))
        setShiftSelectStart(dateKey)
        // Show miqaats modal for the selected date
        handleMiqaatClick(day)
      }
    }
  }

  const handleMiqaatClick = (day: CalendarDay) => {
    const hasMiqaats = day.miqaats && day.miqaats.length > 0
    const hasDuas = day.dailyDuas && day.dailyDuas.length > 0

    modal?.info({
      title: `${day.date?.day} ${day.date?.monthFullName} ${day.date?.year}`,
      content: (
        <div className="space-y-4">
          {/* Miqaats Section */}
          {hasMiqaats && (
            <div>
              <h3 className="text-sm font-semibold text-purple-700 mb-2">Miqaats ({day.miqaats?.length})</h3>
              <div className="space-y-2">
                {day.miqaats?.map((miqaat, idx) => (
                  <div key={idx} className="p-3 bg-purple-50 rounded border border-purple-200">
                    <h4 className="font-semibold text-purple-900">{miqaat.name}</h4>
                    {miqaat.description && <p className="text-sm text-gray-600 mt-1">{miqaat.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Daily Duas Section */}
          {hasDuas && (
            <div>
              <h3 className="text-sm font-semibold text-green-700 mb-2">Daily Duas ({day.dailyDuas?.length})</h3>
              <div className="space-y-2">
                {day.dailyDuas?.map((dua, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-green-50 rounded border border-green-200 cursor-pointer hover:bg-green-100 transition-colors"
                    onClick={() => {
                      if (dua.library) {
                        setSelectedLibrary(dua.library as Library)
                        setLibraryModalOpen(true)
                      }
                    }}>
                    <h4 className="font-semibold text-green-900">📖 {dua.library?.name}</h4>
                    {dua.library?.description && <p className="text-sm text-gray-600 mt-1">{dua.library.description}</p>}
                    {dua.note && <p className="text-xs text-gray-500 mt-1 italic">{dua.note}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {!hasMiqaats && !hasDuas && (
            <div className="flex items-center justify-center h-48 w-full rounded-lg">
              <div className="text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No events on this day</h3>
                <p className="mt-1 text-sm text-gray-500">Click the + Dua button to add daily duas</p>
              </div>
            </div>
          )}
        </div>
      ),
      width: 600,
    })
  }

  const handleManageDailyDuas = (day: CalendarDay, event: React.MouseEvent) => {
    event.stopPropagation()
    if (day.date) {
      setSelectedDateForDua(day.date)
      setDailyDuaModalOpen(true)
    }
  }

  const handleDailyDuaSuccess = () => {
    loadData()
  }

  const handleDuaClick = (library: Library, event: React.MouseEvent) => {
    event.stopPropagation()
    setSelectedLibrary(library)
    setLibraryModalOpen(true)
  }

  return (
    <div className="bg-gradient-to-b">
      <div className="relative z-10">
        <div className="mx-auto">
          {/* Main Calendar Container */}
          <div className="bg-white border border-white/20 overflow-hidden">
            {/* Multi-select mode banner */}

            {/* Toolbar */}
            {calendar && <AdminCalendarToolbar setCalendar={setCalendar} miqaats={miqaats ?? []} selectedDates={selectedDates} setSelectedDates={setSelectedDates} setSearchOpen={setSearchOpen} />}

            {/* Header */}
            {calendar && <AdminCalendarHeader calendar={calendar} setCalendar={setCalendar} miqaats={miqaats ?? []} />}

            {/* Calendar Grid */}
            <div className="bg-white">
              {/* Week day headers */}
              <div className="grid grid-cols-7 border-b border-gray-200">
                {weekDays?.map((day, index) => (
                  <div key={index} className="py-4 text-center">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{day}</span>
                  </div>
                ))}
              </div>

              {/* Calendar weeks */}
              {calendar?.getWeeks()?.map((week, index) => (
                <WeekView
                  week={week}
                  onDateClick={handleDateClick}
                  onMiqaatClick={handleMiqaatClick}
                  onManageDailyDuas={handleManageDailyDuas}
                  onDuaClick={handleDuaClick}
                  selectedDates={selectedDates}
                  multiSelectMode={multiSelectMode}
                  shiftSelectStart={shiftSelectStart}
                  key={index}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Search Modal */}
      <AdminSearchCommand
        miqaats={miqaats ?? []}
        setOpen={setSearchOpen}
        open={searchOpen}
        setCalendar={setCalendar}
        onDateSelect={date => {
          // When a miqaat is selected from search, select that date
          const dateKey = `${date.day}-${date.month}-${date.year}`
          setSelectedDates(new Set([dateKey]))
          setShiftSelectStart(dateKey)
        }}
      />

      {/* Daily Dua Management Modal */}
      {selectedDateForDua && <DailyDuaModal open={dailyDuaModalOpen} onClose={() => setDailyDuaModalOpen(false)} date={selectedDateForDua} onSuccess={handleDailyDuaSuccess} />}

      {/* Library Detail Modal */}
      <LibraryDetailModal library={selectedLibrary} open={libraryModalOpen} onClose={() => setLibraryModalOpen(false)} />
    </div>
  )
}

export default AdminCalendar
