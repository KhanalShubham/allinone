import { Router, Request, Response } from 'express';

const router = Router();

interface LinkEntry {
  code: string;
  originalUrl: string;
  createdAt: Date;
  clicks: number;
}

const store = new Map<string, LinkEntry>();

// Lazy nanoid loader — handles ESM-only nanoid v5 in a CommonJS build
let _nanoid: ((size?: number) => string) | null = null;

async function getNanoid(): Promise<(size?: number) => string> {
  if (_nanoid) return _nanoid;
  // Dynamic import works at runtime even when tsconfig targets commonjs
  const mod = await import('nanoid');
  _nanoid = mod.nanoid as (size?: number) => string;
  return _nanoid;
}

// POST /create
router.post('/create', async (req: Request, res: Response) => {
  const { url } = req.body as { url?: string };

  if (!url) {
    res.status(400).json({ error: 'url is required' });
    return;
  }

  try {
    new URL(url); // validates the URL
  } catch {
    res.status(400).json({ error: 'Invalid URL' });
    return;
  }

  try {
    const nanoid = await getNanoid();
    const code = nanoid(6);

    const entry: LinkEntry = {
      code,
      originalUrl: url,
      createdAt: new Date(),
      clicks: 0,
    };

    store.set(code, entry);

    res.json({
      code,
      shortUrl: `http://localhost:4000/api/shortener/${code}`,
    });
  } catch (err) {
    console.error('Shortener create error:', err);
    res.status(500).json({ error: 'Failed to create short link' });
  }
});

// GET / — list all links
router.get('/', (_req: Request, res: Response) => {
  const links = Array.from(store.values()).map(({ code, originalUrl, clicks, createdAt }) => ({
    code,
    originalUrl,
    clicks,
    createdAt,
  }));
  res.json({ links });
});

// GET /:code — redirect
router.get('/:code', (req: Request, res: Response) => {
  const code = req.params['code'] as string;
  const entry = store.get(code);

  if (!entry) {
    res.status(404).json({ error: 'Short link not found' });
    return;
  }

  entry.clicks += 1;
  res.redirect(302, entry.originalUrl);
});

export default router;
