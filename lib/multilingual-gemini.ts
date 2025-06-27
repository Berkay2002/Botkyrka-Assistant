// Multilingual Gemini service for Botkyrka Assistant
// Handles intent detection, translation, and response summarization

import { GoogleGenAI } from "@google/genai"

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })

/**
 * Helper function to clean JSON responses from Gemini that may be wrapped in markdown
 */
function cleanJSON(jsonWithMarkdown: string): string {
  return jsonWithMarkdown
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim()
}

export interface LanguageDetection {
  language: string
  confidence: number
  languageCode: string // ISO code like 'sv', 'en', 'so', 'ar', 'tr'
}

export interface IntentTranslation {
  originalQuery: string
  translatedQuery: string
  originalLanguage: string
  targetLanguage: string
  intent: string
  confidence: number
}

export interface MultilingualSummary {
  summary: string
  language: string
  sourceLanguage: string
  links: Array<{
    url: string
    title: string
    description: string
  }>
}

// Supported languages for Botkyrka municipality
const SUPPORTED_LANGUAGES = {
  'sv': { name: 'Swedish', nativeName: 'Svenska' },
  'en': { name: 'English', nativeName: 'English' },
  'fi': { name: 'Finnish', nativeName: 'Suomi' },
  'so': { name: 'Somali', nativeName: 'Soomaali' },
  'ar': { name: 'Arabic', nativeName: 'العربية' },
  'tr': { name: 'Turkish', nativeName: 'Türkçe' }
}

const MUNICIPALITY_SUPPORTED_LANGUAGES = ['sv', 'en', 'fi']

/**
 * Detect the language of user input using Gemini
 */
export async function detectUserLanguage(text: string): Promise<LanguageDetection> {
  try {
    const prompt = `
    Detect the language of this text and provide the ISO language code.
    
    Text: "${text}"
    
    Supported languages:
    - Swedish (sv)
    - English (en) 
    - Finnish (fi)
    - Somali (so)
    - Arabic (ar)
    - Turkish (tr)
    
    Respond ONLY with this JSON format:
    {
      "language": "language_name",
      "languageCode": "iso_code",
      "confidence": 0.95
    }
    `
    
    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt
    })
    
    const responseText = result.text || ''
    
    // Parse JSON response
    const parsed = JSON.parse(cleanJSON(responseText))
    
    return {
      language: parsed.language,
      confidence: parsed.confidence,
      languageCode: parsed.languageCode
    }
    
  } catch (error) {
    console.error('Error detecting language:', error)
    console.log('🔄 Using local language detection fallback...')
    
    // Use local detection as fallback
    return detectLanguageLocally(text)
  }
}

/**
 * Detect intent and extract search keywords using Gemini
 */
export async function detectIntentAndTranslate(
  query: string, 
  userLanguage: string,
  targetLanguage: string = 'sv'
): Promise<IntentTranslation> {
  try {
    const prompt = `
    You are an expert in Swedish municipality services. Analyze this user query and:
    1. Detect the intent/category
    2. Extract the KEY SEARCH TERMS that would work best on a Swedish municipality website
    
    User query (in ${userLanguage}): "${query}"
    
    Municipality service categories:
    - Förskola (preschool/daycare)
    - Grundskola (elementary school)
    - Bygglov (building permits)
    - Boende och miljö (housing and environment)
    - Stöd och trygghet (support and safety)
    - Jobb (employment)
    - Sport och kultur (sports and culture)
    - Trafik och parkering (traffic and parking)
    - Utbildning för vuxna (adult education)
    
    IMPORTANT: For "translatedQuery", provide ONLY the key search terms in Swedish that would work best in a search engine, NOT a full sentence.
    
    Examples:
    - "How do I register my child for preschool?" → "förskola ansökan"
    - "Which schools are available?" → "grundskolor"
    - "How to apply for building permit?" → "bygglov ansökan"
    - "Where can I recycle?" → "återvinning"
    
    Respond ONLY with this JSON format:
    {
      "originalQuery": "${query}",
      "translatedQuery": "key_search_terms_in_swedish",
      "originalLanguage": "${userLanguage}",
      "targetLanguage": "${targetLanguage}",
      "intent": "detected_category",
      "confidence": 0.85
    }
    `
    
    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt
    })
    
    const responseText = result.text || ''
    
    // Parse JSON response
    const parsed = JSON.parse(cleanJSON(responseText))
    
    return {
      originalQuery: query,
      translatedQuery: parsed.translatedQuery,
      originalLanguage: userLanguage,
      targetLanguage: targetLanguage,
      intent: parsed.intent,
      confidence: parsed.confidence
    }
    
  } catch (error) {
    console.error('Error detecting intent and translating:', error)
    console.error('Original query:', query)
    console.error('Target language:', targetLanguage)
    console.log('🔄 Using enhanced local keyword extraction...')
    
    // Fallback: extract better keywords locally
    const fallbackKeywords = extractFallbackKeywords(query, userLanguage)
    
    return {
      originalQuery: query,
      translatedQuery: fallbackKeywords,
      originalLanguage: userLanguage,
      targetLanguage: targetLanguage,
      intent: fallbackKeywords.includes('rektor') ? 'Grundskola' : 'general',
      confidence: 0.5 // Better confidence since we have better fallback logic
    }
  }
}

