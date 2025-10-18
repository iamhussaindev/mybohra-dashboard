import { Calendar } from '@lib/helpers/Calendar'
import { IconCalendar, IconSearch, IconX } from '@tabler/icons-react'
import { Miqaat } from '@type/miqaat'
import { Button, Input } from 'antd'

const AdminCalendarToolbar = ({
  setCalendar,
  miqaats,
  selectedDates,
  setSelectedDates,
  setSearchOpen,
}: {
  setCalendar: (calendar: Calendar) => void
  miqaats: Miqaat[]
  selectedDates: Set<string>
  setSelectedDates: (dates: Set<string>) => void
  setSearchOpen: (open: boolean) => void
}) => {
  const handleClearSelection = () => {
    setSelectedDates(new Set())
  }

  const handleSelectMonth = () => {
    const calendar = new Calendar({ miqaats })
    const days = calendar.days()
    const monthDates = new Set(days.map(day => `${day.date.day}-${day.date.month}-${day.date.year}`))
    setSelectedDates(monthDates)
  }

  const handleSelectYear = () => {
    const calendar = new Calendar({ miqaats })
    const yearDates = new Set()

    // Select all days in the current year
    for (let month = 0; month < 12; month++) {
      const monthCalendar = new Calendar({
        year: calendar.year,
        month,
        miqaats,
      })
      const days = monthCalendar.days()
      days.forEach(day => {
        yearDates.add(`${day.date.day}-${day.date.month}-${day.date.year}`)
      })
    }

    setSelectedDates(yearDates as Set<string>)
  }

  return (
    <div className="bg-white/30 backdrop-blur-sm border-b border-gray-200/50 px-6 py-4">
      <div className="flex items-center justify-between max-w-6xl mx-auto">
        {/* Left Controls */}
        <div className="flex items-center gap-3">
          <Button
            onClick={() => {
              setCalendar(new Calendar({ miqaats }))
            }}
            type="primary"
            size="large"
            icon={<IconCalendar className="h-4 w-4" />}
            className="bg-gray-900 hover:bg-gray-800 border-gray-900 hover:border-gray-800 shadow-lg">
            Today
          </Button>

          {selectedDates.size > 0 && (
            <Button onClick={handleClearSelection} size="large" icon={<IconX className="h-4 w-4" />} className="text-gray-600 hover:text-gray-900 hover:bg-gray-100/50">
              Clear Selection ({selectedDates.size})
            </Button>
          )}
        </div>

        {/* Search */}
        <div className="flex-1 max-w-md mx-8">
          <Input
            placeholder="Search miqaats..."
            prefix={<IconSearch className="h-4 w-4 text-gray-400" />}
            onClick={() => setSearchOpen(true)}
            className="h-10 bg-white/50 border-gray-200 hover:border-gray-300 focus:border-blue-500 rounded-lg"
            readOnly
          />
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2">
          <Button onClick={handleSelectMonth} size="large" className="text-gray-700 hover:text-gray-900 hover:bg-gray-100/50 border-gray-200 hover:border-gray-300">
            All events
          </Button>

          <Button onClick={handleSelectYear} size="large" className="text-gray-700 hover:text-gray-900 hover:bg-gray-100/50 border-gray-200 hover:border-gray-300">
            Shared
          </Button>

          <Button onClick={handleSelectYear} size="large" className="text-gray-700 hover:text-gray-900 hover:bg-gray-100/50 border-gray-200 hover:border-gray-300">
            Public
          </Button>

          <Button onClick={handleSelectYear} size="large" className="text-gray-700 hover:text-gray-900 hover:bg-gray-100/50 border-gray-200 hover:border-gray-300">
            Archived
          </Button>
        </div>
      </div>
    </div>
  )
}

export default AdminCalendarToolbar
