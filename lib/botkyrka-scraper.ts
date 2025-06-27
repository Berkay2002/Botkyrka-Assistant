// Botkyrka municipality website scraper
// Handles fetching and parsing search results from botkyrka.se

import axios from 'axios'
import * as cheerio from 'cheerio'

export interface BotkyrkaSearchResult {
  title: string
  description: string
  link: string
  relevanceScore?: number
}

export interface ScrapingResult {
  results: BotkyrkaSearchResult[]
  query: string
  totalResults: number
  success: boolean
  error?: string
}

/**
 * Fetch search results from Botkyrka Kommun's official search
 * Uses the exact URL structure and HTML selectors from the municipality website
 */
export async function fetchBotkyrkaSearchResults(query: string): Promise<ScrapingResult> {
  try {
    const encodedQuery = encodeURIComponent(query)
    const searchUrl = `https://www.botkyrka.se/sokresultat?query=${encodedQuery}&submitButton=Sök`
    
    console.log(`Fetching from Botkyrka: ${searchUrl}`)
    
    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'sv-SE,sv;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      },
      timeout: 10000
    })

    if (response.status !== 200) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const results = parseBotkyrkaSearchResults(response.data)
    
    return {
      results,
      query,
      totalResults: results.length,
      success: true
    }
    
  } catch (error) {
    console.error('Error fetching Botkyrka search results:', error)
    return {
      results: [],
      query,
      totalResults: 0,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

/**
 * Parse HTML from Botkyrka search results page
 * Uses the exact CSS selectors based on the municipality's current HTML structure
 */
function parseBotkyrkaSearchResults(html: string): BotkyrkaSearchResult[] {
  const $ = cheerio.load(html)
  const results: BotkyrkaSearchResult[] = []

  // Primary selector for search results (based on the provided HTML structure)
  $('ol.sv-search-result.c9660 > li.sv-search-hit').each((_, element) => {
    const $element = $(element)
    
    // Extract title and link
    const titleElement = $element.find('h2 a')
    const title = titleElement.text().trim()
    const relativeLink = titleElement.attr('href')
    
    // Extract description
    const description = $element.find('p.normal.c9663').text().trim()
    
    if (title && relativeLink) {
      // Convert relative link to absolute URL
      const absoluteLink = new URL(relativeLink, 'https://www.botkyrka.se').href
      
      results.push({
        title,
        description: description || '',
        link: absoluteLink
      })
    }
  })

  // Fallback selector in case the structure changes
  if (results.length === 0) {
    $('li.sv-search-hit').each((_, element) => {
      const $element = $(element)
      
      const titleElement = $element.find('h2 a, h3 a, .title a, a[href]').first()
      const title = titleElement.text().trim()
      const relativeLink = titleElement.attr('href')
      
      const description = $element.find('p, .description, .excerpt').first().text().trim()
      
      if (title && relativeLink) {
        const absoluteLink = new URL(relativeLink, 'https://www.botkyrka.se').href
        
        results.push({
          title,
          description: description || '',
          link: absoluteLink
        })
      }
    })
  }

  // Additional fallback for generic search results
  if (results.length === 0) {
    $('.search-result, .search-hit, .result-item').each((_, element) => {
      const $element = $(element)
      
      const titleElement = $element.find('a[href]').first()
      const title = titleElement.text().trim()
      const relativeLink = titleElement.attr('href')
      
      const description = $element.find('p, .snippet, .summary').first().text().trim()
      
      if (title && relativeLink && relativeLink.startsWith('/')) {
        const absoluteLink = new URL(relativeLink, 'https://www.botkyrka.se').href
        
        results.push({
          title,
          description: description || '',
          link: absoluteLink
        })
      }
    })
  }

  console.log(`Parsed ${results.length} results from Botkyrka search`)
  return results
}

/**
 * Rank search results by relevance to the user's query
 * Scores results based on title and description matching
 */
export function rankResultsByRelevance(results: BotkyrkaSearchResult[], query: string): BotkyrkaSearchResult[] {
  const queryWords = query.toLowerCase().split(/\s+/).filter(word => word.length > 2)
  
  const scoredResults = results.map(result => {
    let score = 0
    const titleLower = result.title.toLowerCase()
    const descLower = result.description.toLowerCase()
    
    // Score based on exact matches in title (higher weight)
    queryWords.forEach(word => {
      if (titleLower.includes(word)) {
        score += 10
      }
      if (descLower.includes(word)) {
        score += 5
      }
      // Bonus for exact phrase matches
      if (titleLower.includes(query.toLowerCase())) {
        score += 20
      }
    })
    
    // Bonus for official service pages
    if (result.link.includes('/sjalvservice-och-blanketter') || 
        result.link.includes('/skola-och-forskola') ||
        result.link.includes('/bo-och-leva')) {
      score += 15
    }
    
    return {
      ...result,
      relevanceScore: score
    }
  })
  
  // Sort by score (highest first) and return top results
  return scoredResults
    .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0))
    .slice(0, 8) // Limit to top 8 results
}

/**
 * Scrape content from a specific Botkyrka page for detailed information
 */