/**
 * Fallback keyword extraction if Gemini fails
 */
function extractFallbackKeywords(query: string, language: string): string {
  const queryLower = query.toLowerCase()
  
  // Enhanced school-specific patterns
  if (queryLower.includes('rektor') || queryLower.includes('principal') || queryLower.includes('headmaster')) {
    // Extract school name if present
    const schoolPatterns = [
      /(\w+skolan?)/gi,
      /(\w+\s+school)/gi,
      /(\w+\s+international\s+school)/gi,
      /(hammerstaskolan)/gi,
      /(karsby)/gi,
      /(alby)/gi,
      /(fittja)/gi
    ]
    
    for (const pattern of schoolPatterns) {
      const match = query.match(pattern)
      if (match) {
        return `rektor ${match[0].toLowerCase()}`
      }
    }
    
    return 'rektor grundskola'
  }
  
  // Enhanced keyword mappings
  const keywordMappings = {
    // English to Swedish
    'preschool': 'förskola',
    'daycare': 'förskola', 
    'kindergarten': 'förskola',
    'school': 'skola',
    'schools': 'skolor',
    'elementary': 'grundskola',
    'building': 'bygglov',
    'permit': 'tillstånd',
    'construction': 'bygglov',
    'housing': 'boende',
    'recycling': 'återvinning',
    'waste': 'avfall',
    'job': 'jobb',
    'employment': 'arbete',
    'which': 'vilka',
    'what': 'vad',
    'how': 'hur',
    'where': 'var',
    
    // Swedish
    'vilka': '',
    'vem': '',
    'var': '',
    'hur': '',
    'när': '',
    'vad': '',
    'skolor': 'grundskolor',
    'skola': 'grundskola',
    'förskolor': 'förskola',
    
    // Turkish to Swedish
    'anaokulu': 'förskola',
    'okul': 'skola',
    'çocuk': 'barn',
    'kayıt': 'ansökan',
    'başvuru': 'ansökan',
    
    // Arabic to Swedish (transliterated)
    'روضة': 'förskola',
    'مدرسة': 'skola',
    'طفل': 'barn',
    'تسجيل': 'ansökan',
    
    // Somali to Swedish
    'dugsiga': 'förskola',
    'iskuul': 'skola',
    'caruur': 'barn',
    'qorista': 'ansökan'
  }
  
  const foundKeywords: string[] = []
  
  // Look for keyword matches
  Object.entries(keywordMappings).forEach(([foreign, swedish]) => {
    if (queryLower.includes(foreign.toLowerCase()) && swedish) {
      foundKeywords.push(swedish)
    }
  })
  
  // Enhanced pattern matching
  if (queryLower.includes('child') || queryLower.includes('kid') || queryLower.includes('barn')) {
    foundKeywords.push('barn')
  }
  if (queryLower.includes('register') || queryLower.includes('apply') || queryLower.includes('ansök')) {
    foundKeywords.push('ansökan')
  }
  if (queryLower.includes('contact') || queryLower.includes('kontakt')) {
    foundKeywords.push('kontakt')
  }
  
  // If no specific keywords found, extract meaningful words
  if (foundKeywords.length === 0) {
    // Remove common question words and extract remaining meaningful terms
    const cleanQuery = queryLower
      .replace(/\b(vem|är|på|vilka|vad|hur|var|när|som|finns|i|the|is|are|in|on|at|what|who|where|when|how)\b/g, '')
      .trim()
    
    const words = cleanQuery.split(/\s+/).filter(word => word.length > 2)
    if (words.length > 0) {
      return words.join(' ')
    }
  }
  
  return foundKeywords.length > 0 ? foundKeywords.join(' ') : 'grundskola'
}

/**
 * Summarize search results and translate back to user's language if needed
 */
