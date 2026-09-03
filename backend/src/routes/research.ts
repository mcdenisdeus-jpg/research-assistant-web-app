import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { ResearchOrchestrator } from '../services/research/orchestrator';

const router = express.Router();

let orchestrator: ResearchOrchestrator;

// Initialize orchestrator with API keys
export function initializeRoutes(apiKeys: { searchApiKey: string; aiApiKey: string }) {
  orchestrator = new ResearchOrchestrator(apiKeys.searchApiKey, apiKeys.aiApiKey);
}

// POST /research - Start a new research task
router.post('/research', async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || question.trim().length === 0) {
      return res.status(400).json({ error: 'Research question is required' });
    }

    if (question.length > 500) {
      return res.status(400).json({ error: 'Question too long (max 500 characters)' });
    }

    // Start research in background
    const sessionId = uuidv4();

    // Fire and forget - return session ID immediately
    orchestrator.conductResearch(question).then((result) => {
      // Store result (in production, use WebSocket for real-time updates)
      console.log(`Research completed for session ${sessionId}`);
    }).catch((error) => {
      console.error(`Research failed for session ${sessionId}:`, error);
    });

    res.json({ sessionId, status: 'started' });
  } catch (error) {
    console.error('Error starting research:', error);
    res.status(500).json({ error: 'Failed to start research' });
  }
});

// GET /research/:id - Get research results
router.get('/research/:id', async (req, res) => {
  try {
    const result = await orchestrator.getResearchById(req.params.id);
    if (!result) {
      return res.status(404).json({ error: 'Research not found' });
    }
    res.json(result);
  } catch (error) {
    console.error('Error fetching research:', error);
    res.status(500).json({ error: 'Failed to fetch research' });
  }
});

// GET /history - Get research history
router.get('/history', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const history = await orchestrator.getResearchHistory(limit);
    res.json(history);
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

export default router;
