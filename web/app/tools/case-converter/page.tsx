'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CaseSensitive, Copy, Check } from 'lucide-react';

const ARTICLES = new Set(['a', 'an', 'the', 'in', 'on', 'of', 'for', 'but', 'nor', 'or', 'and', 'so', 'yet']);

function toTitleCase(text: string): string {
  return text.replace(/\S+/g, (word, offset) => {
    const lower = word.toLowerCase();
    if (offset > 0 && ARTICLES.has(lower)) return lower;
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  });
}

function toSentenceCase(text: string): string {
  return text
    .toLowerCase()
    .replace(/(^\s*|[.!?]\s+)([a-z])/g, (_, prefix, char) => prefix + char.toUpperCase());
}

export default function CaseConverterPage() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);

  function convert(fn: (t: string) => string) {
    setOutput(fn(input));
    setCopied(false);
  }

  function copyOutput() {
    if (!output) return;
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const wordCount = input.trim() ? input.trim().split(/\s+/).length : 0;
  const charCount = input.length;

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors">
        <ArrowLeft size={15} /> Back to all tools
      </Link>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center shadow-md">
            <CaseSensitive size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Case Converter</h1>
            <p className="text-sm text-gray-500">Convert text to UPPER, lower, Title or Sentence case</p>
          </div>
        </div>

        <div className="px-6 py-6 space-y-4">
          {/* Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Input Text</label>
            <textarea
              value={input}
              onChange={(e) => { setInput(e.target.value); setOutput(''); }}
              placeholder="Type or paste text here…"
              rows={6}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            <p className="text-xs text-gray-400 mt-1">{wordCount} word{wordCount !== 1 ? 's' : ''} · {charCount} character{charCount !== 1 ? 's' : ''}</p>
          </div>

          {/* Buttons */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'UPPERCASE',      fn: (t: string) => t.toUpperCase() },
              { label: 'lowercase',      fn: (t: string) => t.toLowerCase() },
              { label: 'Title Case',     fn: toTitleCase },
              { label: 'Sentence case',  fn: toSentenceCase },
            ].map(({ label, fn }) => (
              <button
                key={label}
                onClick={() => convert(fn)}
                disabled={!input.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg py-2.5 text-sm font-semibold transition-colors"
              >
                {label}
              </button>
            ))}
          </div>

          {/* Output */}
          {output && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">Output</label>
                <button
                  onClick={copyOutput}
                  className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 transition-colors"
                >
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <textarea
                readOnly
                value={output}
                rows={6}
                className="w-full bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-gray-800 text-sm resize-none focus:outline-none"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