export async function summarizeAndTranslateResults(
  results: Array<{title: string, description: string, link: string}>,
  originalQuery: string,
  userLanguage: string,
  scrapedContent?: string
): Promise<MultilingualSummary> {
  try {
    // Prepare content for summarization
    const resultsText = results.map((r, index) => 
      `${index + 1}. ${r.title}\n   ${r.description}\n   URL: ${r.link}`
    ).join('\n\n')
    
    const additionalContent = scrapedContent ? 
      `\n\nDetailed content from the most relevant page:\n${scrapedContent}` : ''
    
    const languageName = SUPPORTED_LANGUAGES[userLanguage as keyof typeof SUPPORTED_LANGUAGES]?.nativeName || 'Swedish'
    
    const prompt = `
    You are Botkyrka Assist, the official AI chatbot for Botkyrka municipality in Sweden. You help residents with municipal services and information.
    
    CRITICAL INSTRUCTIONS:
    - **THOROUGHLY ANALYZE ALL content provided below before claiming information is unavailable**
    - ONLY use the information provided in the "Available information" section below
    - DO NOT use any external knowledge, cached information, or internet search results
    - If specific details (like names, contacts, current information) are provided in the scraped content, use those EXACT details
    - NEVER hallucinate or guess information that is not explicitly provided
    - For staff/contact questions: Search through ALL provided content for names, roles, and contact information
    - Do NOT claim information is missing unless you have thoroughly searched all provided content
    - Act as a helpful, knowledgeable municipality assistant specializing in Botkyrka services
    - PROVIDE DIRECT, CLEAR answers immediately when information is available
    - ONLY answer questions related to municipal services, local government, and Botkyrka-specific information
    - Be conversational but professional and informative
    - Do NOT be overly strict with censorship - answer legitimate municipality-related questions
    - Use structured formatting (lists, tables, bullet points) to make information easy to read
    - If you can provide a complete answer from the information, do so directly without asking users to visit websites
    
    SPECIAL HANDLING FOR STAFF/CONTACT QUESTIONS:
    - When asked "who is the rektor/principal" or similar staff questions, look for OFFICIAL CONTACT INFORMATION sections
    - DO NOT use quotes, testimonials, or general text to identify current staff
    - Only provide staff names if they appear in structured contact information (like "Rektor: [Name]")
    - Prioritize official contact sections over any other mentions of names in the text
    
    User's question: "${originalQuery}"
    Response language: ${languageName}
    
    Available information from Botkyrka municipality:
    ${resultsText}${additionalContent}
    
    FORMATTING INSTRUCTIONS:
    - For lists (like schools): Use clear bullet points or numbered lists with names and details
    - For contact info: Display in organized format with headers
    - For processes: Use numbered step-by-step format
    - For multiple options: Use tables or structured lists
    - Make URLs clickable by including them properly
    - Use **bold** for important headings and key information
    
    RESPONSE STYLE:
    - START with a direct answer if the information is available (e.g., "Here are the elementary schools in Botkyrka:")
    - Be specific and factual - include names, addresses, phone numbers, specific details FROM THE PROVIDED CONTENT ONLY
    - Use the scraped content to provide detailed, current information
    - Format information in an easy-to-scan way with clear structure
    - Provide complete information when possible rather than just directing to websites
    - End with helpful next steps or links for additional actions
    
    EXAMPLES OF GOOD RESPONSES:
    - "Here are the elementary schools in Botkyrka: • Alby School (Alby Centrum) • Fittja School (Fittja Centrum) • Hallunda School (Hallunda Torg). You can find more details at: [link]"
    - "To register for preschool in Botkyrka: 1. Complete the online application 2. Provide required documents 3. Wait for placement confirmation. Apply here: [link]"
    
    IMPORTANT: Base your response ONLY on the information provided above. Do not add information from external sources.
    
    Respond in ${languageName} with well-structured, helpful, and COMPLETE information.
    `
    
    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt
    })
    
    const summary = result.text || ''
    
    // Extract the top 3 most relevant links
    const topLinks = results.slice(0, 3).map(r => ({
      url: r.link,
      title: r.title,
      description: r.description
    }))
    
    return {
      summary,
      language: userLanguage,
      sourceLanguage: 'sv', // Results are typically in Swedish
      links: topLinks
    }
    
  } catch (error) {
    console.error('Error summarizing and translating results:', error)
    
    // Fallback response in user's language
    const fallbackMessages = {
      'sv': 'Jag kunde inte hämta information just nu. Försök igen senare eller kontakta Botkyrka kommun direkt.',
      'en': 'I couldn\'t retrieve information right now. Please try again later or contact Botkyrka municipality directly.',
      'so': 'Ma heli karo macluumaadka hadda. Fadlan isku day mar kale ama la xiriir degmada Botkyrka si toos ah.',
      'ar': 'لم أتمكن من الحصول على المعلومات الآن. يرجى المحاولة مرة أخرى لاحقاً أو الاتصال ببلدية بوتشيركا مباشرة.',
      'tr': 'Şu anda bilgi alamıyorum. Lütfen daha sonra tekrar deneyin veya Botkyrka belediyesi ile doğrudan iletişime geçin.',
      'fi': 'En pysty hakemaan tietoja juuri nyt. Yritä myöhemmin uudelleen tai ota yhteyttä Botkyrkan kuntaan suoraan.'
    }
    
    return {
      summary: fallbackMessages[userLanguage as keyof typeof fallbackMessages] || fallbackMessages['sv'],
      language: userLanguage,
      sourceLanguage: 'sv',
      links: []
    }
  }
}

