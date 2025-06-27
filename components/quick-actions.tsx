"use client"

import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'

interface QuickActionsProps {
  onActionClick: (action: string) => void
}

export function QuickActions({ onActionClick }: QuickActionsProps) {
  const { t } = useTranslation()

  const actions = [
    { key: 'preschool', icon: '🏫' },
    { key: 'waste', icon: '♻️' },
    { key: 'housing', icon: '🏠' },
    { key: 'parking', icon: '🚗' },
    { key: 'eldercare', icon: '👴' },
    { key: 'schools', icon: '📚' },
  ]

  return (
    <div className="flex flex-wrap gap-2 p-2">
      {actions.map((action) => (
        <Button
          key={action.key}
          variant="outline"
          size="sm"
          onClick={() => onActionClick(t(`quickActions.${action.key}`))}
          className="flex items-center gap-1 text-xs px-3 py-1 h-8 rounded-full border-gray-200 hover:bg-blue-50 hover:border-blue-300"
        >
          <span className="text-sm">{action.icon}</span>
          <span>{t(`quickActions.${action.key}`)}</span>
        </Button>
      ))}
    </div>
  )
}
