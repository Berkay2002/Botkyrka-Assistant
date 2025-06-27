"use client"

import { useState, useEffect } from 'react'
import { ExternalLinkIcon } from 'lucide-react'

interface MetaData {
  title?: string
  description?: string
  image?: string
  siteName?: string
  url?: string
}

interface LinkPreviewProps {
  url: string
  className?: string
}

export function LinkPreview({ url, className }: LinkPreviewProps) {
  const [metadata, setMetadata] = useState<MetaData | null>(null)
  const [imageError, setImageError] = useState(false)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        // Try POST first
        let response = await fetch('/api/metadata', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url }),
        })

        // If POST fails with 405, try GET
        if (!response.ok && response.status === 405) {
          response = await fetch(`/api/metadata?url=${encodeURIComponent(url)}`, {
            method: 'GET',
          })
        }

        if (response.ok) {
          const data = await response.json()
          setMetadata(data)
        } else {
          // Fallback for Botkyrka URLs with more specific metadata
          setMetadata(createClientFallbackMetadata(url))
        }
      } catch (error) {
        console.error('Error fetching metadata:', error)
        // Fallback for Botkyrka URLs
        setMetadata(createClientFallbackMetadata(url))
      } finally {
        setLoading(false)
      }
    }

    fetchMetadata()
  }, [url])

  // Client-side fallback metadata generator
  const createClientFallbackMetadata = (url: string): MetaData => {
    if (url.includes('sjalvservice.botkyrka.se')) {
      const params = new URLSearchParams(url.split('?')[1] || '')
      const searchTerm = params.get('q') || ''
      
      if (searchTerm.includes('Förskola') || searchTerm.includes('F%C3%B6rskola')) {
        return {
          title: 'E-tjänster: Förskola',
          description: 'Ansök om förskola, ändra uppgifter och hantera din förskoleansökan digitalt.',
          siteName: 'Botkyrka kommun',
          url
        }
      } else if (searchTerm.includes('Grundskola')) {
        return {
          title: 'E-tjänster: Grundskola',
          description: 'Digitala tjänster för grundskola: ansökan, skolbyte och andra skolärenden.',
          siteName: 'Botkyrka kommun',
          url
        }
      } else if (searchTerm.includes('Boende')) {
        return {
          title: 'E-tjänster: Boende och närmiljö',
          description: 'Digitala tjänster för bygglov, bostadsbidrag och andra boendefrågor.',
          siteName: 'Botkyrka kommun',
          url
        }
      } else if (searchTerm.includes('Stöd')) {
        return {
          title: 'E-tjänster: Stöd och trygghet',
          description: 'Digitala tjänster för ekonomiskt stöd, äldreomsorg och andra trygghetsfrågor.',
          siteName: 'Botkyrka kommun',
          url
        }
      }
      
      return {
        title: 'Självservice och blanketter',
        description: 'Digitala tjänster och blanketter från Botkyrka kommun. Ansök och anmäl dig online.',
        siteName: 'Botkyrka kommun',
        url
      }
    } else if (url.includes('service.botkyrka.se')) {
      if (url.includes('groupId=12')) {
        return {
          title: 'Servicegrupp: Skola och förskola',
          description: 'Kontakt och support för skola och förskola. Hitta rätt person för ditt barns utbildning.',
          siteName: 'Botkyrka kommun',
          url
        }
      } else if (url.includes('groupId=15')) {
        return {
          title: 'Servicegrupp: Stöd, omsorg och familj',
          description: 'Kontakt och support för stöd, omsorg och familjetjänster.',
          siteName: 'Botkyrka kommun',
          url
        }
      } else if (url.includes('groupId=5')) {
        return {
          title: 'Servicegrupp: Boende och närmiljö',
          description: 'Kontakt och support för boende, bygglov och närmiljöfrågor.',
          siteName: 'Botkyrka kommun',
          url
        }
      }
      
      return {
        title: 'Servicegrupper - Botkyrka kommun',
        description: 'Hitta rätt servicegrupp och kontaktinformation för kommunens tjänster.',
        siteName: 'Botkyrka kommun',
        url
      }
    }
    
    return {
      title: 'Botkyrka kommun',
      description: 'Information och tjänster från Botkyrka kommun',
      siteName: 'Botkyrka kommun',
      url
    }
  }

  if (loading) {
    return (
      <div className={`my-3 border-l-4 border-blue-500 bg-gray-50 rounded-r-lg overflow-hidden shadow-sm max-w-md ${className}`}>
        <div className="p-3">
          <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-3 bg-gray-200 rounded animate-pulse mb-1"></div>
          <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3"></div>
        </div>
      </div>
    )
  }

  if (!metadata) return null

  return (
    <div className={`my-3 border-l-4 border-blue-500 bg-gray-50 rounded-r-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow max-w-md ${className}`}>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="block hover:bg-gray-100 transition-colors"
      >
        {metadata.image && !imageError && (
          <div className="aspect-video w-full bg-gray-200">
            <img
              src={metadata.image}
              alt={metadata.title || 'Preview image'}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
              onLoad={(e) => {
                // Ensure image loaded successfully
                const img = e.target as HTMLImageElement
                if (img.naturalWidth === 0) {
                  setImageError(true)
                }
              }}
            />
          </div>
        )}
        <div className="p-3">
          <h4 className="font-semibold text-sm text-blue-600 hover:underline line-clamp-2">
            {metadata.title || 'Botkyrka kommun'}
          </h4>
          {metadata.description && (
            <p className="text-xs text-gray-700 line-clamp-2 leading-relaxed mt-1">
              {metadata.description}
            </p>
          )}
          <div className="flex items-center mt-2 text-xs text-gray-500">
            <span className="truncate">{metadata.siteName || new URL(url).hostname}</span>
            <ExternalLinkIcon size={10} className="ml-1 flex-shrink-0" />
          </div>
        </div>
      </a>
    </div>
  )
}
