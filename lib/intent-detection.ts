// Intent detection system for Botkyrka Assistant
// Analyzes user queries to determine intent and provide contextual responses

export interface Intent {
  category: string
  confidence: number
  keywords: string[]
  queryType: 'general' | 'specific' | 'procedural' | 'contact' | 'urgent'
  serviceType?: string
  language: string
}

export interface IntentResponse {
  intent: Intent
  suggestedLinks: Array<{
    url: string
    displayName: string
    type: 'eservice' | 'service' | 'info'
    priority: number
  }>
  responseHints: string[]
}

// Comprehensive keyword mapping for intent detection
const INTENT_CATEGORIES = {
  'Förskola': {
    swedish: ['förskola', 'dagis', 'förskoleansökan', 'förskoleköer', 'förskoleplats', 'barnomsorg', 'förskolestart'],
    english: ['preschool', 'daycare', 'kindergarten', 'preschool application', 'childcare'],
    arabic: ['روضة', 'حضانة', 'طلب روضة', 'رعاية أطفال'],
    somali: ['dugsiga', 'dhegashada caruurta', 'ardayda yaryar'],
    turkish: ['anaokulu', 'kreş', 'okul öncesi', 'çocuk bakımı'],
    urgent: ['akut', 'emergency', 'brådskande', 'urgent'],
    procedural: ['ansökan', 'application', 'ansök', 'apply', 'hur', 'how', 'när', 'when']
  },  'Grundskola': {
    swedish: ['grundskola', 'grundskolor', 'skola', 'skolor', 'skolplats', 'skolvalet', 'inskriv', 'skolskjuts', 'skolmat', 'fritids'],
    english: ['elementary school', 'primary school', 'school', 'schools', 'school enrollment', 'school choice', 'school transport'],
    arabic: ['مدرسة', 'مدرسة ابتدائية', 'تسجيل مدرسة', 'اختيار مدرسة'],
    somali: ['dugsiga hoose', 'iskuul', 'qorista dugsiga', 'doorashada dugsiga'],
    turkish: ['ilkokul', 'okul', 'okul kaydı', 'okul seçimi', 'okul taşımacılığı'],
    urgent: ['akut', 'emergency', 'brådskande', 'urgent'],
    procedural: ['ansökan', 'application', 'ansök', 'apply', 'hur', 'how', 'när', 'when', 'vilka', 'which']
  },
  'Bygglov': {
    swedish: ['bygglov', 'byggande', 'renovering', 'tillbyggnad', 'anmälan', 'bygganmälan', 'uteservering', 'marklov'],
    english: ['building permit', 'construction', 'renovation', 'building application', 'extension'],
    arabic: ['ترخيص بناء', 'بناء', 'تجديد', 'تطبيق بناء'],
    somali: ['ruqsadda dhismaha', 'dhisma', 'dayactirka', 'arjida dhismaha'],
    turkish: ['yapı izni', 'inşaat', 'renovasyon', 'yapı başvurusu', 'ek bina'],
    urgent: ['akut', 'emergency', 'brådskande', 'urgent'],
    procedural: ['ansökan', 'application', 'ansök', 'apply', 'hur', 'how', 'vilka handlingar', 'documents']
  },
  'Boende-och-miljö': {
    swedish: ['boende', 'bostadsbidrag', 'avfall', 'återvinning', 'sopor', 'miljö', 'grönområde', 'park', 'skog', 'städa', 'skötsel'],
    english: ['housing', 'housing allowance', 'waste', 'recycling', 'garbage', 'environment', 'green area', 'park', 'forest', 'cleaning'],
    arabic: ['سكن', 'بدل سكن', 'نفايات', 'إعادة تدوير', 'قمامة', 'بيئة', 'منطقة خضراء'],
    somali: ['degaan', 'caawimaadda guriga', 'qashinka', 'dib-u-isticmaalka', 'deegaanka'],
    turkish: ['konut', 'konut yardımı', 'atık', 'geri dönüşüm', 'çöp', 'çevre', 'yeşil alan'],
    urgent: ['akut', 'emergency', 'brådskande', 'urgent', 'miljöproblem', 'environmental problem'],
    procedural: ['ansökan', 'application', 'ansök', 'apply', 'hur', 'how', 'rapportera', 'report']
  },
  'Stöd-och-trygghet': {
    swedish: ['hemtjänst', 'äldreomsorg', 'socialtjänst', 'ekonomiskt bistånd', 'trygghet', 'säkerhet', 'våld', 'hot', 'LSS'],
    english: ['home care', 'elderly care', 'social services', 'financial aid', 'safety', 'security', 'violence', 'threats'],
    arabic: ['رعاية منزلية', 'رعاية المسنين', 'خدمات اجتماعية', 'مساعدة مالية', 'أمان', 'عنف'],
    somali: ['daryeelka guriga', 'daryeelka waayeelka', 'adeegyada bulshada', 'caawimada dhaqaalaha', 'amniga'],
    turkish: ['evde bakım', 'yaşlı bakımı', 'sosyal hizmetler', 'mali yardım', 'güvenlik', 'şiddet'],
    urgent: ['akut', 'emergency', 'brådskande', 'urgent', 'våld', 'violence', 'hot', 'threats', 'kris', 'crisis'],
    procedural: ['ansökan', 'application', 'ansök', 'apply', 'hur', 'how', 'hjälp', 'help']
  },
  'Jobb': {
    swedish: ['jobb', 'arbete', 'anställning', 'arbetslös', 'lediga tjänster', 'karriär', 'praktik', 'kompetensutveckling'],
    english: ['job', 'work', 'employment', 'unemployed', 'available positions', 'career', 'internship', 'skills development'],
    arabic: ['وظيفة', 'عمل', 'توظيف', 'عاطل عن العمل', 'مناصب متاحة', 'مهنة'],
    somali: ['shaqo', 'shaqaale', 'shaqo la\'aan', 'xirfado horumarinta'],
    turkish: ['iş', 'çalışma', 'istihdam', 'işsiz', 'açık pozisyonlar', 'kariyer'],
    urgent: ['akut', 'emergency', 'brådskande', 'urgent'],
    procedural: ['ansökan', 'application', 'ansök', 'apply', 'hur', 'how', 'söka', 'search']
  },
  'Sport-och-kultur': {
    swedish: ['sport', 'idrott', 'kultur', 'aktivitet', 'fritid', 'träning', 'bokning', 'anläggning', 'bibliotek', 'evenemang'],
    english: ['sport', 'culture', 'activity', 'leisure', 'training', 'booking', 'facility', 'library', 'event'],
    arabic: ['رياضة', 'ثقافة', 'نشاط', 'وقت فراغ', 'تدريب', 'حجز', 'مرفق', 'مكتبة'],
    somali: ['ciyaaraha', 'dhaqanka', 'nashaad', 'maktabad', 'munaasabad'],
    turkish: ['spor', 'kültür', 'aktivite', 'boş zaman', 'antrenman', 'rezervasyon', 'kütüphane'],
    urgent: ['akut', 'emergency', 'brådskande', 'urgent'],
    procedural: ['ansökan', 'application', 'ansök', 'apply', 'hur', 'how', 'boka', 'book']
  },
  'Trafik-och-parkering': {
    swedish: ['trafik', 'parkering', 'parkeringstillstånd', 'väg', 'gata', 'kollektivtrafik', 'cykelväg', 'parkeringsbiljett'],
    english: ['traffic', 'parking', 'parking permit', 'road', 'street', 'public transport', 'bicycle path', 'parking ticket'],
    arabic: ['مرور', 'موقف سيارات', 'تصريح وقوف', 'طريق', 'شارع', 'نقل عام'],
    somali: ['taraafikada', 'meesha baabuurta', 'ruqsadda meesha baabuurta', 'waddo'],
    turkish: ['trafik', 'park etme', 'park izni', 'yol', 'sokak', 'toplu taşıma'],
    urgent: ['akut', 'emergency', 'brådskande', 'urgent', 'biljett', 'ticket', 'böter', 'fine'],
    procedural: ['ansökan', 'application', 'ansök', 'apply', 'hur', 'how', 'överklaga', 'appeal']
  },
  'Utbildning-vuxna': {
    swedish: ['komvux', 'vuxenutbildning', 'sfi', 'svenska för invandrare', 'yrkesutbildning', 'studiemedel', 'studievägledning'],
    english: ['adult education', 'swedish for immigrants', 'vocational training', 'study financial aid', 'study guidance'],
    arabic: ['تعليم الكبار', 'السويدية للمهاجرين', 'التدريب المهني', 'مساعدة الدراسة'],
    somali: ['waxbarashada dadka waaweyn', 'af-soomaali loogu baro dadka cusub', 'tababarka xirfadaha'],
    turkish: ['yetişkin eğitimi', 'göçmenler için isveççe', 'meslek eğitimi', 'eğitim yardımı'],
    urgent: ['akut', 'emergency', 'brådskande', 'urgent'],
    procedural: ['ansökan', 'application', 'ansök', 'apply', 'hur', 'how', 'anmäl', 'register']
  }
}

