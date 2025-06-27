import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Analytics types
export interface QuestionLog {
  id?: string
  question_text: string
  detected_language: string
  user_id?: string
  timestamp?: string
  response_helpful?: boolean
  sent_to_kommun?: boolean
}

export interface FeedbackLog {
  id?: string
  question_id: string
  is_helpful: boolean
  comment?: string
  message_content?: string
  user_language?: string
  timestamp?: string
}

export interface FallbackLog {
  id?: string
  question_text: string
  user_language: string
  feedback?: string
  timestamp?: string
}

// Analytics functions
export async function logQuestion(data: Omit<QuestionLog, 'id' | 'timestamp'>) {
  try {
    const { error } = await supabase
      .from('question_logs')
      .insert([{
        ...data,
        timestamp: new Date().toISOString()
      }])
    
    if (error) throw error
  } catch (error) {
    console.error('Error logging question:', error)
  }
}

export async function logFeedback(data: Omit<FeedbackLog, 'id' | 'timestamp'>) {
  try {
    const { error } = await supabase
      .from('feedback_logs')
      .insert([{
        ...data,
        timestamp: new Date().toISOString()
      }])
    
    if (error) throw error
  } catch (error) {
    console.error('Error logging feedback:', error)
  }
}

export async function logFallback(data: Omit<FallbackLog, 'id' | 'timestamp'>) {
  try {
    const { error } = await supabase
      .from('fallback_logs')
      .insert([{
        ...data,
        timestamp: new Date().toISOString()
      }])
    
    if (error) throw error
  } catch (error) {
    console.error('Error logging fallback:', error)
  }
}
