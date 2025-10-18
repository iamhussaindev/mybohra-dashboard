'use client'

import { App, ConfigProvider } from 'antd'
import { ReactNode } from 'react'

interface AntdConfigProviderProps {
  children: ReactNode
}

export default function AntdConfigProvider({ children }: AntdConfigProviderProps) {
  return (
    <ConfigProvider
      theme={{
        token: {
          fontFamily: "var(--font-cf), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
          fontSize: 14,
          fontWeightStrong: 500,
        },
        components: {
          Form: {
            labelFontSize: 14,
          },
        },
        // Use CSS variables to avoid specificity conflicts
        cssVar: true,
        hashed: false,
      }}>
      <App>{children}</App>
    </ConfigProvider>
  )
}
