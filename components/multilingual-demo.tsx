'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Loader2, Globe, MessageCircle, ExternalLink } from 'lucide-react'
import StructuredResponse from '@/components/structured-response'
import { LinkifyText } from '@/components/linkify-text'

const EXAMPLE_QUERIES = [
  {
    language: 'Swedish',
    flag: '🇸🇪',
    query: 'Vilka grundskolor finns i Botkyrka?',
    translation: 'Which elementary schools are available in Botkyrka?'
  },
  {
    language: 'Somali',
    flag: '🇸🇴',
    query: 'Sidee ayaan caruurteyda ugu qoraan dugsi xanaanada?',
    translation: 'How do I register my children for preschool?'
  },
  {
    language: 'Arabic', 
    flag: '🇸🇦',
    query: 'كيف أتقدم بطلب للحصول على ترخيص بناء؟',
    translation: 'How do I apply for a building permit?'
  },
  {
    language: 'Turkish',
    flag: '🇹🇷', 
    query: 'Çocuğumu anaokuluna nasıl kaydettiririm?',
    translation: 'How do I register my child for kindergarten?'
  },
  {
    language: 'English',
    flag: '��',
    query: 'What preschools are available in my area?',
    translation: 'What preschools are available in my area?'
  }
]

interface MultilingualResponse {
  response: string
  language: string
  originalQuery: string
  translatedQuery?: string
  intent: string
  resultsFound: number
  topLinks: Array<{
    url: string
    title: string
    description: string
  }>
  success: boolean
  metadata?: any
}

export default function MultilingualDemo() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<MultilingualResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (testQuery?: string) => {
    const searchQuery = testQuery || query
    if (!searchQuery.trim()) return

    setLoading(true)
    setError(null)
    setResponse(null)

    try {
      const res = await fetch('/api/multilingual-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: searchQuery }),
      })

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`)
      }

      const data = await res.json()
      setResponse(data)
      if (testQuery) setQuery(testQuery)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Globe className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold">Multilingual Botkyrka Assistant</h1>
        </div>
        <p className="text-gray-600">
          Ask questions about municipality services in your native language
        </p>
        <div className="flex flex-wrap justify-center gap-2 mt-4">
          <Badge variant="secondary">🇸🇪 Svenska</Badge>
          <Badge variant="secondary">🇺🇸 English</Badge>
          <Badge variant="secondary">🇫🇮 Suomi</Badge>
          <Badge variant="secondary">🇸🇴 Soomaali</Badge>
          <Badge variant="secondary">🇸🇦 العربية</Badge>
          <Badge variant="secondary">🇹🇷 Türkçe</Badge>
        </div>
      </div>

      {/* Query Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Ask Your Question
          </CardTitle>
          <CardDescription>
            Type your question in any supported language
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Example: Sidee ayaan caruurteyda ugu qoraan dugsi xanaanada? (Somali)&#10;Example: كيف أتقدم بطلب للحصول على ترخيص بناء؟ (Arabic)&#10;Example: Hur ansöker jag om förskola? (Swedish)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            rows={4}
            className="resize-none"
          />
          <Button 
            onClick={() => handleSubmit()} 
            disabled={loading || !query.trim()}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Ask Question'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Example Queries */}
      <Card>
        <CardHeader>
          <CardTitle>Try These Examples</CardTitle>
          <CardDescription>
            Click any example to test the multilingual functionality
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {EXAMPLE_QUERIES.map((example, index) => (
              <div
                key={index}
                className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => handleSubmit(example.query)}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{example.flag}</span>
                  <div className="flex-1">
                    <div className="font-medium text-sm text-gray-600 mb-1">
                      {example.language}
                    </div>
                    <div className="font-semibold mb-1">{example.query}</div>
                    <div className="text-sm text-gray-500 italic">
                      {example.translation}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-700">
              <span className="font-semibold">Error:</span>
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Response Display */}
      {response && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Response</span>
              <div className="flex gap-2">
                <Badge variant="outline">
                  {response.language.toUpperCase()}
                </Badge>
                <Badge variant="outline">
                  {response.intent}
                </Badge>
                <Badge variant="outline">
                  {response.resultsFound} results
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Original and Translated Query */}
            {response.translatedQuery && response.translatedQuery !== response.originalQuery && (
              <div className="p-3 bg-blue-50 rounded-lg space-y-2">
                <div>
                  <span className="font-semibold text-sm text-blue-700">Original Query:</span>
                  <div className="text-blue-900">{response.originalQuery}</div>
                </div>
                <div>
                  <span className="font-semibold text-sm text-blue-700">Translated for Search:</span>
                  <div className="text-blue-900">{response.translatedQuery}</div>
                </div>
              </div>
            )}

            {/* Main Response */}
            <div className="prose prose-sm max-w-none">
              <StructuredResponse 
                content={response.response} 
                language={response.language} 
              />
            </div>

            {/* Top Links */}
            {response.topLinks && response.topLinks.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Relevant Links:</h4>
                <div className="space-y-2">
                  {response.topLinks.map((link, index) => (
                    <a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-3 border rounded-lg hover:bg-gray-50 transition-colors group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-blue-600 group-hover:text-blue-800">
                            {link.title}
                          </div>
                          {link.description && (
                            <div className="text-sm text-gray-600 mt-1">
                              {link.description}
                            </div>
                          )}
                        </div>
                        <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-blue-600 ml-2 mt-1" />
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Metadata */}
            {response.metadata && (
              <details className="text-xs text-gray-500">
                <summary className="cursor-pointer font-medium">Technical Details</summary>
                <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                  {JSON.stringify(response.metadata, null, 2)}
                </pre>
              </details>
            )}
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="text-sm text-blue-800">
            <strong>How it works:</strong> The system detects your language, translates your query to Swedish 
            (regardless of original language for optimal search results), searches the official Botkyrka municipality website, 
            and provides a response in your original language with links to the official Swedish pages.
            <br/><br/>
            <strong>Key Fix:</strong> All queries are now translated to Swedish before searching, ensuring maximum 
            compatibility with Botkyrka's search system.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
