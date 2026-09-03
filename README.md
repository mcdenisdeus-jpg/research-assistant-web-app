# Research Assistant Web App - MVP

A functional web-based research assistant that searches the web, gathers sources, and synthesizes information using AI with accurate citations.

## Features

✅ **Clean Research Interface** - Simple question input with responsive design  
✅ **Web Search Integration** - Searches multiple sources via Bing Search API  
✅ **Smart Source Ranking** - Prioritizes academic, government, and reputable sources  
✅ **AI Synthesis** - Generates well-structured answers with proper citations  
✅ **Citation System** - Every factual claim linked to original sources  
✅ **Source Cards** - Beautiful source display with metadata and links  
✅ **Research Progress** - Real-time progress updates during research  
✅ **Error Handling** - Graceful failure handling with user-friendly messages  
✅ **Research History** - Track previous research questions and results  
✅ **Mobile Responsive** - Works great on desktop and mobile devices  

## Technology Stack

**Frontend:**
- React 18 with TypeScript
- TailwindCSS for styling
- Axios for HTTP requests
- Lucide React for icons

**Backend:**
- Node.js with Express
- SQLite for data persistence
- TypeScript for type safety
- CORS enabled for frontend communication

**External APIs:**
- Bing Search API (free tier)
- OpenAI API for AI synthesis
- Jina AI for content extraction (fallback)

## Project Structure

```
research-assistant-web-app/
├── frontend/                    # React application
│   ├── src/
│   │   ├── components/         # React components
│   │   │   ├── ResearchForm.tsx
│   │   │   ├── ResultsPage.tsx
│   │   │   ├── SourceCard.tsx
│   │   │   ├── ProgressIndicator.tsx
│   │   │   └── History.tsx
│   │   ├── pages/
│   │   │   ├── HomePage.tsx
│   │   │   └── ResultsPage.tsx
│   │   ├── services/
│   │   │   └── api.ts          # Frontend API client
│   │   ├── types/
│   │   │   └── index.ts        # TypeScript types
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── tsconfig.json
│
├── backend/                     # Node.js/Express API
│   ├── src/
│   │   ├── services/           # Core business logic
│   │   │   ├── research/
│   │   │   │   ├── orchestrator.ts
│   │   │   │   ├── queryAnalyzer.ts
│   │   │   │   ├── sourceRanker.ts
│   │   │   │   └── citationManager.ts
│   │   │   ├── search/
│   │   │   │   ├── searchProvider.ts
│   │   │   │   ├── bingSearch.ts
│   │   │   │   └── sourceRetriever.ts
│   │   │   ├── ai/
│   │   │   │   ├── aiProvider.ts
│   │   │   │   └── openaiProvider.ts
│   │   │   └── database/
│   │   │       └── db.ts
│   │   ├── routes/
│   │   │   ├── research.ts
│   │   │   └── history.ts
│   │   ├── middleware/
│   │   │   └── validation.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── index.ts            # Express app entry point
│   ├── package.json
│   └── tsconfig.json
│
├── .env.example                 # Template for environment variables
└── docker-compose.yml          # (Optional) Local development setup
```

## Required Environment Variables

Create a `.env` file in the `backend/` directory with the following:

```
# Search API
BING_SEARCH_API_KEY=your_bing_search_api_key_here

# AI Provider
OPENAI_API_KEY=your_openai_api_key_here

# Server
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Optional
JINA_API_KEY=optional_for_content_extraction
```

## Getting API Keys

### Bing Search API
1. Go to https://www.microsoft.com/en-us/bing/apis/bing-web-search-api
2. Click "Get free key" or "Try now"
3. Sign in with Microsoft account
4. Create a resource and get your API key
5. Free tier: 1,000 queries per month

### OpenAI API
1. Go to https://platform.openai.com/account/api-keys
2. Create a new API key
3. Use GPT-4 or GPT-3.5-turbo (chat models)
4. Note: OpenAI has moved to paid-only, but offers $5 free trial credits

### Jina AI (Optional, for content extraction)
1. Go to https://jina.ai/
2. Sign up for free tier
3. Get API key for web content extraction

## Installation & Setup

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### 1. Clone and Install Dependencies

```bash
git clone https://github.com/mcdenisdeus-jpg/research-assistant-web-app.git
cd research-assistant-web-app

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
cd ..
```

### 2. Configure Environment Variables

```bash
# Copy the example file
cp .env.example backend/.env

# Edit the file with your API keys
nano backend/.env
# or use your preferred editor
```

### 3. Start the Application

**Option A: Development (separate terminals)**

Terminal 1 - Backend:
```bash
cd backend
npm run dev
# Server runs on http://localhost:3001
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
# App runs on http://localhost:5173
```

**Option B: Docker (single command)**
```bash
docker-compose up
```

## How It Works

### Research Pipeline

1. **Question Analysis**
   - Parses user input
   - Extracts key terms and concepts
   - Determines if current information is needed
   - Generates multiple search queries automatically

2. **Web Search**
   - Searches using Bing Search API
   - Returns structured results with title, URL, snippet, date
   - Provider abstraction allows swapping search engines

