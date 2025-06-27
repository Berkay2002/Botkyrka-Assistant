# Query-Aware Link Ranking Enhancement

## Overview
Enhanced the automated link discovery system to intelligently rank and filter discovered sub-pages based on the user's specific query, rather than using generic category matching.

## Key Improvements

### 1. Query-Aware Scoring System
- **High Priority Scoring**: Direct matches between user query intent and URL/text content
- **Context Analysis**: Parses user query to understand what they're specifically looking for
- **Intent Detection**: Recognizes patterns like "vilka" (which), "lista" (list) to prioritize directory/listing pages

### 2. Enhanced Scoring Algorithm

#### High Priority Boosts (+10 points)
- For queries asking "which schools" → heavily boost "grundskolor-i-botkyrka" URLs
- Direct query term matches in URL path (e.g., user asks "vilka grundskolor" → boost URLs containing "grundskolor-i-")

#### Medium Priority Boosts (+3-4 points)
- User query words found in link text or URL
- Longer query words get higher scores (more specific = more relevant)

#### Action Word Boosts (+2 points)
- "hitta" (find), "ansök" (apply), "boka" (book), etc.
- Particularly relevant for procedural queries

#### Penalties (-1 to -3 points)
- Generic words ("hem", "start", "overview")
- Complaint/feedback pages when user wants directory information
- Very long generic descriptions that don't mention the service category

### 3. Debug Information
- Shows relevance scores for each discovered link
- Logs top 3 scored links with their scores for debugging
- Helps verify the ranking system is working correctly

### 4. Improved Gemini Integration
- Updated system prompt to emphasize using highest-scored links first
- Shows scores in context so Gemini knows which links are most relevant
- Instructs Gemini to prioritize top-scored URLs in responses

## Example Improvement

### Before (Generic Scoring)
User Query: "Grundskolor i btokryrka vilka?"
System would return: "skolvalet" (general school choice page)

### After (Query-Aware Scoring)
User Query: "Grundskolor i btokryrka vilka?"
System now prioritizes: "grundskolor-i-botkyrka" (specific school directory)

## Technical Implementation

### Enhanced `discoverRelevantSubPages` Function
```typescript
// Now accepts user query as third parameter
async function discoverRelevantSubPages(category: string, baseUrl: string, userQuery: string = '')

// Sophisticated scoring that analyzes:
1. Direct query intent matches
2. URL path relevance  
3. Query word frequency
4. Action word presence
5. Generic content penalties
```

### Scoring Logic Examples
```typescript
// High priority for directory queries
if (userQueryLower.includes('vilka') && href.includes('grundskolor-i-botkyrka')) 
  score += 10

// Query word analysis
queryWords.forEach(word => {
  if (text.includes(word) || href.includes(word)) {
    score += word.length > 4 ? 4 : 3
  }
})

// Penalty for irrelevant content
if (userQueryLower.includes('vilka') && text.includes('klagomål')) 
  score -= 3
```

## Benefits

1. **More Accurate Results**: Users get exactly what they're looking for
2. **Context-Sensitive**: Same category can return different top links based on user intent
3. **Better User Experience**: Reduces clicks needed to find specific information
4. **Automated Intelligence**: No need to hardcode specific URL mappings
5. **Scalable**: Works for any service category and query type

## Future Enhancements

1. **Machine Learning**: Could train on user click patterns to improve scoring
2. **Semantic Analysis**: Use NLP to better understand query intent
3. **Multi-language**: Adapt scoring for different language queries
4. **Time-based**: Boost recently updated pages
5. **User Feedback**: Allow users to rate link relevance to improve algorithm
