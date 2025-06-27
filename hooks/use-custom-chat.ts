"use client"

import { useState, useCallback } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
  id: string
}

interface UseChatReturn {
  messages: Message[]
  input: string
  setInput: (value: string) => void
  append: (message: { content: string; role: 'user' }) => Promise<void>
  isLoading: boolean
  error: string | null
}

export function useCustomChat(): UseChatReturn {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const append = useCallback(async (message: { content: string; role: 'user' }) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: message.content
    }

    // Add user message immediately
    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage]
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error.en || 'Something went wrong')
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.content
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Chat error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [messages])

  return {
    messages,
    input,
    setInput,
    append,
    isLoading,
    error
  }
}
