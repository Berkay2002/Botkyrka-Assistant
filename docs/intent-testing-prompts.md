# Intent Detection Test Prompts

## Test these prompts to verify the intent detection system is working correctly:

### 1. General Queries (Single Words/Phrases)
```
Förskola
Bygglov
Jobb
Sport
```

### 2. Specific Queries (Detailed Questions)
```
Hur ansöker jag om förskola för mitt barn?
Vilka handlingar behöver jag för bygglov?
Finns det lediga jobb på kommunen?
Var kan jag lämna återvinning?
```

### 3. Procedural Queries (How-to)
```
Hur byter jag förskola?
Hur ansöker jag om parkeringstillstånd?
Hur kontaktar jag hemtjänsten?
Steg för steg ansökan bygglov
```

### 4. Contact Queries
```
Vem kan jag prata med om skolproblem?
Telefonnummer till socialkontoret
Kontakta någon om avfallsproblem
Ring kommun förskola
```

### 5. Urgent Queries
```
Akut hjälp med boende
Emergency housing help
Brådskande bygglov
Urgent help elderly care
```

### 6. Multilingual Tests
```
preschool application (English)
مدرسة (Arabic)
shaqo (Somali - job)
okul (Turkish - school)
```

### 7. Environmental/Specific Context Tests
```
Skog städning
Vilka parker sköter kommunen?
Rapportera miljöproblem
Forest cleaning responsibility
```

### 8. Mixed Intent Tests
```
Förskola ansökan urgent
Building permit help contact
Jobb vuxenutbildning kombination
```

### 9. Complex Queries
```
Jag behöver hjälp med att ansöka om förskola och också information om avgifter
Can you help me with both school enrollment and housing allowance?
```

### 10. Edge Cases
```
Botkyrka
Kommun
Hjälp
Help
```

## Expected Behaviors

### General Queries
- Should provide overview with 3-4 examples
- Confidence: 2-4
- Query type: 'general'

### Procedural Queries  
- Should prioritize e-services
- Include step-by-step guidance
- Query type: 'procedural'

### Contact Queries
- Should prioritize service group links
- Include contact information
- Query type: 'contact'

### Urgent Queries
- Should prioritize service groups
- Include emergency context
- Query type: 'urgent'
- Higher confidence scoring

### Language Detection
- Swedish: Default and most common
- English: Should detect "and", "the", "help"
- Arabic: Should detect Arabic script
- Somali: Should detect "iyo", "ama"
- Turkish: Should detect "ve", "için"

## Console Output to Check

Look for these in the browser console:
```
Received message: [user input]
Intent detected: {
  category: 'Category-Name',
  confidence: [number],
  keywords: [array],
  queryType: 'general|specific|procedural|contact|urgent',
  serviceType: 'Category-Name',
  language: 'language'
}
```

## Testing Confidence Scores

- **Low confidence (0-1)**: Generic/unclear queries
- **Medium confidence (2-3)**: Clear single category match
- **High confidence (4+)**: Multiple keywords, urgent, or exact matches

## Link Prioritization Testing

### For procedural queries, expect:
1. E-service links first
2. Information links second
3. Service group links third

### For urgent/contact queries, expect:
1. Service group links first
2. E-service links second
3. Information links third

### For general queries, expect:
1. Information links first
2. E-service links second  
3. Service group links third
