# Content Scraping Integration

## Overview

The Botkyrka Assistant now automatically scrapes content from the most relevant Botkyrka pages when users ask detailed questions. This provides Gemini with current, specific information to give more accurate and helpful responses.

## How It Works

### 1. Intent Detection
When a user asks a question, the system:
- Detects the intent category (e.g., "Förskola", "Bygglov", "Grundskola")
- Analyzes keywords and question type
- Determines if content scraping would be beneficial

### 2. Page Discovery
The system:
- Uses Botkyrka's own search function to find relevant pages
- Scores and ranks pages based on relevance to the user's query
- Selects the top-ranked page for scraping

### 3. Content Scraping
For high-quality search results (score ≥ 8), the system:
- Fetches the page content
- Extracts main text content while removing navigation, ads, etc.
- Summarizes the content for optimal context length
- Identifies metadata like forms, contact info, and downloads

### 4. Enhanced Response
Gemini receives:
- The original system prompt
- Search results with ranked pages
- Scraped content from the most relevant page
- Instructions to prioritize scraped content over general knowledge

## When Scraping Is Triggered

Content scraping is triggered when:
1. The user asks a detailed question (contains words like "hur", "vad", "när", "vilka", etc.)
2. The query is not a simple greeting or single-word question
3. A high-scoring relevant page is found (score ≥ 8)
4. The intent category is recognized

## Examples

### Question: "Hur ansöker man om förskola?"
**System behavior:**
1. Detects intent: "Förskola"
2. Searches Botkyrka for "förskola ansök"
3. Finds relevant pages and scores them
4. Scrapes content from top-ranked page about preschool applications
5. Provides Gemini with current application procedures and requirements

**User sees:**
- Loading indicator with "Hämtar aktuell information..."
- Response with specific details from the scraped page
- Direct links to application forms and detailed information

### Question: "Vilka grundskolor finns i Botkyrka?"
**System behavior:**
1. Detects intent: "Grundskola" + list query ("vilka")
2. Searches for "vilka grundskolor"
3. Scrapes content from school directory page
4. Provides current list of schools with details

**User sees:**
- Enhanced loading indicator showing content fetching
- Up-to-date list of schools from official website
- Links to specific school pages

## API Endpoints

### `/api/scrape-content`
**POST** - Scrapes content from a Botkyrka URL

**Request:**
```json
{
  "url": "https://www.botkyrka.se/skola-och-forskola/grundskola",
  "contentSummary": true
}
```

**Response:**
```json
{
  "content": "Summarized page content...",
  "metadata": {
    "title": "Grundskola - Botkyrka kommun",
    "wordCount": 250,
    "hasForms": true,
    "hasContactInfo": false,
    "hasDownloads": true,
    "contentType": "education"
  },
  "url": "https://www.botkyrka.se/skola-och-forskola/grundskola",
  "scraped_at": "2025-06-24T10:30:00.000Z"
}
```

### Enhanced `/api/chat` Response
Now includes metadata about content scraping:

```json
{
  "content": "AI response using scraped content...",
  "role": "assistant",
  "metadata": {
    "scrapedContent": true,
    "discoveredPages": true,
    "intentCategory": "Grundskola",
    "confidence": 3
  }
}
```

## Security Features

1. **URL Validation**: Only allows scraping from `botkyrka.se` domains
2. **Rate Limiting**: Built-in request limiting to prevent abuse
3. **Content Filtering**: Removes scripts, ads, and navigation elements
4. **Error Handling**: Graceful fallback when scraping fails

## User Experience Enhancements

### Loading Indicators
- Shows "Tänker..." for general processing
- Shows "Hämtar aktuell information..." when scraping content
- Displays "Hämtar senaste information från Botkyrka webbplats..." for detailed status
- Available in all supported languages (Swedish, English, Somali, Arabic, Turkish)

### Response Quality
- Responses now contain current, specific information from official sources
- Better accuracy for detailed questions about procedures and requirements
- Automatic detection of forms, downloads, and contact information
- Direct links to relevant pages with rich previews

## Implementation Details

### Content Scoring Algorithm
Pages are scored based on:
- Direct query word matches (high priority)
- Category-specific keywords
- User intent indicators ("vilka", "hur", etc.)
- Action words ("ansök", "apply", "hitta")
- Penalties for generic or unrelated content

### Content Processing
1. **HTML Cleaning**: Removes navigation, ads, scripts, and styling
2. **Content Extraction**: Focuses on main content areas
3. **Text Normalization**: Cleans whitespace and formatting
4. **Summarization**: Extracts key paragraphs while preserving detail
5. **Metadata Detection**: Identifies interactive elements and content type

### Error Handling
- Network timeouts gracefully handled
- Invalid URLs rejected with clear error messages
- Failed scraping doesn't prevent normal chat responses
- Comprehensive logging for debugging

## Testing

Use the test files:
- `test-content-scraping.mjs` - Tests basic scraping functionality
- `test-chat-scraping.mjs` - Tests integrated chat with auto-scraping

## Future Enhancements

1. **Cache scraped content** to reduce repeated requests
2. **Support for document scraping** (PDFs, forms)
3. **Multi-page scraping** for complex topics
4. **Real-time content freshness** detection
5. **User preference** for scraping vs. quick responses
