# Intent Detection System for Botkyrka Assistant

The intent detection system analyzes user queries to understand their needs and provide more targeted, contextual responses. This system leverages Gemini's natural language understanding while adding service-specific intelligence.

## Key Features

### 1. **Natural Language Processing**
- Relies on Gemini's built-in multilingual capabilities
- No hardcoded language detection - Gemini automatically responds in the user's language
- Focuses on intent and service category detection

### 2. **Query Type Classification**
- **General**: Single-word queries (e.g., "Förskola")
- **Specific**: Detailed questions about services
- **Procedural**: How-to questions requiring step-by-step guidance
- **Contact**: Requests for human assistance or phone numbers
- **Urgent**: Emergency or time-sensitive requests

### 3. **Service Category Matching**
Detects intent for major service categories:
- **Förskola** (Preschool)
- **Grundskola** (Elementary School)
- **Bygglov** (Building Permits)
- **Boende-och-miljö** (Housing and Environment)
- **Stöd-och-trygghet** (Support and Safety)
- **Jobb** (Employment)
- **Sport-och-kultur** (Sports and Culture)
- **Trafik-och-parkering** (Traffic and Parking)
- **Utbildning-vuxna** (Adult Education)

### 4. **Smart Link Prioritization**
Based on query type, the system prioritizes:
- **Procedural queries**: E-services first, then information
- **Contact/Urgent queries**: Service groups first, then e-services
- **General queries**: Information first, balanced approach

### API Integration
The intent detection is integrated into the chat API (`/api/chat/route.ts`):

```typescript
// Detect intent from user message (category and query type only)
const intentAnalysis = detectIntent(latestMessage)

// Build intent-aware response enhancements
const { systemPromptAddition, prioritizedLinks } = buildIntentAwareResponse(intentAnalysis, latestMessage)

// Enhanced system prompt with intent context (Gemini handles language automatically)
let conversationContext = ENHANCED_SYSTEM_PROMPT + systemPromptAddition
```

### Chat Form Integration
The chat form (`components/chat-form.tsx`) uses intent detection for link suggestions:

```typescript
function extractActionLinks(content: string) {
  // Use intent detection for better link suggestions
  const intentAnalysis = detectIntent(content)
  
  // Convert to action links format
  return intentAnalysis.suggestedLinks.slice(0, 3).map(link => ({
    keyword: intentAnalysis.intent.category,
    url: link.url,
    displayName: link.displayName,
    type: link.type
  }))
}
```

## Benefits

### 1. **Improved Accuracy**
- Matches user intent rather than just keywords
- Reduces irrelevant link suggestions
- Better contextual understanding

### 2. **Enhanced User Experience**
- More relevant responses
- Faster access to needed services
- Natural multilingual interactions (powered by Gemini)

### 3. **Contextual Responses**
- Query type affects response style
- Urgent queries get priority handling
- Procedural queries get step-by-step guidance

## Usage Examples

### Example 1: Preschool Application
**User input**: "Hur ansöker jag om förskola?" (Swedish) or "How do I apply for preschool?" (English)
**Intent detected**: 
- Category: Förskola
- Type: procedural
- Confidence: 4.2

**Result**: Prioritizes e-service application link, includes step-by-step guidance. Gemini responds in the user's input language.

### Example 2: Emergency Contact
**User input**: "I need help urgent with housing problem" or "Brådskande hjälp med boende"
**Intent detected**:
- Category: Boende-och-miljö
- Type: urgent
- Confidence: 3.8

**Result**: Prioritizes service group contact, emphasizes immediate assistance. Gemini adapts language automatically.

### Example 3: General Inquiry
**User input**: "förskola" or "preschool" or "مدرسة"
**Intent detected**:
- Category: Förskola
- Type: general
- Confidence: 2.1

**Result**: Provides overview of school services, balanced link approach. Gemini responds in appropriate language.

## Configuration

### Adding New Service Categories
To add new service categories, update the `INTENT_CATEGORIES` object in `/lib/intent-detection.ts`:

```typescript
'New-Service': {
  swedish: ['swedish', 'keywords'],
  english: ['english', 'keywords'],
  arabic: ['arabic', 'keywords'],
  // ... other languages
  urgent: ['emergency', 'keywords'],
  procedural: ['how-to', 'keywords']
}
```

### Adjusting Confidence Thresholds
Modify confidence scoring in the `detectIntent` function:
- Base keyword match: +2 points
- Exact word match: +1 point
- Urgent match: +3 points
- Procedural match: +1.5 points

### Language Support
To add new languages:
1. Add language keywords to `detectLanguage()` function
2. Add language-specific keywords to service categories
3. Update response hints in `generateResponseHints()`

## Testing

Test the intent detection with various query types:

```typescript
// Test cases
const testQueries = [
  "förskola",           // General Swedish
  "how to apply preschool", // Procedural English
  "urgent help housing",    // Urgent English
  "کيف أتصل",             // Contact Arabic
  "ansökan bygglov"        // Procedural Swedish
]

testQueries.forEach(query => {
  const result = detectIntent(query)
  console.log(`Query: ${query}`)
  console.log(`Intent:`, result.intent)
  console.log(`Links:`, result.suggestedLinks)
})
```

## Future Enhancements

1. **Machine Learning Integration**: Train models on user interaction data
2. **Personalization**: Remember user preferences and query patterns
3. **Context Memory**: Use conversation history for better intent detection
4. **Advanced NLP**: Integrate with more sophisticated natural language processing
5. **Analytics**: Track intent detection accuracy and user satisfaction
