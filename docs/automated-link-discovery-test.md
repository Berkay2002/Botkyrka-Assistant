# Automated Link Discovery Testing

## Overview
This document provides test cases to verify the automated link discovery functionality that helps Gemini find relevant sub-pages for any Botkyrka service category.

## How It Works

1. **Intent Detection**: System detects user intent and categorizes it (Förskola, Grundskola, Bygglov, etc.)
2. **Sub-page Discovery**: For each category, system automatically:
   - Fetches the main category page from Botkyrka website
   - Parses HTML to extract relevant internal links
   - Scores and filters links based on relevance to the category
   - Provides top 4 most relevant sub-pages to Gemini as context
3. **Enhanced Responses**: Gemini uses discovered sub-pages to provide specific, actionable guidance with exact URLs

## Test Cases

### Test 1: Preschool Services (Förskola)
**User Query**: "Hur ansöker jag om förskola?"
**Expected Behavior**:
- System detects intent: category = "Förskola"
- Discovers sub-pages from: https://www.botkyrka.se/skola-och-forskola/barnomsorg-i-botkyrka/forskola
- Should find links like: application forms, waiting times, fees, etc.
- Gemini response should include specific discovered URLs for applications

### Test 2: Building Permits (Bygglov)
**User Query**: "Vad kostar bygglov?"
**Expected Behavior**:
- System detects intent: category = "Bygglov"
- Discovers sub-pages from: https://www.botkyrka.se/bo-och-leva/bygglov-och-tillstand
- Should find links like: fee schedules, application forms, requirements
- Gemini response should include specific discovered URLs for fees and applications

### Test 3: Housing and Environment (Boende och miljö)
**User Query**: "Hur återvinner jag sopor?"
**Expected Behavior**:
- System detects intent: category = "Boende-och-miljö"
- Discovers sub-pages from: https://www.botkyrka.se/bo-och-leva/miljo-och-hallbarhet
- Should find links like: recycling information, waste disposal, environmental services
- Gemini response should include specific discovered URLs for waste management

### Test 4: Job Services (Jobb)
**User Query**: "Vilka jobb finns lediga?"
**Expected Behavior**:
- System detects intent: category = "Jobb"
- Discovers sub-pages from: https://www.botkyrka.se/kommun-och-politik/jobba-i-botkyrka
- Should find links like: job listings, application procedures, career development
- Gemini response should include specific discovered URLs for job applications

### Test 5: Adult Education (Utbildning vuxna)
**User Query**: "Hur anmäler jag mig till SFI?"
**Expected Behavior**:
- System detects intent: category = "Utbildning-vuxna"
- Discovers sub-pages from: https://www.botkyrka.se/skola-och-forskola/vuxenutbildning
- Should find links like: SFI registration, course information, requirements
- Gemini response should include specific discovered URLs for SFI enrollment

## Expected Improvements

### Before Automated Discovery:
- Generic responses: "Visit botkyrka.se for more information"
- Limited actionable guidance
- Users had to navigate and find relevant pages themselves

### After Automated Discovery:
- Specific responses: "Apply directly here: [exact discovered URL]"
- Actionable guidance with current, relevant links
- Users get direct access to the exact services they need

## Technical Features

### Link Scoring Algorithm:
- **Keyword matching**: Higher scores for category-specific keywords
- **Action words**: Boost for "ansök", "apply", "boka", "contact"
- **Generic penalty**: Lower scores for generic terms like "home", "overview"
- **Length consideration**: Longer, more specific keywords get higher scores

### Quality Filters:
- Excludes navigation, footer, and breadcrumb links
- Filters out very short or generic link text
- Prioritizes content area links only
- Limits to top 4 most relevant results

### Integration with Gemini:
- Provides discovered links as additional context
- Instructions to use specific URLs in responses
- Guidance to reference discovered services and forms
- Direction to provide actionable, specific information

## Verification Steps

1. **Check console logs**: Should show "Discovering relevant sub-pages for category: [category]"
2. **Verify context**: Additional context should include "Relevant service pages discovered:"
3. **Response quality**: Gemini responses should include specific discovered URLs
4. **Link relevance**: Discovered links should be directly related to user queries
5. **No repetition**: System should not overwhelm with too many links

## Benefits

- **Automated maintenance**: No need to hardcode service URLs
- **Always current**: Discovers whatever links currently exist on Botkyrka website
- **Comprehensive coverage**: Works for all service categories
- **Contextual relevance**: Only shows links relevant to user's specific query
- **Better user experience**: Direct access to exact services needed
