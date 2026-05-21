'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Hash, Copy, Check } from 'lucide-react';

type Algorithm = 'SHA-256' | 'SHA-1' | 'SHA-512';

async function generateHash(text: string, algorithm: Algorithm): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest(algorithm, data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export default function HashGeneratorPage() {
  const [input, setInput] = useState('');
  const [algorithm, setAlgorithm] = useState<Algorithm>('SHA-256');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function generate() {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const hash = await generateHash(input, algorithm);
      setOutput(hash);
    } catch {
      setOutput('Error generating hash.');
    } finally {
      setLoading(false);
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
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center shadow-md">
            <Hash size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Hash Generator</h1>
            <p className="text-sm text-gray-500">Generate SHA-256, SHA-1 or SHA-512 hash from any text</p>
          </div>
        </div>

        <div className="px-6 py-6 space-y-4">
          {/* Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Input Text</label>
            <textarea
              value={input}
              onChange={(e) => { setInput(e.target.value); setOutput(''); }}
              placeholder="Type or paste text to hash…"
              rows={5}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Algorithm select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Algorithm</label>
            <select
              value={algorithm}
              onChange={(e) => { setAlgorithm(e.target.value as Algorithm); setOutput(''); }}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="SHA-256">SHA-256 (recommended)</option>
              <option value="SHA-1">SHA-1</option>
              <option value="SHA-512">SHA-512</option>
            </select>
          </div>

          {/* Button */}
          <button
            onClick={generate}
            disabled={!input.trim() || loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg py-2.5 text-sm font-semibold transition-colors"
          >
            {loading ? 'Generating…' : 'Generate Hash'}
          </button>

          {/* Output */}
          {output && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">{algorithm} Hash</label>
                <button
                  onClick={copyOutput}
                  className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 transition-colors"
                >
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                <p className="text-sm text-gray-800 font-mono break-all">{output}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
