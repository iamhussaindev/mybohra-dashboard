'use client'

import { StorageService } from '@lib/api/storage'
import { IconCheck, IconLoader, IconX } from '@tabler/icons-react'
import { useEffect, useState } from 'react'

interface FileCheckerProps {
  url?: string
  type: 'audio' | 'pdf'
  className?: string
}

interface FileStatus {
  exists: boolean
  loading: boolean
  error?: string
}

export default function FileChecker({ url, type, className = '' }: FileCheckerProps) {
  const [status, setStatus] = useState<FileStatus>({
    exists: false,
    loading: false,
  })

  useEffect(() => {
    if (!url) {
      setStatus({ exists: false, loading: false })
      return
    }

    checkFileExists()
  }, [url])

  const checkFileExists = async () => {
    if (!url) return

    setStatus({ exists: false, loading: true })

    try {
      // Extract path from URL
      const path = extractPathFromUrl(url)
      if (!path) {
        setStatus({ exists: false, loading: false, error: 'Invalid URL' })
        return
      }

      const exists = await StorageService.checkFileExists(path, type)
      setStatus({ exists, loading: false })
    } catch (error) {
      setStatus({
        exists: false,
        loading: false,
        error: error instanceof Error ? error.message : 'Check failed',
      })
    }
  }

  const extractPathFromUrl = (url: string): string | null => {
    try {
      const urlObj = new URL(url)
      const pathParts = urlObj.pathname.split('/')

      // Find the bucket name and get everything after it
      const bucketIndex = pathParts.findIndex(part => part === type)
      if (bucketIndex === -1 || bucketIndex === pathParts.length - 1) {
        return null
      }

      return pathParts.slice(bucketIndex + 1).join('/')
    } catch {
      return null
    }
  }

  const getIcon = () => {
    if (status.loading) {
      return <IconLoader className="w-4 h-4 animate-spin text-blue-500" />
    }

    if (status.error) {
      return <IconX className="w-4 h-4 text-red-500" />
    }

    return status.exists ? <IconCheck className="w-4 h-4 text-green-500" /> : <IconX className="w-4 h-4 text-red-500" />
  }

  const getTooltip = () => {
    if (status.loading) return 'Checking file...'
    if (status.error) return `Error: ${status.error}`
    return status.exists ? 'File exists' : 'File not found'
  }

  const getStatusText = () => {
    if (status.loading) return 'Checking...'
    if (status.error) return 'Error'
    return status.exists ? 'Available' : 'Missing'
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="flex items-center space-x-1" title={getTooltip()}>
        {getIcon()}
        <span className="text-xs text-gray-600">{getStatusText()}</span>
      </div>
    </div>
  )
}
