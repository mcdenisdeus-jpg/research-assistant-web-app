# Research Assistant Web App

A full-stack web application for AI-powered research that uses web search and language models to provide comprehensive answers to research questions.

## Features

### Backend
- **Multi-stage research pipeline**: Analyzes questions, generates search queries, retrieves and ranks sources
- **Web search integration**: Uses Bing Search API to find relevant sources
- **AI synthesis**: Leverages OpenAI to synthesize research findings
- **Citation tracking**: Automatically validates and tracks citations
- **SQLite persistence**: Stores research sessions and results
- **Error handling**: Graceful fallbacks and error recovery

### Frontend
- **React + TypeScript**: Modern, type-safe UI
- **Real-time progress**: Visual progress indicator during research
- **Responsive design**: Works on desktop and mobile
- **Source cards**: Display ranked sources with metadata
- **Citation management**: Show citations with source links

## Architecture

```
frontend/          # React TypeScript app
├── src/
│   ├── components/     # React UI components
│   ├── services/       # API client
│   ├── types/          # TypeScript definitions
│   └── App.tsx         # Main app component
└── package.json

backend/           # Express TypeScript server
├── src/
│   ├── services/
│   │   ├── ai/         # AI provider (OpenAI)
│   │   ├── database/   # SQLite wrapper
│   │   ├── research/   # Research orchestrator
│   │   └── search/     # Search providers
│   ├── routes/         # Express routes
│   ├── types/          # TypeScript definitions
│   └── index.ts        # Server entry point
└── package.json
```

## Research Pipeline

The research process follows these stages:

1. **Understanding Question** (1s)
   - Analyzes the research question
   - Extracts key topics and terms

2. **Generating Queries** (2-3s)
   - Uses AI to generate 3-5 focused search queries
   - Falls back to keyword analysis if needed

3. **Searching Sources** (5-10s)
   - Executes search queries against Bing Search API
   - Collects initial results

4. **Filtering Results** (2-3s)
   - Ranks sources by quality and relevance
   - Classifies sources (academic, news, government, general)
   - Selects top 8-10 sources

5. **Reading Sources** (15-30s)
   - Retrieves full content from selected sources
   - Handles timeouts and access errors
   - Extracts text from HTML

6. **Comparing Evidence** (2-3s)
   - Analyzes relationships between sources
   - Identifies agreements and disagreements

7. **Writing Report** (10-20s)
   - Uses AI to synthesize comprehensive answer
   - Ensures proper citations
   - Validates citation format

## Setup Instructions

### Prerequisites
- Node.js 16+ and npm/yarn
- Bing Search API key (from [Microsoft Azure](https://azure.microsoft.com/en-us/services/cognitive-services/bing-web-search-api/))
- OpenAI API key (from [OpenAI](https://platform.openai.com/account/api-keys))

### Backend Setup

```bash
cd backend
npm install

# Create .env file
cp .env.example .env
# Edit .env with your API keys:
# BING_SEARCH_API_KEY=your_key_here
# OPENAI_API_KEY=your_key_here

# Start development server
npm run dev
```

The backend will run on `http://localhost:3001`

### Frontend Setup

```bash
cd frontend
npm install

# Start development server
npm run dev
```

The frontend will run on `http://localhost:5173`

## API Endpoints

### POST /api/research
Start a new research task

**Request:**
```json
{
  "question": "What are the latest developments in quantum computing?"
}
```

**Response:**
```json
{
  "sessionId": "uuid-string",
  "status": "started"
}
```

### GET /api/research/:id
Get research results by ID

**Response:**
```json
{
  "id": "uuid",
  "question": "...",
  "answer": "...",
  "citations": [...],
  "sources": [...],
  "metadata": {...}
}
```

### GET /api/history
Get research history

**Query Parameters:**
- `limit` (default: 20, max: 100)

## Environment Variables

```
# Search API
BING_SEARCH_API_KEY=your_bing_api_key

# AI Provider
OPENAI_API_KEY=your_openai_api_key

# Server
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

## Technologies

### Frontend
- React 18
- TypeScript
- Tailwind CSS
- Vite
- Axios
- Lucide React (icons)

### Backend
- Express.js
- TypeScript
- SQLite3
- Axios
- UUID

### External APIs
- Bing Search API
- OpenAI API

## Performance Considerations

- Research typically completes in 30-120 seconds
- Search queries are executed sequentially to avoid rate limits
- Source content retrieval has 8-second timeouts
- Results are cached in SQLite for later retrieval
- Frontend polls backend every 1 second for updates

## Error Handling

- Graceful degradation when APIs are unavailable
- Fallback to simpler queries if AI generation fails
- Timeout handling for slow sources
- Validation of citations against sources
- User-friendly error messages

## Future Enhancements

- [ ] WebSocket support for real-time progress updates
- [ ] Multiple search providers (Google, DuckDuckGo)
- [ ] Source content caching
- [ ] Advanced filtering (by date, domain, etc.)
- [ ] Export to PDF/Markdown
- [ ] User authentication and history
- [ ] Rate limiting and quotas
- [ ] A/B testing different synthesis strategies

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.
