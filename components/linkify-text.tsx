'use client'

import { ExternalLink, Globe } from 'lucide-react'

interface LinkifyTextProps {
  text: string
  className?: string
}

// Enhanced utility to convert URLs in text to clickable links with previews
export function LinkifyText({ text, className = "" }: LinkifyTextProps) {
  const urlRegex = /(https?:\/\/[^\s\]]+)/g
  
  // Split text and identify URLs
  const parts = text.split(urlRegex)
  
  return (
    <div className={`space-y-2 ${className}`}>
      {parts.map((part, index) => {
        if (urlRegex.test(part)) {
          // Extract domain for better display
          const url = part.trim()
          let displayUrl = url
          let domain = ''
          
          try {
            const urlObj = new URL(url)
            domain = urlObj.hostname
            displayUrl = url.length > 60 ? `${url.substring(0, 60)}...` : url
          } catch {
            // If URL parsing fails, use the original
            displayUrl = url.length > 60 ? `${url.substring(0, 60)}...` : url
          }
          
          return (
            <div key={index} className="my-2">
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 p-3 border border-blue-200 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors group max-w-full"
              >
                <Globe className="h-4 w-4 text-blue-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-blue-900 truncate">
                    {domain && domain.includes('botkyrka.se') ? '🏛️ Botkyrka Kommun' : domain}
                  </div>
                  <div className="text-xs text-blue-700 truncate">
                    {displayUrl}
                  </div>
                </div>
                <ExternalLink className="h-4 w-4 text-blue-600 group-hover:text-blue-800 flex-shrink-0" />
              </a>
            </div>
          )
        }
        
        // Regular text - preserve line breaks and spacing
        return (
          <span key={index} className="whitespace-pre-wrap">
            {part}
          </span>
        )
      })}
    </div>
  )
}

// Alternative simple linkify for inline use
export function SimpleLinkify({ text }: { text: string }) {
  const urlRegex = /(https?:\/\/[^\s\]]+)/g
  const parts = text.split(urlRegex)
  
  return (
    <>
      {parts.map((part, index) => {
        if (urlRegex.test(part)) {
          const url = part.trim()
          const displayUrl = url.length > 50 ? `${url.substring(0, 50)}...` : url
          
          return (
            <a
              key={index}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline inline-flex items-center gap-1"
            >
              {displayUrl}
              <ExternalLink className="h-3 w-3" />
            </a>
          )
        }
        return <span key={index}>{part}</span>
      })}
    </>
  )
}
