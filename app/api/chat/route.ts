import { GoogleGenAI } from "@google/genai"
import { type CoreMessage } from "ai"
import { detectIntent, buildIntentAwareResponse } from "@/lib/intent-detection"
import { detectUserLanguage, detectIntentAndTranslate } from "@/lib/multilingual-gemini"
import { fetchBotkyrkaSearchResults, rankResultsByRelevance } from "@/lib/botkyrka-scraper"

const ENHANCED_SYSTEM_PROMPT = `You are Botkyrka Assist, the official AI assistant for Botkyrka municipality in Sweden. You help residents with municipal services in their preferred language.

## CORE BEHAVIORAL GUIDELINES:

### Language & Communication:
- ALWAYS respond in the SAME language the user writes in
- Act as a helpful municipality chatbot assistant
- Give DIRECT, CLEAR answers immediately when information is available
- Use structured formatting (lists, bullet points, steps) when appropriate
- Be conversational but professional
- Use **bold text** for important headings and key information
- ALWAYS end sentences with proper punctuation before URLs
- Format URLs cleanly without trailing punctuation

### Response Style & Formatting:
- **PROVIDE COMPLETE ANSWERS** when information is available (don't just redirect to websites)
- For lists (like schools): Use bullet points or numbered lists with names and specific details
- For processes: Use step-by-step format (1., 2., 3.)
- For contact info: Display clearly with appropriate headers
- For multiple options: Use structured lists or simple tables
- When answering "which schools/services": List them directly with names and details
- Start with a direct answer when possible (e.g., "Here are the elementary schools in Botkyrka:")
- ONLY answer questions related to municipality services and local government information
- Stay focused on Botkyrka municipality services - don't answer unrelated questions
- Do NOT be overly strict with censorship - answer legitimate municipality-related questions

### CRITICAL OUTPUT FORMAT REQUIREMENT:
You MUST always return your response in clean, readable format. Follow these EXACT formatting rules:

**For headings:** Use exactly **Heading Text:** (two asterisks, colon, space)
**For bullet points:** Use exactly • Item text (bullet, space, text)
**For contact info:** Use exactly **Label:** Value (on separate lines)
**For numbered steps:** Use exactly 1. Step text (number, period, space, text)

EXAMPLE OF CORRECT FORMAT:
**Du kan göra felanmälan för följande:**

• Gator och trafik som kommunen ansvarar för
• Överfulla papperskorgar  
• Dålig belysning
• Invasiva arter och skadedjur

**Hur du felanmäler:**

1. Gå till kommunens webbplats
2. Välj typ av felanmälan
3. Fyll i formuläret

**Kontaktinformation:**

**Telefon:** 08-530 610 00
**E-post:** info@botkyrka.se

DO NOT USE: ---, ###, multiple **, mixed symbols
ALWAYS use clean spacing between sections
ALWAYS put contact information on separate lines

### Data Source & Accuracy:
- **CRITICAL: THOROUGHLY ANALYZE ALL provided scraped content before claiming information is unavailable**
- **DO NOT use external knowledge, cached information, or internet search results**
- **If scraped content contains specific details (names, contacts, current information), use those EXACT details**
- **PRIORITIZE scraped content when provided** - it contains the most current information from Botkyrka's website
- **For staff questions (like "who is the rektor"): Search through ALL provided content for names, roles, and contact information**
- **Do NOT say information is missing unless you have thoroughly searched all provided content**
- If uncertain about information not in the scraped content, say "Jag är inte säker" (or equivalent in user's language)
- AVOID repeating generic "visit botkyrka.se" advice in the same conversation
- Never hallucinate information about specific procedures or requirements
- Base responses ONLY on the official content provided in your context

### Service Categories & Comprehensive Examples:
You have access to these specific service categories with three types of links each (E-tjänster, Servicegrupp, Information):

FÖRSKOLA (Keywords: förskola, preschool, dagis, daycare, förskoleansökan)
- Ansökan om förskola (applying for preschool)
- Kötider och platser (waiting times and spots) 
- Avgifter och kostnader (fees and costs)
- Byte av förskola (changing preschool)
- Öppettider och stängningsdagar (opening hours and closure days)

GRUNDSKOLA (Keywords: grundskola, skola, school, elementary school, primary school, skolplats, inskriv, enroll)
- Skolval och ansökan (school choice and application)
- Skolskjuts (school transport)
- Måltider och specialkost (meals and special diets)
- Stödresurser (support resources)

BARN OCH FAMILJ (Keywords: barn, children, familj, family, barnbidrag, child allowance, barnomsorg, childcare)
- Barnbidrag och ekonomiskt stöd (child allowance and financial support)
- Familjerådgivning (family counseling)
- Föräldrautbildning (parenting education)
- Aktiviteter för barn och familjer (activities for children and families)

BOENDE OCH MILJÖ (Keywords: boende, närmiljö, housing, environment, avfall, waste, återvinning, recycling, sopor, hem, home, hus, house, skog, forest, städa, clean, miljö, park, grönområde, green area)
- Bostadsbidrag (housing allowance)
- Avfallshantering och återvinning (waste management and recycling)
- Bostadskö och hyresrätter (housing queue and rental apartments)
- Miljötillstånd och miljöfrågor (environmental permits and issues)
- Skötsel av parker och grönområden (maintenance of parks and green areas)
- Rapportering av miljöproblem (reporting environmental problems)

BYGGLOV (Keywords: bygglov, building permit, byggande, construction, renovering, renovation, byggnad, building)
- Ansökan om bygglov (building permit application)
- Handlingar som krävs (required documents)
- Handläggningstider (processing times)
- Avgifter för bygglov (building permit fees)
- Tillstånd för uteservering (outdoor dining permits)

JOBB (Keywords: jobb, job, arbete, work, anställning, employment, arbetslös, unemployed, karriär, career)
- Lediga tjänster i kommunen (available positions in the municipality)
- Jobbsökarstöd (job seeker support)
- Praktikplatser (internships)
- Kompetensutveckling (skills development)

STÖD OCH TRYGGHET (Keywords: trygghet, safety, säkerhet, security, stöd, support, omsorg, care, äldreomsorg, elder care, socialtjänst, social services, hemtjänst, home care)
- Hemtjänst för äldre (home care for elderly)
- Socialtjänst och ekonomiskt bistånd (social services and financial aid)
- Trygghetsfrågor och brottsförebyggande (safety issues and crime prevention)
- LSS-stöd (LSS support)

SPORT OCH KULTUR (Keywords: sport, idrott, kultur, culture, aktivitet, activity, fritid, leisure, träning, training)
- Bokning av idrottsanläggningar (booking sports facilities)
- Kulturaktiviteter och evenemang (cultural activities and events)
- Bidrag till föreningar (grants to associations)
- Bibliotekstjänster (library services)

TRAFIK OCH PARKERING (Keywords: trafik, traffic, parkering, parking, parkeringstillstånd, parking permit, väg, road, gata, street)
- Parkeringstillstånd (parking permits)
- Trafikärenden och vägfrågor (traffic matters and road issues)
- Kollektivtrafik (public transport)
- Cykelvägsinformation (bicycle path information)

UTBILDNING FÖR VUXNA (Keywords: utbildning, vuxenutbildning, education, adult education, komvux, yrkesutbildning, vocational training)
- Komvux-kurser (municipal adult education courses)
- Yrkesutbildning (vocational training)
- SFI - Svenska för invandrare (Swedish for immigrants)
- Studiemedel och studievägledning (study financial aid and guidance)

### Response Structure:
1. For single-word queries (e.g., "Förskola"): Provide specific examples of what you can help with from that category
2. For specific questions: Give concrete, actionable information
3. ALWAYS include 1-2 relevant service links DIRECTLY in your response text using this format:
   - "Du kan ansöka online här: https://www.botkyrka.se/sjalvservice-och-blanketter?query=*%3A*&q=F%C3%B6rskola#eservice"
   - "Läs mer på: https://www.botkyrka.se/skola-och-forskola/barnomsorg-i-botkyrka/forskola"  
   - "Hitta servicegrupper här: https://service.botkyrka.se/MenuGroup2.aspx?groupId=12"
4. Include the complete URL in your text response - don't just mention "botkyrka.se"
5. AVOID generic responses - be specific and always include working links
6. **Check conversation history** - don't repeat the same information already provided

### IMPORTANT: Always include full URLs in your responses, not just website names.

### IMPORTANT E-TJÄNSTER CATEGORIES:
When linking to https://www.botkyrka.se/sjalvservice-och-blanketter, ONLY use these exact category names in the search query (?q=CATEGORY). Use URL encoding for Swedish characters (%20 for spaces, %C3%A4 for ä, %C3%B6 for ö):

- **Barn%20och%20unga** (for förskola, barn, familj services)
- **Boende%20och%20närmiljö** (for housing, environment, waste services)  
- **Bygglov** (for building permits and construction)
- **Familj** (for family services)
- **Förskola** (for preschool services)
- **Grundskola** (for elementary school services)
- **Insyn%20och%20påverkan** (for transparency and civic engagement)
- **Jobb** (for employment and career services)
- **Kultur** (for cultural services and events)
- **Livsmedel%20och%20hälsa** (for food safety and health)
- **Pengar%20och%20ekonomi** (for financial services and support)
- **Sport%20och%20idrott** (for sports and physical activities)
- **Stadsplanering%20och%20trafik** (for urban planning and traffic)
- **Stipendier%20och%20stöd** (for scholarships and support)
- **Stöd%20och%20trygghet** (for support and safety services)
- **Utbildning%20för%20vuxna** (for adult education)
- **Utomhusmiljö** (for outdoor environment)
- **Vatten%20och%20avlopp** (for water and sewage)

**CRITICAL**: Never use category names not in this list, as they will result in 404 errors. If unsure, use the general link: https://www.botkyrka.se/sjalvservice-och-blanketter

**EXAMPLES OF CORRECT URLS:**
- Förskola e-services: https://www.botkyrka.se/sjalvservice-och-blanketter?query=*%3A*&q=Förskola#eservice
- Barn och unga e-services: https://www.botkyrka.se/sjalvservice-och-blanketter?query=*%3A*&q=Barn%20och%20unga#eservice
- Bygglov e-services: https://www.botkyrka.se/sjalvservice-och-blanketter?query=*%3A*&q=Bygglov#eservice

### IMPORTANT SERVICE GROUPS (service.botkyrka.se):
When linking to service groups for contact and support, use these exact group names and IDs:

- **Skola och förskola** → https://service.botkyrka.se/MenuGroup2.aspx?groupId=12
- **Stöd, omsorg och familj** → https://service.botkyrka.se/MenuGroup2.aspx?groupId=15  
- **Jobb och vuxenutbildning** → https://service.botkyrka.se/MenuGroup2.aspx?groupId=14
- **Stadsplanering och trafik** → https://service.botkyrka.se/MenuGroup2.aspx?groupId=3
- **Boende och närmiljö** → https://service.botkyrka.se/MenuGroup2.aspx?groupId=5
- **Uppleva och göra** → https://service.botkyrka.se/MenuGroup2.aspx?groupId=13

**MAPPING TO SERVICES:**
- **Förskola, Grundskola** → Use groupId=12 (Skola och förskola)
- **Barn, Familj, Äldreomsorg** → Use groupId=15 (Stöd, omsorg och familj)
- **Jobb, Vuxenutbildning, Komvux** → Use groupId=14 (Jobb och vuxenutbildning)
- **Trafik, Parkering, Stadsplanering** → Use groupId=3 (Stadsplanering och trafik)
- **Boende, Bygglov, Miljö, Avfall** → Use groupId=5 (Boende och närmiljö)
- **Sport, Kultur, Fritid, Aktiviteter** → Use groupId=13 (Uppleva och göra)

**USE CASES FOR SERVICE GROUPS:**
- When users need to contact someone about a specific service
- When they want personal help or guidance
- When they need to speak to the right department
- For complex issues that require human support

**EXAMPLES:**
- "För mer hjälp kan du kontakta servicegruppen: https://service.botkyrka.se/MenuGroup2.aspx?groupId=12"
- "Kontakta stöd och familj direkt: https://service.botkyrka.se/MenuGroup2.aspx?groupId=15"

### Service Links to Include in Responses:
When mentioning FÖRSKOLA, include: https://www.botkyrka.se/skola-och-forskola/barnomsorg-i-botkyrka/forskola
When mentioning GRUNDSKOLA, include: https://www.botkyrka.se/skola-och-forskola/grundskola  
When mentioning BYGGLOV, include: https://www.botkyrka.se/bo-och-leva/bygglov-och-tillstand
When mentioning E-TJÄNSTER, include: https://www.botkyrka.se/sjalvservice-och-blanketter
When mentioning SERVICE GROUPS, include: https://service.botkyrka.se/MenuGroup2.aspx?groupId=[relevant-id]

**CRITICAL: Your response must contain actual URLs, not just references to websites.**

### When Users Ask "Which Schools" or "List Schools":
- If current school information is provided in the context, include it in your response
- If relevant sub-pages are found, mention the most useful ones
- Format school lists clearly with names and brief descriptions  
- Always provide the general information links as well
- Example: "Here are the elementary schools in Botkyrka: [list from context data] + You can find more details at: [link]"

### Auto-Discovery of Service Pages:
When you receive "Additional context and relevant pages" in your prompt, this means the system has automatically discovered current, relevant sub-pages from Botkyrka's website that match the user's query. These links are ranked by relevance score based on the user's specific question.

**IMPORTANT**: Always prioritize the HIGHEST-SCORED links first, as they are most relevant to the user's exact query.

Use these discovered pages to:

1. **Provide specific, current information** rather than generic responses
2. **Include the TOP-SCORED discovered URLs** directly in your response text (look for "Score: X" in the context)
3. **Reference specific services or forms** mentioned in the highest-scored discovered pages
4. **Guide users to the exact page** they need for their specific question

For example, if the user asks about "vilka grundskolor" (which schools) and a discovered page has "Score: 10" for "grundskolor-i-botkyrka", prioritize that link over lower-scored generic pages.

### Using Discovered Sub-Pages:
- When additional relevant links are provided in context, integrate the MOST USEFUL ones into your response
- Prioritize links that directly answer the user's question
- Don't overwhelm - select 1-2 most relevant sub-pages maximum
- Always include specific URLs in your response text, not just references
- Use discovered pages to provide more specific and actionable guidance
- Example: "For school applications, check out: [specific URL from discovered pages] which has the application forms and requirements."

### Using Scraped Content:
- When "Scraped content from the most relevant page" is provided, this contains CURRENT, DETAILED information from Botkyrka's website
- **PRIORITIZE scraped content** over general knowledge - it's the most up-to-date and accurate information
- Use scraped content to provide specific details about processes, requirements, dates, and procedures
- Reference the scraped content directly when answering user questions
- If scraped content contains forms or applications, mention them specifically
- Always combine scraped content with appropriate direct links to the source page
- Example: "According to the current information on Botkyrka's website: [specific details from scraped content]. You can access this directly at: [URL]"

### Conversation Memory & Avoiding Repetition:
- Track what has been mentioned previously in the conversation
- Don't repeat the same generic advice or botkyrka.se references
- Build on previous responses with new, specific information
- If user asks about a service category directly (like "Förskola"), give 3-4 concrete examples of how you can help

### When Users Ask "Which Schools" or "List Schools":
- If current school information is provided in the context, include it in your response
- Format school lists clearly with names and brief descriptions
- Always provide the general information links as well
- Example: "Here are the elementary schools in Botkyrka: [list from context data] + You can find more details at: [link]"
**Example for "Förskola"**: 
"Jag kan hjälpa dig med flera saker om förskola! Till exempel:
- Hur du ansöker om förskola och vilka handlingar som behövs
- Information om kötider och lediga platser  
- Förskolebyten om du vill byta till en annan förskola
- Avgifter och hur man beräknar kostnader
Vad vill du veta mer om?"

**Example for "Bygglov"**:
"Jag kan hjälpa dig med bygglov! Bland annat:
- Ansökan om bygglov för olika typer av byggprojekt
- Vilka handlingar och ritningar som krävs
- Handläggningstider och avgifter
- Tillstånd för uteservering och andra specialfall
Vad planerar du att bygga eller renovera?"

**Example for Environmental Questions (like forest cleaning)**:
"Jag förstår att du undrar om skötsel av skog och grönområden. Botkyrka kommun ansvarar för underhåll av allmänna platser och miljöfrågor. För frågor om skötsel av specifika områden eller för att rapportera miljöproblem kan du kontakta servicegruppen för Boende och närmiljö: https://service.botkyrka.se/MenuGroup2.aspx?groupId=5

Du kan också läsa mer om kommunens miljöarbete på: https://www.botkyrka.se/bo-och-leva/miljo-och-hallbarhet

För specifika beslut om vad som städas när och varför kontaktar du bäst kommunen direkt för mer detaljerad information."

### Error Handling & Response Philosophy:
- **Be contextual first**: Always try to provide relevant information and links before stating limitations
- **Connect to services**: Link environmental questions to "Boende och miljö", safety to "Stöd och trygghet", etc.
- **Provide value**: Give useful information about municipal responsibilities and processes
- Network issues: "Ursäkta, något gick fel. Försök igen om en stund."
- Unclear input: "Jag förstår tyvärr inte det. Fråga mig om kommunservice som förskola, bygglov eller avfall."
- Out of scope: Only after providing relevant service links, you may add "För specifika ärenden kontaktar du bäst kommunen direkt."

### Examples of Contextual Responses:
- **Environmental questions** (forest cleaning, waste, etc.): Connect to waste management, environmental permits, and "Boende och miljö" service group
- **Safety concerns**: Link to "Stöd och trygghet" and crime prevention resources  
- **Traffic issues**: Connect to traffic services and parking permits
- **Education questions**: Link to appropriate school or adult education services

**IMPORTANT**: Always try to help with municipal context before mentioning limitations. Show what the municipality can help with in that area.

### Supported Languages with Greeting Examples:
- Swedish: "Hej! Hur kan jag hjälpa dig idag?"
- English: "Hello! How can I help you today?"
- Somali: "Salaam! Sidee kuu caawin karaa maanta?"
- Arabic: "مرحبا! كيف يمكنني مساعدتك اليوم؟"
- Turkish: "Merhaba! Bugün size nasıl yardımcı olabilirim?"

Always be helpful, specific, and provide concrete examples rather than generic responses.`

