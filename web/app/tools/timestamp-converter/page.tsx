'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Timer, Copy, Check } from 'lucide-react';

function formatDate(d: Date): string {
  return d.toLocaleString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long',
    day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}

export default function TimestampConverterPage() {
  const [unixInput, setUnixInput] = useState('');
  const [dateInput, setDateInput] = useState('');
  const [nowTs, setNowTs] = useState(0);
  const [copiedKey, setCopiedKey] = useState('');

  // Live clock
  useEffect(() => {
    setNowTs(Math.floor(Date.now() / 1000));
    const id = setInterval(() => setNowTs(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(id);
  }, []);

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(''), 2000);
    });
  }

  // Unix → Date
  const unixDate = (() => {
    const n = Number(unixInput);
    if (!unixInput.trim() || isNaN(n)) return null;
    const d = new Date(n * 1000);
    if (isNaN(d.getTime())) return null;
    return d;
  })();

  // Date → Unix
  const dateTs = (() => {
    if (!dateInput) return null;
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return null;
    return { secs: Math.floor(d.getTime() / 1000), ms: d.getTime() };
  })();

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors">
        <ArrowLeft size={15} /> Back to all tools
      </Link>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center shadow-md">
            <Timer size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Timestamp Converter</h1>
            <p className="text-sm text-gray-500">Convert Unix timestamps to readable dates and back</p>
          </div>
        </div>

        <div className="px-6 py-6 space-y-6">
          {/* Live timestamp */}
          <div className="bg-violet-50 border border-violet-100 rounded-xl px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-xs text-violet-500 font-medium uppercase tracking-wide">Current Unix Time</p>
              <p className="text-2xl font-bold text-violet-800 font-mono">{nowTs}</p>
            </div>
            <button
              onClick={() => copy(String(nowTs), 'now')}
              className="inline-flex items-center gap-1.5 text-xs text-violet-600 hover:text-violet-700 transition-colors"
            >
              {copiedKey === 'now' ? <Check size={13} /> : <Copy size={13} />}
              {copiedKey === 'now' ? 'Copied!' : 'Copy'}
            </button>
          </div>

          {/* Unix → Date */}
          <div>
            <h2 className="text-sm font-semibold text-gray-800 mb-3">Unix Timestamp → Human Date</h2>
            <input
              type="number"
              value={unixInput}
              onChange={(e) => setUnixInput(e.target.value)}
              placeholder="e.g. 1716192000"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {unixDate && (
              <div className="mt-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 space-y-2">
                {[
                  { label: 'Local', value: formatDate(unixDate), key: 'local' },
                  { label: 'ISO 8601', value: unixDate.toISOString(), key: 'iso' },
                  { label: 'UTC', value: unixDate.toUTCString(), key: 'utc' },
                ].map(({ label, value, key }) => (
                  <div key={key} className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-xs text-blue-500 font-medium">{label}</span>
                      <p className="text-sm text-gray-800 font-mono">{value}</p>
                    </div>
                    <button onClick={() => copy(value, key)} className="shrink-0 inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 mt-3">
                      {copiedKey === key ? <Check size={12} /> : <Copy size={12} />}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Date → Unix */}
          <div>
            <h2 className="text-sm font-semibold text-gray-800 mb-3">Human Date → Unix Timestamp</h2>
            <input
              type="datetime-local"
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            />
            {dateTs && (
              <div className="mt-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 space-y-2">
                {[
                  { label: 'Seconds', value: String(dateTs.secs), key: 'dsec' },
                  { label: 'Milliseconds', value: String(dateTs.ms), key: 'dms' },
                ].map(({ label, value, key }) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-blue-500 font-medium">{label}</span>
                      <p className="text-sm text-gray-800 font-mono">{value}</p>
                    </div>
                    <button onClick={() => copy(value, key)} className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700">
                      {copiedKey === key ? <Check size={12} /> : <Copy size={12} />}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
