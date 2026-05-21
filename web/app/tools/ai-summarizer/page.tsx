'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function AiSummarizerPage() {
  const [text, setText] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [apiKeyMissing, setApiKeyMissing] = useState(false);

  async function handleSummarize() {
    setError('');
    setSummary('');
    setApiKeyMissing(false);

    if (!text.trim()) {
      setError('Please enter some text to summarize.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/api/ai/summarize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg: string = data.error ?? data.message ?? 'Summarization failed.';
        if (msg.toLowerCase().includes('anthropic_api_key') || msg.toLowerCase().includes('api key not configured')) {
          setApiKeyMissing(true);
        } else {
          setError(msg);
        }
        return;
      }

      setSummary(data.summary ?? '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
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
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-400 to-indigo-600 shadow-md flex items-center justify-center">
            <BookOpen size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">AI Summarizer</h1>
            <p className="text-sm text-gray-500">Summarize any text or article instantly</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Textarea */}
          <div>
            <textarea
              rows={8}
              value={text}
              onChange={(e) => { setText(e.target.value); setError(''); setApiKeyMissing(false); setSummary(''); }}
              placeholder="Paste the text or article you want to summarize..."
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
            />
            <p className="text-xs text-gray-400 text-right mt-1">{text.length.toLocaleString()} characters</p>
          </div>

          <button
            onClick={handleSummarize}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:cursor-not-allowed text-white rounded-lg py-2.5 font-semibold text-sm transition-colors"
          >
            {loading ? (
              <span className="inline-flex items-center gap-1">
                Summarizing
                <span className="animate-bounce inline-block" style={{ animationDelay: '0ms' }}>.</span>
                <span className="animate-bounce inline-block" style={{ animationDelay: '150ms' }}>.</span>
                <span className="animate-bounce inline-block" style={{ animationDelay: '300ms' }}>.</span>
              </span>
            ) : 'Summarize'}
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

          {summary && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
              <p className="text-sm font-semibold text-blue-900 mb-3">Summary</p>
              <div className="text-sm text-blue-900 whitespace-pre-wrap leading-relaxed">
                {summary}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
