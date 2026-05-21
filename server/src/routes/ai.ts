import { Router, Request, Response } from 'express';
import Anthropic from '@anthropic-ai/sdk';

const router = Router();

const MODEL = 'claude-haiku-4-5-20251001';

// Lazy client — only instantiated when first request arrives
let client: Anthropic | null = null;

function getClient(): Anthropic | null {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  if (!client) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

function noKey(res: Response): void {
  res.status(503).json({ error: 'ANTHROPIC_API_KEY not configured' });
}

async function complete(system: string, user: string): Promise<string> {
  const ai = getClient();
  if (!ai) throw new Error('NO_KEY');
  const msg = await ai.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system,
    messages: [{ role: 'user', content: user }],
  });
  const block = msg.content[0];
  if (block.type !== 'text') throw new Error('Unexpected response type');
  return block.text;
}

// POST /summarize
router.post('/summarize', async (req: Request, res: Response) => {
  const { text } = req.body as { text?: string };
  if (!text) {
    res.status(400).json({ error: 'text is required' });
    return;
  }
  if (!getClient()) { noKey(res); return; }

  try {
    const summary = await complete(
      'You are a summarizer. Return a clear, concise summary in 3-5 bullet points. Be brief and direct.',
      text,
    );
    res.json({ summary });
  } catch (err) {
    console.error('Summarize error:', err);
    res.status(500).json({ error: 'Failed to summarize text' });
  }
});

// POST /grammar
router.post('/grammar', async (req: Request, res: Response) => {
  const { text } = req.body as { text?: string };
  if (!text) {
    res.status(400).json({ error: 'text is required' });
    return;
  }
  if (!getClient()) { noKey(res); return; }

  try {
    const corrected = await complete(
      'You are a grammar editor. Fix all grammar, spelling and punctuation errors in the provided text. Return ONLY the corrected text, nothing else. Do not add explanations.',
      text,
    );
    res.json({ corrected, original: text });
  } catch (err) {
    console.error('Grammar error:', err);
    res.status(500).json({ error: 'Failed to fix grammar' });
  }
});

// POST /rewrite
router.post('/rewrite', async (req: Request, res: Response) => {
  const { text, tone } = req.body as {
    text?: string;
    tone?: 'formal' | 'casual' | 'shorter' | 'detailed';
  };

  if (!text || !tone) {
    res.status(400).json({ error: 'text and tone are required' });
    return;
  }

  const toneSystemMap: Record<string, string> = {
    formal:
      'You are a writing assistant. Rewrite the provided text in a professional, formal tone suitable for business communication. Return ONLY the rewritten text.',
    casual:
      'You are a writing assistant. Rewrite the provided text in a friendly, casual conversational tone. Return ONLY the rewritten text.',
    shorter:
      'You are a writing assistant. Rewrite the provided text to be as concise as possible while preserving the key meaning. Remove all unnecessary words. Return ONLY the rewritten text.',
    detailed:
      'You are a writing assistant. Rewrite the provided text with more detail, depth, and elaboration. Expand on key points. Return ONLY the rewritten text.',
  };

  const systemPrompt = toneSystemMap[tone];
  if (!systemPrompt) {
    res.status(400).json({ error: 'Invalid tone. Allowed: formal, casual, shorter, detailed' });
    return;
  }

  if (!getClient()) { noKey(res); return; }

  try {
    const rewritten = await complete(systemPrompt, text);
    res.json({ rewritten });
  } catch (err) {
    console.error('Rewrite error:', err);
    res.status(500).json({ error: 'Failed to rewrite text' });
  }
});

// POST /hashtags
router.post('/hashtags', async (req: Request, res: Response) => {
  const { topic, platform } = req.body as {
    topic?: string;
    platform?: 'instagram' | 'tiktok' | 'youtube' | 'twitter';
  };

  if (!topic || !platform) {
    res.status(400).json({ error: 'topic and platform are required' });
    return;
  }

  const allowedPlatforms = ['instagram', 'tiktok', 'youtube', 'twitter'];
  if (!allowedPlatforms.includes(platform)) {
    res.status(400).json({ error: 'Invalid platform. Allowed: instagram, tiktok, youtube, twitter' });
    return;
  }

  if (!getClient()) { noKey(res); return; }

  try {
    const rawText = await complete(
      'Generate relevant hashtags for the given topic and platform. Return ONLY a JSON array of hashtag strings (including the # symbol), maximum 20 tags, ordered by relevance. No explanation.',
      `Topic: ${topic}\nPlatform: ${platform}`,
    );

    let hashtags: string[];
    try {
      // Try to parse JSON array directly
      const match = rawText.match(/\[[\s\S]*\]/);
      hashtags = JSON.parse(match ? match[0] : rawText) as string[];
    } catch {
      // Fallback: extract tokens starting with #
      hashtags = rawText
        .split(/[\s,\n]+/)
        .filter((t) => t.startsWith('#'))
        .slice(0, 20);
    }

    res.json({ hashtags });
  } catch (err) {
    console.error('Hashtags error:', err);
    res.status(500).json({ error: 'Failed to generate hashtags' });
  }
});

export default router;
