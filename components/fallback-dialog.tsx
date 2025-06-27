"use client"

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ExternalLinkIcon, MessageSquareIcon, RefreshCwIcon } from 'lucide-react'

interface FallbackDialogProps {
  questionText: string
  onClose: () => void
  onTryAnother: () => void
}

export function FallbackDialog({ questionText, onClose, onTryAnother }: FallbackDialogProps) {
  const { t, i18n } = useTranslation()
  const [feedback, setFeedback] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSendToKommun = async () => {
    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/fallback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionText,
          userLanguage: i18n.language,
          feedback: feedback.trim() || undefined
        })
      })

      if (response.ok) {
        setIsSubmitted(true)
        setTimeout(() => {
          onClose()
        }, 2000)
      }
    } catch (error) {
      console.error('Failed to send fallback:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6 text-center">
          <div className="text-green-600 text-4xl mb-4">✓</div>
          <p className="text-sm text-gray-600">
            {i18n.language === 'sv' ? 'Tack! Din fråga har skickats till kommunen.' :
             i18n.language === 'en' ? 'Thank you! Your question has been sent to the municipality.' :
             i18n.language === 'so' ? 'Mahadsanid! Su\'aalkaaga ayaa loo diray dawladda hoose.' :
             i18n.language === 'ar' ? 'شكراً لك! تم إرسال سؤالك إلى البلدية.' :
             i18n.language === 'tr' ? 'Teşekkürler! Sorunuz belediyeye gönderildi.' :
             'Thank you! Your question has been sent to the municipality.'}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <MessageSquareIcon size={20} />
          {i18n.language === 'sv' ? 'Behöver du mer hjälp?' :
           i18n.language === 'en' ? 'Need more help?' :
           i18n.language === 'so' ? 'Ma u baahan tahay kaalmo dheeraad ah?' :
           i18n.language === 'ar' ? 'تحتاج مساعدة إضافية؟' :
           i18n.language === 'tr' ? 'Daha fazla yardıma ihtiyacınız var mı?' :
           'Need more help?'}
        </CardTitle>
        <CardDescription>
          {i18n.language === 'sv' ? 'Jag är inte säker på svaret. Du kan skicka din fråga direkt till kommunen eller prova ett annat ämne.' :
           i18n.language === 'en' ? 'I\'m not sure about the answer. You can send your question directly to the municipality or try another topic.' :
           i18n.language === 'so' ? 'Ma hubo jawaabta. Waxaad u diri kartaa su\'aalkaaga si toos ah dawladda hoose ama isku dayi mawduuc kale.' :
           i18n.language === 'ar' ? 'لست متأكداً من الإجابة. يمكنك إرسال سؤالك مباشرة إلى البلدية أو جرب موضوعاً آخر.' :
           i18n.language === 'tr' ? 'Cevap konusunda emin değilim. Sorunuzu doğrudan belediyeye gönderebilir veya başka bir konu deneyebilirsiniz.' :
           'I\'m not sure about the answer. You can send your question directly to the municipality or try another topic.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-gray-50 rounded text-sm">
          <strong>{i18n.language === 'sv' ? 'Din fråga:' : 
                   i18n.language === 'en' ? 'Your question:' :
                   i18n.language === 'so' ? 'Su\'aalkaaga:' :
                   i18n.language === 'ar' ? 'سؤالك:' :
                   i18n.language === 'tr' ? 'Sorunuz:' : 'Your question:'}</strong>
          <br />
          "{questionText}"
        </div>

        <Textarea
          placeholder={t('feedback')}
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          className="min-h-[80px]"
        />

        <div className="flex gap-2">
          <Button 
            onClick={handleSendToKommun}
            disabled={isSubmitting}
            className="flex-1 flex items-center gap-2"
          >
            <ExternalLinkIcon size={16} />
            {isSubmitting ? 
              (i18n.language === 'sv' ? 'Skickar...' : 'Sending...') : 
              t('sendToKommun')
            }
          </Button>
          <Button 
            variant="outline" 
            onClick={onTryAnother}
            className="flex-1 flex items-center gap-2"
          >
            <RefreshCwIcon size={16} />
            {t('tryAnother')}
          </Button>
        </div>

        <p className="text-xs text-gray-500 text-center">
          {t('privacyNote')}
        </p>
      </CardContent>
    </Card>
  )
}
