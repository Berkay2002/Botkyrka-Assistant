# Intent Detection Test Prompts

Use these prompts to test the intent detection system and see how it handles different types of queries, languages, and scenarios.

## Basic Service Category Tests

### Förskola (Preschool)
- `Förskola` *(General - should provide overview)*
- `Hur ansöker jag om förskola?` *(Procedural - should prioritize e-services)*
- `Kan jag ringa om förskola?` *(Contact - should prioritize service groups)*
- `Akut hjälp med förskola` *(Urgent - should prioritize contact)*

### Grundskola (Elementary School)
- `skola` *(General)*
- `How to enroll in elementary school?` *(Procedural in English)*
- `skolplats Stockholm` *(Specific)*
- `I need help with school transport urgent` *(Urgent in English)*

### Bygglov (Building Permits)
- `bygglov` *(General)*
- `building permit application` *(Procedural in English)*
- `renovering av hus` *(Specific)*
- `Vilka handlingar behövs för bygglov?` *(Procedural)*

### Boende och Miljö (Housing and Environment)
- `avfall` *(General)*
- `waste recycling` *(General in English)*
- `Hur sorterar jag sopor?` *(Procedural)*
- `Miljöproblem akut` *(Urgent)*
- `bostadsbidrag ansökan` *(Procedural)*

## Multilingual Tests

### Swedish
- `Vem bestämmer i Botkyrka kommun egentligen?` *(Political question)*
- `Kan jag få ekonomiskt stöd?` *(Support services)*
- `Var kan jag idrotta?` *(Sports and culture)*

### English
- `How can I get housing allowance?` *(Procedural)*
- `I need urgent help with elderly care` *(Urgent)*
- `What sports facilities are available?` *(General)*
- `Where can I learn Swedish?` *(Adult education)*

### Arabic
- `مدرسة` *(General - School)*
- `مساعدة عاجلة` *(Urgent help)*
- `كيف أتقدم بطلب للحصول على روضة أطفال؟` *(Procedural - Preschool application)*

### Somali
- `dugsiga` *(General - School)*
- `caawimaadda guriga` *(Housing allowance)*
- `sidee aan u codsado shaqo?` *(Job application)*

### Turkish
- `okul` *(General - School)*
- `acil yardım` *(Urgent help)*
- `nasıl iş başvurusu yapabilirim?` *(Job application)*

## Query Type Tests

### General Queries (Single words/concepts)
- `Jobb`
- `Kultur`
- `Trafik`
- `Sport`
- `Hemtjänst`

### Specific Questions
- `Vilka skolor finns i Botkyrka?`
- `När öppnar biblioteket?`
- `Hur mycket kostar förskola?`
- `What are the parking fees?`

### Procedural Questions (How-to)
- `Hur ansöker jag om parkeringstillstånd?`
- `How do I apply for adult education?`
- `Vilka handlingar behövs för bygglov?`
- `När ska jag anmäla flytt?`

### Contact Requests
- `Vem kan jag ringa om äldreomsorg?`
- `I need to speak to someone about housing`
- `Kan jag träffa någon om ekonomiskt stöd?`
- `Who can help me with job applications?`

### Urgent Requests
- `Akut hjälp med hemtjänst`
- `Emergency housing problem`
- `Brådskande miljöproblem`
- `Urgent help with social services`

## Edge Cases and Complex Queries

### Mixed Languages
- `Hej, I need help with förskola application`
- `Building permit för renovering`

### Multiple Services
- `Förskola och grundskola information`
- `Housing and job support`
- `Sport och kultur aktiviteter`

### Unclear/Ambiguous
- `Hjälp` *(Generic help)*
- `Information` *(Generic information)*
- `Kommun` *(General municipality)*

### Long/Complex Sentences
- `Jag har just flyttat till Botkyrka och behöver hjälp med att hitta förskola för mitt barn, plus information om vad som finns för aktiviteter på helger`
- `My family is new to Sweden and we need help with school enrollment, housing allowance application, and Swedish language courses - where do we start?`

## Expected Intent Detection Results

### High Confidence (3.0+)
- Direct keyword matches in user's language
- Clear service category identification
- Appropriate query type classification

### Medium Confidence (1.5-2.9)
- Partial keyword matches
- Some ambiguity in category
- Mixed signals in query type

### Low Confidence (<1.5)
- Generic terms
- No clear service category
- Should fallback to general services

## Test Scenarios

### Test 1: Service Category Accuracy
Input various service-related keywords and verify:
- Correct category detection
- Appropriate confidence levels
- Right language identification

### Test 2: Query Type Classification
Test different question formats:
- General: Single words
- Procedural: "How to..." questions
- Contact: "Who can I call..." requests
- Urgent: Emergency language

### Test 3: Link Prioritization
Verify that suggested links match query type:
- Procedural → E-services first
- Contact/Urgent → Service groups first
- General → Information first

### Test 4: Multilingual Support
Test same concepts in different languages:
- Keywords should match in appropriate language
- Confidence should be similar across languages
- Response hints should be relevant

### Test 5: Edge Cases
- Very short queries
- Very long queries
- Mixed languages
- Typos and variations

## Expected Console Output Format

When testing, you should see console output like:
```
Received message: [user input]
Intent detected: {
  category: '[detected category]',
  confidence: [number],
  keywords: ['matched', 'keywords'],
  queryType: '[general|specific|procedural|contact|urgent]',
  serviceType: '[category]',
  language: '[detected language]'
}
```

## Success Criteria

✅ **Good Intent Detection:**
- Confidence > 2.0 for clear service queries
- Correct language identification
- Appropriate query type classification
- Relevant suggested links

✅ **Expected Behaviors:**
- Swedish "förskola" → Category: Förskola, Type: general, Confidence: 3.0+
- English "urgent housing help" → Category: Boende-och-miljö, Type: urgent, Confidence: 3.0+
- "Hur ansöker..." → Type: procedural
- "Vem kan jag ringa..." → Type: contact

✅ **Link Quality:**
- Procedural queries get e-service links first
- Urgent queries get service group contacts first
- URLs are complete and clickable
- Rich previews show for Botkyrka URLs
