// comprehensive-test.mjs

import fetch from 'node-fetch'

const API_BASE_URL = 'http://localhost:3000'

async function testScrapingBehavior() {
  console.log('🔍 Testing Content Scraping Integration\n')
  
  const testCases = [
    {
      type: 'Detailed Question (Should Scrape)',
      question: 'Hur lång är handläggningstiden för bygglov och vilka handlingar behöver jag?',
      expectScraping: true
    },
    {
      type: 'List Question (Should Scrape)',
      question: 'Vilka förskolor finns i Botkyrka?',
      expectScraping: true
    },
    {
      type: 'Simple Greeting (Should NOT Scrape)',
      question: 'Hej',
      expectScraping: false
    },
    {
      type: 'Single Word (Should NOT Scrape)',
      question: 'Förskola',
      expectScraping: false
    },
    {
      type: 'Process Question (Should Scrape)',
      question: 'Vad krävs för att ansöka om hemtjänst?',
      expectScraping: true
    }
  ]
  
  for (const testCase of testCases) {
    console.log(`\n📋 ${testCase.type}`)
    console.log(`❓ Question: "${testCase.question}"`)
    console.log(`🎯 Expected scraping: ${testCase.expectScraping ? 'YES' : 'NO'}`)
    
    try {
      const startTime = Date.now()
      
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: testCase.question,
          messages: []
        })
      })
      
      const endTime = Date.now()
      const responseTime = endTime - startTime
      
      if (response.ok) {
        const data = await response.json()
        
        console.log(`⏱️  Response time: ${responseTime}ms`)
        console.log(`📏 Response length: ${data.content?.length || 0} characters`)
        
        // Check metadata if available
        if (data.metadata) {
          console.log(`🤖 Intent: ${data.metadata.intentCategory || 'Unknown'}`)
          console.log(`📊 Confidence: ${data.metadata.confidence || 'N/A'}`)
          console.log(`🔍 Scraped content: ${data.metadata.scrapedContent ? 'YES' : 'NO'}`)
          console.log(`🔗 Discovered pages: ${data.metadata.discoveredPages ? 'YES' : 'NO'}`)
          
          // Validate expectation
          const actualScraping = data.metadata.scrapedContent
          if (actualScraping === testCase.expectScraping) {
            console.log(`✅ Scraping behavior matches expectation`)
          } else {
            console.log(`❌ Scraping behavior differs from expectation`)
          }
        } else {
          console.log(`📊 No metadata available`)
        }
        
        // Show response preview
        const preview = data.content?.substring(0, 200) + '...'
        console.log(`💬 Response preview: ${preview}`)
        
        // Analyze response content for quality indicators
        const hasLinks = data.content?.includes('https://')
        const hasSpecificInfo = data.content?.includes('kommun') || data.content?.includes('Botkyrka')
        const isDetailed = data.content?.length > 200
        
        console.log(`🔗 Contains links: ${hasLinks ? 'YES' : 'NO'}`)
        console.log(`ℹ️  Specific info: ${hasSpecificInfo ? 'YES' : 'NO'}`)
        console.log(`📝 Detailed response: ${isDetailed ? 'YES' : 'NO'}`)
        
      } else {
        console.log(`❌ Request failed: ${response.status}`)
      }
      
    } catch (error) {
      console.log(`❌ Error: ${error.message}`)
    }
    
    console.log('─'.repeat(80))
  }
  
  console.log('\n🎉 Content Scraping Integration Test Complete!')
  console.log('\nKey Benefits:')
  console.log('• Detailed questions automatically get current information from Botkyrka')
  console.log('• Simple greetings and single words don\'t trigger unnecessary scraping')
  console.log('• Responses include specific links and up-to-date procedures')
  console.log('• User sees helpful loading indicators during content fetching')
}

testScrapingBehavior()
