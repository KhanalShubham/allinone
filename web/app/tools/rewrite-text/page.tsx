'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, PenLine, Copy, Check } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

type Tone = 'More Formal' | 'More Casual' | 'Shorter' | 'More Detailed';

const TONES: Tone[] = ['More Formal', 'More Casual', 'Shorter', 'More Detailed'];

export default function RewriteTextPage() {
  const [text, setText] = useState('');
  const [tone, setTone] = useState<Tone>('More Formal');
  const [rewritten, setRewritten] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [apiKeyMissing, setApiKeyMissing] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleRewrite() {
    setError('');
    setRewritten('');
    setApiKeyMissing(false);
    setCopied(false);

    if (!text.trim()) {
      setError('Please enter some text to rewrite.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/api/ai/rewrite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, tone }),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg: string = data.error ?? data.message ?? 'Rewrite failed.';
        if (msg.toLowerCase().includes('anthropic_api_key') || msg.toLowerCase().includes('api key not configured')) {
          setApiKeyMissing(true);
        } else {
          setError(msg);
        }
        return;
      }

      setRewritten(data.rewritten ?? '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!rewritten) return;
    await navigator.clipboard.writeText(rewritten);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-400 to-violet-600 shadow-md flex items-center justify-center">
            <PenLine size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Rewrite Text</h1>
            <p className="text-sm text-gray-500">Transform your text to the perfect tone with AI</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Textarea */}
          <textarea
            rows={6}
            value={text}
            onChange={(e) => { setText(e.target.value); setError(''); setApiKeyMissing(false); setRewritten(''); }}
            placeholder="Paste your text here..."
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
          />

          {/* Tone selector */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Tone</p>
            <div className="flex flex-wrap gap-2">
              {TONES.map((t) => (
                <button
                  key={t}
                  onClick={() => setTone(t)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                    tone === t
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleRewrite}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:cursor-not-allowed text-white rounded-lg py-2.5 font-semibold text-sm transition-colors"
          >
            {loading ? 'Rewriting...' : 'Rewrite'}
          </button>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {apiKeyMissing && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
              <p className="font-semibold mb-2">API key required</p>
              <p className="mb-3">Add ANTHROPIC_API_KEY to server/.env to enable AI tools:</p>
              <pre className="bg-amber-100 rounded-lg px-3 py-2 text-xs font-mono overflow-x-auto">
                ANTHROPIC_API_KEY=your_key_here
              </pre>
            </div>
          )}

          {rewritten && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-3">
              <p className="text-sm font-semibold text-blue-900">Rewritten — {tone}</p>
              <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{rewritten}</p>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {copied ? <><Check size={14} className="text-green-600" /> Copied!</> : <><Copy size={14} /> Copy</>}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
