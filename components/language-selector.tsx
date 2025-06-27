"use client"

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SUPPORTED_LANGUAGES, type LanguageCode } from '@/lib/i18n'
import ReactCountryFlag from 'react-country-flag'

export function LanguageSelector() {
  const { i18n } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)

  const currentLanguage = SUPPORTED_LANGUAGES[i18n.language as LanguageCode] || SUPPORTED_LANGUAGES.sv

  const handleLanguageChange = (langCode: LanguageCode) => {
    i18n.changeLanguage(langCode)
    setIsOpen(false)
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-[22px] w-[30px] p-0 hover:bg-blue-50 rounded-sm border-2 border-transparent hover:border-blue-200 transition-all duration-200 shadow-sm"
        >
          <ReactCountryFlag 
            countryCode={currentLanguage.countryCode} 
            svg 
            style={{
              width: '24px',
              height: '18px',
              borderRadius: '2px'
            }}
          />
        </Button>
      </DropdownMenuTrigger><DropdownMenuContent align="end" className="w-44 bg-white/95 backdrop-blur-sm border border-gray-200 shadow-xl rounded-xl">
        {Object.values(SUPPORTED_LANGUAGES).map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className="flex items-center gap-3 cursor-pointer py-2.5 px-3 hover:bg-blue-50 rounded-lg mx-1"
          >
            <ReactCountryFlag 
              countryCode={lang.countryCode} 
              svg 
              style={{
                width: '20px',
                height: '15px',
                borderRadius: '2px'
              }}
            />
            <span className="text-sm font-medium text-gray-700">{lang.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
