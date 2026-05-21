'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Braces, Copy, Check } from 'lucide-react';

export default function JsonFormatterPage() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [lineCount, setLineCount] = useState(0);
  const [copied, setCopied] = useState(false);

  function format() {
    setError('');
    setOutput('');
    if (!input.trim()) return;
    try {
      const parsed = JSON.parse(input);
      const pretty = JSON.stringify(parsed, null, 2);
      setOutput(pretty);
      setLineCount(pretty.split('\n').length);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Invalid JSON';
      setError(msg);
    }
  }

  function minify() {
    setError('');
    setOutput('');
    if (!input.trim()) return;
    try {
      const parsed = JSON.parse(input);
      const mini = JSON.stringify(parsed);
      setOutput(mini);
      setLineCount(1);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Invalid JSON';
      setError(msg);
    }
  }

  function copyOutput() {
    if (!output) return;
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors">
        <ArrowLeft size={15} /> Back to all tools
      </Link>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center shadow-md">
            <Braces size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">JSON Formatter</h1>
            <p className="text-sm text-gray-500">Paste messy JSON and get it clean and readable</p>
          </div>
        </div>

        <div className="px-6 py-6 space-y-4">
          {/* Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Paste JSON</label>
            <textarea
              value={input}
              onChange={(e) => { setInput(e.target.value); setError(''); setOutput(''); }}
              placeholder={'{"key": "value", "array": [1, 2, 3]}'}
              rows={8}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={format}
              disabled={!input.trim()}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg py-2.5 text-sm font-semibold transition-colors"
            >
              Format
            </button>
            <button
              onClick={minify}
              disabled={!input.trim()}
              className="flex-1 bg-gray-700 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg py-2.5 text-sm font-semibold transition-colors"
            >
              Minify
            </button>
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 font-mono break-all">{error}</p>
          )}

          {/* Output */}
          {output && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">
                  Output <span className="text-gray-400 font-normal">({lineCount} line{lineCount !== 1 ? 's' : ''})</span>
                </label>
                <button
                  onClick={copyOutput}
                  className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 transition-colors"
                >
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 overflow-auto max-h-80">
                <pre className="text-sm text-gray-800 font-mono whitespace-pre">{output}</pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
