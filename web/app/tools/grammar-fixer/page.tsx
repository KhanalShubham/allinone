'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, SpellCheck, Copy, Check } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function GrammarFixerPage() {
  const [text, setText] = useState('');
  const [original, setOriginal] = useState('');
  const [corrected, setCorrected] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [apiKeyMissing, setApiKeyMissing] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleFix() {
    setError('');
    setOriginal('');
    setCorrected('');
    setApiKeyMissing(false);
    setCopied(false);

    if (!text.trim()) {
      setError('Please enter some text to fix.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/api/ai/grammar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg: string = data.error ?? data.message ?? 'Grammar fix failed.';
        if (msg.toLowerCase().includes('anthropic_api_key') || msg.toLowerCase().includes('api key not configured')) {
          setApiKeyMissing(true);
        } else {
          setError(msg);
        }
        return;
      }

      setOriginal(data.original ?? text);
      setCorrected(data.corrected ?? '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!corrected) return;
    await navigator.clipboard.writeText(corrected);
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
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 shadow-md flex items-center justify-center">
            <SpellCheck size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Grammar Fixer</h1>
            <p className="text-sm text-gray-500">Correct grammar, spelling, and punctuation with AI</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Textarea */}
          <textarea
            rows={6}
            value={text}
            onChange={(e) => { setText(e.target.value); setError(''); setApiKeyMissing(false); setCorrected(''); setOriginal(''); }}
            placeholder="Type or paste your text here..."
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
          />

          <button
            onClick={handleFix}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:cursor-not-allowed text-white rounded-lg py-2.5 font-semibold text-sm transition-colors"
          >
            {loading ? 'Fixing grammar...' : 'Fix Grammar'}
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

          {/* Side-by-side comparison */}
          {corrected && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {/* Original */}
                <div className="bg-red-50 border border-red-100 rounded-xl p-3">
                  <p className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-2">Original</p>
                  <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{original}</p>
                </div>
                {/* Fixed */}
                <div className="bg-green-50 border border-green-100 rounded-xl p-3">
                  <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-2">Fixed</p>
                  <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{corrected}</p>
                </div>
              </div>

              <button
                onClick={handleCopy}
                className="w-full flex items-center justify-center gap-2 border border-gray-300 rounded-lg py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {copied ? <><Check size={15} className="text-green-600" /> Copied!</> : <><Copy size={15} /> Copy Fixed Text</>}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