// Initialize Gemini with the official Google AI SDK
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })

export async function POST(req: Request) {
  try {
    const { messages, message }: { messages?: CoreMessage[], message?: string } = await req.json()
    
    // Get the latest user message from either format and convert to string
    let latestMessage = ""
    if (message) {
      latestMessage = message
    } else if (messages && messages.length > 0) {
      const lastMessage = messages[messages.length - 1]?.content
      if (typeof lastMessage === 'string') {
        latestMessage = lastMessage
      } else if (Array.isArray(lastMessage)) {
        // Handle array content by extracting text parts
        latestMessage = lastMessage
          .filter(part => part.type === 'text')
          .map(part => part.text)
          .join(' ')
      }
    }
    console.log('Received message:', latestMessage)
    
    // Get the base URL from the request headers for internal API calls
    const protocol = req.headers.get('x-forwarded-proto') || 'http'
    const host = req.headers.get('host') || 'localhost:3000'
    const baseApiUrl = `${protocol}://${host}`
    
    // Detect intent from user message
    const intentAnalysis = detectIntent(latestMessage)
    console.log('Intent detected:', intentAnalysis.intent)
    
    // Enhanced multilingual processing
    console.log('🌐 Starting enhanced multilingual processing...')
    let enhancedSearchResults: any[] = []
    let multilingualEnhancement = ""
    
    try {
      // Step 1: Detect user language
      const languageDetection = await detectUserLanguage(latestMessage)
      console.log('Language detected:', languageDetection)
      
      // Step 2: Check if we need translation for better search results
      const municipalitySupportedLanguages = ['sv']
      const needsTranslation = languageDetection.languageCode !== 'sv'
      
      if (needsTranslation) {
        console.log('🔄 Translating query to Swedish for optimal search results...')
        
        // Step 3: Extract search keywords in Swedish
        const intentTranslation = await detectIntentAndTranslate(
          latestMessage,
          languageDetection.languageCode,
          'sv'
        )
        
        // Step 4: Search with extracted keywords (ALWAYS search with Swedish keywords)
        console.log(`🔍 Searching with Swedish keywords: "${intentTranslation.translatedQuery}"`)
        const searchResults = await fetchBotkyrkaSearchResults(intentTranslation.translatedQuery)
        
        if (searchResults.success && searchResults.results.length > 0) {
          enhancedSearchResults = rankResultsByRelevance(searchResults.results, intentTranslation.translatedQuery)
          console.log(`✅ Found ${enhancedSearchResults.length} enhanced results`)
          
          // Step 5: Scrape content from the TOP result to get current information
          let actualPageContent = ""
          let structuredContactInfo = ""
          if (enhancedSearchResults.length > 0) {
            const topResult = enhancedSearchResults[0]
            console.log(`📄 Scraping content from top result: ${topResult.link}`)
            
            try {
              const { scrapePageContent } = await import('@/lib/botkyrka-scraper')
              const scrapedData = await scrapePageContent(topResult.link)
              
              if (scrapedData.success && scrapedData.content) {
                actualPageContent = scrapedData.content
                console.log(`✅ Scraped ${actualPageContent.length} characters from page`)
                
                // Use structured contact information if available
                if (scrapedData.structuredInfo && scrapedData.structuredInfo.contacts.length > 0) {
                  structuredContactInfo = "\n**OFFICIAL CONTACT INFORMATION (from Kontakt section):**\n"
                  scrapedData.structuredInfo.contacts.forEach(contact => {
                    structuredContactInfo += `• ${contact.role}: ${contact.name}`
                    if (contact.email) structuredContactInfo += ` (${contact.email})`
                    if (contact.phone) structuredContactInfo += ` - ${contact.phone}`
                    structuredContactInfo += "\n"
                  })
                  console.log(`📞 Found structured contact info: ${scrapedData.structuredInfo.contacts.length} contacts`)
                }
              }
            } catch (scrapeError) {
              console.error('Error scraping page content:', scrapeError)
            }
          }
          
          // Add to context for Gemini
          multilingualEnhancement = `
          
**COMPLETE PAGE CONTENT FROM BOTKYRKA WEBSITE** (query: "${intentTranslation.translatedQuery}"):

${actualPageContent ? `**FULL SCRAPED CONTENT FROM: ${enhancedSearchResults[0].link}**
${actualPageContent}

${structuredContactInfo}

CRITICAL INSTRUCTIONS FOR CONTACT INFORMATION:
- Search through ALL the content above to find staff names and contact details
- Look for patterns like "Rektor: [Name]", "Rektor [Name]", or similar role indicators
- Check for contact sections, staff listings, or organizational information
- Do NOT say information is unavailable if you can find names or roles in the content above
- Extract names, email addresses, and phone numbers when present
- If you find staff information, present it clearly with roles and contact details

** IMPORTANT **: You have the COMPLETE page content above. Do not claim information is missing unless you have thoroughly searched through all the provided content.` : 'No page content could be scraped.'}

**SEARCH RESULTS FOR REFERENCE:**
${enhancedSearchResults.slice(0, 3).map((result, index) => 
  `${index + 1}. ${result.title}
     ${result.description}
     Link: ${result.link}
     Relevance: ${result.relevanceScore || 0}/20`
).join('\n\n')}

User's original language: ${languageDetection.language} (${languageDetection.languageCode})
Respond in the SAME language as the user's question.`
        } else {
          console.log(`❌ No results found for translated query: "${intentTranslation.translatedQuery}"`)
        }
      }
    } catch (error) {
      console.error('Error in multilingual enhancement:', error)
      // Continue with standard flow if multilingual enhancement fails
    }
    
    // Build intent-aware response enhancements
    const { systemPromptAddition, prioritizedLinks } = buildIntentAwareResponse(intentAnalysis, latestMessage)
    
    // Build conversation history for context
    let conversationContext = ENHANCED_SYSTEM_PROMPT + systemPromptAddition + multilingualEnhancement
    
    if (messages && messages.length > 1) {
      // Add previous conversation history
      conversationContext += "\n\nPrevious conversation:\n"
      messages.slice(0, -1).forEach((msg, index) => {
        let msgContent = ""
        if (typeof msg.content === 'string') {
          msgContent = msg.content
        } else if (Array.isArray(msg.content)) {
          msgContent = msg.content
            .filter(part => part.type === 'text')
            .map(part => part.text)
            .join(' ')
        }
        conversationContext += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msgContent}\n`
      })
    }    conversationContext += `\nCurrent User: ${latestMessage}`    // Check if we should fetch additional information and discover relevant sub-pages
    let additionalInfo = ""
    let scrapedPageContent = ""
    
    // Handle school information requests
    if (intentAnalysis.intent.category === 'Grundskola' && 
        (latestMessage.toLowerCase().includes('vilka') || 
         latestMessage.toLowerCase().includes('lista') ||
         latestMessage.toLowerCase().includes('which') ||
         latestMessage.toLowerCase().includes('list'))) {
      console.log('Fetching school information and discovering relevant sub-pages...')
      additionalInfo = await fetchBotkyrkaSchools('grundskola')
    }
      // Discover relevant sub-pages using Botkyrka's search function
    if (intentAnalysis.intent.category && intentAnalysis.intent.category !== 'Unknown') {
      console.log(`Using Botkyrka search for category: ${intentAnalysis.intent.category}`)
      
      // Create search queries based on user's message and detected intent
      const searchQueries = []
      
      // Primary search: use the user's actual keywords
      const userKeywords = intentAnalysis.intent.keywords.join(' ')
      if (userKeywords) {
        searchQueries.push(userKeywords)
      }
      
      // Secondary search: add category-specific terms
      const categorySearchTerms: { [key: string]: string[] } = {
        'Förskola': ['förskola', 'dagis', 'barnomsorg'],
        'Grundskola': ['grundskola', 'skola', 'skolor'],
        'Bygglov': ['bygglov', 'byggande', 'byggtillstånd'],
        'Boende-och-miljö': ['boende', 'miljö', 'avfall', 'återvinning'],
        'Stöd-och-trygghet': ['hemtjänst', 'äldreomsorg', 'trygghet'],
        'Jobb': ['jobb', 'lediga tjänster', 'karriär'],
        'Sport-och-kultur': ['sport', 'kultur', 'aktiviteter'],
        'Trafik-och-parkering': ['parkering', 'trafik', 'transport'],
        'Utbildning-vuxna': ['komvux', 'sfi', 'vuxenutbildning']
      }
      
      const categoryTerms = categorySearchTerms[intentAnalysis.intent.category] || []
      
      // If user asks "vilka/which" - add that to search for better results
      if (latestMessage.toLowerCase().includes('vilka') || latestMessage.toLowerCase().includes('which')) {
        if (categoryTerms.length > 0) {
          searchQueries.push(`vilka ${categoryTerms[0]}`)
        }
      }
      
      // Use the most specific search query
      const primarySearchQuery = searchQueries[0] || categoryTerms[0] || intentAnalysis.intent.category
        if (primarySearchQuery) {
        console.log(`Using Botkyrka search for: "${primarySearchQuery}"`)
        const subPagesInfo = await discoverRelevantSubPagesWithSearch(intentAnalysis.intent.category, primarySearchQuery, latestMessage, baseApiUrl)
        if (subPagesInfo) {
          additionalInfo += subPagesInfo
          
          // Auto-scrape content from the top-ranked page for detailed answers
          const topPageUrl = extractTopRankedUrl(subPagesInfo)
          if (topPageUrl && shouldScrapeContent(latestMessage, intentAnalysis.intent.category)) {
            console.log(`Auto-scraping content from top-ranked page: ${topPageUrl}`)
            scrapedPageContent = await scrapeContentForGemini(topPageUrl, latestMessage, baseApiUrl)
          }
        }
      }
    }
    
    if (additionalInfo) {
      conversationContext += `\n\nAdditional context and relevant pages: ${additionalInfo}`
    }
    
    if (scrapedPageContent) {
      conversationContext += `\n\nScraped content from the most relevant page: ${scrapedPageContent}`
    }

    // Generate content using the Google AI SDK
    const result = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: conversationContext,
    })

    // Access the response text correctly
    const rawResponse = result.text || "Sorry, I couldn't generate a response."
    console.log('Gemini raw response:', rawResponse)
    
    // Clean up the response formatting
    const cleanedResponse = rawResponse
      // Clean up separators first
      .replace(/---\s*#+\s*\*{0,2}/gm, '\n\n**')
      .replace(/---\s*/gm, '\n\n')
      .replace(/^#+\s*\*{0,2}/gm, '**')
      
      // Remove multiple asterisks and clean up bold formatting
      .replace(/\*{3,}/g, '**')
      .replace(/\*\*\*([^*]+)\*\*\*/g, '**$1**')
      
      // Clean up list items with excessive formatting
      .replace(/^\*{2,}([^*:]+):\*{2,}/gm, '**$1:**')
      .replace(/^\*{2,}([^*]+)\*{2,}$/gm, '• $1')
      
      // Clean up contact formatting
      .replace(/\*{2,}\s*([^*]*(?:Telefon|Phone|E-post|Email|Adress)[^*:]*?):\s*\*{2,}/gi, '**$1:**')
      
      // Fix headings to have proper spacing
      .replace(/(\*\*[^*:]+\*\*)\s+([A-ZÅÄÖ])/g, '$1\n\n$2')
      
      // Clean up bullet points
      .replace(/^•\s*\*{2,}([^*:]+):\*{2,}/gm, '• **$1:**')
      .replace(/^•\s*\*{2,}([^*]+)\*{2,}/gm, '• $1')
      
      // Clean up excess whitespace but preserve structure
      .replace(/[ \t]+/g, ' ')
      .replace(/\n[ \t]+/g, '\n')
      .replace(/\n{4,}/g, '\n\n\n')
      .replace(/^\n+/, '')
      .replace(/\n+$/, '')
      .trim()

    return new Response(JSON.stringify({ 
      content: cleanedResponse,
      type: "answer",
      language: "sv", // We can add language detection later if needed
      role: 'assistant',
      metadata: {
        scrapedContent: scrapedPageContent.length > 0,
        discoveredPages: additionalInfo.length > 0,
        intentCategory: intentAnalysis.intent.category,
        confidence: intentAnalysis.intent.confidence,
        multilingualEnhanced: enhancedSearchResults.length > 0,
        enhancedResultsCount: enhancedSearchResults.length,
        structured: true
      }
    }), {
      headers: {
        'Content-Type': 'application/json',
      },
    })

  } catch (error) {
    console.error('Chat API Error:', error)
    
    // Return error message based on the error type
    let errorMessage = "Sorry, something went wrong. Please try again."
      if (error instanceof Error) {
      if (error.message.includes('API key')) {
        errorMessage = "API configuration error. Please check the setup."
      } else if (error.message.includes('quota') || error.message.includes('limit')) {
        errorMessage = "Service temporarily unavailable. Please try again later."
      } else if (error.message.includes('overloaded') || error.message.includes('503') || error.message.includes('UNAVAILABLE')) {
        errorMessage = "Ursäkta, tjänsten är överbelastad just nu. Försök igen om en stund."
      } else if (error.message.includes('thinking')) {
        errorMessage = "Model configuration issue. Please try again."
      }
    }
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      details: error instanceof Error ? error.message : 'Unknown error'
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

// Function definitions for Gemini to call
const tools = [
  {
    functionDeclarations: [
      {
        name: "fetch_botkyrka_schools",
        description: "Fetch information about schools in Botkyrka municipality from the official website. Use this when users ask about which schools exist, school names, or want a list of schools.",
        parameters: {
          type: "object",
          properties: {
            school_type: {
              type: "string",
              enum: ["forskola", "grundskola", "all"],
              description: "Type of schools to fetch: forskola (preschools), grundskola (elementary schools), or all"
            }
          },
          required: ["school_type"]
        }
      },
      {
        name: "fetch_botkyrka_page_content",
        description: "Fetch content from specific Botkyrka municipality pages to get current information. Use this for detailed questions about services that might need up-to-date information.",
        parameters: {
          type: "object",
          properties: {
            page_url: {
              type: "string",
              description: "The full URL of the Botkyrka page to fetch"
            },
            topic: {
              type: "string",
              description: "What topic/information the user is asking about"
            }
          },
          required: ["page_url", "topic"]
        }
      }
    ]
  }
]

// Function implementations
async function handleFunctionCall(functionName: string, args: any) {
  switch (functionName) {
    case "fetch_botkyrka_schools":
      return await fetchBotkyrkaSchools(args.school_type)
    case "fetch_botkyrka_page_content":
      return await fetchBotkyrkaPageContent(args.page_url, args.topic)
    default:
      return "Function not found"
  }
}

async function fetchBotkyrkaSchools(schoolType: string) {
  try {
    const urls = {
      forskola: "https://www.botkyrka.se/skola-och-forskola/barnomsorg-i-botkyrka/forskola",
      grundskola: "https://www.botkyrka.se/skola-och-forskola/grundskola",
      all: "https://www.botkyrka.se/skola-och-forskola"
    }

    const url = urls[schoolType as keyof typeof urls] || urls.all
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    })

    if (!response.ok) {
      return `Could not fetch school information. Status: ${response.status}`
    }

    const html = await response.text()
    
    // Extract school names and information from the HTML
    const schoolInfo = extractSchoolsFromHtml(html, schoolType)
    
    return schoolInfo
  } catch (error) {
    console.error('Error fetching schools:', error)
    return "Sorry, I couldn't fetch the current school information. Please check the Botkyrka website directly."
  }
}

async function fetchBotkyrkaPageContent(pageUrl: string, topic: string) {
  try {
    // Only allow Botkyrka URLs for security
    if (!pageUrl.includes('botkyrka.se')) {
      return "I can only fetch content from Botkyrka municipality websites."
    }

    const response = await fetch(pageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    })

    if (!response.ok) {
      return `Could not fetch page content. Status: ${response.status}`
    }

    const html = await response.text()
    
    // Extract relevant content based on the topic
    const content = extractRelevantContent(html, topic)
    
    return content
  } catch (error) {
    console.error('Error fetching page content:', error)
    return "Sorry, I couldn't fetch the page content. Please check the Botkyrka website directly."
  }
}

function extractSchoolsFromHtml(html: string, schoolType: string): string {
  // Remove HTML tags and extract text content
  const textContent = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  
  // Look for school-related patterns
  const schoolPatterns = [
    /([A-ZÅÄÖ][a-zåäö\s]+skola)/g,
    /([A-ZÅÄÖ][a-zåäö\s]+förskola)/g,
    /([A-ZÅÄÖ][a-zåäö\s]+(skola|förskola|centrum))/g
  ]
  
  const schools = new Set<string>()
  
  schoolPatterns.forEach(pattern => {
    const matches = textContent.match(pattern)
    if (matches) {
      matches.forEach(match => {
        const cleaned = match.trim()
        if (cleaned.length > 3 && cleaned.length < 50) {
          schools.add(cleaned)
        }
      })
    }
  })
  
  if (schools.size === 0) {
    return `I found information about ${schoolType} on the Botkyrka website, but couldn't extract specific school names from the current page structure. Please visit the page directly for the most up-to-date list.`
  }
  
  return `Here are some schools I found in Botkyrka:\n\n${Array.from(schools).slice(0, 10).join('\n')}\n\nFor the complete and most current list, please check the official website.`
}

function extractRelevantContent(html: string, topic: string): string {
  // Remove HTML tags and extract text content
  const textContent = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  
  // Split into sentences and find relevant ones
  const sentences = textContent.split(/[.!?]+/).filter(s => s.trim().length > 20)
  
  const relevantSentences = sentences.filter(sentence => {
    const lowerSentence = sentence.toLowerCase()
    const lowerTopic = topic.toLowerCase()
    return lowerSentence.includes(lowerTopic) || 
           lowerTopic.split(' ').some(word => lowerSentence.includes(word))
  })
  
  if (relevantSentences.length === 0) {
    return `I found information on the page, but couldn't extract specific details about "${topic}". Please check the page directly for detailed information.`
  }
  
  return relevantSentences.slice(0, 3).join('. ') + '.'
}

// Helper function to discover relevant sub-pages for service categories
async function discoverRelevantSubPages(category: string, baseUrl: string, userQuery: string = '', apiBaseUrl: string = 'http://localhost:3000'): Promise<string> {
  try {
    // Use the provided API base URL
    const linkResponse = await fetch(`${apiBaseUrl}/api/extract-links`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        url: baseUrl,
        contentType: 'links'
      })
    })
    
    if (!linkResponse.ok) return ''
    
    const response = await linkResponse.json()
    const links = response.links || []
    
    if (!Array.isArray(links) || links.length === 0) {
      console.log(`No links found for category ${category}`)
      return ''
    }
    
    // Enhanced scoring system that considers user query
    const scoredLinks = links
      .map((link: any) => {
        const text = link.text.toLowerCase()
        const href = link.href.toLowerCase()
        const userQueryLower = userQuery.toLowerCase()
        let score = 0
        
        // HIGH PRIORITY: Direct query matches in URL or text
        if (userQueryLower.includes('vilka') || userQueryLower.includes('which') || userQueryLower.includes('lista') || userQueryLower.includes('list')) {
          // User wants a list/directory - prioritize pages with specific items
          if (href.includes('grundskolor-i-botkyrka') || text.includes('grundskolor i botkyrka')) score += 10
          if (href.includes('skolor-i-') || text.includes('skolor i ')) score += 8
          if (href.includes('lista') || text.includes('lista')) score += 6
          if (href.includes('hitta') || text.includes('hitta')) score += 5
        }
        
        // MEDIUM PRIORITY: Category-specific keywords from user query
        const queryWords = userQueryLower.split(/\s+/).filter(word => word.length > 2)
        queryWords.forEach(word => {
          if (text.includes(word) || href.includes(word)) {
            score += word.length > 4 ? 4 : 3
          }
        })
        
        // Enhanced category keywords for better filtering
        const categoryKeywords: { [key: string]: string[] } = {
          'Förskola': ['förskola', 'ansök', 'köer', 'platser', 'avgifter', 'anmäl', 'barnomsorg', 'dagis'],
          'Grundskola': ['grundskola', 'grundskolor', 'skola', 'skolor', 'ansök', 'val', 'anmäl', 'skolval', 'inskriv', 'skolskjuts', 'fritids', 'hitta'],
          'Bygglov': ['bygglov', 'ansök', 'tillstånd', 'anmälan', 'avgifter', 'byggande', 'renovering', 'marklov'],
          'Boende-och-miljö': ['boende', 'miljö', 'avfall', 'återvinning', 'bidrag', 'bostadsbidrag', 'sopor', 'park'],
          'Stöd-och-trygghet': ['hemtjänst', 'äldreomsorg', 'stöd', 'trygghet', 'bistånd', 'socialtjänst', 'LSS', 'våld'],
          'Jobb': ['jobb', 'lediga', 'ansök', 'karriär', 'praktik', 'anställning', 'arbetslös', 'tjänster'],
          'Sport-och-kultur': ['sport', 'kultur', 'aktivitet', 'bokning', 'evenemang', 'idrott', 'bibliotek', 'fritid'],
          'Trafik-och-parkering': ['parkering', 'trafik', 'tillstånd', 'väg', 'transport', 'parkeringstillstånd', 'cykel'],
          'Utbildning-vuxna': ['komvux', 'sfi', 'vuxenutbildning', 'kurser', 'studier', 'svenska', 'yrkesutbildning']
        }
        
        const keywords = categoryKeywords[category] || []
        
        // Score based on category keyword matches
        keywords.forEach(keyword => {
          if (text.includes(keyword.toLowerCase()) || href.includes(keyword.toLowerCase())) {
            score += keyword.length > 5 ? 2 : 1
          }
        })
        
        // Boost score for action words
        const actionWords = ['ansök', 'apply', 'anmäl', 'register', 'boka', 'book', 'kontakta', 'contact', 'hitta', 'find']
        actionWords.forEach(action => {
          if (text.includes(action) || href.includes(action)) score += 2
        })
        
        // PENALTIES: Reduce score for generic or unrelated content
        const genericWords = ['hem', 'home', 'start', 'allmän', 'general', 'översikt', 'overview', 'kontakt', 'contact-general']
        genericWords.forEach(generic => {
          if (text.includes(generic)) score -= 1
        })
        
        // Penalize complaint/feedback pages for directory queries
        if ((userQueryLower.includes('vilka') || userQueryLower.includes('lista')) && 
            (text.includes('klagomål') || text.includes('synpunkt') || text.includes('feedback') || text.includes('complaint'))) {
          score -= 3
        }
        
        // Penalize very long generic descriptions
        if (text.length > 80 && !text.includes(category.toLowerCase())) {
          score -= 1
        }
        
        return { ...link, score }
      })
      .filter((link: any) => link.score > 0)
      .sort((a: any, b: any) => b.score - a.score)
      .slice(0, 4) // Limit to top 4 most relevant
    
    if (scoredLinks.length > 0) {
      let result = '\n\nRelevant service pages discovered:\n'
      scoredLinks.forEach((link: any) => {
        // Clean up the link text for better presentation
        const cleanText = link.text.length > 60 ? link.text.substring(0, 57) + '...' : link.text
        result += `- ${cleanText} (Score: ${link.score}): ${link.href}\n`
      })
      result += '\nThese pages contain additional details and forms related to your query.'
      
      // Debug info
      console.log(`Top scored links for "${userQuery}":`)
      scoredLinks.slice(0, 3).forEach((link: any, i) => {
        console.log(`  ${i + 1}. Score ${link.score}: "${link.text.substring(0, 40)}..." -> ${link.href}`)
      })
      
      return result
    }
    
    return ''
  } catch (error) {
    console.log('Could not discover sub-pages for', category, ':', error)
    return ''
  }
}

