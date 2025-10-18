'use client'

import AuthGuard from '@components/auth/AuthGuard'
import DashboardLayout from '@components/layout/DashboardLayout'
import { IconCheck, IconCode, IconDownload, IconUpload } from '@tabler/icons-react'
import { Alert, Button, Card, Space } from 'antd'
import dynamic from 'next/dynamic'
import { useState } from 'react'

// Dynamically import Monaco Editor to avoid SSR issues
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false })

const defaultJson = {
  name: 'MyBohra App',
  version: '1.0.0',
  description: 'Islamic community management platform',
  settings: {
    theme: 'light',
    language: 'en',
    notifications: true,
  },
  features: {
    calendar: true,
    library: true,
    tasbeeh: true,
  },
}

function JsonEditorContent() {
  const [jsonContent, setJsonContent] = useState(JSON.stringify(defaultJson, null, 2))
  const [isValid, setIsValid] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const handleEditorChange = (value: string | undefined) => {
    if (!value) return
    setJsonContent(value)

    try {
      JSON.parse(value)
      setIsValid(true)
      setError(null)
    } catch (err) {
      setIsValid(false)
      setError(err instanceof Error ? err.message : 'Invalid JSON')
    }
  }

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(jsonContent)
      setJsonContent(JSON.stringify(parsed, null, 2))
      setIsValid(true)
      setError(null)
    } catch (err) {
      setError('Cannot format invalid JSON')
    }
  }

  const handleDownload = () => {
    try {
      const blob = new Blob([jsonContent], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'data.json'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      setError('Failed to download JSON')
    }
  }

  const handleUpload = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e: any) => {
      const file = e.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = event => {
          try {
            const content = event.target?.result as string
            JSON.parse(content) // Validate
            setJsonContent(content)
            setIsValid(true)
            setError(null)
          } catch (err) {
            setError('Invalid JSON file')
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  return (
    <DashboardLayout
      actions={[
        <Button key="upload" icon={<IconUpload className="h-4 w-4" />} onClick={handleUpload}>
          Upload JSON
        </Button>,
        <Button key="download" icon={<IconDownload className="h-4 w-4" />} onClick={handleDownload} disabled={!isValid}>
          Download
        </Button>,
        <Button key="format" type="primary" icon={<IconCode className="h-4 w-4" />} onClick={handleFormat} disabled={!isValid} className="bg-blue-600 hover:bg-blue-700">
          Format JSON
        </Button>,
      ]}
      showSearch={false}>
      <div className="space-y-4 w-full">
        {/* Status Indicator */}
        {isValid ? <Alert message="Valid JSON" type="success" icon={<IconCheck className="h-4 w-4" />} showIcon /> : <Alert message="Invalid JSON" description={error} type="error" showIcon />}

        {/* JSON Editor */}
        <Card>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <MonacoEditor
              height="600px"
              defaultLanguage="json"
              value={jsonContent}
              onChange={handleEditorChange}
              theme="vs-light"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                wrappingIndent: 'indent',
                automaticLayout: true,
              }}
            />
          </div>
        </Card>

        {/* Instructions */}
        <Card title="Instructions">
          <Space direction="vertical" className="w-full">
            <p className="text-gray-600">
              <strong>JSON Editor Features:</strong>
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>Edit JSON data directly in the editor</li>
              <li>Real-time validation to catch syntax errors</li>
              <li>Format JSON with proper indentation</li>
              <li>Upload existing JSON files</li>
              <li>Download edited JSON to your computer</li>
            </ul>
          </Space>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default function JsonEditorPage() {
  return (
    <AuthGuard>
      <JsonEditorContent />
    </AuthGuard>
  )
}
