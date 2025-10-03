import Card from '@components/ui/atoms/Card'

interface KPICardProps {
  title: string
  value: number
  icon: React.ComponentType<any>
  color: string
  subtitle?: string
}

const KPICard = ({ title, value, icon: Icon, color, subtitle }: KPICardProps) => (
  <Card variant="outlined" className="shadow-box p-6 hover:shadow-lg transition-shadow">
    <div className="flex items-center">
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      </div>
    </div>
  </Card>
)

export default KPICard