3. **Source Collection & Ranking**
   - Removes duplicate results
   - Ranks by relevance and source quality
   - Prioritizes: academic → government → news → general sources
   - Filters out spam and low-quality sites

4. **Content Extraction**
   - Retrieves full page content from each source
   - Extracts relevant text sections
   - Handles timeouts and inaccessible pages gracefully

5. **AI Synthesis**
   - Sends research context to OpenAI API
   - AI generates comprehensive answer
   - Includes citations for all factual claims
   - Avoids fabrication and unsupported claims

6. **Citation Management**
   - Maps citations to source list
   - Validates all citations refer to actual sources
   - Creates clickable links to original sources

7. **Results Display**
   - Shows research question
   - Displays synthesized answer with inline citations
   - Lists all sources with metadata
   - Shows research metadata (duration, search count)

## Research Progress States

Users see real-time progress updates:

```
Understanding question...          ↓
Generating search queries...       ↓
Searching sources...               ↓
Filtering and ranking results...   ↓
Reading relevant sources...        ↓
Comparing evidence...              ↓
Writing research report...         ✓
```

## Citation Format

Citations appear inline in the answer and link to sources:

```
"Solar power has grown significantly over the past decade [1][2]."

---

[1] Source Title
Domain: example.com
Date: 2023-06-15
[Open Source] [Copy URL]

[2] Another Source
Domain: research.org
Date: 2024-01-10
[Open Source] [Copy URL]
```

## Database Schema

The app uses SQLite with the following main tables:

- **users** - User accounts (for future expansion)
- **research_sessions** - Individual research activities
- **research_questions** - Original questions asked
- **search_queries** - Generated search queries for each research
- **sources** - Web sources found and used
- **citations** - Mapping between answer claims and sources
- **research_results** - Final synthesized answers

## Adding Another Search Provider

1. Create `backend/src/services/search/[provider]Provider.ts`
2. Implement `SearchProvider` interface
3. Add to provider selection in orchestrator

Example:
```typescript
export class GoogleSearchProvider implements SearchProvider {
  async search(query: string): Promise<SearchResult[]> {
    // Implementation here
  }
}
```

## Adding Another AI Provider

1. Create `backend/src/services/ai/[provider]Provider.ts`
2. Implement `AIProvider` interface
3. Add to provider selection in orchestrator

Example:
```typescript
export class AnthropicProvider implements AIProvider {
  async generateResearchQueries(question: string): Promise<string[]> {
    // Implementation
  }
  async generateFinalReport(context: ResearchContext): Promise<string> {
    // Implementation
  }
}
```

## Error Handling

The application gracefully handles:

- ❌ Search API failures → Shows error, suggests retry
- ❌ AI API failures → Falls back to source summaries
- ❌ Network timeouts → Continues with available sources
- ❌ Rate limits → Implements backoff and queuing
- ❌ Inaccessible sources → Skips with notification
- ❌ Empty results → Guides user to refine question

## Security Features

- ✅ API keys never exposed to frontend
- ✅ Server-side API calls only
- ✅ Input validation on all endpoints
- ✅ Content sanitization for XSS prevention
- ✅ CORS configured for frontend only
- ✅ Rate limiting on search endpoints
- ✅ SSRF protection for source retrieval

## Testing the Application

### Test Scenarios

1. **Basic Research**
   - Question: "What are the latest advances in quantum computing?"
   - Verify: Search runs, sources load, AI synthesizes, citations present

2. **Current Events**
   - Question: "What happened in the news today?"
   - Verify: Recent sources prioritized, dates are current

3. **Empty Question**
   - Question: "" (blank)
   - Verify: Validation error message shown

4. **Technical Question**
   - Question: "How do neural networks work?"
   - Verify: Academic sources prioritized, complex concepts explained

5. **Search Failure**
   - Turn off internet or use invalid API key
   - Verify: Clear error message, no crash

6. **Mobile Testing**
   - Open on mobile device
   - Verify: Responsive layout, readable text, buttons clickable

## Future Enhancements

- User accounts and saved research
- PDF export of research results
- Comparison of multiple research sessions
- Source quality scoring dashboard
- Custom search filters (date range, language, domain)
- Multi-language support
- Collaborative research sessions
- Research templates for common question types
- Advanced citation formats (APA, Chicago, MLA)
- API rate limiting and caching

## Troubleshooting

**"API Key Invalid" error**
- Verify key is copied exactly (no extra spaces)
- Check API hasn't been rate limited
- Confirm key is for correct service

**"No sources found"**
- Try a simpler, more specific question
- Check internet connection
- Verify Bing API quota not exceeded

**"AI synthesis failed"**
- Check OpenAI API status
- Verify API key has credits
- Try a shorter, clearer question

**Frontend can't connect to backend**
- Verify backend is running on port 3001
- Check CORS settings
- Ensure FRONTEND_URL in .env is correct

## License

MIT

## Contributing

This is an MVP. Contributions welcome for:
- Additional search providers
- Alternative AI providers
- UI/UX improvements
- Performance optimization
- Test coverage

---

**Built with a focus on reliable research, not impressive-looking UI.**  
Source quality → Evidence → Accurate synthesis → Citations → Presentation
