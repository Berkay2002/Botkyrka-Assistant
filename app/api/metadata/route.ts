import { NextRequest, NextResponse } from 'next/server'

interface MetaData {
  title?: string
  description?: string
  image?: string
  siteName?: string
  url?: string
}

/**
 * Handle GET /api/metadata?url=…
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const url = searchParams.get('url')

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 })
  }

  return await fetchMetadata(url)
}

/**
 * Handle POST /api/metadata
 * Body: { url: string }
 */
export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json()
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }
    return await fetchMetadata(url)
  } catch (err) {
    console.error('Error parsing request body:', err)
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}

/**
 * Shared metadata-fetching logic
 */
async function fetchMetadata(targetUrl: string) {
  try {
    const fetchOptions = {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
          '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'sv-SE,sv;q=0.9,en;q=0.8',
        DNT: '1',
        Connection: 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
      signal: AbortSignal.timeout(10_000),
    }

    const res = await fetch(targetUrl, fetchOptions)
    if (!res.ok) {
      return NextResponse.json(createFallbackMetadata(targetUrl))
    }

    const html = await res.text()
    const metadata: MetaData = {}

    const extract = (prop: string, attr: 'property' | 'name' = 'property') => {
      const re = new RegExp(
        `<meta\\s+${attr}=["']${prop}["'][^>]*content=["']([^"']*)["'][^>]*>`,
        'i'
      )
      return html.match(re)?.[1] ?? null
    }

    metadata.title =
      extract('og:title') ||
      extract('twitter:title') ||
      extract('title', 'name') ||
      html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] ||
      undefined

    metadata.description =
      extract('og:description') ||
      extract('twitter:description') ||
      extract('description', 'name') ||
      undefined

    metadata.image =
      extract('og:image') ||
      extract('twitter:image') ||
      extract('image', 'name') ||
      undefined

    metadata.siteName =
      extract('og:site_name') ||
      extract('application-name', 'name') ||
      'Botkyrka kommun'

    // Normalize image URL
    if (metadata.image) {
      try {
        const u = new URL(metadata.image, targetUrl)
        metadata.image = u.href
      } catch {
        metadata.image = undefined
      }
    }    // Clean up text - decode HTML entities
    if (metadata.title) {
      metadata.title = decodeHtmlEntities(metadata.title).trim()
    }
    if (metadata.description) {
      metadata.description = decodeHtmlEntities(metadata.description)
        .slice(0, 150)
        .trim()
    }

    metadata.url = targetUrl

    if (!metadata.title && !metadata.description) {
      return NextResponse.json(createFallbackMetadata(targetUrl))
    }

    return NextResponse.json(metadata)
  } catch (err) {
    console.error('Error fetching metadata:', err)
    return NextResponse.json(createFallbackMetadata(targetUrl))
  }
}

/**
 * Fallback metadata when scraping fails or for known Botkyrka URLs
 */
