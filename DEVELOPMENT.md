# Development Notes

## Local Development

### Terminal 1: Backend
```bash
cd backend
npm install
npm run dev
```

### Terminal 2: Frontend
```bash
cd frontend
npm install
npm run dev
```

Then open http://localhost:5173

## Testing the API

```bash
# Start research
curl -X POST http://localhost:3001/api/research \
  -H "Content-Type: application/json" \
  -d '{"question": "What is artificial intelligence?"}'

# Response:
# {"sessionId": "..."}

# Poll for results (replace UUID with sessionId)
curl http://localhost:3001/api/research/UUID
```

## Database

The backend uses SQLite with the following tables:
- `research_sessions` - Research tasks
- `search_queries` - Generated search queries
- `sources` - Found and ranked sources
- `research_results` - Final research answers
- `citations` - Citation mappings

Database file: `backend/research.db`

## Debugging

### Backend Logs
- API requests/responses are logged to console
- Error stack traces shown in development
- Progress updates sent to progress callback

### Frontend Console
- API errors logged to browser console
- Component state printed on errors

## Performance Profiling

The metadata in each research result includes:
- `researchDurationMs` - Total time
- `searchQueriesGenerated` - Number of queries
- `totalSearchResults` - Initial search results count
- `sourcesFound` - After ranking and filtering
- `sourcesRetrieved` - Successfully retrieved

## Common Issues

### "Invalid API Key"
- Check BING_SEARCH_API_KEY in .env
- Check OPENAI_API_KEY in .env
- Make sure keys are not expired

### "No search results found"
- Try different search terms
- Check Bing Search API quota
- Verify internet connection

### "Timeout during content retrieval"
- Some websites block automated access
- Normal behavior, system continues with other sources

## Code Structure

### Research Orchestrator
Main coordinator in `backend/src/services/research/orchestrator.ts`:
- Manages entire research pipeline
- Coordinates with search and AI providers
- Persists results to database
- Handles errors and fallbacks

### Query Analyzer
In `backend/src/services/research/queryAnalyzer.ts`:
- Analyzes research questions
- Generates search queries
- Fallback for AI query generation

### Source Ranker
In `backend/src/services/research/sourceRanker.ts`:
- Ranks sources by quality
- Classifies source types
- Assigns relevance scores

### Citation Manager
In `backend/src/services/research/citationManager.ts`:
- Extracts citations from text
- Validates citations
- Formats for display

## Next Steps for Development

1. Implement WebSocket support for real-time progress
2. Add source content caching
3. Support multiple AI providers
4. Add user authentication
5. Implement rate limiting
6. Add export functionality
