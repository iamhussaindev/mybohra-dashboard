'use client'

import { useLightDark } from '@hooks/useThemeSwitch'

export const ToggleTheme = ({ className, renderIcon }: { className?: string; renderIcon: (theme: string) => React.ReactNode }) => {
  const { toggleTheme, theme } = useLightDark()

  return (
    <button onClick={toggleTheme} className={className}>
      {renderIcon(theme)}
    </button>
  )
}