function createFallbackMetadata(url: string): MetaData {
  try {
    if (url.includes('sjalvservice-och-blanketter')) {
      try {
        const urlObj = new URL(url)
        const searchTerm = urlObj.searchParams.get('q')
        
        if (searchTerm) {
          const decodedSearchTerm = decodeURIComponent(searchTerm)
          
          if (decodedSearchTerm.includes('Boende') && decodedSearchTerm.includes('närmiljö')) {
            return {
              title: 'E-tjänster: Boende och närmiljö',
              description: 'Digitala tjänster för bygglov, bostadsbidrag, avfallshantering och andra boendefrågor.',
              siteName: 'Botkyrka kommun',
              url
            }
          } else if (decodedSearchTerm.includes('Förskola')) {
            return {
              title: 'E-tjänster: Förskola',
              description: 'Ansök om förskola, ändra uppgifter och hantera din förskoleansökan digitalt.',
              siteName: 'Botkyrka kommun',
              url
            }
          } else if (decodedSearchTerm.includes('Grundskola')) {
            return {
              title: 'E-tjänster: Grundskola',
              description: 'Digitala tjänster för grundskola: ansökan, skolbyte och andra skolärenden.',
              siteName: 'Botkyrka kommun',
              url
            }
          } else if (decodedSearchTerm.includes('Stöd') && decodedSearchTerm.includes('trygghet')) {
            return {
              title: 'E-tjänster: Stöd och trygghet',
              description: 'Digitala tjänster för ekonomiskt stöd, äldreomsorg och andra trygghetsfrågor.',
              siteName: 'Botkyrka kommun',
              url
            }
          }
          
          return {
            title: `E-tjänster: ${decodedSearchTerm}`,
            description: `Digitala tjänster och blanketter för ${decodedSearchTerm}. Ansök och anmäl dig till tjänster online.`,
            siteName: 'Botkyrka kommun',
            url
          }
        }
      } catch (e) {
        // URL parsing failed, use generic fallback
      }
      return {
        title: 'Självservice och blanketter',
        description: 'Alla digitala tjänster och blanketter på en plats. Ansök och anmäl dig till kommunens tjänster online.',
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
          description: 'Kontakt och support för stöd, omsorg och familjetjänster. Hjälp och rådgivning för din familj.',
          siteName: 'Botkyrka kommun',
          url
        }
      } else if (url.includes('groupId=5')) {
        return {
          title: 'Servicegrupp: Boende och närmiljö',
          description: 'Kontakt och support för boende, bygglov och närmiljöfrågor. Få hjälp med dina boendefrågor.',
          siteName: 'Botkyrka kommun',
          url
        }
      } else if (url.includes('groupId=14')) {
        return {
          title: 'Servicegrupp: Jobb och vuxenutbildning',
          description: 'Kontakt och support för jobb, vuxenutbildning och arbetsmarknadsservice. Hjälp med din karriär.',
          siteName: 'Botkyrka kommun',
          url
        }
      } else if (url.includes('groupId=13')) {
        return {
          title: 'Servicegrupp: Uppleva och göra',
          description: 'Kontakt och support för kultur, sport och fritidsaktiviteter. Information om evenemang.',
          siteName: 'Botkyrka kommun',
          url
        }
      } else if (url.includes('groupId=3')) {
        return {
          title: 'Servicegrupp: Stadsplanering och trafik',
          description: 'Kontakt och support för stadsplanering, trafik och infrastrukturfrågor. Hjälp med planfrågor.',
          siteName: 'Botkyrka kommun',
          url
        }
      } else {
        return {
          title: 'Servicegrupper - Botkyrka kommun',
          description: 'Hitta rätt servicegrupp och kontaktinformation för kommunens tjänster.',
          siteName: 'Botkyrka kommun',
          url
        }
      }
    }
    
    // Generic fallback
    return {
      title: 'Botkyrka kommun',
      description: 'Information och tjänster från Botkyrka kommun',
      siteName: 'Botkyrka kommun',
      url
    }
  } catch (e) {
    return {
      title: 'Botkyrka kommun',
      description: 'Information och tjänster från Botkyrka kommun',
      siteName: 'Botkyrka kommun',
      url: url || ''
    }
  }
}

/**
 * Decode HTML entities in text
 */
function decodeHtmlEntities(text: string): string {
  const entityMap: Record<string, string> = {
    '&quot;': '"',
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&nbsp;': ' ',
    '&#228;': 'ä',  // ä
    '&#229;': 'å',  // å
    '&#246;': 'ö',  // ö
    '&#196;': 'Ä',  // Ä
    '&#197;': 'Å',  // Å
    '&#214;': 'Ö',  // Ö
    '&#252;': 'ü',  // ü
    '&#220;': 'Ü',  // Ü
    '&#233;': 'é',  // é
    '&#201;': 'É',  // É
    '&#39;': "'",   // apostrophe
    '&#x27;': "'",  // apostrophe (hex)
    '&#x2019;': "'", // right single quotation mark
    '&#8217;': "'", // right single quotation mark
    '&#8220;': '"', // left double quotation mark
    '&#8221;': '"', // right double quotation mark
  }

  let decoded = text
  
  // Replace named entities first
  Object.entries(entityMap).forEach(([entity, replacement]) => {
    decoded = decoded.replace(new RegExp(entity, 'g'), replacement)
  })
  
  // Handle numeric entities (&#xxx;)
  decoded = decoded.replace(/&#(\d+);/g, (match, num) => {
    try {
      return String.fromCharCode(parseInt(num, 10))
    } catch {
      return match // Keep original if conversion fails
    }
  })
  
  // Handle hex entities (&#xXXX;)
  decoded = decoded.replace(/&#x([0-9a-fA-F]+);/g, (match, hex) => {
    try {
      return String.fromCharCode(parseInt(hex, 16))
    } catch {
      return match // Keep original if conversion fails
    }
  })
  
  return decoded
}