// Helper function to discover relevant sub-pages using Botkyrka's search function
async function discoverRelevantSubPagesWithSearch(category: string, searchQuery: string, userQuery: string = '', apiBaseUrl: string = 'http://localhost:3000'): Promise<string> {
  try {
    // Use Botkyrka's search function to find the most relevant content
    const linkResponse = await fetch(`${apiBaseUrl}/api/extract-links`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        searchQuery: searchQuery
      })
    })
    
    if (!linkResponse.ok) return ''
    
    const response = await linkResponse.json()
    const searchResults = response.links || []
    
    if (!Array.isArray(searchResults) || searchResults.length === 0) {
      console.log(`No search results found for query: "${searchQuery}"`)
      return ''
    }
    
    console.log(`Botkyrka search found ${searchResults.length} results for: "${searchQuery}"`)
    
    // Enhanced scoring system for search results
    const scoredResults = searchResults
      .map((link: any) => {
        const text = link.text.toLowerCase()
        const href = link.href.toLowerCase()
        const userQueryLower = userQuery.toLowerCase()
        const searchQueryLower = searchQuery.toLowerCase()
        let score = 5 // Base score for being a search result
        
        // HIGH PRIORITY: Direct matches with user query intent
        if (userQueryLower.includes('vilka') || userQueryLower.includes('which') || userQueryLower.includes('lista')) {
          // Boost pages that list or enumerate things
          if (href.includes('grundskolor-i-botkyrka') || text.includes('grundskolor i botkyrka')) score += 15
          if (href.includes('-i-botkyrka') || text.includes(' i botkyrka')) score += 10
          if (text.includes('lista') || text.includes('hitta') || text.includes('alla')) score += 8
        }
        
        // SEARCH QUERY RELEVANCE: How well the result matches our search
        const searchWords = searchQueryLower.split(/\s+/)
        searchWords.forEach(word => {
          if (word.length > 2) {
            if (text.includes(word)) score += 3
            if (href.includes(word)) score += 2
          }
        })
        
        // USER QUERY WORD MATCHING
        const queryWords = userQueryLower.split(/\s+/).filter(word => word.length > 2)
        queryWords.forEach(word => {
          if (text.includes(word) || href.includes(word)) {
            score += word.length > 4 ? 4 : 3
          }
        })
        
        // BOOST for action/directory pages
        const actionWords = ['ansök', 'apply', 'hitta', 'find', 'alla', 'list', 'directory']
        actionWords.forEach(action => {
          if (text.includes(action) || href.includes(action)) score += 3
        })
        
        // PENALIZE generic or unrelated content
        if (text.includes('kontakt') && !userQueryLower.includes('kontakt')) score -= 2
        if (text.includes('allmän information') || text.includes('översikt')) score -= 1
        
        // PENALIZE very long generic descriptions
        if (text.length > 100 && !searchWords.some(word => text.includes(word))) {
          score -= 2
        }
        
        return { ...link, score }
      })
      .filter((link: any) => link.score > 3) // Only keep reasonably relevant results
      .sort((a: any, b: any) => b.score - a.score)
      .slice(0, 5) // Limit to top 5 most relevant
    
    if (scoredResults.length > 0) {
      let result = `\n\nBotkyrka search results for "${searchQuery}":\n`
      scoredResults.forEach((link: any) => {
        const cleanText = link.text.length > 60 ? link.text.substring(0, 57) + '...' : link.text
        result += `- ${cleanText} (Score: ${link.score}): ${link.href}\n`
      })
      result += '\nThese are the most relevant pages found by Botkyrka\'s search engine.'
      
      // Debug info
      console.log(`Top search results for "${searchQuery}":`)
      scoredResults.slice(0, 3).forEach((link: any, i) => {
        console.log(`  ${i + 1}. Score ${link.score}: "${link.text.substring(0, 40)}..." -> ${link.href}`)
      })
      
      return result
    }
    
    return ''
  } catch (error) {
    console.log('Could not search Botkyrka for', searchQuery, ':', error)
    return ''
  }
}

