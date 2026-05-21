'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, AlignLeft, Trash2 } from 'lucide-react';

export default function WordCounterPage() {
  const [text, setText] = useState('');

  const stats = useMemo(() => {
    const words       = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars       = text.length;
    const charsNoSp   = text.replace(/\s/g, '').length;
    const sentences   = text.trim() ? text.split(/[.!?]+/).filter((s) => s.trim()).length : 0;
    const paragraphs  = text.trim() ? text.split(/\n\s*\n/).filter((p) => p.trim()).length : 0;
    const readingTime = Math.max(1, Math.round(words / 200));
    return { words, chars, charsNoSp, sentences, paragraphs, readingTime };
  }, [text]);

  const statCards = [
    { label: 'Words',       value: stats.words,       sub: 'total words' },
    { label: 'Characters',  value: stats.chars,       sub: 'with spaces' },
    { label: 'No spaces',   value: stats.charsNoSp,   sub: 'characters' },
    { label: 'Sentences',   value: stats.sentences,   sub: 'detected' },
    { label: 'Paragraphs',  value: stats.paragraphs,  sub: 'blocks' },
    { label: 'Read time',   value: `~${stats.readingTime} min`, sub: 'at 200 wpm' },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors">
        <ArrowLeft size={15} /> Back to all tools
      </Link>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-green-100 text-green-600 flex items-center justify-center">
              <AlignLeft size={22} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Word Counter</h1>
              <p className="text-sm text-gray-500">Paste your text and see the stats instantly</p>
            </div>
          </div>
          {text && (
            <button
              onClick={() => setText('')}
              className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors"
            >
              <Trash2 size={13} /> Clear
            </button>
          )}
        </div>

        {/* Textarea */}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste or type your text here…"
          rows={9}
          className="w-full px-6 py-4 text-sm text-gray-800 placeholder-gray-400 resize-none focus:outline-none border-b border-gray-100"
        />

        {/* Stats grid */}
        <div className="grid grid-cols-3 sm:grid-cols-6 divide-x divide-y divide-gray-100">
          {statCards.map((s) => (
            <div key={s.label} className="px-4 py-4 text-center">
              <div className="text-2xl font-bold text-gray-900">{s.value}</div>
              <div className="text-xs font-medium text-gray-700 mt-0.5">{s.label}</div>
              <div className="text-xs text-gray-400">{s.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
