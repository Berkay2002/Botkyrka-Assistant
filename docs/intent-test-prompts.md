# Intent Detection Test Prompts for Botkyrka Assistant

## Service Category Detection Tests

### Swedish Service Keywords
1. `Äldreomsorg` - Should detect Stöd-och-trygghet category
2. `förskola` - Should detect Förskola category  
3. `bygglov` - Should detect Bygglov category
4. `hemtjänst` - Should detect Stöd-och-trygghet category
5. `parkering` - Should detect Trafik-och-parkering category
6. `avfall` - Should detect Boende-och-miljö category
7. `vuxenutbildning` - Should detect Utbildning-vuxna category

### English Service Keywords
1. `elder care` - Should detect Stöd-och-trygghet category
2. `preschool` - Should detect Förskola category
3. `building permit` - Should detect Bygglov category
4. `home care` - Should detect Stöd-och-trygghet category
5. `parking` - Should detect Trafik-och-parkering category
6. `waste management` - Should detect Boende-och-miljö category

### Multilingual Tests (Gemini handles language automatically)
```
مدرسة
رعاية المسنين  
ترخيص بناء
dugsiga
daryeelka waayeelka
ruqsadda dhismaha
okul
yaşlı bakımı
yapı izni
```

## Query Type Detection Tests

### General Queries (single words)
```
förskola
skola  
bygglov
äldreomsorg
parkering
sport
kultur
```

### Procedural Queries (how-to questions)
```
Hur ansöker jag om förskola?
How do I apply for building permit?
När kan jag ansöka om hemtjänst?
Vilka handlingar behövs för bygglov?
What documents do I need for preschool?
```

### Contact Queries (want to speak to someone)
```
Vem kan jag kontakta om förskolan?
I need to talk to someone about elder care
Kan jag ringa någon om bygglov?
Who can help me with parking permits?
```

### Urgent Queries (emergency/urgent needs)
```
Akut hjälp äldreomsorg
Emergency elder care help
Brådskande bygglovsfråga
Urgent parking issue
Need help now with housing
```

### Specific Queries (detailed questions + school listing)
```
Vad kostar förskolan per månad?
What are the fees for preschool in Botkyrka?
När öppnar ansökan för grundskola?
How long does building permit take to process?
Vilka grundskolor finns det i botkyrka?
Which elementary schools are in Botkyrka?
Lista alla skolor i Botkyrka
List all schools in Botkyrka
```

## Expected Behavior

For each test, verify:

1. **Category Match**: Right service category detected
2. **Query Type**: Proper classification (general/specific/procedural/contact/urgent)
3. **Confidence Score**: Reasonable confidence level (0-10+)
4. **Response Language**: Gemini responds in same language as input (automatic)
5. **Link Prioritization**: Appropriate links suggested based on query type
6. **Content Relevance**: Response addresses the specific query

## Testing the System

To test these prompts:

1. Try each prompt in the chat interface
2. Check the console logs for intent detection results:
   ```
   Intent detected: {
     category: 'Förskola',
     confidence: 3,
     keywords: ['förskola'],
     queryType: 'general',
     serviceType: 'Förskola'
   }
   ```
3. Verify Gemini responds in the correct language automatically
4. Check that appropriate links are provided
5. Ensure the response style matches the query type

## Common Issues to Watch For

1. **Category Mismatch**: Keywords being assigned to wrong service categories
2. **Query Type Errors**: Procedural queries being classified as general
3. **Confidence Issues**: Very specific queries getting low confidence scores
4. **Link Relevance**: Inappropriate links being suggested for the query type
5. **Response Style**: Urgent queries not getting priority treatment
