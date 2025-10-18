import { Calendar } from '@lib/helpers/Calendar'
import { IconCalendar, IconChevronLeft, IconChevronRight, IconChevronsLeft, IconChevronsRight } from '@tabler/icons-react'
import { Miqaat } from '@type/miqaat'
import { Button } from 'antd'

type Props = {
  calendar: Calendar
  setCalendar: (calendar: Calendar) => void
  miqaats: Miqaat[]
}

const AdminCalendarHeader = ({ calendar, setCalendar, miqaats }: Props) => {
  return (
    <div className="bg-white/50 backdrop-blur-sm border-b border-gray-200/50 px-6 py-3">
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        {/* Year Navigation */}
        <Button
          type="text"
          size="large"
          onClick={() => setCalendar(calendar?.previousYear())}
          icon={<IconChevronsLeft className="h-4 w-4" />}
          className="text-gray-600 hover:text-gray-900 hover:bg-gray-100/50 px-4 py-2 h-auto">
          <span className="text-lg font-semibold ml-2">{(calendar?.year ?? 0) - 1}</span>
        </Button>

        {/* Main Navigation */}
        <div className="flex items-center gap-6">
          <Button
            type="text"
            size="large"
            onClick={() => setCalendar(calendar?.previousMonth())}
            icon={<IconChevronLeft className="h-5 w-5" />}
            className="text-gray-600 hover:text-gray-900 hover:bg-gray-100/50"
          />

          <div
            onClick={() => {
              setCalendar(new Calendar({ miqaats: miqaats ?? [] }))
            }}
            className="flex items-center gap-3 cursor-pointer group px-6 py-3 rounded-xl hover:bg-gray-100/50 transition-all duration-200">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <IconCalendar className="h-5 w-5 text-white" />
              </div>
              <div className="text-left">
                <h1 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{calendar?.monthName}</h1>
                <p className="text-sm text-gray-500 font-medium">
                  {calendar?.gregMonth} • {calendar?.year}
                </p>
              </div>
            </div>
          </div>

          <Button
            type="text"
            size="large"
            onClick={() => setCalendar(calendar?.nextMonth())}
            icon={<IconChevronRight className="h-5 w-5" />}
            className="text-gray-600 hover:text-gray-900 hover:bg-gray-100/50"
          />
        </div>

        {/* Year Navigation */}
        <Button
          type="text"
          size="large"
          onClick={() => setCalendar(calendar?.nextYear())}
          icon={<IconChevronsRight className="h-4 w-4" />}
          iconPosition="end"
          className="text-gray-600 hover:text-gray-900 hover:bg-gray-100/50 px-4 py-2 h-auto">
          <span className="text-lg font-semibold mr-2">{(calendar?.year ?? 0) + 1}</span>
        </Button>
      </div>
    </div>
  )
}

export default AdminCalendarHeader
