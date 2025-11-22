# LLM-Enhanced RAG Query System

## Overview

This implementation adds **LLM-powered query enhancement** to improve vector search accuracy. Before searching the vector database, user queries are intelligently expanded with synonyms, related terms, and interview-focused context.

## How It Works

```
User Query: "Tell me about my projects"
    ↓
LLM Enhancement (Groq llama-3.1-8b-instant)
    ↓
Enhanced Query: "software development projects, technical achievements, 
                 leadership roles, problem-solving examples, measurable outcomes,
                 project management, team collaboration, technical challenges overcome"
    ↓
Vector Database Search (with enhanced query)
    ↓
Better, More Relevant Results
```

## Key Features

### 1. **Intelligent Query Expansion**
- Adds relevant synonyms and related terms
- Expands context for interview scenarios
- Includes technical and soft skill variations
- Focuses on achievements and quantifiable results

### 2. **Fallback Safety**
- If LLM enhancement fails, uses original query
- No impact on user experience if API is down
- Graceful degradation

### 3. **Performance Optimized**
- Uses `llama-3.1-8b-instant` (fastest model)
- Temperature: 0.3 (consistent enhancements)
- Max tokens: 150 (quick responses)

## Example Transformations

### Technical Questions
```
Original: "Python experience"
Enhanced: "Python programming, Python frameworks, FastAPI, Django, Flask, 
           data analysis, machine learning, automation scripts, API development,
           Python libraries, backend development"
```

### Project Questions
```
Original: "Tell me about my projects"
Enhanced: "software development projects, technical achievements, leadership roles,
           problem-solving examples, measurable outcomes, project management,
           team collaboration, technical challenges overcome, deliverables,
           impact and results"
```

### Skill Questions
```
Original: "databases"
Enhanced: "database design, SQL, NoSQL, PostgreSQL, MongoDB, Redis, 
           database optimization, query performance, schema design,
           data modeling, database administration"
```

## Usage

### Basic Enhancement
```typescript
import { enhanceQuery } from '@/lib/llm-enhanced-rag';

const enhanced = await enhanceQuery("Tell me about FastAPI");
// Result: "FastAPI framework, API development, Python async programming, ..."
```

### With Metadata
```typescript
import { enhanceQueryWithMetadata } from '@/lib/llm-enhanced-rag';

const result = await enhanceQueryWithMetadata("Python experience");
console.log(result.original);    // "Python experience"
console.log(result.enhanced);    // "Python programming, frameworks, ..."
console.log(result.addedTerms);  // ["programming", "frameworks", ...]
```

### Vector DB Integration
```typescript
import { getVectorDB } from '@/lib/vector-db';

const vectorDB = getVectorDB();

// Automatically uses LLM enhancement
const results = await vectorDB.search("Tell me about my projects");

// Disable enhancement for specific queries
const directResults = await vectorDB.search("exact match query", false);
```

## Configuration

### Environment Variables
```env
# .env.local
GROQ_API_KEY=your_groq_api_key_here
```

### Check Availability
```typescript
import { isQueryEnhancementAvailable } from '@/lib/llm-enhanced-rag';

if (isQueryEnhancementAvailable()) {
  console.log('LLM query enhancement is enabled');
}
```

## Benefits

### 1. **Improved Search Accuracy**
- Finds more relevant results by expanding search terms
- Catches variations in phrasing and terminology
- Better matches for interview-focused questions

### 2. **Better Interview Preparation**
- Automatically includes achievement-oriented terms
- Expands queries to cover STAR format components
- Focuses on quantifiable results and metrics

### 3. **Semantic Understanding**
- LLM understands intent behind questions
- Adds contextually relevant terms
- Bridges vocabulary gaps between question and content

## Performance

- **Enhancement Time**: ~500-1000ms (parallel with other operations)
- **Model**: llama-3.1-8b-instant (fastest Groq model)
- **Token Usage**: ~50-150 tokens per query
- **Cost**: Minimal (Groq offers generous free tier)

## Integration Points

### Files Modified/Created:
1. **`lib/llm-enhanced-rag.ts`** (NEW)
   - `enhanceQuery()` - Main enhancement function
   - `enhanceQueryWithMetadata()` - Enhancement with details
   - `enhanceQueries()` - Batch processing

2. **`lib/vector-db.ts`** (UPDATED)
   - Integrated LLM enhancement in `search()` method
   - Optional `useEnhancement` parameter
   - Automatic fallback on errors

3. **`lib/enhanced-rag.ts`** (COMPATIBLE)
   - Works seamlessly with existing RAG pipeline
   - Enhancement happens before vector search
   - No breaking changes

## Testing

### Test Query Enhancement
```typescript
// Test various query types
const tests = [
  "Tell me about my projects",
  "Python experience",
  "FastAPI skills",
  "deployment process",
  "team leadership"
];

for (const query of tests) {
  const enhanced = await enhanceQuery(query);
  console.log(`${query} → ${enhanced}`);
}
```

### Compare Results
```typescript
// Compare search results with and without enhancement
const query = "Tell me about databases";

const withEnhancement = await vectorDB.search(query, true);
const withoutEnhancement = await vectorDB.search(query, false);

console.log('Enhanced results:', withEnhancement.length);
console.log('Direct results:', withoutEnhancement.length);
```

## Best Practices

1. **Always Use Enhancement for User Queries**
   - Let users ask natural questions
   - LLM handles term expansion automatically

2. **Disable for Exact Matches**
   - Use `search(query, false)` for precise lookups
   - Example: searching for specific file names or IDs

3. **Monitor Enhancement Quality**
   - Log enhanced queries for review
   - Adjust prompts if enhancements are off-target

4. **Cache Common Enhancements** (Optional)
   - Cache frequent query enhancements
   - Reduces API calls and improves speed

## Summary

✅ **LLM-powered query enhancement** improves vector search accuracy  
✅ **Automatic expansion** of terms, synonyms, and context  
✅ **Interview-focused** enhancements for better preparation  
✅ **Graceful fallback** if enhancement fails  
✅ **Fast performance** with llama-3.1-8b-instant  
✅ **Integrated** with existing RAG pipeline  

**Result**: Better search results, more relevant answers, and improved interview preparation! 🚀
