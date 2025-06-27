// Quick test for intent detection
const testQuery = "Vilka grundskolor finns det i botkyrka?"
console.log('Testing:', testQuery)

// This would now match "grundskolor" and "vilka" keywords
// Expected result:
// - category: 'Grundskola' 
// - confidence: > 2
// - queryType: 'specific'
// - Should trigger school fetching
