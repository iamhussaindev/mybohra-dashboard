'use client'

import { Data } from '@type/data'
import { DataTable } from './DataTable'

interface DataListProps {
  onEditData: (data: Data) => void
  onDeleteData: (dataId: number) => void
}

export default function DataList({ onEditData, onDeleteData }: DataListProps) {
  const handleDataClick = (data: Data) => {
    // Handle data click/view action
    console.log('Data clicked:', data)
  }

  const handleDataEdit = (data: Data) => {
    onEditData(data)
  }

  const handleDataDelete = (data: Data) => {
    onDeleteData(data.id)
  }

  return (
    <div className="space-y-6">
      <DataTable onDataEdit={handleDataEdit} onDataDelete={handleDataDelete} className="bg-white" />
    </div>
  )
}
