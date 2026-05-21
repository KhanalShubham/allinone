import Anthropic from '@anthropic-ai/sdk';
import type { AiTone, SocialPlatform } from '../types';

const MODEL = 'claude-haiku-4-5-20251001';

let client: Anthropic | null = null;

export function hasApiKey(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

function getClient(): Anthropic {
  if (!client) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

async function complete(system: string, user: string): Promise<string> {
  const msg = await getClient().messages.create({
    model: MODEL,
    max_tokens: 1024,
    system,
    messages: [{ role: 'user', content: user }],
  });
  const block = msg.content[0];
  if (block.type !== 'text') throw new Error('Unexpected response type');
  return block.text;
}

export async function summarize(text: string): Promise<string> {
  return complete(
    'You are a summarizer. Return a clear, concise summary in 3-5 bullet points. Be brief and direct.',
    text,
  );
}

export async function fixGrammar(text: string): Promise<string> {
  return complete(
    'You are a grammar editor. Fix all grammar, spelling and punctuation errors in the provided text. Return ONLY the corrected text, nothing else. Do not add explanations.',
    text,
  );
}

const TONE_PROMPTS: Record<AiTone, string> = {
  formal:
    'You are a writing assistant. Rewrite the provided text in a professional, formal tone suitable for business communication. Return ONLY the rewritten text.',
  casual:
    'You are a writing assistant. Rewrite the provided text in a friendly, casual conversational tone. Return ONLY the rewritten text.',
  shorter:
    'You are a writing assistant. Rewrite the provided text to be as concise as possible while preserving the key meaning. Remove all unnecessary words. Return ONLY the rewritten text.',
  detailed:
    'You are a writing assistant. Rewrite the provided text with more detail, depth, and elaboration. Expand on key points. Return ONLY the rewritten text.',
};

export async function rewrite(text: string, tone: AiTone): Promise<string> {
  return complete(TONE_PROMPTS[tone], text);
}

export async function generateHashtags(topic: string, platform: SocialPlatform): Promise<string[]> {
  const rawText = await complete(
    'Generate relevant hashtags for the given topic and platform. Return ONLY a JSON array of hashtag strings (including the # symbol), maximum 20 tags, ordered by relevance. No explanation.',
    `Topic: ${topic}\nPlatform: ${platform}`,
  );

  try {
    const match = rawText.match(/\[[\s\S]*\]/);
    return JSON.parse(match ? match[0] : rawText) as string[];
  } catch {
    return rawText
      .split(/[\s,\n]+/)
      .filter((t) => t.startsWith('#'))
      .slice(0, 20);
  }
}
