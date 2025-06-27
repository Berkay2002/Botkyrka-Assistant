'use client'

import { ReactNode } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ExternalLink, MapPin, Phone, Mail, Clock } from 'lucide-react'

interface StructuredResponseProps {
  content: string
  language: string
}

interface ParsedContent {
  type: 'text' | 'list' | 'table' | 'contact' | 'steps' | 'links' | 'schools' | 'header'
  content: any
}

export default function StructuredResponse({ content, language }: StructuredResponseProps) {
  // Clean up messy markdown formatting
  const cleanContent = (text: string): string => {
    return text
      // Remove multiple asterisks and clean up bold formatting
      .replace(/\*{3,}/g, '**')
      .replace(/\*\*\*([^*]+)\*\*\*/g, '**$1**')
      
      // Clean up separators and headers but preserve structure
      .replace(/^---\s*#+\s*\*{0,2}/gm, '\n**')
      .replace(/^---\s*/gm, '\n')
      .replace(/^#+\s*\*{0,2}/gm, '**')
      
      // Clean up list formatting
      .replace(/^\*{2,}([^*:]+):\*{0,2}/gm, '\n**$1:**')
      .replace(/^\*{2,}([^*]+)\*{0,2}$/gm, '• $1')
      .replace(/^-{2,}\s*/gm, '• ')
      
      // Clean up contact formatting while preserving structure
      .replace(/\*{2,}([^*]*(?:Telefon|Phone|E-post|Email)[^*]*?):\*{0,2}/gi, '\n**$1:**')
      
      // Clean up excess spaces but preserve paragraph breaks
      .replace(/[ \t]+/g, ' ')
      .replace(/\n[ \t]+/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
  }

  const parseContent = (text: string): ParsedContent[] => {
    const cleanedText = cleanContent(text)
    const sections: ParsedContent[] = []
    const lines = cleanedText.split('\n').filter(line => line.trim())
    
    let currentSection: ParsedContent | null = null
    let buffer: string[] = []
    
    for (const line of lines) {
      const trimmed = line.trim()
      
      // Detect headers (lines with **bold** text or ending with :)
      if (trimmed.match(/^\*\*.*\*\*:?$/) || (trimmed.endsWith(':') && !trimmed.includes('http') && trimmed.length < 60)) {
        if (buffer.length > 0) {
          sections.push({ type: 'text', content: buffer.join('\n') })
          buffer = []
        }
        if (currentSection) {
          sections.push(currentSection)
          currentSection = null
        }
        sections.push({ type: 'header', content: trimmed.replace(/\*\*/g, '') })
      }
      // Detect school lists (specific pattern for schools)
      else if (trimmed.match(/^[•\-\*]\s+.*[Ss]chool|.*[Ss]kola/) || 
               (trimmed.match(/^[•\-\*]\s+/) && (trimmed.toLowerCase().includes('grundskola') || trimmed.toLowerCase().includes('förskola')))) {
        if (currentSection?.type !== 'schools') {
          if (buffer.length > 0) {
            sections.push({ type: 'text', content: buffer.join('\n') })
            buffer = []
          }
          if (currentSection) {
            sections.push(currentSection)
          }
          currentSection = { type: 'schools', content: [] }
        }
        const schoolInfo = trimmed.replace(/^[•\-\*]\s+/, '').replace(/^\d+\.\s+/, '')
        currentSection.content.push(schoolInfo)
      }
      // Detect regular lists (bullet points or numbers)
      else if (trimmed.match(/^[•\-\*]\s+/) || trimmed.match(/^\d+\.\s+/)) {
        if (currentSection?.type !== 'list') {
          if (buffer.length > 0) {
            sections.push({ type: 'text', content: buffer.join('\n') })
            buffer = []
          }
          if (currentSection) {
            sections.push(currentSection)
          }
          currentSection = { type: 'list', content: [] }
        }
        const item = trimmed.replace(/^[•\-\*]\s+/, '').replace(/^\d+\.\s+/, '')
        currentSection.content.push(item)
      }
      // Detect contact information
      else if (trimmed.includes('@') || trimmed.includes('tel:') || trimmed.includes('Telefon:') || 
               trimmed.includes('Adress:') || trimmed.includes('Phone:') || trimmed.includes('Email:')) {
        if (buffer.length > 0) {
          sections.push({ type: 'text', content: buffer.join('\n') })
          buffer = []
        }
        if (currentSection?.type !== 'contact') {
          if (currentSection) {
            sections.push(currentSection)
          }
          currentSection = { type: 'contact', content: [] }
        }
        currentSection.content.push(trimmed)
      }
      // Detect steps (numbered processes)
      else if (trimmed.match(/^Steg \d+:|^Step \d+:|^\d+\)/) || 
               (trimmed.match(/^\d+\./) && (trimmed.toLowerCase().includes('ansök') || trimmed.toLowerCase().includes('apply') || trimmed.toLowerCase().includes('complete')))) {
        if (currentSection?.type !== 'steps') {
          if (buffer.length > 0) {
            sections.push({ type: 'text', content: buffer.join('\n') })
            buffer = []
          }
          if (currentSection) {
            sections.push(currentSection)
          }
          currentSection = { type: 'steps', content: [] }
        }
        currentSection.content.push(trimmed)
      }
      // Regular text
      else {
        if (currentSection && currentSection.type !== 'text') {
          sections.push(currentSection)
          currentSection = null
        }
        buffer.push(trimmed)
      }
    }
    
    // Add remaining buffer
    if (buffer.length > 0) {
      sections.push({ type: 'text', content: buffer.join('\n') })
    }
    
    // Add remaining section
    if (currentSection) {
      sections.push(currentSection)
    }
    
    return sections
  }
  
  const renderLinks = (text: string): ReactNode => {
    const urlRegex = /(https?:\/\/[^\s\)]+)/g
    const parts = text.split(urlRegex)
    
    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        const isBotkyrkaUrl = part.includes('botkyrka.se')
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 underline ${
              isBotkyrkaUrl ? 'font-medium' : ''
            }`}
          >
            {isBotkyrkaUrl ? '🏛️ Botkyrka' : '🔗 Länk'}
            <ExternalLink className="h-3 w-3" />
          </a>
        )
      } else {
        // Process bold formatting
        return renderBoldText(part)
      }
    })
  }
  
  const renderBoldText = (text: string): ReactNode => {
    const boldRegex = /\*\*(.*?)\*\*/g
    const parts = text.split(boldRegex)
    
    return parts.map((part, index) => {
      // Odd indices are the bold text (captured groups)
      if (index % 2 === 1) {
        return <strong key={index} className="font-semibold">{part}</strong>
      }
      return part
    })
  }
  
  const renderSection = (section: ParsedContent, index: number): ReactNode => {
    switch (section.type) {
      case 'header':
        return (
          <div key={index} className="my-6">
            <h3 className="text-lg font-bold text-gray-900 border-b-2 border-blue-200 pb-2">
              {renderLinks(section.content)}
            </h3>
          </div>
        )

      case 'schools':
        return (
          <div key={index} className="my-4">
            <div className="grid gap-3">
              {section.content.map((school: string, schoolIndex: number) => {
                // Try to extract school name and location/details
                const parts = school.split(/[\(\)]/);
                const schoolName = parts[0]?.trim();
                const schoolDetails = parts[1]?.trim();
                
                return (
                  <Card key={schoolIndex} className="border-l-4 border-l-blue-500 bg-blue-50/30">
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <div className="min-w-0 flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">
                            {schoolName || school}
                          </h4>
                          {schoolDetails && (
                            <p className="text-sm text-gray-600 mb-2">
                              📍 {schoolDetails}
                            </p>
                          )}
                          <div className="text-sm">
                            {renderLinks(school)}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )
        
      case 'list':
        return (
          <div key={index} className="my-4">
            <ul className="space-y-2">
              {section.content.map((item: string, itemIndex: number) => (
                <li key={itemIndex} className="flex items-start gap-3">
                  <span className="text-blue-600 font-bold mt-1">•</span>
                  <span className="flex-1">{renderLinks(item)}</span>
                </li>
              ))}
            </ul>
          </div>
        )
        
      case 'steps':
        return (
          <div key={index} className="my-4">
            <div className="space-y-3">
              {section.content.map((step: string, stepIndex: number) => (
                <div key={stepIndex} className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-1 min-w-fit bg-blue-100 text-blue-800 border-blue-300">
                    {stepIndex + 1}
                  </Badge>
                  <span className="flex-1">{renderLinks(step)}</span>
                </div>
              ))}
            </div>
          </div>
        )
        
      case 'contact':
        return (
          <Card key={index} className="my-4 bg-green-50 border-green-200">
            <CardContent className="pt-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-green-800 mb-3">📞 Kontaktinformation</h4>
                {section.content.map((contact: string, contactIndex: number) => (
                  <div key={contactIndex} className="flex items-center gap-2 text-sm">
                    {contact.includes('@') && <Mail className="h-4 w-4 text-green-600" />}
                    {(contact.includes('Telefon:') || contact.includes('Phone:')) && <Phone className="h-4 w-4 text-green-600" />}
                    {contact.includes('Adress:') && <MapPin className="h-4 w-4 text-green-600" />}
                    {contact.includes('Öppet:') && <Clock className="h-4 w-4 text-green-600" />}
                    <span>{renderLinks(contact)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )
        
      default:
        return (
          <div key={index} className="my-2">
            <p className="text-gray-800 leading-relaxed">
              {renderLinks(section.content)}
            </p>
          </div>
        )
    }
  }
  
  const sections = parseContent(content)
  
  return (
    <div className="space-y-2">
      {sections.map((section, index) => renderSection(section, index))}
    </div>
  )
}