export async function scrapePageContent(url: string): Promise<{
  content: string
  success: boolean
  rawHtml?: string
  structuredInfo?: {
    contacts: Array<{role: string, name: string, email?: string, phone?: string}>
    officialInfo: string
  }
  error?: string
}> {
  try {
    console.log(`🔍 Scraping ALL content from: ${url}`)
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      },
      timeout: 8000
    })

    const htmlContent = response.data
    const $ = cheerio.load(htmlContent)
    
    // Try structured extraction first (for backwards compatibility)
    const structuredData = extractStructuredInfo(htmlContent)
    
    // Remove only scripts, styles, and navigation elements but keep ALL content
    $('script, style, nav, header, footer, .cookie-banner, .navigation, .breadcrumb').remove()
    
    // Get the FULL page content without being too selective
    let fullContent = ''
    
    // Try main content area first
    const mainContent = $('main, .main-content, .page-content, #content, .sv-layout').first()
    if (mainContent.length > 0) {
      fullContent = mainContent.html() || ''
    } else {
      // Fallback: get everything in body
      fullContent = $('body').html() || ''
    }
    
    // Convert HTML to readable text but preserve structure
    let cleanContent = ''
    if (fullContent) {
      // Replace common HTML elements with readable equivalents
      cleanContent = fullContent
        .replace(/<h[1-6][^>]*>/gi, '\n\n**')
        .replace(/<\/h[1-6]>/gi, '**\n')
        .replace(/<p[^>]*>/gi, '\n')
        .replace(/<\/p>/gi, '\n')
        .replace(/<br[^>]*\/?>/gi, '\n')
        .replace(/<strong[^>]*>/gi, '**')
        .replace(/<\/strong>/gi, '**')
        .replace(/<em[^>]*>/gi, '*')
        .replace(/<\/em>/gi, '*')
        .replace(/<li[^>]*>/gi, '\n• ')
        .replace(/<\/li>/gi, '')
        .replace(/<ul[^>]*>|<\/ul>/gi, '\n')
        .replace(/<ol[^>]*>|<\/ol>/gi, '\n')
        .replace(/<div[^>]*class="[^"]*contact[^"]*"[^>]*>/gi, '\n\n**KONTAKT:**\n')
        .replace(/<a\s+href="mailto:([^"]+)"[^>]*>/gi, '\nEmail: $1 ')
        .replace(/<a\s+href="tel:([^"]+)"[^>]*>/gi, '\nTelefon: $1 ')
        .replace(/<a[^>]*href="([^"]+)"[^>]*>/gi, ' [Länk: $1] ')
        .replace(/<\/a>/gi, '')
        .replace(/<[^>]+>/g, ' ') // Remove remaining HTML tags
        .replace(/\s+/g, ' ') // Normalize whitespace
        .replace(/\n\s*\n\s*\n/g, '\n\n') // Remove excessive line breaks
        .trim()
    }
    
    console.log(`✅ Successfully scraped ${cleanContent.length} characters of ALL content from ${url}`)
    console.log(`📋 Found ${structuredData.contacts.length} structured contacts`)
    
    return {
      content: cleanContent.substring(0, 8000), // Increased limit for full content
      success: true,
      rawHtml: fullContent.substring(0, 10000), // Also provide raw HTML sample
      structuredInfo: {
        contacts: structuredData.contacts,
        officialInfo: structuredData.officialInfo
      }
    }
    
  } catch (error) {
    console.error('❌ Error scraping page content:', error)
    return {
      content: '',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Extract structured contact information from HTML content
 * Prioritizes official contact sections over quotes or testimonials
 */
function extractStructuredInfo(html: string): {
  contacts: Array<{role: string, name: string, email?: string, phone?: string}>,
  officialInfo: string,
  generalContent: string
} {
  const contacts: Array<{role: string, name: string, email?: string, phone?: string}> = []
  let officialInfo = ''
  let generalContent = ''
  
  try {
    // Look for contact sections (prioritize these)
    const contactSectionRegex = /<div[^>]*class="[^"]*sv-text-portlet-content[^"]*"[^>]*>[\s\S]*?<h2[^>]*id="h-Kontakt"[^>]*>Kontakt<\/h2>([\s\S]*?)<\/div>/i
    const contactMatch = html.match(contactSectionRegex)
    
    if (contactMatch) {
      const contactSection = contactMatch[1]
      officialInfo = contactSection
      
      // Extract rektor information
      const rektorRegex = /<strong[^>]*>.*?Rektor.*?<\/strong>[\s\S]*?<span[^>]*>(.*?)<br/i
      const rektorMatch = contactSection.match(rektorRegex)
      
      if (rektorMatch) {
        const rektorName = rektorMatch[1].trim()
        
        // Extract email and phone for this rektor
        const emailRegex = /<a href="mailto:([^"]+)"/
        const phoneRegex = /<a href="tel:([^"]+)"/
        
        const emailMatch = contactSection.match(emailRegex)
        const phoneMatch = contactSection.match(phoneRegex)
        
        contacts.push({
          role: 'Rektor',
          name: rektorName,
          email: emailMatch ? emailMatch[1] : undefined,
          phone: phoneMatch ? phoneMatch[1] : undefined
        })
      }
      
      // Extract biträdande rektor information
      const bitradandeRegex = /<strong>Biträdande rektor åk ([^<]+)<\/strong><br[^>]*>([^<]+)/g
      let bitradandeMatch
      
      while ((bitradandeMatch = bitradandeRegex.exec(contactSection)) !== null) {
        const grade = bitradandeMatch[1].trim()
        const name = bitradandeMatch[2].trim()
        
        contacts.push({
          role: `Biträdande rektor åk ${grade}`,
          name: name,
          email: undefined, // Could be extracted similarly if needed
          phone: undefined
        })
      }
    }
    
    // Clean up general content (remove HTML tags for better readability)
    generalContent = html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    
  } catch (error) {
    console.error('Error extracting structured info:', error)
    // Fallback to basic content extraction
    generalContent = html
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  }
  
  return { contacts, officialInfo, generalContent }
}