// Service group mappings for contact information
const SERVICE_GROUP_MAPPING = {
  'Förskola': { groupId: 12, name: 'Skola och förskola' },
  'Grundskola': { groupId: 12, name: 'Skola och förskola' },
  'Stöd-och-trygghet': { groupId: 15, name: 'Stöd, omsorg och familj' },
  'Barn-och-familj': { groupId: 15, name: 'Stöd, omsorg och familj' },
  'Jobb': { groupId: 14, name: 'Jobb och vuxenutbildning' },
  'Utbildning-vuxna': { groupId: 14, name: 'Jobb och vuxenutbildning' },
  'Trafik-och-parkering': { groupId: 3, name: 'Stadsplanering och trafik' },
  'Bygglov': { groupId: 5, name: 'Boende och närmiljö' },
  'Boende-och-miljö': { groupId: 5, name: 'Boende och närmiljö' },
  'Sport-och-kultur': { groupId: 13, name: 'Uppleva och göra' }
}

// E-service URL encodings
const E_SERVICE_CATEGORIES = {
  'Förskola': 'F%C3%B6rskola',
  'Grundskola': 'Grundskola', 
  'Barn-och-familj': 'Barn%20och%20unga',
  'Bygglov': 'Bygglov',
  'Boende-och-miljö': 'Boende%20och%20närmiljö',
  'Stöd-och-trygghet': 'Stöd%20och%20trygghet',
  'Jobb': 'Jobb',
  'Sport-och-kultur': 'Kultur',
  'Trafik-och-parkering': 'Stadsplanering%20och%20trafik',
  'Utbildning-vuxna': 'Utbildning%20för%20vuxna'
}

