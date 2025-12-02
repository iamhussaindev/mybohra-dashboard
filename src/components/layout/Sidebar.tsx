import {
  Icon,
  IconBuilding,
  IconCalendar,
  IconChartBar,
  IconChartPie,
  IconCode,
  IconDashboard,
  IconDeviceMobile,
  IconDragDrop,
  IconFolder,
  IconListTree,
  IconLocation,
  IconLogout,
  IconMapPin,
  IconProps,
  IconSettings,
  IconUsers,
} from '@tabler/icons-react'
import classNames from 'classnames'
import { usePathname } from 'next/navigation'

interface SidebarItem {
  name: string
  href: string
  icon: React.ForwardRefExoticComponent<IconProps & React.RefAttributes<Icon>>
  count?: number
}

interface SidebarSection {
  title: string
  items: SidebarItem[]
}

const sidebarSections: SidebarSection[] = [
  {
    title: 'General',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: IconDashboard, count: 0 },
      { name: 'Analytics', href: '/dashboard/analytics', icon: IconChartBar },
      { name: 'Users', href: '/dashboard/users', icon: IconUsers },
      { name: 'Library', href: '/dashboard/library', icon: IconFolder },
      {
        name: 'Tasbeeh',
        href: '/dashboard/tasbeeh',
        icon: IconListTree,
      },
      { name: 'Business', href: '/dashboard/business', icon: IconChartPie },
      { name: 'Miqaats', href: '/dashboard/miqaats', icon: IconCalendar },

      {
        name: 'Daily Duas',
        href: '/dashboard/assign-duas',
        icon: IconDragDrop,
      },
      { name: 'Locations', href: '/dashboard/location', icon: IconLocation },
      { name: 'Mazaars', href: '/dashboard/mazaars', icon: IconMapPin },
      { name: 'Dai Duat', href: '/dashboard/dai-duat', icon: IconUsers },
      { name: 'Musafirkhana', href: '/dashboard/musafirkhana', icon: IconBuilding },
      { name: 'Devices', href: '/dashboard/devices', icon: IconDeviceMobile },
    ],
  },
  {
    title: 'App Data',
    items: [
      {
        name: 'Send Notifications',
        href: '/dashboard/send-notification',
        icon: IconUsers,
      },
      {
        name: 'JSON Editor',
        href: '/dashboard/json-editor',
        icon: IconCode,
      },
    ],
  },
  {
    title: 'Support',
    items: [
      {
        name: 'Settings',
        href: '/dashboard/settings',
        icon: IconSettings,
        count: 0,
      },
      { name: 'Logout', href: '/dashboard/logout', icon: IconLogout },
    ],
  },
]

export default function Sidebar() {
  const pathname = usePathname()

  const renderSidebarItem = (item: SidebarItem) => {
    const current = item.href === pathname

    return (
      <li key={item.name} className={classNames('rounded-md hover:bg-gray-50 hover:text-primary-600', current ? 'bg-gray-100 text-black' : 'text-black/90')}>
        <a href={item.href} className={classNames(current ? 'bg-gray-100 text-black' : 'text-black/90 hover:bg-gray-50 hover:text-primary-600', 'group flex gap-x-3 rounded-md p-2 text-sm')}>
          <item.icon aria-hidden="true" className={classNames(current ? 'text-black' : 'text-black/90 group-hover:text-black', 'h-5 w-5 shrink-0')} />
          {item.name}
          {item.count !== undefined && (
            <span aria-hidden="true" className="ml-auto w-9 min-w-max whitespace-nowrap rounded-full bg-white px-2.5 py-0.5 text-center text-xs font-medium text-black ring-1 ring-inset ring-gray-200">
              {item.count}
            </span>
          )}
        </a>
      </li>
    )
  }

  const renderSidebarSection = (section: SidebarSection) => (
    <div className={classNames('border-b border-gray-200 pb-4', section.title === sidebarSections[sidebarSections.length - 1].title ? 'border-b-0' : '')} key={section.title}>
      <div className="text-xs font-semibold uppercase text-gray-400 py-2 mt-4">{section.title}</div>
      <ul role="list" className="-mx-2 space-y-1">
        {section.items.map(renderSidebarItem)}
      </ul>
    </div>
  )

  return (
    <div className="flex grow flex-col h-full border-r shadow-only border-gray-200 bg-white overflow-y-auto">
      <div className="flex py-2 px-4 border-b h-[57px] border-gray-200 pb-0 shrink-0 items-center">
        <h2 className="text-2xl text-primary-800 mb-0 font-bold">MyBohra</h2>
      </div>
      <nav className="flex flex-1 flex-col px-4 py-2">{sidebarSections.map(renderSidebarSection)}</nav>
    </div>
  )
}
