import fetch from 'node-fetch'

async function testRektorQuery() {
  console.log('🔍 Testing rektor query that should work...')
  
  const query = "Vem är rektor i hammersta skolan?"
  
  try {
    const response = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: query }]
      })
    })

    if (!response.ok) {
      console.log(`❌ HTTP ${response.status}`)
      return
    }

    const data = await response.json()
    
    console.log('📊 Response metadata:')
    console.log('- Multilingual enhanced:', data.metadata?.multilingualEnhanced)
    console.log('- Enhanced results count:', data.metadata?.enhancedResultsCount)
    console.log('- Scraped content:', data.metadata?.scrapedContent)
    console.log('- Intent category:', data.metadata?.intentCategory)
    
    console.log('\n💬 Response content:')
    console.log(data.content)
    
    // Check if it contains the generic fallback message
    if (data.content.includes('Jag har tyvärr inte tillgång till aktuell information')) {
      console.log('\n❌ Got generic fallback - multilingual processing likely failed')
    } else if (data.content.includes('rektor') || data.content.includes('Rektor')) {
      console.log('\n✅ Got specific rektor information!')
    }
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`)
  }
}

testRektorQuery()
