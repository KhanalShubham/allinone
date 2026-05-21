'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Binary, Copy, Check } from 'lucide-react';

export default function Base64Page() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  function encode() {
    setError('');
    try {
      setOutput(btoa(unescape(encodeURIComponent(input))));
    } catch {
      setError('Encoding failed. Please check your input.');
      setOutput('');
    }
  }

  function decode() {
    setError('');
    try {
      setOutput(decodeURIComponent(escape(atob(input.trim()))));
    } catch {
      setError('Invalid Base64 string. Please check your input.');
      setOutput('');
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
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-500 to-gray-700 flex items-center justify-center shadow-md">
            <Binary size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Base64 Encode / Decode</h1>
            <p className="text-sm text-gray-500">Encode or decode any text using Base64</p>
          </div>
        </div>

        <div className="px-6 py-6 space-y-4">
          {/* Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Input Text</label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter text to encode or Base64 string to decode…"
              rows={5}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={encode}
              disabled={!input.trim()}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg py-2.5 text-sm font-semibold transition-colors"
            >
              Encode
            </button>
            <button
              onClick={decode}
              disabled={!input.trim()}
              className="flex-1 bg-gray-700 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg py-2.5 text-sm font-semibold transition-colors"
            >
              Decode
            </button>
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
          )}

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
              <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                <pre className="text-sm text-gray-800 whitespace-pre-wrap break-all font-mono">{output}</pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