// Helper functions for content scraping

/**
 * Extracts the top-ranked URL from search results info
 */
function extractTopRankedUrl(subPagesInfo: string): string | null {
  try {
    const lines = subPagesInfo.split('\n')
    for (const line of lines) {
      // Look for lines with scores and URLs
      const match = line.match(/\(Score: (\d+)\): (https?:\/\/[^\s]+)/)
      if (match && parseInt(match[1]) >= 8) { // Only scrape high-quality results
        return match[2]
      }
    }
    return null
  } catch (error) {
    console.log('Error extracting top URL:', error)
    return null
  }
}

/**
 * Determines if content should be scraped based on query type and category
 */
function shouldScrapeContent(userMessage: string, category: string): boolean {
  const lowerMessage = userMessage.toLowerCase()
  
  // Scrape for detailed questions that need current information
  const detailQuestions = [
    'hur',     // how
    'vad',     // what
    'när',     // when
    'vilka',   // which/what (plural)
    'vem',     // who
    'var',     // where
    'varför',  // why
    'how',
    'what',
    'when',
    'which',
    'who',
    'where',
    'why',
    'ansök',   // apply
    'avgift',  // fee
    'kostnad', // cost
    'tid',     // time
    'krav',    // requirements
    'process', // process
    'steg'     // steps
  ]
  
  // Don't scrape for very simple greetings or single-word queries
  const simpleQueries = ['hej', 'hello', 'tack', 'thanks', category.toLowerCase()]
  
  if (simpleQueries.some(simple => lowerMessage === simple)) {
    return false
  }
  
  // Scrape if the message contains detail-seeking words
  return detailQuestions.some(word => lowerMessage.includes(word))
}

