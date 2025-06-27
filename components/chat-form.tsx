"use client"

import { cn } from "@/lib/utils"
import { useState, useCallback, useEffect } from "react"
import { ArrowUpIcon, ExternalLinkIcon, MessageSquareIcon, RefreshCwIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { AutoResizeTextarea } from "@/components/autoresize-textarea"
import { LanguageSelector } from "@/components/language-selector"
import { QuickActions } from "@/components/quick-actions"
import { MessageFeedback } from "@/components/message-feedback"
import { FallbackDialog } from "@/components/fallback-dialog"
import { LinkPreview } from "@/components/link-preview"
import { ClientOnly } from "@/components/client-only"
import StructuredResponse from "@/components/structured-response"
import { detectIntent } from "@/lib/intent-detection"
import { useTranslation } from 'react-i18next'
import { SUPPORTED_LANGUAGES, type LanguageCode } from '@/lib/i18n'
import '@/lib/i18n'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

// Language detection removed - Gemini handles multilingual input automatically

function extractActionLinks(content: string) {
  // Use intent detection for better link suggestions
  const intentAnalysis = detectIntent(content)
  
  if (intentAnalysis.intent.confidence < 1) {
    // Low confidence, fallback to general links
    return [{
      keyword: 'allmän',
      url: 'https://www.botkyrka.se/sjalvservice-och-blanketter',
      displayName: 'Självservice och blanketter',
      type: 'general'
    }]
  }
  
  // Convert intent-based suggestions to action links format
  return intentAnalysis.suggestedLinks.slice(0, 3).map(link => ({
    keyword: intentAnalysis.intent.category,
    url: link.url,
    displayName: link.displayName,
    type: link.type
  }))
}

function getContextualLinkTitle(content: string, actionLinks: Array<{ keyword: string; url: string; displayName: string; type: string }>) {
  // Use intent detection to get contextual title
  const intentAnalysis = detectIntent(content)
  
  if (intentAnalysis.intent.confidence > 1) {
    const categoryDisplayNames: { [key: string]: string } = {
      'Förskola': 'Förskola - Ansökan och information',
      'Grundskola': 'Skola - E-tjänster och information',
      'Barn-och-familj': 'Barn och familj - Stöd och tjänster',
      'Boende-och-miljö': 'Boende och miljö - Tjänster och stöd',
      'Bygglov': 'Bygglov - Ansökan och tillstånd',
      'Stöd-och-trygghet': 'Stöd och trygghet - Omsorg och säkerhet',
      'Jobb': 'Jobb och utbildning - Möjligheter',
      'Sport-och-kultur': 'Kultur och fritid - Aktiviteter',
      'Trafik-och-parkering': 'Trafik och parkering - Tjänster',
      'Utbildning-vuxna': 'Vuxenutbildning - Kurser och stöd'
    }
    
    return categoryDisplayNames[intentAnalysis.intent.category] || 'Kommunala tjänster'
  }
  
  // Fallback to checking link types
  const hasEservice = actionLinks.some(link => link.type === 'eservice')
  const hasInfo = actionLinks.some(link => link.type === 'info')
  
  if (hasEservice && hasInfo) {
    return 'E-tjänster och information'
  } else if (hasEservice) {
    return 'Digitala tjänster'
  } else if (hasInfo) {
    return 'Information och vägledning'
  }
  
  return 'Relaterade tjänster'
}

function shouldShowFallback(content: string): boolean {
  const fallbackIndicators = [
    'jag är inte säker', 'i\'m not sure', 'ma hubo', 'لست متأكد', 'emin değilim',
    'vet inte', 'don\'t know', 'ma ogtahay', 'لا أعرف', 'bilmiyorum',
    'osäker', 'uncertain', 'hubanti', 'غير متأكد', 'belirsiz'
  ]
  
  return fallbackIndicators.some(indicator => 
    content.toLowerCase().includes(indicator.toLowerCase())
  )
}

function processMessageContent(content: string) {  // First, handle markdown-style bold text formatting and URLs together
  const processTextWithLinksAndFormatting = (text: string) => {
    // Regular expression to match URLs - improved to handle complex URLs with special characters
    const urlRegex = /(https?:\/\/[^\s<>"{}|\\^`[\]]+)/g
    
    // Split by URLs first
    const urlParts = text.split(urlRegex)
      return urlParts.map((part, urlIndex) => {
      if (part.match(urlRegex)) {
        // Clean the URL by removing trailing punctuation that might be sentence-ending
        const cleanUrl = part.replace(/[.,;!?]+$/, '')
        
        // Check if it's a Botkyrka URL for rich preview
        const botkyrkaRegex = /https?:\/\/(www\.)?botkyrka\.se/
        const serviceBotkyrkaRegex = /https?:\/\/service\.botkyrka\.se/
        
        if (botkyrkaRegex.test(cleanUrl) || serviceBotkyrkaRegex.test(cleanUrl)) {
          // Use LinkPreview component for rich previews with real metadata
          return <LinkPreview key={`url-${urlIndex}`} url={cleanUrl} />
        }
        
        // Check if it's an image URL
        const imageRegex = /\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i
        if (imageRegex.test(cleanUrl)) {
          return (
            <div key={`img-${urlIndex}`} className="my-3">
              <img
                src={cleanUrl}
                alt="Image"
                className="rounded-lg max-w-md max-h-96 object-cover"
                onError={(e) => {
                  // Fallback to regular link if image fails to load
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                  const link = target.nextElementSibling as HTMLElement
                  if (link) link.style.display = 'block'
                }}
              />
              <a
                href={cleanUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline text-sm block mt-1"
                style={{ display: 'none' }}
              >
                {cleanUrl}
              </a>
            </div>
          )
        }
        
        // Regular link
        return (
          <a
            key={`link-${urlIndex}`}
            href={cleanUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline break-all"
          >
            {cleanUrl}
          </a>
        )
      } else {
        // Process text formatting for non-URL parts
        // Handle bold formatting (**text**)
        const boldRegex = /\*\*(.*?)\*\*/g
        const boldParts = part.split(boldRegex)
        
        return boldParts.map((boldPart, boldIndex) => {
          // Odd indices are the bold text (captured groups)
          if (boldIndex % 2 === 1) {
            return <strong key={`bold-${urlIndex}-${boldIndex}`} className="font-semibold">{boldPart}</strong>
          }
          return boldPart
        })
      }
    })
  }
  
  return processTextWithLinksAndFormatting(content)
}

export function ChatForm({ className, ...props }: React.ComponentProps<"form">) {
  const { t, i18n } = useTranslation()
  const [showFallback, setShowFallback] = useState(false)
  const [fallbackQuestion, setFallbackQuestion] = useState('')
  const [idleTimer, setIdleTimer] = useState<NodeJS.Timeout | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isScrapingContent, setIsScrapingContent] = useState(false)
  const [hasShownDetailedInstructions, setHasShownDetailedInstructions] = useState(false)

  const append = useCallback(async (message: { content: string; role: 'user' }) => {
    const userMessage: Message = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: message.content
    }

    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: updatedMessages
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }      const data = await response.json()
      
      // Check if response contains detailed instructions about botkyrka.se
      const hasDetailedInstructions = data.content.toLowerCase().includes('för detaljerade instruktioner') || 
                                     data.content.toLowerCase().includes('besök botkyrka.se')
      
      // If we've already shown detailed instructions, filter them out to avoid repetition
      let filteredContent = data.content
      if (hasShownDetailedInstructions && hasDetailedInstructions) {        // Remove repetitive instruction sentences
        filteredContent = data.content
          .split('.')
          .filter((sentence: string) => {
            const lowerSentence = sentence.toLowerCase()
            return !(lowerSentence.includes('för detaljerade instruktioner') || 
                    lowerSentence.includes('besök botkyrka.se') ||
                    lowerSentence.includes('där hittar du all information'))
          })
          .join('.')
          .replace(/\.\s*\./g, '.') // Clean up double periods
          .trim()
      }
      
      // Mark that we've shown detailed instructions
      if (hasDetailedInstructions) {
        setHasShownDetailedInstructions(true)
      }
      
      const assistantMessage: Message = {
        id: `assistant_${Date.now()}`,
        role: 'assistant',
        content: filteredContent
      }

      setMessages(prev => [...prev, assistantMessage])

      // Check if the response indicates uncertainty
      if (shouldShowFallback(data.content)) {
        setFallbackQuestion(message.content)
        setShowFallback(true)
      }
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage: Message = {
        id: `error_${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, something went wrong. Please try again.'
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }, [messages])

  // Reset idle timer on any activity
  useEffect(() => {
    if (idleTimer) clearTimeout(idleTimer)
    
    if (messages.length > 0) {
      const timer = setTimeout(() => {
        // Show idle prompt only if no fallback dialog is open
        if (!showFallback) {        const idleMessage: Message = {
          id: `idle_${Date.now()}`,
          role: 'assistant',
          content: t('idlePrompt')
        }
        setMessages(prev => [...prev, idleMessage])
        }
      }, 300000) // 5 minutes
      
      setIdleTimer(timer)
    }
    
    return () => {
      if (idleTimer) clearTimeout(idleTimer)
    }
  }, [messages.length, showFallback, t, setMessages])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!input.trim()) return
    
    // Check for goodbye messages
    const goodbyeKeywords = ['tack', 'thanks', 'mahadsanid', 'شكرا', 'teşekkürler', 'hej då', 'goodbye', 'bay bay']
    if (goodbyeKeywords.some(keyword => input.toLowerCase().includes(keyword.toLowerCase()))) {
      const goodbyeMessage: Message = {
        id: `goodbye_${Date.now()}`,
        role: 'assistant',
        content: t('goodbye')
      }
      setMessages(prev => [...prev, 
        { id: `user_${Date.now()}`, role: 'user', content: input },
        goodbyeMessage
      ])
      setInput("")
      return
    }
    
    void append({ 
      content: input, 
      role: "user",
    })
    setInput("")
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>)
    }
  }

  const handleQuickAction = (action: string) => {
    setInput(action)
  }

  const handleInputChange = (value: string) => {
    setInput(value)
  }

  const handleFeedback = (helpful: boolean, comment?: string) => {
    // Feedback is already sent by MessageFeedback component
    console.log('Feedback received:', { helpful, comment })
  }

  const handleSendToKommun = (questionText?: string) => {
    setFallbackQuestion(questionText || input || 'General inquiry')
    setShowFallback(true)
  }

  const handleTryAnother = () => {
    setShowFallback(false)
    setFallbackQuestion('')
    // Focus back on input
    setTimeout(() => {
      const textarea = document.querySelector('textarea')
      textarea?.focus()
    }, 100)
  }
  const handleNewChat = () => {
    setMessages([])
    setInput('')
    setShowFallback(false)
    setFallbackQuestion('')
    setHasShownDetailedInstructions(false) // Reset instruction tracking
    if (idleTimer) clearTimeout(idleTimer)
    // Focus on input after clearing
    setTimeout(() => {
      const textarea = document.querySelector('textarea')
      textarea?.focus()
    }, 100)
  }

  const currentLanguage = SUPPORTED_LANGUAGES[i18n.language as LanguageCode] || SUPPORTED_LANGUAGES.sv

  // Show initial greeting if no messages
  const showGreeting = messages.length === 0

  const header = (
    <header className="flex flex-col items-center text-center px-4 py-6 max-w-md mx-auto">
      <div className="flex items-center justify-between w-full mb-4">
        <div></div>
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-600">
          <ClientOnly fallback="BotKyrka">
            {t('title')}
          </ClientOnly>
        </h1>
        <ClientOnly>
          <LanguageSelector />
        </ClientOnly>
      </div>
      
      {/* Welcome message */}
      <Card className="w-full max-w-[85%] mb-4">
        <CardContent className="p-4">
          <p className="text-gray-800 text-sm sm:text-base">
            <ClientOnly fallback="Hej! Hur kan jag hjälpa dig idag?">
              {t('greeting')}
            </ClientOnly>
          </p>
        </CardContent>
      </Card>
      
      {/* Context hint */}
      <p className="text-gray-500 text-xs sm:text-sm mb-6 px-2">
        <ClientOnly fallback="Fråga mig om vad som helst gällande Botkyrkas tjänster—t.ex. förskola, boende eller avfallshantering.">
          {t('contextHint')}
        </ClientOnly>
      </p>
      
      <div className="w-full">
        <ClientOnly>
          <QuickActions onActionClick={handleQuickAction} />
        </ClientOnly>
      </div>
    </header>
  )

  const messageList = (
    <div className="flex-1 flex flex-col">
      {/* Chat header with better spacing and alignment */}
      <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-4 py-3 z-10">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          {/* Left side - New Chat button with fixed width */}
          <div className="w-20 flex justify-start">
            <ClientOnly>
              <Button
                onClick={handleNewChat}
                variant="outline"
                size="sm"
                className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-colors flex items-center gap-1.5"
              >
                <MessageSquareIcon className="h-4 w-4" />
                <span className="hidden sm:inline text-xs">{t('newChat')}</span>
                <span className="sm:hidden text-xs">{t('newChat').split(' ')[0]}</span>
              </Button>
            </ClientOnly>
          </div>
          
          {/* Center - Title with flex-1 for perfect centering */}
          <div className="flex-1 flex justify-center">
            <h1 className="text-lg sm:text-xl font-semibold text-blue-600">
              <ClientOnly fallback="BotKyrka">
                {t('title')}
              </ClientOnly>
            </h1>
          </div>
          
          {/* Right side - Language selector with fixed width */}
          <div className="w-20 flex justify-end">
            <ClientOnly>
              <LanguageSelector />
            </ClientOnly>
          </div>
        </div>
      </div>
      
      {/* Messages container with proper padding */}
      <div className="flex-1 px-4 py-4 space-y-4 overflow-y-auto">        {messages.map((message, index) => {
          // Don't show separate action links anymore - all links should be embedded in content
          
          return (
            <div key={index} className="flex flex-col">
              <Card className={cn(
                "max-w-[85%] sm:max-w-[75%] border-0 shadow-sm",
                message.role === 'assistant' 
                  ? "self-start bg-gray-50" 
                  : "self-end bg-blue-500 text-white"
              )}>
                <CardContent className="p-4">
                  <div className="whitespace-pre-wrap text-sm sm:text-base leading-relaxed">
                    {processMessageContent(message.content)}
                  </div>
                  
                  {message.role === 'assistant' && (
                    <>
                      <Separator className="my-3" />
                      <ClientOnly>
                        <MessageFeedback
                          messageIndex={index}
                          messageContent={message.content}
                          onFeedback={handleFeedback}
                          onSendToKommun={() => handleSendToKommun(message.content)}
                        />
                      </ClientOnly>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          )
        })}
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="flex flex-col">
            <Card className="max-w-[85%] sm:max-w-[75%] self-start bg-gray-50 border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <RefreshCwIcon className="h-4 w-4 animate-spin text-blue-500" />
                  <span className="text-sm text-gray-600">
                    <ClientOnly fallback="Thinking...">
                      {isScrapingContent ? t('scraping_content') : t('thinking')}
                    </ClientOnly>
                  </span>
                </div>
                {isScrapingContent && (
                  <div className="mt-2 flex items-center space-x-2 text-xs text-blue-600">
                    <ExternalLinkIcon className="h-3 w-3" />
                    <span>
                      <ClientOnly fallback="Getting latest information from Botkyrka website...">
                        {t('fetching_content')}
                      </ClientOnly>
                    </span>
                  </div>
                )}
                <div className="mt-2 space-y-2">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
        {messages.length === 0 && (
          <ClientOnly>
            <QuickActions onActionClick={handleQuickAction} />
          </ClientOnly>
        )}
      </div>
    </div>
  )

  return (
    <>
      <main
        className={cn(
          "flex h-screen max-h-screen w-full flex-col bg-white relative",
          className,
        )}
        {...props}
      >
        <div className="flex-1 overflow-y-auto">
          <ClientOnly fallback={
            <div className="flex flex-col items-center text-center px-4 py-6 max-w-md mx-auto">
              <h1 className="text-2xl sm:text-3xl font-bold text-blue-600 mb-4">
                BotKyrka
              </h1>
              <Card className="w-full max-w-[85%] mb-4">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-3/4 mx-auto" />
                    <Skeleton className="h-4 w-1/2 mx-auto" />
                  </div>
                </CardContent>
              </Card>
            </div>
          }>
            {showGreeting ? header : messageList}
          </ClientOnly>
        </div>
        
        <div className="border-t bg-gradient-to-r from-gray-50 to-white p-4 shadow-lg">          <form
            onSubmit={handleSubmit}
            className="flex items-end gap-3 max-w-4xl mx-auto"
          >            <div className="flex-1 flex items-center gap-2">
              <div className="flex-1 relative">
                <AutoResizeTextarea
                  onKeyDown={handleKeyDown}
                  onChange={handleInputChange}
                  value={input}
                  placeholder={t('placeholder')}
                  className="w-full min-h-[52px] max-h-32 px-5 py-4 pr-5 text-base border-2 border-gray-200 rounded-3xl resize-none focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 shadow-sm bg-white transition-all duration-200 placeholder:text-gray-400 overflow-hidden scrollbar-none"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                />
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    variant="ghost" 
                    size="sm" 
                    className="h-10 w-10 p-0 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all duration-200 flex-shrink-0"
                  >
                    {isLoading ? (
                      <RefreshCwIcon size={18} className="text-white animate-spin" />
                    ) : (
                      <ArrowUpIcon size={18} className="text-white" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent sideOffset={12} className="bg-gray-800 text-white">
                  {isLoading ? t('sending') : t('sendMessage')}
                </TooltipContent>
              </Tooltip>
            </div>
          </form>
          
          {/* Privacy note */}
          <ClientOnly fallback={
            <div className="text-center mt-3">
              <Skeleton className="h-3 w-48 mx-auto" />
            </div>
          }>
            <p className="text-xs text-muted-foreground text-center mt-3 font-medium tracking-wide">
              {t('privacyNote')}
            </p>
          </ClientOnly>
        </div>
      </main>

      {/* Fallback Dialog Overlay */}
      {showFallback && (
        <ClientOnly>
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <FallbackDialog
              questionText={fallbackQuestion}
              onClose={() => setShowFallback(false)}
              onTryAnother={handleTryAnother}
            />
          </div>
        </ClientOnly>
      )}
    </>
  )
}
