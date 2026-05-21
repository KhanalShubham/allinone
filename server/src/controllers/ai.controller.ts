import { Request, Response } from 'express';
import * as aiService from '../services/ai.service';
import type { AiTone, SocialPlatform } from '../types';

function noKey(res: Response): void {
  res.status(503).json({ error: 'ANTHROPIC_API_KEY not configured' });
}

export async function summarize(req: Request, res: Response): Promise<void> {
  const { text } = req.body as { text?: string };
  if (!text) { res.status(400).json({ error: 'text is required' }); return; }
  if (!aiService.hasApiKey()) { noKey(res); return; }

  try {
    const summary = await aiService.summarize(text);
    res.json({ summary });
  } catch (err) {
    console.error('Summarize error:', err);
    res.status(500).json({ error: 'Failed to summarize text' });
  }
}

export async function fixGrammar(req: Request, res: Response): Promise<void> {
  const { text } = req.body as { text?: string };
  if (!text) { res.status(400).json({ error: 'text is required' }); return; }
  if (!aiService.hasApiKey()) { noKey(res); return; }

  try {
    const corrected = await aiService.fixGrammar(text);
    res.json({ corrected, original: text });
  } catch (err) {
    console.error('Grammar error:', err);
    res.status(500).json({ error: 'Failed to fix grammar' });
  }
}

export async function rewrite(req: Request, res: Response): Promise<void> {
  const { text, tone } = req.body as { text?: string; tone?: AiTone };
  if (!text || !tone) {
    res.status(400).json({ error: 'text and tone are required' });
    return;
  }

  const allowed: AiTone[] = ['formal', 'casual', 'shorter', 'detailed'];
  if (!allowed.includes(tone)) {
    res.status(400).json({ error: 'Invalid tone. Allowed: formal, casual, shorter, detailed' });
    return;
  }

  if (!aiService.hasApiKey()) { noKey(res); return; }

  try {
    const rewritten = await aiService.rewrite(text, tone);
    res.json({ rewritten });
  } catch (err) {
    console.error('Rewrite error:', err);
    res.status(500).json({ error: 'Failed to rewrite text' });
  }
}

export async function generateHashtags(req: Request, res: Response): Promise<void> {
  const { topic, platform } = req.body as { topic?: string; platform?: SocialPlatform };
  if (!topic || !platform) {
    res.status(400).json({ error: 'topic and platform are required' });
    return;
  }

  const allowed: SocialPlatform[] = ['instagram', 'tiktok', 'youtube', 'twitter'];
  if (!allowed.includes(platform)) {
    res.status(400).json({ error: 'Invalid platform. Allowed: instagram, tiktok, youtube, twitter' });
    return;
  }

  if (!aiService.hasApiKey()) { noKey(res); return; }

  try {
    const hashtags = await aiService.generateHashtags(topic, platform);
    res.json({ hashtags });
  } catch (err) {
    console.error('Hashtags error:', err);
    res.status(500).json({ error: 'Failed to generate hashtags' });
  }
}