// Information page URLs
const INFO_URLS = {
  'Förskola': 'https://www.botkyrka.se/skola-och-forskola/barnomsorg-i-botkyrka/forskola',
  'Grundskola': 'https://www.botkyrka.se/skola-och-forskola/grundskola',
  'Barn-och-familj': 'https://www.botkyrka.se/stod-och-omsorg/barn-och-familj',
  'Bygglov': 'https://www.botkyrka.se/bo-och-leva/bygglov-och-tillstand',
  'Boende-och-miljö': 'https://www.botkyrka.se/bo-och-leva/miljo-och-hallbarhet',
  'Stöd-och-trygghet': 'https://www.botkyrka.se/stod-och-omsorg',
  'Jobb': 'https://www.botkyrka.se/kommun-och-politik/jobba-i-botkyrka',
  'Sport-och-kultur': 'https://www.botkyrka.se/uppleva-och-gora',
  'Trafik-och-parkering': 'https://www.botkyrka.se/bo-och-leva/trafik-och-parkering',
  'Utbildning-vuxna': 'https://www.botkyrka.se/skola-och-forskola/vuxenutbildning'
}

/**
 * Determines the query type based on keywords and structure
 */
function determineQueryType(text: string): 'general' | 'specific' | 'procedural' | 'contact' | 'urgent' {
  const normalizedText = text.toLowerCase()
  
  // Check for urgent keywords
  const urgentKeywords = ['akut', 'emergency', 'brådskande', 'urgent', 'hjälp', 'help', 'kris', 'crisis', 'våld', 'violence']
  if (urgentKeywords.some(keyword => normalizedText.includes(keyword))) {
    return 'urgent'
  }
  
  // Check for procedural keywords
  const proceduralKeywords = ['hur', 'how', 'när', 'when', 'var', 'where', 'ansökan', 'application', 'ansök', 'apply', 'vilka handlingar', 'documents']
  if (proceduralKeywords.some(keyword => normalizedText.includes(keyword))) {
    return 'procedural'
  }
  
  // Check for contact keywords
  const contactKeywords = ['kontakt', 'contact', 'ring', 'call', 'prata', 'talk', 'träffa', 'meet', 'personal', 'hjälp', 'help']
  if (contactKeywords.some(keyword => normalizedText.includes(keyword))) {
    return 'contact'
  }
  
  // Check if it's a single word (general query)
  const words = text.trim().split(/\s+/)
  if (words.length <= 2) {
    return 'general'
  }
  
  return 'specific'
}

/**
 * Simplified intent detection without hardcoded language detection
 * Focuses on service category and query type detection
 */
