import { Router, Request, Response } from 'express';
import https from 'https';

const router = Router();

interface CacheEntry {
  data: unknown;
  timestamp: number;
}

const cache: Record<string, CacheEntry> = {};
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

function fetchJson(url: string): Promise<unknown> {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      let raw = '';
      response.on('data', (chunk: string) => { raw += chunk; });
      response.on('end', () => {
        try {
          resolve(JSON.parse(raw));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

// GET /rates?base=USD
router.get('/rates', async (req: Request, res: Response) => {
  const base = ((req.query.base as string) || 'USD').toUpperCase();

  const cached = cache[base];
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    res.json(cached.data);
    return;
  }

  try {
    const data = await fetchJson(`https://api.exchangerate-api.com/v4/latest/${base}`);
    cache[base] = { data, timestamp: Date.now() };
    res.json(data);
  } catch (err) {
    console.error('Currency rates error:', err);
    res.status(502).json({ error: 'Failed to fetch exchange rates' });
  }
});

export default router;
