// Multilingual chat API endpoint
// Implements the complete flow: language detection → translation → scraping → summarization

import { NextRequest } from 'next/server'
import { 
  detectUserLanguage, 
  detectIntentAndTranslate,
  summarizeAndTranslateResults,
  getGreetingMessage
} from '@/lib/multilingual-gemini'
import { 
  fetchBotkyrkaSearchResults, 
  rankResultsByRelevance,
  scrapePageContent 
} from '@/lib/botkyrka-scraper'

export async function POST(req: NextRequest) {
  try {
    const { message }: { message: string } = await req.json()
    
    if (!message || message.trim().length === 0) {
      return Response.json({ 
        error: 'Message is required' 
      }, { status: 400 })
    }

    console.log('🌐 Processing multilingual query:', message)

    // Step 1: Detect user language
    console.log('🔍 Step 1: Detecting language...')
    const languageDetection = await detectUserLanguage(message)
    console.log('Language detected:', languageDetection)

    // Step 2: Always translate to Swedish for optimal municipality search
    // Even if the user speaks English or Finnish, Swedish searches yield better results
    const targetLanguage = 'sv'
    console.log('🔄 Step 2: Translating to Swedish for optimal search results')

    // Step 3: Detect intent and extract Swedish search keywords
    console.log('🎯 Step 3: Detecting intent and extracting search keywords...')
    const intentTranslation = await detectIntentAndTranslate(
      message,
      languageDetection.languageCode,
      targetLanguage
    )
    console.log('Intent and keywords:', intentTranslation)
    
    // Step 4: Fetch results from Botkyrka municipality website using keywords
    console.log(`🔍 Step 4: Searching Botkyrka with keywords: "${intentTranslation.translatedQuery}"`)
    const searchResults = await fetchBotkyrkaSearchResults(intentTranslation.translatedQuery)
    
    if (!searchResults.success || searchResults.results.length === 0) {
      console.log('❌ No results found or error occurred')
      
      // Return helpful message in user's language
      const noResultsMessages = {
        'sv': 'Jag kunde inte hitta information om det du frågade efter. Försök med andra sökord eller kontakta Botkyrka kommun direkt på botkyrka.se',
        'en': 'I couldn\'t find information about what you asked for. Try different search terms or contact Botkyrka municipality directly at botkyrka.se',
        'so': 'Ma heli karo macluumaad ku saabsan waxa aad waydiisay. Tijaabi erayo kale ama la xiriir degmada Botkyrka si toos ah botkyrka.se',
        'ar': 'لم أتمكن من العثور على معلومات حول ما سألت عنه. جرب كلمات بحث مختلفة أو اتصل ببلدية بوتشيركا مباشرة على botkyrka.se',
        'tr': 'Sorduğunuz hakkında bilgi bulamadım. Farklı arama terimleri deneyin veya Botkyrka belediyesine doğrudan botkyrka.se adresinden ulaşın',
        'fi': 'En löytänyt tietoja siitä, mitä kysyit. Kokeile erilaisia hakusanoja tai ota yhteyttä Botkyrkan kuntaan suoraan osoitteessa botkyrka.se'
      }
      
      return Response.json({
        response: noResultsMessages[languageDetection.languageCode as keyof typeof noResultsMessages] || noResultsMessages['sv'],
        language: languageDetection.languageCode,
        translatedQuery: intentTranslation.translatedQuery,
        intent: intentTranslation.intent,
        resultsFound: 0,
        success: true
      })
    }

    // Step 5: Rank results by relevance
    console.log('📊 Step 5: Ranking results by relevance...')
    const rankedResults = rankResultsByRelevance(searchResults.results, intentTranslation.translatedQuery)
    console.log(`Found ${rankedResults.length} ranked results`)

    // Step 6: Scrape content from the most relevant page for detailed information
    let scrapedContent = ''
    if (rankedResults.length > 0 && rankedResults[0].relevanceScore && rankedResults[0].relevanceScore > 5) {
      console.log('📄 Step 6: Scraping content from top result...')
      const scrapingResult = await scrapePageContent(rankedResults[0].link)
      if (scrapingResult.success) {
        scrapedContent = scrapingResult.content
        console.log(`Scraped ${scrapedContent.length} characters from ${rankedResults[0].link}`)
      }
    }

    // Step 7: Generate multilingual summary
    console.log('📝 Step 7: Generating multilingual summary...')
    const summary = await summarizeAndTranslateResults(
      rankedResults.slice(0, 5), // Top 5 results
      message, // Original user query
      languageDetection.languageCode,
      scrapedContent
    )

    console.log('✅ Multilingual flow completed successfully')

    // Return comprehensive response
    return Response.json({
      response: summary.summary,
      language: languageDetection.languageCode,
      originalQuery: message,
      translatedQuery: intentTranslation.translatedQuery,
      intent: intentTranslation.intent,
      resultsFound: rankedResults.length,
      topLinks: summary.links,
      scrapedContent: scrapedContent.length > 0,
      success: true,
      metadata: {
        languageDetection,
        intentTranslation,
        searchResults: {
          query: searchResults.query,
          totalResults: searchResults.totalResults,
          success: searchResults.success
        },
        processingSteps: [
          'Language Detection',
          'Intent Analysis & Translation',
          'Municipality Search',
          'Result Ranking',
          'Content Scraping',
          'Multilingual Summarization'
        ]
      }
    })

  } catch (error) {
    console.error('❌ Multilingual chat API error:', error)
    
    return Response.json({
      error: 'Sorry, something went wrong processing your request. Please try again.',
      details: error instanceof Error ? error.message : 'Unknown error',
      success: false
    }, { 
      status: 500 
    })
  }
}

// Handle GET requests with greeting
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const lang = searchParams.get('lang') || 'sv'
  
  return Response.json({
    greeting: getGreetingMessage(lang),
    supportedLanguages: [
      { code: 'sv', name: 'Svenska', nativeName: 'Svenska' },
      { code: 'en', name: 'English', nativeName: 'English' },
      { code: 'fi', name: 'Finnish', nativeName: 'Suomi' },
      { code: 'so', name: 'Somali', nativeName: 'Soomaali' },
      { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
      { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' }
    ],
    municipalitySupported: ['sv', 'en', 'fi'],
    apiVersion: '1.0.0'
  })
}
