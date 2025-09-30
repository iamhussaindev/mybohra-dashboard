'use client'

import { useLightDark } from '@hooks/useThemeSwitch'
import React from 'react'
import { ToastContainer as ToastContainerComponent } from 'react-toastify'

const ToastContainer = () => {
  const { theme } = useLightDark()
  return <ToastContainerComponent theme={theme === 'dark' ? 'dark' : 'light'} position="top-right" />
}

export default ToastContainer