export function detectIntent(userInput: string): IntentResponse {
  const normalizedInput = userInput.toLowerCase().trim()
  
  // Determine query type based on keywords and structure
  const queryType = determineQueryType(userInput)
  
  let bestMatch = {
    category: 'general',
    confidence: 0,
    keywords: [] as string[],
    serviceType: undefined as string | undefined
  }
  
  // Score each category based on keyword matches
  Object.entries(INTENT_CATEGORIES).forEach(([category, data]) => {
    let score = 0
    const matchedKeywords: string[] = []
    
    // Check keywords across all languages for better matching
    const allKeywords = [
      ...(data.swedish || []),
      ...(data.english || []),
      ...(data.arabic || []),
      ...(data.somali || []),
      ...(data.turkish || [])
    ]
    
    allKeywords.forEach(keyword => {
      if (normalizedInput.includes(keyword.toLowerCase())) {
        score += 2 // Base score for keyword match
        matchedKeywords.push(keyword)
        
        // Boost score for exact word matches
        const words = normalizedInput.split(/\s+/)
        if (words.includes(keyword.toLowerCase())) {
          score += 1
        }
      }
    })
    
    // Check urgent keywords for priority
    if (queryType === 'urgent' && Array.isArray(data.urgent)) {
      data.urgent.forEach(keyword => {
        if (normalizedInput.includes(keyword.toLowerCase())) {
          score += 3 // Higher score for urgent matches
          matchedKeywords.push(keyword)
        }
      })
    }
    
    // Check procedural keywords
    if (queryType === 'procedural' && Array.isArray(data.procedural)) {
      data.procedural.forEach(keyword => {
        if (normalizedInput.includes(keyword.toLowerCase())) {
          score += 1.5 // Medium boost for procedural matches
          matchedKeywords.push(keyword)
        }
      })
    }
    
    if (score > bestMatch.confidence) {
      bestMatch = {
        category,
        confidence: score,
        keywords: matchedKeywords,
        serviceType: category
      }
    }
  })
  
  // Generate suggested links based on the detected intent
  const suggestedLinks = generateSuggestedLinks(bestMatch.category, queryType)
  
  // Generate response hints based on intent and query type
  const responseHints = generateResponseHints(bestMatch.category, queryType)
  
  return {
    intent: {
      category: bestMatch.category,
      confidence: bestMatch.confidence,
      keywords: bestMatch.keywords,
      queryType,
      serviceType: bestMatch.serviceType,
      language: 'auto' // Let Gemini detect and handle language
    },
    suggestedLinks,
    responseHints
  }
}

/**
 * Generates suggested links based on intent and query type
 */
function generateSuggestedLinks(category: string, queryType: string): Array<{
  url: string
  displayName: string
  type: 'eservice' | 'service' | 'info'
  priority: number
}> {
  const links: Array<{
    url: string
    displayName: string
    type: 'eservice' | 'service' | 'info'
    priority: number
  }> = []
  
  if (category === 'general') {
    // For general queries, return main portal links
    links.push({
      url: 'https://www.botkyrka.se/sjalvservice-och-blanketter',
      displayName: 'E-tjänster och blanketter',
      type: 'eservice',
      priority: 1
    })
    return links
  }
  
  // Get service group info
  const serviceGroup = SERVICE_GROUP_MAPPING[category as keyof typeof SERVICE_GROUP_MAPPING]
  const eServiceCategory = E_SERVICE_CATEGORIES[category as keyof typeof E_SERVICE_CATEGORIES]
  const infoUrl = INFO_URLS[category as keyof typeof INFO_URLS]
  
  // Prioritize links based on query type
  switch (queryType) {
    case 'procedural':
      // Procedural queries need e-services first
      if (eServiceCategory) {
        links.push({
          url: `https://www.botkyrka.se/sjalvservice-och-blanketter?query=*%3A*&q=${eServiceCategory}#eservice`,
          displayName: `E-tjänster: ${category.replace('-', ' och ')}`,
          type: 'eservice',
          priority: 1
        })
      }
      if (infoUrl) {
        links.push({
          url: infoUrl,
          displayName: `Information: ${category.replace('-', ' och ')}`,
          type: 'info',
          priority: 2
        })
      }
      break
      
    case 'contact':
    case 'urgent':
      // Contact/urgent queries need service groups first
      if (serviceGroup) {
        links.push({
          url: `https://service.botkyrka.se/MenuGroup2.aspx?groupId=${serviceGroup.groupId}`,
          displayName: `Servicegrupp: ${serviceGroup.name}`,
          type: 'service',
          priority: 1
        })
      }
      if (eServiceCategory) {
        links.push({
          url: `https://www.botkyrka.se/sjalvservice-och-blanketter?query=*%3A*&q=${eServiceCategory}#eservice`,
          displayName: `E-tjänster: ${category.replace('-', ' och ')}`,
          type: 'eservice',
          priority: 2
        })
      }
      break
      
    default:
      // General and specific queries - balanced approach
      if (infoUrl) {
        links.push({
          url: infoUrl,
          displayName: `Information: ${category.replace('-', ' och ')}`,
          type: 'info',
          priority: 1
        })
      }
      if (eServiceCategory) {
        links.push({
          url: `https://www.botkyrka.se/sjalvservice-och-blanketter?query=*%3A*&q=${eServiceCategory}#eservice`,
          displayName: `E-tjänster: ${category.replace('-', ' och ')}`,
          type: 'eservice',
          priority: 2
        })
      }
      if (serviceGroup) {
        links.push({
          url: `https://service.botkyrka.se/MenuGroup2.aspx?groupId=${serviceGroup.groupId}`,
          displayName: `Servicegrupp: ${serviceGroup.name}`,
          type: 'service',
          priority: 3
        })
      }
  }
  
  return links.sort((a, b) => a.priority - b.priority)
}

