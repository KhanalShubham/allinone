'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Hash, Copy, Check } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

type Platform = 'Instagram' | 'TikTok' | 'YouTube' | 'Twitter';
const PLATFORMS: Platform[] = ['Instagram', 'TikTok', 'YouTube', 'Twitter'];

function generateFallbackHashtags(topic: string, platform: Platform): string[] {
  const t = topic.toLowerCase().replace(/\s+/g, '');
  const base = [
    `#${t}`,
    `#${t}life`,
    `#${t}lover`,
    `#${t}daily`,
    `#${t}gram`,
    `#${t}vibes`,
    `#${t}community`,
    `#${t}tips`,
    `#${t}inspiration`,
    `#${t}content`,
  ];

  const platformTags: Record<Platform, string[]> = {
    Instagram: ['#instagood', '#photooftheday', '#instadaily', '#follow', '#like4like', '#explore', '#trending'],
    TikTok: ['#fyp', '#foryou', '#foryoupage', '#trending', '#viral', '#tiktok', '#xyzbca'],
    YouTube: ['#youtube', '#youtuber', '#subscribe', '#video', '#vlog', '#content', '#creator'],
    Twitter: ['#twitter', '#trending', '#viral', '#thread', '#follow', '#retweet', '#socialmedia'],
  };

  return [...new Set([...base, ...platformTags[platform]])].slice(0, 25);
}

export default function HashtagGeneratorPage() {
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState<Platform>('Instagram');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [apiKeyMissing, setApiKeyMissing] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  async function handleGenerate() {
    setError('');
    setHashtags([]);
    setApiKeyMissing(false);
    setCopiedIndex(null);
    setCopiedAll(false);

    if (!topic.trim()) {
      setError('Please enter a topic or keyword.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/api/ai/hashtags`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, platform }),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg: string = data.error ?? data.message ?? 'Hashtag generation failed.';
        if (msg.toLowerCase().includes('anthropic_api_key') || msg.toLowerCase().includes('api key not configured')) {
          setApiKeyMissing(true);
          // Use fallback
          setHashtags(generateFallbackHashtags(topic, platform));
        } else {
          setError(msg);
          setHashtags(generateFallbackHashtags(topic, platform));
        }
        return;
      }

      if (Array.isArray(data.hashtags) && data.hashtags.length > 0) {
        setHashtags(data.hashtags as string[]);
      } else {
        setHashtags(generateFallbackHashtags(topic, platform));
      }
    } catch {
      // Fallback on network error
      setHashtags(generateFallbackHashtags(topic, platform));
    } finally {
      setLoading(false);
    }
  }

  async function handleCopyOne(tag: string, index: number) {
    await navigator.clipboard.writeText(tag);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  }

  async function handleCopyAll() {
    if (!hashtags.length) return;
    await navigator.clipboard.writeText(hashtags.join(' '));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors"
      >
        <ArrowLeft size={15} /> Back to all tools
      </Link>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 pb-5 border-b border-gray-100">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-600 shadow-md flex items-center justify-center">
            <Hash size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Hashtag Generator</h1>
            <p className="text-sm text-gray-500">Generate relevant hashtags for your posts</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Topic input */}
          <div>
            <input
              type="text"
              value={topic}
              onChange={(e) => { setTopic(e.target.value); setError(''); setApiKeyMissing(false); setHashtags([]); }}
              placeholder="What is your post about? (e.g. travel, food, coding)"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              onKeyDown={(e) => { if (e.key === 'Enter') handleGenerate(); }}
            />
          </div>

          {/* Platform selector */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Platform</p>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map((p) => (
                <button
                  key={p}
                  onClick={() => setPlatform(p)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                    platform === p
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:cursor-not-allowed text-white rounded-lg py-2.5 font-semibold text-sm transition-colors"
          >
            {loading ? 'Generating hashtags...' : 'Generate Hashtags'}
          </button>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {apiKeyMissing && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
              <p className="font-semibold mb-2">API key required for AI hashtags</p>
              <p className="mb-3">Showing fallback hashtags. Add ANTHROPIC_API_KEY to server/.env for AI-powered results:</p>
              <pre className="bg-amber-100 rounded-lg px-3 py-2 text-xs font-mono overflow-x-auto">
                ANTHROPIC_API_KEY=your_key_here
              </pre>
            </div>
          )}

          {/* Hashtags result */}
          {hashtags.length > 0 && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-blue-900">{hashtags.length} hashtags generated</p>
                <button
                  onClick={handleCopyAll}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors"
                >
                  {copiedAll ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy All</>}
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {hashtags.map((tag, i) => (
                  <button
                    key={`${tag}-${i}`}
                    onClick={() => handleCopyOne(tag, i)}
                    title="Click to copy"
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                      copiedIndex === i
                        ? 'bg-green-100 border-green-300 text-green-700'
                        : 'bg-white border-blue-200 text-blue-700 hover:bg-blue-100'
                    }`}
                  >
                    {copiedIndex === i ? '✓ Copied' : tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
