import AuthGuard from '@components/auth/AuthGuard'
import AdminCalendar from '@components/calendar/AdminCalendar'
import DashboardLayout from '@components/layout/DashboardLayout'

function CalendarPage() {
  return (
    <AuthGuard>
      <DashboardLayout>
        <AdminCalendar />
      </DashboardLayout>
    </AuthGuard>
  )
}

export default CalendarPage
