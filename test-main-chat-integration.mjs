#!/usr/bin/env node

/**
 * Test script to verify that the main chat endpoint now provides 
 * the same robust multilingual functionality as the multilingual demo
 */

const TEST_QUERIES = [
  {
    query: "Vem är rektor i hammersta skolan?",
    language: "Swedish",
    description: "Staff information query that should return detailed contact info"
  },
  {
    query: "Who is the principal at Hammersta school?",
    language: "English", 
    description: "Same query in English to test multilingual handling"
  },
  {
    query: "Vilka grundskolor finns i Botkyrka?",
    language: "Swedish",
    description: "General school listing query"
  }
];

async function testChatEndpoint(query, endpointName, endpoint) {
  console.log(`\n🧪 Testing ${endpointName}: "${query}"`);
  console.log('=' .repeat(60));
  
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: query })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    console.log(`✅ Response received (${data.response?.length || data.content?.length || 0} chars)`);
    console.log(`🌐 Language: ${data.language}`);
    console.log(`📊 Metadata:`, {
      resultsFound: data.resultsFound,
      multilingualEnhanced: data.metadata?.multilingualEnhanced,
      enhancedResultsCount: data.metadata?.enhancedResultsCount,
      scrapedContent: data.metadata?.scrapedContent
    });
    
    // Show first 300 characters of response
    const responseText = data.response || data.content || 'No response text';
    console.log(`📝 Response preview:\n${responseText.substring(0, 300)}${responseText.length > 300 ? '...' : ''}`);
    
    return {
      success: true,
      responseLength: responseText.length,
      language: data.language,
      enhanced: data.metadata?.multilingualEnhanced || false,
      resultsCount: data.resultsFound || data.metadata?.enhancedResultsCount || 0,
      scrapedContent: data.metadata?.scrapedContent || false
    };
    
  } catch (error) {
    console.error(`❌ Error testing ${endpointName}:`, error.message);
    return { success: false, error: error.message };
  }
}

async function runComparisonTest() {
  console.log('🚀 Testing Main Chat Integration');
  console.log('Testing whether main /api/chat now has the same robust functionality as /api/multilingual-chat');
  
  const baseUrl = 'http://localhost:3001';
  
  for (const testCase of TEST_QUERIES) {
    console.log(`\n\n🔍 TEST CASE: ${testCase.description}`);
    console.log(`Query: "${testCase.query}" (${testCase.language})`);
    
    // Test main chat endpoint
    const mainResult = await testChatEndpoint(
      testCase.query, 
      'Main Chat (/api/chat)', 
      `${baseUrl}/api/chat`
    );
    
    // Test multilingual demo endpoint for comparison
    const demoResult = await testChatEndpoint(
      testCase.query, 
      'Demo Chat (/api/multilingual-chat)', 
      `${baseUrl}/api/multilingual-chat`
    );
    
    // Compare results
    console.log('\n📊 COMPARISON:');
    console.log(`Main enhanced: ${mainResult.enhanced} | Demo enhanced: ${demoResult.enhanced || 'N/A'}`);
    console.log(`Main results: ${mainResult.resultsCount} | Demo results: ${demoResult.resultsCount}`);
    console.log(`Main scraped: ${mainResult.scrapedContent} | Demo scraped: ${demoResult.scrapedContent}`);
    console.log(`Main length: ${mainResult.responseLength} | Demo length: ${demoResult.responseLength}`);
    
    // Check if integration was successful
    const integrationSuccess = 
      mainResult.success && 
      mainResult.enhanced && 
      mainResult.resultsCount > 0 && 
      mainResult.responseLength > 100;
      
    console.log(`🎯 Integration success: ${integrationSuccess ? '✅ YES' : '❌ NO'}`);
  }
}

// Run the test
runComparisonTest().catch(console.error);
