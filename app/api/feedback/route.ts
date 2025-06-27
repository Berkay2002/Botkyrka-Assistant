import { NextRequest, NextResponse } from 'next/server'
import { logFeedback } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { 
      questionId, 
      isHelpful, 
      comment, 
      messageContent, 
      language 
    } = await req.json()

    if (!questionId || typeof isHelpful !== 'boolean') {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create a comprehensive feedback entry
    await logFeedback({
      question_id: questionId,
      is_helpful: isHelpful,
      comment: comment || null,
      message_content: messageContent || null,
      user_language: language || 'sv',
    })

    // If feedback is negative and has a comment, could trigger additional actions:
    // - Alert content team for review
    // - Flag for training data improvement
    // - Generate follow-up questions

    const thankYouMessages = {
      sv: 'Tack för din feedback! Den hjälper oss att förbättra tjänsten.',
      en: 'Thank you for your feedback! It helps us improve the service.',
      so: 'Mahadsanid jawaabkaaga! Waxay naga caawisaa inaan hagaajinno adeegga.',
      ar: 'شكراً لتقييمك! يساعدنا على تحسين الخدمة.',
      tr: 'Geri bildiriminiz için teşekkürler! Hizmeti geliştirmemize yardımcı oluyor.',
    }

    return NextResponse.json({ 
      success: true,
      message: thankYouMessages[language as keyof typeof thankYouMessages] || thankYouMessages.en
    })
  } catch (error) {
    console.error('Feedback API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