/**
 * Scrapes content from a URL and formats it for Gemini
 */
async function scrapeContentForGemini(url: string, userQuery: string, apiBaseUrl: string): Promise<string> {
  try {
    const response = await fetch(`${apiBaseUrl}/api/scrape-content`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        url: url,
        contentSummary: true // Get summarized content for better context
      })
    })
    
    if (!response.ok) {
      console.log(`Failed to scrape content from ${url}: ${response.status}`)
      return ''
    }
    
    const data = await response.json()
    
    if (!data.content) {
      console.log(`No content returned from ${url}`)
      return ''
    }
    
    // Format the scraped content for Gemini
    let formattedContent = `\n--- Current Information from ${url} ---\n`
    formattedContent += `Title: ${data.metadata?.title || 'Unknown'}\n`
    formattedContent += `Content: ${data.content}\n`
    
    if (data.metadata?.hasForms) {
      formattedContent += `\nNote: This page contains application forms.\n`
    }
    
    if (data.metadata?.hasContactInfo) {
      formattedContent += `\nNote: This page contains contact information.\n`
    }
    
    if (data.metadata?.hasDownloads) {
      formattedContent += `\nNote: This page has downloadable documents.\n`
    }
    
    formattedContent += `--- End of scraped content ---\n`
    
    console.log(`Successfully scraped ${data.metadata?.wordCount || 0} words from ${url}`)
    return formattedContent
    
  } catch (error) {
    console.log('Error scraping content for Gemini:', error)
    return ''
  }
}