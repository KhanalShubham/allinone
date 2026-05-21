import { Request, Response } from 'express';
import * as shortenerService from '../services/shortener.service';

export async function create(req: Request, res: Response): Promise<void> {
  const { url } = req.body as { url?: string };
  if (!url) { res.status(400).json({ error: 'url is required' }); return; }

  try {
    new URL(url);
  } catch {
    res.status(400).json({ error: 'Invalid URL' });
    return;
  }

  try {
    const entry = await shortenerService.createLink(url);
    res.json({
      code: entry.code,
      shortUrl: `${process.env.API_BASE_URL || 'http://localhost:4000'}/api/shortener/${entry.code}`,
    });
  } catch (err) {
    console.error('Shortener create error:', err);
    res.status(500).json({ error: 'Failed to create short link' });
  }
}

export function list(_req: Request, res: Response): void {
  const links = shortenerService.listLinks().map(({ code, originalUrl, clicks, createdAt }) => ({
    code,
    originalUrl,
    clicks,
    createdAt,
  }));
  res.json({ links });
}

export function redirect(req: Request, res: Response): void {
  const code = req.params['code'] as string;
  const entry = shortenerService.getLink(code);

  if (!entry) {
    res.status(404).json({ error: 'Short link not found' });
    return;
  }

  shortenerService.incrementClicks(code);
  res.redirect(302, entry.originalUrl);
}