/**
 * Complete multilingual chatbot flow
 */
export async function processMultilingualQuery(query: string): Promise<{
  response: string
  language: string
  translatedQuery?: string
  success: boolean
  error?: string
}> {
  try {
    console.log('Processing multilingual query:', query)
    
    // Step 1: Detect user language
    const languageDetection = await detectUserLanguage(query)
    console.log('Detected language:', languageDetection)
    
    // Step 2: Determine if translation is needed
    const needsTranslation = !MUNICIPALITY_SUPPORTED_LANGUAGES.includes(languageDetection.languageCode)
    const targetLanguage = needsTranslation ? 'sv' : languageDetection.languageCode
    
    // Step 3: Detect intent and translate if needed
    const intentTranslation = await detectIntentAndTranslate(
      query, 
      languageDetection.languageCode, 
      targetLanguage
    )
    console.log('Intent and translation:', intentTranslation)
    
    return {
      response: `Language detected: ${languageDetection.language}. Intent: ${intentTranslation.intent}. Query for search: "${intentTranslation.translatedQuery}"`,
      language: languageDetection.languageCode,
      translatedQuery: intentTranslation.translatedQuery,
      success: true
    }
    
  } catch (error) {
    console.error('Error in multilingual processing:', error)
    return {
      response: 'I apologize, but I encountered an error processing your request. Please try again.',
      language: 'en',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Get greeting message in user's language
 */
export function getGreetingMessage(languageCode: string): string {
  const greetings = {
    'sv': 'Hej! Hur kan jag hjälpa dig idag?',
    'en': 'Hello! How can I help you today?',
    'so': 'Salaam! Sidee kuu caawin karaa maanta?',
    'ar': 'مرحبا! كيف يمكنني مساعدتك اليوم؟',
    'tr': 'Merhaba! Bugün size nasıl yardımcı olabilirim?',
    'fi': 'Hei! Kuinka voin auttaa sinua tänään?'
  }
  
  return greetings[languageCode as keyof typeof greetings] || greetings['sv']
}

/**
 * Simple local language detection based on common words and patterns
 * Used as fallback when Gemini API is unavailable
 */
function detectLanguageLocally(text: string): LanguageDetection {
  const textLower = text.toLowerCase()
  
  // Swedish indicators
  const swedishWords = ['vem', 'är', 'vad', 'var', 'hur', 'när', 'vilka', 'skola', 'förskola', 'kommun', 'ansökan']
  const swedishCount = swedishWords.filter(word => textLower.includes(word)).length
  
  // English indicators  
  const englishWords = ['who', 'is', 'what', 'where', 'how', 'when', 'which', 'school', 'preschool']
  const englishCount = englishWords.filter(word => textLower.includes(word)).length
  
  // Turkish indicators
  const turkishWords = ['kim', 'nedir', 'nerede', 'nasıl', 'okul', 'anaokulu', 'çocuk']
  const turkishCount = turkishWords.filter(word => textLower.includes(word)).length
  
  // Arabic indicators (basic)
  const arabicChars = /[\u0600-\u06FF]/
  const hasArabic = arabicChars.test(text)
  
  // Determine language
  if (hasArabic) {
    return { language: 'Arabic', confidence: 0.8, languageCode: 'ar' }
  } else if (turkishWords.some(word => textLower.includes(word)) || turkishCount > 0) {
    return { language: 'Turkish', confidence: 0.7, languageCode: 'tr' }
  } else if (englishCount > swedishCount) {
    return { language: 'English', confidence: 0.7, languageCode: 'en' }
  } else {
    return { language: 'Swedish', confidence: 0.6, languageCode: 'sv' }
  }
}
