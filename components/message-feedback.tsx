"use client"

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ThumbsUpIcon, ThumbsDownIcon, ExternalLinkIcon } from 'lucide-react'

interface MessageFeedbackProps {
  messageIndex: number
  messageContent: string
  onFeedback?: (helpful: boolean, comment?: string) => void
  onSendToKommun?: () => void
}

export function MessageFeedback({ 
  messageIndex, 
  messageContent, 
  onFeedback, 
  onSendToKommun 
}: MessageFeedbackProps) {
  // Component now returns null to effectively remove all feedback UI
  return null
}
