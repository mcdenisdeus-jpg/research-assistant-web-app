import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import researchRoutes, { initializeRoutes } from './routes/research';
import { initializeDatabase } from './services/database/db';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// Validate required environment variables
const requiredEnvVars = ['BING_SEARCH_API_KEY', 'OPENAI_API_KEY'];
const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  console.error('Please configure your .env file with API keys');
  process.exit(1);
}

// Initialize database
initializeDatabase()
  .then(() => {
    console.log('Database initialized');
  })
  .catch((error) => {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  });

// Initialize research routes with API keys
initializeRoutes({
  searchApiKey: process.env.BING_SEARCH_API_KEY!,
  aiApiKey: process.env.OPENAI_API_KEY!,
});

// Routes
app.use('/api', researchRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Research Assistant API running on http://localhost:${PORT}`);
  console.log(`Frontend should be configured to: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
});
