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
  const { t, i18n } = useTranslation()
  const [feedbackGiven, setFeedbackGiven] = useState<boolean | null>(null)
  const [showComment, setShowComment] = useState(false)
  const [comment, setComment] = useState('')

  const handleFeedback = async (helpful: boolean) => {
    setFeedbackGiven(helpful)
    
    if (!helpful) {
      setShowComment(true)
    } else {
      // Send positive feedback immediately
      try {
        await fetch('/api/feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            questionId: `msg_${messageIndex}`,
            isHelpful: helpful,
            messageContent,
            language: i18n.language
          })
        })
        
        onFeedback?.(helpful)
      } catch (error) {
        console.error('Failed to send feedback:', error)
      }
    }
  }

  const handleCommentSubmit = async () => {
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: `msg_${messageIndex}`,
          isHelpful: false,
          comment: comment.trim(),
          messageContent,
          language: i18n.language
        })
      })
      
      onFeedback?.(false, comment.trim())
      setShowComment(false)
    } catch (error) {
      console.error('Failed to send feedback:', error)
    }
  }

  if (feedbackGiven === true) {
    return (
      <div className="flex items-center gap-2 text-xs text-green-600">
        <ThumbsUpIcon size={12} className="fill-current" />
        <span>
          {i18n.language === 'sv' ? 'Tack för din feedback!' :
           i18n.language === 'en' ? 'Thanks for your feedback!' :
           i18n.language === 'so' ? 'Mahadsanid jawaabkaaga!' :
           i18n.language === 'ar' ? 'شكراً لتقييمك!' :
           i18n.language === 'tr' ? 'Geri bildiriminiz için teşekkürler!' :
           'Thanks for your feedback!'}
        </span>
      </div>
    )
  }

  if (showComment) {
    return (
      <div className="space-y-2">
        <Textarea
          placeholder={t('feedback')}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="min-h-[60px] text-xs"
        />
        <div className="flex gap-2">
          <Button 
            onClick={handleCommentSubmit}
            size="sm"
            className="text-xs h-7"
          >
            {i18n.language === 'sv' ? 'Skicka' :
             i18n.language === 'en' ? 'Send' :
             i18n.language === 'so' ? 'Dir' :
             i18n.language === 'ar' ? 'إرسال' :
             i18n.language === 'tr' ? 'Gönder' : 'Send'}
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setShowComment(false)}
            className="text-xs h-7"
          >
            {i18n.language === 'sv' ? 'Avbryt' :
             i18n.language === 'en' ? 'Cancel' :
             i18n.language === 'so' ? 'Jooji' :
             i18n.language === 'ar' ? 'إلغاء' :
             i18n.language === 'tr' ? 'İptal' : 'Cancel'}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500">{t('helpful')}?</span>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => handleFeedback(true)}
        className="h-6 w-6 p-0 hover:bg-green-100"
        disabled={feedbackGiven !== null}
      >
        <ThumbsUpIcon size={12} className="text-green-600" />
      </Button>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => handleFeedback(false)}
        className="h-6 w-6 p-0 hover:bg-red-100"
        disabled={feedbackGiven !== null}
      >
        <ThumbsDownIcon size={12} className="text-red-600" />
      </Button>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={onSendToKommun}
        className="text-xs text-blue-600 hover:bg-blue-50 h-6 px-2"
      >
        <ExternalLinkIcon size={10} className="mr-1" />
        {t('sendToKommun')}
      </Button>
    </div>
  )
}
