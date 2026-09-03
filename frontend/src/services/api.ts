import axios from 'axios';
import { ResearchResult, ResearchSession } from '../types';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 60000,
});

export async function startResearch(question: string): Promise<{ sessionId: string }> {
  const response = await api.post('/research', { question });
  return response.data;
}

export async function getResearchResult(id: string): Promise<ResearchResult> {
  const response = await api.get(`/research/${id}`);
  return response.data;
}

export async function getResearchHistory(limit = 20): Promise<ResearchSession[]> {
  const response = await api.get(`/history?limit=${limit}`);
  return response.data;
}

export async function pollResearchResult(
  sessionId: string,
  maxAttempts = 120,
  interval = 1000
): Promise<ResearchResult> {
  let attempts = 0;

  return new Promise((resolve, reject) => {
    const timer = setInterval(async () => {
      attempts++;

      try {
        const result = await getResearchResult(sessionId);
        clearInterval(timer);
        resolve(result);
      } catch (error: any) {
        if (error.response?.status === 404 && attempts < maxAttempts) {
          return;
        }

        clearInterval(timer);
        reject(
          error.response?.data?.error ||
          error.message ||
          'Failed to get research results'
        );
      }
    }, interval);

    setTimeout(() => {
      clearInterval(timer);
      reject('Research took too long to complete');
    }, maxAttempts * interval);
  });
}
