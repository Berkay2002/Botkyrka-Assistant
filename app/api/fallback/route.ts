import { NextRequest, NextResponse } from 'next/server'
import { logFallback } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { questionText, userLanguage, feedback } = await req.json()

    if (!questionText || !userLanguage) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    await logFallback({
      question_text: questionText,
      user_language: userLanguage,
      feedback: feedback || null,
    })

    // In a real implementation, this could integrate with:
    // - Email forwarding to kommun staff
    // - Ticket system (like Zendesk, ServiceNow)
    // - Microsoft Teams/Slack notifications
    // - CRM system integration

    const responseMessages = {
      sv: 'Tack! Din fråga har skickats till kommunen och du kommer få svar inom 2-3 arbetsdagar.',
      en: 'Thank you! Your question has been sent to the municipality and you will receive a response within 2-3 business days.',
      so: 'Mahadsanid! Su\'aalkaaga ayaa loo diray dawladda hoose waxaadna heli doontaa jawaab 2-3 maalmood shaqo gudahood.',
      ar: 'شكراً لك! تم إرسال سؤالك إلى البلدية وستحصل على رد خلال 2-3 أيام عمل.',
      tr: 'Teşekkürler! Sorunuz belediyeye gönderildi ve 2-3 iş günü içinde yanıt alacaksınız.',
    }

    return NextResponse.json({ 
      success: true,
      message: responseMessages[userLanguage as keyof typeof responseMessages] || responseMessages.en,
      reference_id: `BOT-${Date.now()}` // For tracking purposes
    })
  } catch (error) {
    console.error('Fallback API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