/**
 * Generates response hints based on intent and query type
 */
function generateResponseHints(category: string, queryType: string): string[] {
  const hints: string[] = []
  
  // Category-specific hints
  switch (category) {
    case 'Förskola':
      hints.push('Förskoleansökan och köer', 'Avgifter och måltider', 'Öppettider och stängning')
      break
    case 'Grundskola':
      hints.push('Skolval och ansökan', 'Skolskjuts och måltider', 'Stödresurser')
      break
    case 'Bygglov':
      hints.push('Bygglovsansökan', 'Handläggningstider', 'Avgifter och dokument')
      break
    case 'Boende-och-miljö':
      hints.push('Bostadsbidrag', 'Avfallshantering', 'Miljörapportering')
      break
    case 'Stöd-och-trygghet':
      hints.push('Hemtjänst', 'Ekonomiskt bistånd', 'Trygghetsfrågor')
      break
    default:
      hints.push('Kommunala tjänster', 'E-tjänster', 'Kontaktinformation')
  }
  
  // Query type specific hints
  switch (queryType) {
    case 'urgent':
      hints.unshift('Akut hjälp', 'Kontakt direkt')
      break
    case 'procedural':
      hints.unshift('Steg-för-steg guide', 'Ansökningsprocess')
      break
    case 'contact':
      hints.unshift('Kontaktinformation', 'Personlig service')
      break
  }
  
  return hints.slice(0, 4) // Limit to 4 hints
}

/**
 * Enhanced response builder with intent-aware suggestions
 */
export function buildIntentAwareResponse(intent: IntentResponse, userInput: string): {
  systemPromptAddition: string
  prioritizedLinks: string[]
} {
  const { intent: detectedIntent, suggestedLinks, responseHints } = intent
  
  let systemPromptAddition = `\n\nINTENT ANALYSIS:
- Category: ${detectedIntent.category}
- Confidence: ${detectedIntent.confidence}
- Query Type: ${detectedIntent.queryType}
- Matched Keywords: ${detectedIntent.keywords.join(', ')}
- Response Hints: ${responseHints.join(', ')}\n`
  
  if (detectedIntent.queryType === 'urgent') {
    systemPromptAddition += `\nURGENT QUERY DETECTED: Prioritize immediate help and contact information. Provide emergency contacts if relevant.\n`
  }
  
  if (detectedIntent.queryType === 'procedural') {
    systemPromptAddition += `\nPROCEDURAL QUERY DETECTED: Focus on step-by-step instructions and application processes.\n`
  }
  
  if (detectedIntent.queryType === 'contact') {
    systemPromptAddition += `\nCONTACT QUERY DETECTED: Emphasize service groups and direct communication channels.\n`
  }
  
  if (detectedIntent.confidence > 3) {
    systemPromptAddition += `\nHIGH CONFIDENCE MATCH: Focus specifically on ${detectedIntent.category} services.\n`
  }
  
  // Build prioritized links for embedding in response
  const prioritizedLinks = suggestedLinks.map(link => link.url)
  
  systemPromptAddition += `\nPRIORITIZED LINKS TO INCLUDE: ${prioritizedLinks.join(', ')}\n`
  
  return {
    systemPromptAddition,
    prioritizedLinks
  }
}
